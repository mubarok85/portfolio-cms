import type {
  QuickQuestion,
  TextChatMessage,
} from "./types";

export const WHATSAPP_NUMBER =
  "8801881527885";

export const FALLBACK_IMAGE =
  "/profile.webp";

export const SESSION_STORAGE_KEY =
  "portfolio-assistant-session";

export const CHAT_STORAGE_KEY =
  "portfolio-assistant-messages";

export const MAX_API_CONTEXT_MESSAGES =
  6;

export const MAX_CONTEXT_MESSAGE_LENGTH =
  900;

export const IMAGE_REQUEST_PATTERNS: RegExp[] =
  [
    /\b(generate|create|make|draw|design|paint|illustrate|render)\b.*\b(image|picture|photo|art|artwork|poster|logo|icon|wallpaper|portrait|illustration)\b/i,

    /\b(image|picture|photo|artwork|poster|logo|wallpaper|portrait)\b.*\b(of|showing|with)\b/i,

    /^\s*\/image\s+/i,
  ];

export const LIVE_INFORMATION_PATTERNS: RegExp[] =
  [
    /\b(today|tonight|currently|current|right now|now)\b/i,

    /\b(latest|recent|newest|breaking|live|updated|up[- ]to[- ]date)\b/i,

    /\b(search the web|search online|look up|check online)\b/i,

    /\b(news|weather|forecast|score|scores|fixture|schedule|standings)\b/i,

    /\b(who won|winner|current president|current ceo)\b/i,

    /\b(world cup|champions league|premier league|nba|nfl|ipl|cricket)\b/i,
  ];

export const QUICK_QUESTIONS: QuickQuestion[] =
  [
    {
      title:
        "Generate an image.",
      description:
        "Create artwork from a description.",
      message:
        "Generate an image of a futuristic premium office at night.",
      accent:
        "from-fuchsia-500/20 via-violet-500/10 to-transparent",
      iconColor:
        "text-fuchsia-300",
    },
    {
      title:
        "Hire Mubarok.",
      description:
        "Discuss sales or business support.",
      message:
        "I want to hire Mubarok. Can you help me get started?",
      accent:
        "from-blue-500/20 via-indigo-500/10 to-transparent",
      iconColor:
        "text-blue-300",
    },
    {
      title:
        "Request a quotation.",
      description:
        "Discuss your project requirements.",
      message:
        "I need a project quotation. What information should I provide?",
      accent:
        "from-violet-500/20 via-fuchsia-500/10 to-transparent",
      iconColor:
        "text-violet-300",
    },
    {
      title:
        "Ask a general question.",
      description:
        "Use the assistant like a regular chatbot.",
      message:
        "What can you help me with?",
      accent:
        "from-emerald-500/20 via-teal-500/10 to-transparent",
      iconColor:
        "text-emerald-300",
    },
  ];

export const INITIAL_MESSAGES: TextChatMessage[] =
  [
    {
      id:
        "welcome-message",
      kind:
        "text",
      sender:
        "assistant",
      text:
        "Hi, I am **Mubarok Hossain's AI assistant**. I can answer questions, search current information, discuss projects, and generate images from text descriptions.",
    },
  ];