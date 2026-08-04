"use client";

import {
  FormEvent,
  KeyboardEvent,
  WheelEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiArrowDown,
  FiArrowRight,
  FiCheck,
  FiMessageCircle,
  FiRefreshCw,
  FiSend,
  FiStar,
  FiX,
} from "react-icons/fi";

type ChatMessage = {
  id: string;
  sender: "assistant" | "visitor";
  text: string;
};

type ChatbotSettings = {
  navbar_image_url?: string | null;
};

type AssistantApiResponse = {
  success?: boolean;
  message?: string;
};

const WHATSAPP_NUMBER =
  "8801881527885";

const FALLBACK_IMAGE =
  "/profile.webp";

const SESSION_STORAGE_KEY =
  "portfolio-assistant-session";

const CHAT_STORAGE_KEY =
  "portfolio-assistant-messages";

const MAX_STORED_MESSAGES = 20;

const QUICK_QUESTIONS = [
  {
    title: "Hire Mubarok.",
    description:
      "Discuss sales or business support.",
    message:
      "I want to hire Mubarok. Can you help me get started?",
    accent:
      "from-blue-500/20 via-indigo-500/10 to-transparent",
    iconColor: "text-blue-300",
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
    iconColor: "text-violet-300",
  },
  {
    title: "Website project.",
    description:
      "Discuss a website or online platform.",
    message:
      "I want to discuss a website project.",
    accent:
      "from-cyan-500/20 via-blue-500/10 to-transparent",
    iconColor: "text-cyan-300",
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

const INITIAL_MESSAGES: ChatMessage[] =
  [
    {
      id: "welcome-message",
      sender: "assistant",
      text:
        "Hi, I am Mubarok Hossain's AI assistant. You can ask me general questions, learn about Mubarok's portfolio, discuss a project, or continue directly on WhatsApp.",
    },
  ];

function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createSessionId() {
  return `session-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] =
    useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>(
      INITIAL_MESSAGES,
    );

  const [inputValue, setInputValue] =
    useState("");

  const [isTyping, setIsTyping] =
    useState(false);

  const [
    showQuestions,
    setShowQuestions,
  ] = useState(true);

  const [
    showScrollButton,
    setShowScrollButton,
  ] = useState(false);

  const [
    profileImage,
    setProfileImage,
  ] = useState(FALLBACK_IMAGE);

  const [imageFailed, setImageFailed] =
    useState(false);

  const [sessionId, setSessionId] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const scrollAreaRef =
    useRef<HTMLDivElement>(null);

  const requestControllerRef =
    useRef<AbortController | null>(
      null,
    );

  useEffect(() => {
    const storedSession =
      window.localStorage.getItem(
        SESSION_STORAGE_KEY,
      );

    const currentSession =
      storedSession ||
      createSessionId();

    if (!storedSession) {
      window.localStorage.setItem(
        SESSION_STORAGE_KEY,
        currentSession,
      );
    }

    setSessionId(currentSession);

    try {
      const storedMessages =
        window.localStorage.getItem(
          CHAT_STORAGE_KEY,
        );

      if (storedMessages) {
        const parsedMessages =
          JSON.parse(
            storedMessages,
          ) as ChatMessage[];

        if (
          Array.isArray(
            parsedMessages,
          ) &&
          parsedMessages.length > 0
        ) {
          setMessages(
            parsedMessages.slice(
              -MAX_STORED_MESSAGES,
            ),
          );

          setShowQuestions(false);
        }
      }
    } catch {
      window.localStorage.removeItem(
        CHAT_STORAGE_KEY,
      );
    }
  }, []);

  useEffect(() => {
    if (
      messages.length === 0
    ) {
      return;
    }

    window.localStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(
        messages.slice(
          -MAX_STORED_MESSAGES,
        ),
      ),
    );
  }, [messages]);

  useEffect(() => {
    async function loadChatbotImage() {
      try {
        const response = await fetch(
          "/api/settings",
          {
            cache: "no-store",
          },
        );

        const result =
          await response.json();

        if (
          response.ok &&
          result.success &&
          result.data
        ) {
          const settings =
            result.data as ChatbotSettings;

          setProfileImage(
            settings.navbar_image_url?.trim() ||
              FALLBACK_IMAGE,
          );

          setImageFailed(false);
        }
      } catch {
        setProfileImage(
          FALLBACK_IMAGE,
        );
      }
    }

    loadChatbotImage();
  }, []);

  useEffect(() => {
    return () => {
      requestControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    if (window.innerWidth < 640) {
      document.body.style.overflow =
        "hidden";
    }

    window.requestAnimationFrame(
      () => {
        scrollToBottom("auto");
      },
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    window.requestAnimationFrame(
      () => {
        scrollToBottom("smooth");
      },
    );
  }, [messages, isTyping]);

  function updateScrollButton() {
    const container =
      scrollAreaRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    setShowScrollButton(
      distanceFromBottom > 80,
    );
  }

  function scrollToBottom(
    behavior: ScrollBehavior = "smooth",
  ) {
    const container =
      scrollAreaRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }

  async function sendMessage(
    rawMessage: string,
  ) {
    const cleanMessage =
      rawMessage.trim();

    if (
      !cleanMessage ||
      isTyping
    ) {
      return;
    }

    setErrorMessage("");
    setShowQuestions(false);

    const visitorMessage: ChatMessage =
      {
        id: createMessageId(),
        sender: "visitor",
        text: cleanMessage,
      };

    const updatedMessages = [
      ...messages,
      visitorMessage,
    ].slice(-MAX_STORED_MESSAGES);

    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    requestControllerRef.current?.abort();

    const controller =
      new AbortController();

    requestControllerRef.current =
      controller;

    try {
      const response = await fetch(
        "/api/assistant",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            sessionId,

            messages:
              updatedMessages
                .filter(
                  (message) =>
                    message.id !==
                    "welcome-message",
                )
                .slice(-10)
                .map((message) => ({
                  role:
                    message.sender ===
                    "visitor"
                      ? "user"
                      : "assistant",

                  content:
                    message.text,
                })),
          }),

          signal:
            controller.signal,
        },
      );

      const result =
        (await response.json()) as AssistantApiResponse;

      const assistantText =
        result.message?.trim();

      if (
        !response.ok ||
        !result.success ||
        !assistantText
      ) {
        throw new Error(
          assistantText ||
            "The assistant could not respond.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          sender: "assistant",
          text: assistantText,
        },
      ]);
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      const fallbackMessage =
        error instanceof Error &&
        error.message
          ? error.message
          : "I could not generate a response right now. Please try again or continue on WhatsApp.";

      setErrorMessage(
        fallbackMessage,
      );

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          sender: "assistant",
          text:
            "I am having trouble responding right now. You can try again or use the Continue on WhatsApp button.",
        },
      ]);
    } finally {
      setIsTyping(false);

      if (
        requestControllerRef.current ===
        controller
      ) {
        requestControllerRef.current =
          null;
      }
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void sendMessage(inputValue);
  }

  function handleTextareaKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage(inputValue);
    }
  }

  function handleQuickQuestion(
    question: string,
  ) {
    void sendMessage(question);
  }

  function createWhatsAppSummary() {
    const recentConversation =
      messages
        .filter(
          (message) =>
            message.id !==
            "welcome-message",
        )
        .slice(-8)
        .map((message) => {
          const speaker =
            message.sender ===
            "visitor"
              ? "Visitor"
              : "Assistant";

          return `${speaker}: ${message.text}`;
        })
        .join("\n\n");

    return (
      recentConversation ||
      inputValue.trim() ||
      "I would like to discuss a business opportunity."
    );
  }

  function createWhatsAppUrl(
    message: string,
  ) {
    const formattedMessage = [
      "Hello Mubarok Hossain,",
      "",
      "I contacted you through your portfolio AI assistant.",
      "",
      "Conversation summary.",
      "",
      message.trim(),
      "",
      "I would like to continue this discussion with you.",
    ].join("\n");

    return (
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(
        formattedMessage,
      )}`
    );
  }

  function continueOnWhatsApp() {
    window.open(
      createWhatsAppUrl(
        createWhatsAppSummary(),
      ),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function clearConversation() {
    requestControllerRef.current?.abort();

    const newSession =
      createSessionId();

    window.localStorage.setItem(
      SESSION_STORAGE_KEY,
      newSession,
    );

    window.localStorage.removeItem(
      CHAT_STORAGE_KEY,
    );

    setSessionId(newSession);
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    setIsTyping(false);
    setErrorMessage("");
    setShowQuestions(true);
  }

  function handleChatWheel(
    event: WheelEvent<HTMLDivElement>,
  ) {
    const container =
      scrollAreaRef.current;

    if (!container) {
      return;
    }

    event.stopPropagation();

    container.scrollBy({
      top: event.deltaY,
      behavior: "auto",
    });
  }

  function handleImageError() {
    if (
      profileImage !==
      FALLBACK_IMAGE
    ) {
      setProfileImage(
        FALLBACK_IMAGE,
      );

      setImageFailed(false);

      return;
    }

    setImageFailed(true);
  }

  return (
    <>
      <div
        className={`fixed inset-x-3 bottom-[82px] z-[90] mx-auto w-auto max-w-[400px] transition-all duration-300 sm:inset-x-auto sm:bottom-24 sm:right-5 sm:mx-0 sm:w-[390px] lg:right-6 lg:w-[410px] ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-5 scale-[0.96] opacity-0"
        }`}
      >
        <section className="relative grid max-h-[calc(100dvh-98px)] w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[30px] border border-white/10 bg-[#060a16]/98 text-white shadow-[0_35px_120px_rgba(0,0,0,0.72),0_0_70px_rgba(99,102,241,0.16)] backdrop-blur-2xl sm:max-h-[700px]">
          <div className="pointer-events-none absolute -left-20 -top-24 h-52 w-52 rounded-full bg-cyan-500/15 blur-[80px]" />

          <div className="pointer-events-none absolute -right-20 top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-[90px]" />

          <header className="relative min-w-0 overflow-hidden border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 px-4 py-4 sm:px-5">
            <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-violet-500/20">
                  {!imageFailed ? (
                    <img
                      src={profileImage}
                      alt="Mubarok Hossain"
                      onError={
                        handleImageError
                      }
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-extrabold text-cyan-200">
                      MH.
                    </div>
                  )}

                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#060a16] bg-emerald-400" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold sm:text-lg">
                      Mubarok AI.
                    </p>

                    <FiStar className="h-4 w-4 shrink-0 text-violet-300" />
                  </div>

                  <p className="mt-1 truncate text-[9px] uppercase tracking-[0.1em] text-slate-400 sm:text-[10px]">
                    General assistant and portfolio guide.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={
                    clearConversation
                  }
                  aria-label="Start a new conversation"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:text-white"
                >
                  <FiRefreshCw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsOpen(false)
                  }
                  aria-label="Close chatbot"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="relative min-h-0 min-w-0">
            <div
              ref={scrollAreaRef}
              onScroll={
                updateScrollButton
              }
              onWheel={
                handleChatWheel
              }
              className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="space-y-4 px-4 py-5 sm:px-5">
                {messages.map(
                  (message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender ===
                        "visitor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.sender ===
                          "visitor"
                            ? "rounded-br-md bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white"
                            : "rounded-bl-md border border-white/10 bg-white/[0.06] text-slate-300"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ),
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-4">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.15s]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300" />
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                    {errorMessage}
                  </p>
                )}
              </div>

              {showQuestions && (
                <div className="border-t border-white/10 px-4 py-5 sm:px-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                    Suggested questions.
                  </p>

                  <div className="mt-4 grid gap-2.5">
                    {QUICK_QUESTIONS.map(
                      (question) => (
                        <button
                          key={
                            question.message
                          }
                          type="button"
                          disabled={isTyping}
                          onClick={() =>
                            handleQuickQuestion(
                              question.message,
                            )
                          }
                          className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r ${question.accent} px-4 py-3.5 text-left transition hover:-translate-y-0.5 disabled:opacity-50`}
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200">
                              {
                                question.title
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {
                                question.description
                              }
                            </p>
                          </div>

                          <FiArrowRight
                            className={`h-4 w-4 ${question.iconColor}`}
                          />
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                scrollToBottom()
              }
              aria-label="Scroll to latest message"
              className={`absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-white transition ${
                showScrollButton
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <FiArrowDown className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative border-t border-white/10 bg-[#060a16] p-4"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_52px] items-end gap-3">
              <textarea
                rows={1}
                value={inputValue}
                maxLength={1500}
                onChange={(event) =>
                  setInputValue(
                    event.target.value,
                  )
                }
                onKeyDown={
                  handleTextareaKeyDown
                }
                placeholder="Ask anything."
                className="min-h-[52px] max-h-28 w-full resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600"
              />

              <button
                type="submit"
                disabled={
                  !inputValue.trim() ||
                  isTyping
                }
                aria-label="Send message"
                className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 disabled:opacity-40"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={
                continueOnWhatsApp
              }
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200"
            >
              Continue on WhatsApp.

              <FiCheck className="h-4 w-4" />
            </button>

            <p className="mt-3 text-center text-[9px] leading-4 text-slate-600">
              AI responses may be incorrect. Do not submit passwords, payment information, or confidential data.
            </p>
          </form>
        </section>
      </div>

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) => !current,
          )
        }
        aria-label={
          isOpen
            ? "Close AI assistant"
            : "Open AI assistant"
        }
        className="fixed bottom-4 right-4 z-[91] flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/25 bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_20px_60px_rgba(34,211,238,0.3)] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        {isOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}