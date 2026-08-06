export type MessageSender =
  | "assistant"
  | "visitor";

export type TextChatMessage = {
  id: string;
  kind: "text";
  sender: MessageSender;
  text: string;
  isStreaming?: boolean;
};

export type ImageChatMessage = {
  id: string;
  kind: "image";
  sender: "assistant";
  prompt: string;
  imageUrl: string;
};

export type ChatMessage =
  | TextChatMessage
  | ImageChatMessage;

export type StoredChatMessage =
  TextChatMessage;

export type ThinkingMode =
  | "standard"
  | "live"
  | "image";

export type ChatbotSettings = {
  navbar_image_url?: string | null;
};

export type AssistantApiResponse = {
  success?: boolean;
  message?: string;
  mode?: "standard" | "live";
};

export type ApiConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type QuickQuestion = {
  title: string;
  description: string;
  message: string;
  accent: string;
  iconColor: string;
};

export type AssistantStreamEvent =
  | {
      type: "metadata";
      mode: "standard" | "live";
      model: string;
      sessionId: string | null;
    }
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