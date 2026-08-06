import { NextResponse } from "next/server";
import {
  pipeGroqStream,
  requestLiveStream,
  requestStandardStream,
} from "./groq";
import { getPortfolioContext } from "./portfolio";
import { createGroqMessages } from "./prompt";
import {
  getClientIdentifier,
  isRateLimited,
} from "./rate-limit";
import { selectAssistantMode } from "./routing";
import type {
  AssistantStreamEvent,
} from "./types";
import {
  assistantRequestSchema,
  MAX_USER_MESSAGE_LENGTH,
  prepareConversation,
} from "./validation";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function createErrorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
    },
  );
}

function encodeStreamEvent(
  event: AssistantStreamEvent,
) {
  return `data: ${JSON.stringify(
    event,
  )}\n\n`;
}

export async function POST(
  request: Request,
) {
  try {
    const clientIdentifier =
      getClientIdentifier(
        request,
      );

    if (
      isRateLimited(
        clientIdentifier,
      )
    ) {
      return createErrorResponse(
        "You have sent too many messages. Please wait a few minutes or continue on WhatsApp.",
        429,
      );
    }

    const apiKey =
      process.env
        .GROQ_API_KEY
        ?.trim();

    if (!apiKey) {
      return createErrorResponse(
        "The AI assistant is temporarily unavailable because its server key is missing.",
        503,
      );
    }

    let rawBody: unknown;

    try {
      rawBody =
        await request.json();
    } catch {
      return createErrorResponse(
        "The request body is not valid JSON.",
        400,
      );
    }

    const validation =
      assistantRequestSchema.safeParse(
        rawBody,
      );

    if (
      !validation.success
    ) {
      const details =
        validation.error
          .issues
          .map(
            (issue) =>
              `${issue.path.join(".")}, ${issue.message}`,
          )
          .join(" | ");

      console.error(
        "Assistant validation failed.",
        details,
      );

      return createErrorResponse(
        process.env.NODE_ENV ===
          "development"
          ? `Validation failed, ${details}`
          : "The message could not be processed.",
        400,
      );
    }

    const preparedConversation =
      prepareConversation(
        validation.data
          .messages,
      );

    const latestUserMessage =
      preparedConversation
        .latestUserMessage
        ?.trim();

    if (!latestUserMessage) {
      return createErrorResponse(
        "No valid visitor message was provided.",
        400,
      );
    }

    if (
      latestUserMessage.length >
      MAX_USER_MESSAGE_LENGTH
    ) {
      return createErrorResponse(
        `Your message is too long. Please keep one message under ${MAX_USER_MESSAGE_LENGTH.toLocaleString()} characters.`,
        400,
      );
    }

    const mode =
      selectAssistantMode(
        latestUserMessage,
      );

    const standardModel =
      process.env
        .GROQ_MODEL
        ?.trim() ||
      "openai/gpt-oss-20b";

    const liveModel =
      process.env
        .GROQ_LIVE_MODEL
        ?.trim() ||
      "openai/gpt-oss-20b";

    const portfolioContext =
      await getPortfolioContext();

    const messages =
      createGroqMessages({
        mode,

        portfolioContext,

        history:
          preparedConversation
            .history,

        latestUserMessage,
      });

    const sessionId =
      typeof validation
        .data
        .sessionId ===
      "string"
        ? validation
            .data
            .sessionId
            .trim() ||
          null
        : null;

    const providerController =
      new AbortController();

    const timeout =
      setTimeout(
        () => {
          providerController.abort();
        },
        mode === "live"
          ? 60000
          : 35000,
      );

    request.signal.addEventListener(
      "abort",
      () => {
        providerController.abort();
      },
      {
        once: true,
      },
    );

    const encoder =
      new TextEncoder();

    const stream =
      new ReadableStream<Uint8Array>({
        async start(
          controller,
        ) {
          let closed = false;
          let sentDone = false;

          function send(
            event: AssistantStreamEvent,
          ) {
            if (closed) {
              return;
            }

            controller.enqueue(
              encoder.encode(
                encodeStreamEvent(
                  event,
                ),
              ),
            );
          }

          function closeStream() {
            if (closed) {
              return;
            }

            closed = true;
            clearTimeout(
              timeout,
            );

            controller.close();
          }

          send({
            type:
              "metadata",

            mode,

            model:
              mode === "live"
                ? liveModel
                : standardModel,

            sessionId,
          });

          try {
            const providerResponse =
              mode === "live"
                ? await requestLiveStream({
                    apiKey,

                    model:
                      liveModel,

                    messages,

                    signal:
                      providerController
                        .signal,
                  })
                : await requestStandardStream({
                    apiKey,

                    model:
                      standardModel,

                    messages,

                    signal:
                      providerController
                        .signal,
                  });

            await pipeGroqStream({
              response:
                providerResponse,

              kind:
                mode === "live"
                  ? "responses"
                  : "chat",

              onEvent:
                (event) => {
                  if (
                    event.type ===
                    "delta"
                  ) {
                    send({
                      type:
                        "delta",

                      text:
                        event.text,
                    });
                  }

                  if (
                    event.type ===
                      "error"
                  ) {
                    send({
                      type:
                        "error",

                      message:
                        event.message,
                    });
                  }

                  if (
                    event.type ===
                      "done" &&
                    !sentDone
                  ) {
                    sentDone = true;

                    send({
                      type:
                        "done",
                    });
                  }
                },
            });

            if (!sentDone) {
              send({
                type:
                  "done",
              });
            }
          } catch (error) {
            if (
              error instanceof
                Error &&
              error.name ===
                "AbortError"
            ) {
              if (
                !request.signal
                  .aborted
              ) {
                send({
                  type:
                    "error",

                  message:
                    "The AI assistant took too long to respond. Please try again.",
                });
              }
            } else {
              console.error(
                "Assistant stream error.",
                error,
              );

              send({
                type:
                  "error",

                message:
                  process.env
                    .NODE_ENV ===
                    "development" &&
                  error instanceof
                    Error
                    ? error.message
                    : "I could not generate a response right now. Please try again or continue on WhatsApp.",
              });
            }
          } finally {
            closeStream();
          }
        },

        cancel() {
          providerController.abort();

          clearTimeout(
            timeout,
          );
        },
      });

    return new Response(
      stream,
      {
        status: 200,

        headers: {
          "Content-Type":
            "text/event-stream; charset=utf-8",

          "Cache-Control":
            "no-cache, no-transform",

          Connection:
            "keep-alive",

          "X-Accel-Buffering":
            "no",
        },
      },
    );
  } catch (error) {
    console.error(
      "Assistant route error.",
      error,
    );

    return createErrorResponse(
      process.env.NODE_ENV ===
        "development" &&
      error instanceof Error
        ? error.message
        : "I could not start the AI response. Please try again.",
      500,
    );
  }
}