import {
  NextResponse,
} from "next/server";
import {
  createClient,
} from "@supabase/supabase-js";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const BUCKET_NAME =
  "chatbot-uploads";

const GROQ_CHAT_ENDPOINT =
  "https://api.groq.com/openai/v1/chat/completions";

const MAX_IMAGE_COUNT =
  3;

const SIGNED_URL_LIFETIME_SECONDS =
  10 * 60;

const VISION_MAX_OUTPUT_TOKENS =
  2400;

const VISION_TIMEOUT_MILLISECONDS =
  90_000;

type GroqVisionResponse = {
  choices?: Array<{
    finish_reason?: string | null;

    message?: {
      content?: string | null;
    };
  }>;

  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

function createError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      success:
        false,

      message,
    },
    {
      status,
    },
  );
}

function createVisionInstruction(
  prompt: string,
  imageCount: number,
) {
  const visitorRequest =
    prompt ||
    (
      imageCount ===
      1
        ? "Analyze this image carefully."
        : "Analyze these images carefully and compare them when relevant."
    );

  return `
You are analyzing ${imageCount} uploaded image${imageCount === 1 ? "" : "s"}.

VISITOR REQUEST.

${visitorRequest}

ANALYSIS REQUIREMENTS.

Inspect every uploaded image before answering.

When multiple images are provided, refer to them as Image 1, Image 2, and Image 3.

Answer the visitor's exact question first.

Then explain the most important visual evidence supporting your answer.

For website or application screenshots, review the visible layout, hierarchy, spacing, typography, colors, content clarity, calls to action, accessibility, mobile usability, trust signals, and visible technical problems.

For screenshots containing text, read only text that is genuinely visible.

Clearly state when text or visual details are too small or unclear to verify.

Do not invent hidden content.

Do not identify a real person by name based only on appearance.

Use clear Markdown headings and concise bullet points when helpful.

Keep the analysis focused enough to complete within the available response limit.

Complete every sentence, heading, list, and section.

Do not finish with an incomplete bullet point, colon, heading, or sentence.
`.trim();
}

async function removeTemporaryImages(
  paths: string[],
) {
  if (
    paths.length ===
    0
  ) {
    return;
  }

  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL
      ?.trim();

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return;
  }

  try {
    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        },
      );

    const {
      error,
    } =
      await supabase
        .storage
        .from(
          BUCKET_NAME,
        )
        .remove(
          paths,
        );

    if (
      error
    ) {
      console.error(
        "Temporary image cleanup failed.",
        error,
      );
    }
  } catch (error) {
    console.error(
      "Temporary image cleanup threw an error.",
      error,
    );
  }
}

export async function POST(
  request: Request,
) {
  const pathsToDelete:
    string[] =
    [];

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      VISION_TIMEOUT_MILLISECONDS,
    );

  request.signal.addEventListener(
    "abort",
    () => {
      controller.abort();
    },
    {
      once:
        true,
    },
  );

  try {
    const supabaseUrl =
      process.env
        .NEXT_PUBLIC_SUPABASE_URL
        ?.trim();

    const serviceRoleKey =
      process.env
        .SUPABASE_SERVICE_ROLE_KEY
        ?.trim();

    const groqApiKey =
      process.env
        .GROQ_API_KEY
        ?.trim();

    const visionModel =
      process.env
        .GROQ_VISION_MODEL
        ?.trim() ||
      "qwen/qwen3.6-27b";

    if (
      !supabaseUrl ||
      !serviceRoleKey ||
      !groqApiKey
    ) {
      return createError(
        "Image-analysis configuration is incomplete.",
        503,
      );
    }

    let body: {
      prompt?: unknown;
      paths?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return createError(
        "The image-analysis request is not valid JSON.",
        400,
      );
    }

    const prompt =
      typeof body.prompt ===
        "string"
        ? body.prompt
            .trim()
            .slice(
              0,
              4000,
            )
        : "";

    if (
      !Array.isArray(
        body.paths,
      ) ||
      body.paths.length ===
        0 ||
      body.paths.length >
        MAX_IMAGE_COUNT ||
      !body.paths.every(
        (path) =>
          typeof path ===
            "string" &&
          path.length >
            0 &&
          path.length <
            500,
      )
    ) {
      return createError(
        "Provide between one and three valid uploaded image paths.",
        400,
      );
    }

    const paths =
      body.paths as string[];

    pathsToDelete.push(
      ...paths,
    );

    const supabase =
      createClient(
        supabaseUrl,
        serviceRoleKey,
        {
          auth: {
            persistSession:
              false,

            autoRefreshToken:
              false,
          },
        },
      );

    const {
      data:
        signedFiles,
      error:
        signedUrlError,
    } =
      await supabase
        .storage
        .from(
          BUCKET_NAME,
        )
        .createSignedUrls(
          paths,
          SIGNED_URL_LIFETIME_SECONDS,
        );

    if (
      signedUrlError ||
      !signedFiles
    ) {
      return createError(
        signedUrlError?.message ||
          "Could not open the uploaded images.",
        500,
      );
    }

    const imageUrls =
      signedFiles
        .map(
          (file) =>
            file.signedUrl,
        )
        .filter(
          (
            url,
          ): url is string =>
            Boolean(
              url,
            ),
        );

    if (
      imageUrls.length !==
      paths.length
    ) {
      return createError(
        "One or more uploaded images could not be accessed.",
        500,
      );
    }

    const response =
      await fetch(
        GROQ_CHAT_ENDPOINT,
        {
          method:
            "POST",

          headers: {
            Authorization:
              `Bearer ${groqApiKey}`,

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              model:
                visionModel,

              messages: [
                {
                  role:
                    "user",

                  content: [
                    {
                      type:
                        "text",

                      text:
                        createVisionInstruction(
                          prompt,
                          imageUrls.length,
                        ),
                    },

                    ...imageUrls.map(
                      (
                        imageUrl,
                      ) => ({
                        type:
                          "image_url",

                        image_url: {
                          url:
                            imageUrl,
                        },
                      }),
                    ),
                  ],
                },
              ],

              reasoning_effort:
                "none",

              reasoning_format:
                "hidden",

              temperature:
                0.7,

              top_p:
                0.8,

              max_completion_tokens:
                VISION_MAX_OUTPUT_TOKENS,

              stream:
                false,
            }),

          cache:
            "no-store",

          signal:
            controller.signal,
        },
      );

    let result:
      GroqVisionResponse;

    try {
      result =
        (await response.json()) as GroqVisionResponse;
    } catch {
      return createError(
        `The vision model returned an unreadable response with status ${response.status}.`,
        502,
      );
    }

    if (
      !response.ok
    ) {
      const providerMessage =
        result.error
          ?.message
          ?.trim();

      console.error(
        "Groq vision request failed.",
        {
          status:
            response.status,

          providerMessage,

          model:
            visionModel,

          imageCount:
            imageUrls.length,
        },
      );

      if (
        response.status ===
        429
      ) {
        return createError(
          "The image-analysis token limit was reached. Please wait a minute, try fewer images, or ask a shorter question.",
          429,
        );
      }

      return createError(
        providerMessage ||
          `Image analysis failed with status ${response.status}.`,
        response.status,
      );
    }

    const answer =
      result.choices?.[0]
        ?.message
        ?.content
        ?.trim();

    if (
      !answer
    ) {
      return createError(
        "The vision model returned an empty response.",
        502,
      );
    }

    const finishReason =
      result.choices?.[0]
        ?.finish_reason ||
      null;

    const wasIncomplete =
      finishReason ===
      "length";

    const finalAnswer =
      wasIncomplete
        ? `${answer}\n\n> The image analysis reached its response limit. Ask me to continue from the last completed section.`
        : answer;

    return NextResponse.json({
      success:
        true,

      message:
        finalAnswer,

      model:
        visionModel,

      incomplete:
        wasIncomplete,

      finishReason,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      return createError(
        request.signal.aborted
          ? "The image analysis was cancelled."
          : "The image analysis took too long. Please try fewer images or a more focused question.",
        504,
      );
    }

    console.error(
      "Image-analysis route error.",
      error,
    );

    return createError(
      error instanceof Error
        ? error.message
        : "The images could not be analyzed.",
      500,
    );
  } finally {
    clearTimeout(
      timeout,
    );

    await removeTemporaryImages(
      pathsToDelete,
    );
  }
}
