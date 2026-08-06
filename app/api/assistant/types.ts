export type ConversationRole =
  | "user"
  | "assistant";

export type GroqRole =
  | "system"
  | "user"
  | "assistant";

export type ValidatedMessage = {
  role: ConversationRole;
  content: string;
};

export type GroqMessage = {
  role: GroqRole;
  content: string;
};

export type PortfolioRow =
  Record<string, unknown>;

export type PortfolioRecord =
  | PortfolioRow
  | PortfolioRow[]
  | null;

export type PortfolioContext = {
  settings: PortfolioRecord;
  hero: PortfolioRecord;
  about: PortfolioRecord;
  services: PortfolioRecord;
  experience: PortfolioRecord;
  projects: PortfolioRecord;
};

export type PreparedConversation = {
  latestUserMessage: string | null;
  history: GroqMessage[];
};

export type AssistantMode =
  | "standard"
  | "live";

export type GroqApiResponse = {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
      executed_tools?: unknown[];
    };
  }>;

  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

export type GroqCompletionOptions = {
  apiKey: string;
  model: string;
  messages: GroqMessage[];
  signal: AbortSignal;
};

export type AssistantStreamEvent =
  | {
      type: "metadata";
      mode: AssistantMode;
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