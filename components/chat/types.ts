export type MessageSender =
  | "assistant"
  | "visitor";

export type MessageImageAttachment = {
  id: string;
  name: string;
  previewUrl: string;
};

export type TextChatMessage = {
  id: string;
  kind: "text";
  sender: MessageSender;
  text: string;
  isStreaming?: boolean;
  attachments?: MessageImageAttachment[];
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
  | "image"
  | "vision";

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

export type PendingImageStatus =
  | "ready"
  | "uploading"
  | "uploaded"
  | "error";

export type PendingImageAttachment = {
  id: string;
  originalName: string;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  file: File;
  previewUrl: string;
  status: PendingImageStatus;
  progress: number;
  storagePath: string | null;
  error: string | null;
};

export type SignedUploadItem = {
  id: string;
  path: string;
  token: string;
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
