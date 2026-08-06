import { z } from "zod";
import type {
  PreparedConversation,
  ValidatedMessage,
} from "./types";

export const MAX_USER_MESSAGE_LENGTH =
  4000;

const MAX_HISTORY_MESSAGES = 6;

const MAX_PREVIOUS_MESSAGE_LENGTH =
  1200;

const messageSchema = z.object({
  role: z.enum([
    "user",
    "assistant",
  ]),

  content: z.coerce
    .string()
    .trim()
    .min(1)
    .max(12000),
});

export const assistantRequestSchema =
  z.object({
    sessionId: z
      .union([
        z.string(),
        z.null(),
        z.undefined(),
      ])
      .optional(),

    messages: z
      .array(messageSchema)
      .min(1)
      .max(20),
  });

const FAILED_ASSISTANT_PATTERNS = [
  "i am having trouble responding",
  "continue on whatsapp button",
  "i could not generate a response",
  "the message could not be processed",
  "the ai assistant took too long",
  "validation failed",
  "request entity too large",
  "live verification is temporarily unavailable",
];

function shortenMessage(
  text: string,
) {
  const cleanedText =
    text.trim();

  if (
    cleanedText.length <=
    MAX_PREVIOUS_MESSAGE_LENGTH
  ) {
    return cleanedText;
  }

  return `${cleanedText.slice(
    0,
    MAX_PREVIOUS_MESSAGE_LENGTH,
  )}\n\n[Previous message shortened for context.]`;
}

function isFailedAssistantMessage(
  message: ValidatedMessage,
) {
  if (
    message.role !== "assistant"
  ) {
    return false;
  }

  const normalizedText =
    message.content
      .toLowerCase()
      .trim();

  return FAILED_ASSISTANT_PATTERNS.some(
    (pattern) =>
      normalizedText.includes(
        pattern,
      ),
  );
}

export function prepareConversation(
  messages: ValidatedMessage[],
): PreparedConversation {
  const cleanedMessages =
    messages
      .filter(
        (message) =>
          message.content.trim()
            .length > 0,
      )
      .filter(
        (message) =>
          !isFailedAssistantMessage(
            message,
          ),
      );

  let latestUserIndex = -1;

  for (
    let index =
      cleanedMessages.length - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      cleanedMessages[index]
        .role === "user"
    ) {
      latestUserIndex =
        index;

      break;
    }
  }

  if (
    latestUserIndex < 0
  ) {
    return {
      latestUserMessage:
        null,

      history: [],
    };
  }

  const latestUserMessage =
    cleanedMessages[
      latestUserIndex
    ].content.trim();

  const history =
    cleanedMessages
      .slice(
        0,
        latestUserIndex,
      )
      .slice(
        -MAX_HISTORY_MESSAGES,
      )
      .map((message) => ({
        role:
          message.role,

        content:
          shortenMessage(
            message.content,
          ),
      }));

  return {
    latestUserMessage,
    history,
  };
}