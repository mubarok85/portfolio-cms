import type {
  GroqCompletionOptions,
  GroqMessage,
} from "./types";

const GROQ_CHAT_ENDPOINT =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_RESPONSES_ENDPOINT =
  "https://api.groq.com/openai/v1/responses";

const STANDARD_MAX_OUTPUT_TOKENS =
  2200;

const LIVE_MAX_OUTPUT_TOKENS =
  900;

const MAX_LIVE_SYSTEM_CHARACTERS =
  5000;

const MAX_LIVE_USER_CHARACTERS =
  3000;

type GroqErrorResponse = {
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

type ChatCompletionStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string | null;
    };

    finish_reason?: string | null;
  }>;

  error?: {
    message?: string;
  };
};

type ResponsesStreamEvent = {
  type?: string;

  delta?: string | null;

  text?: string | null;

  error?: {
    message?: string;
  };

  response?: {
    error?: {
      message?: string;
    };
  };
};

export type NormalizedStreamEvent =
  | {
      type: "delta";
      text: string;
    }
  | {
      type: "done";
    }
  | {
      type: "error";
      message: string;
    };

function shortenText(
  text: string,
  maximumLength: number,
) {
  const cleanText =
    text.trim();

  if (
    cleanText.length <=
    maximumLength
  ) {
    return cleanText;
  }

  return cleanText.slice(
    0,
    maximumLength,
  );
}

function createCompactLiveInput(
  messages: GroqMessage[],
) {
  const systemMessage =
    messages.find(
      (message) =>
        message.role ===
        "system",
    );

  const latestUserMessage =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role ===
          "user",
      );

  const compactInput: GroqMessage[] =
    [];

  if (systemMessage) {
    compactInput.push({
      role: "system",

      content:
        shortenText(
          systemMessage.content,
          MAX_LIVE_SYSTEM_CHARACTERS,
        ),
    });
  }

  if (latestUserMessage) {
    compactInput.push({
      role: "user",

      content:
        shortenText(
          latestUserMessage.content,
          MAX_LIVE_USER_CHARACTERS,
        ),
    });
  }

  return compactInput;
}

async function readProviderError(
  response: Response,
) {
  try {
    const result =
      (await response.json()) as GroqErrorResponse;

    return (
      result.error?.message?.trim() ||
      `Groq request failed with status ${response.status}.`
    );
  } catch {
    return `Groq request failed with status ${response.status}.`;
  }
}

async function requireSuccessfulResponse(
  response: Response,
) {
  if (response.ok) {
    return response;
  }

  const providerMessage =
    await readProviderError(
      response,
    );

  console.error(
    "Groq streaming request failed.",
    {
      status:
        response.status,

      providerMessage,
    },
  );

  throw new Error(
    providerMessage,
  );
}

export async function requestStandardStream({
  apiKey,
  model,
  messages,
  signal,
}: GroqCompletionOptions) {
  const response = await fetch(
    GROQ_CHAT_ENDPOINT,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${apiKey}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        model,

        messages,

        temperature: 0.65,

        max_completion_tokens:
          STANDARD_MAX_OUTPUT_TOKENS,

        stream: true,
      }),

      cache: "no-store",

      signal,
    },
  );

  return requireSuccessfulResponse(
    response,
  );
}

export async function requestLiveStream({
  apiKey,
  messages,
  signal,
}: GroqCompletionOptions) {
  const compactInput =
    createCompactLiveInput(
      messages,
    );

  const response = await fetch(
    GROQ_RESPONSES_ENDPOINT,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${apiKey}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        model:
          "openai/gpt-oss-20b",

        input:
          compactInput,

        tools: [
          {
            type:
              "browser_search",
          },
        ],

        tool_choice:
          "required",

        max_output_tokens:
          LIVE_MAX_OUTPUT_TOKENS,

        stream: true,
      }),

      cache: "no-store",

      signal,
    },
  );

  return requireSuccessfulResponse(
    response,
  );
}

function parseChatCompletionEvent(
  rawData: string,
): NormalizedStreamEvent[] {
  if (
    rawData === "[DONE]"
  ) {
    return [
      {
        type: "done",
      },
    ];
  }

  try {
    const chunk =
      JSON.parse(
        rawData,
      ) as ChatCompletionStreamChunk;

    const providerError =
      chunk.error?.message?.trim();

    if (providerError) {
      return [
        {
          type: "error",
          message:
            providerError,
        },
      ];
    }

    const text =
      chunk.choices?.[0]
        ?.delta
        ?.content;

    const events:
      NormalizedStreamEvent[] =
      [];

    if (text) {
      events.push({
        type: "delta",
        text,
      });
    }

    if (
      chunk.choices?.[0]
        ?.finish_reason
    ) {
      events.push({
        type: "done",
      });
    }

    return events;
  } catch {
    return [];
  }
}

function parseResponsesEvent(
  eventName: string,
  rawData: string,
): NormalizedStreamEvent[] {
  if (
    rawData === "[DONE]"
  ) {
    return [
      {
        type: "done",
      },
    ];
  }

  try {
    const event =
      JSON.parse(
        rawData,
      ) as ResponsesStreamEvent;

    const eventType =
      event.type ||
      eventName;

    if (
      eventType ===
        "response.output_text.delta" &&
      typeof event.delta ===
        "string" &&
      event.delta
    ) {
      return [
        {
          type: "delta",
          text:
            event.delta,
        },
      ];
    }

    if (
      eventType ===
        "response.output_text.done" &&
      typeof event.text ===
        "string" &&
      event.text
    ) {
      return [];
    }

    if (
      eventType ===
        "response.completed" ||
      eventType ===
        "response.done"
    ) {
      return [
        {
          type: "done",
        },
      ];
    }

    if (
      eventType ===
        "error" ||
      eventType ===
        "response.failed"
    ) {
      return [
        {
          type: "error",

          message:
            event.error
              ?.message ||
            event.response
              ?.error
              ?.message ||
            "The live-search request failed.",
        },
      ];
    }

    return [];
  } catch {
    return [];
  }
}

export async function pipeGroqStream({
  response,
  kind,
  onEvent,
}: {
  response: Response;
  kind:
    | "chat"
    | "responses";
  onEvent: (
    event: NormalizedStreamEvent,
  ) => void;
}) {
  const reader =
    response.body?.getReader();

  if (!reader) {
    throw new Error(
      "The Groq response did not contain a readable stream.",
    );
  }

  const decoder =
    new TextDecoder();

  let buffer = "";
  let eventName = "";

  while (true) {
    const {
      value,
      done,
    } =
      await reader.read();

    if (done) {
      break;
    }

    buffer +=
      decoder.decode(
        value,
        {
          stream: true,
        },
      );

    const blocks =
      buffer.split(
        "\n\n",
      );

    buffer =
      blocks.pop() ||
      "";

    for (
      const block of blocks
    ) {
      const lines =
        block.split(
          "\n",
        );

      let data = "";

      for (
        const line of lines
      ) {
        if (
          line.startsWith(
            "event:",
          )
        ) {
          eventName =
            line
              .slice(6)
              .trim();
        }

        if (
          line.startsWith(
            "data:",
          )
        ) {
          const dataPart =
            line
              .slice(5)
              .trimStart();

          data +=
            dataPart;
        }
      }

      if (!data) {
        continue;
      }

      const normalizedEvents =
        kind === "chat"
          ? parseChatCompletionEvent(
              data,
            )
          : parseResponsesEvent(
              eventName,
              data,
            );

      for (
        const normalizedEvent of
        normalizedEvents
      ) {
        onEvent(
          normalizedEvent,
        );
      }

      eventName = "";
    }
  }
}