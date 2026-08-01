"use client";

import {
  FormEvent,
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
  FiSend,
  FiStar,
  FiX,
} from "react-icons/fi";

type ChatMessage = {
  id: string;
  sender: "assistant" | "visitor";
  text: string;
};

const WHATSAPP_NUMBER = "8801881527885";

const QUICK_QUESTIONS = [
  {
    title: "Hire me.",
    description: "Discuss sales or business support.",
    message: "I want to hire you.",
    accent:
      "from-blue-500/20 via-indigo-500/10 to-transparent",
    iconColor: "text-blue-300",
  },
  {
    title: "Request a quotation.",
    description: "Share a project and receive guidance.",
    message: "I need a project quotation.",
    accent:
      "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    iconColor: "text-violet-300",
  },
  {
    title: "Website project.",
    description: "Discuss a business website or platform.",
    message: "I want to discuss a website project.",
    accent:
      "from-cyan-500/20 via-blue-500/10 to-transparent",
    iconColor: "text-cyan-300",
  },
  {
    title: "Mobile application.",
    description: "Plan an application and its requirements.",
    message: "I want to discuss a mobile application.",
    accent:
      "from-emerald-500/20 via-teal-500/10 to-transparent",
    iconColor: "text-emerald-300",
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-message",
    sender: "assistant",
    text:
      "Hi, I am Mubarok Hossain. I can help you with international sales, business development, websites, mobile applications, project planning, and client communication.",
  },
];

function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>(INITIAL_MESSAGES);

  const [inputValue, setInputValue] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const [showQuestions, setShowQuestions] =
    useState(true);

  const [showScrollButton, setShowScrollButton] =
    useState(false);

  const scrollAreaRef =
    useRef<HTMLDivElement>(null);

  const responseTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  function updateScrollButton() {
    const container = scrollAreaRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    setShowScrollButton(distanceFromBottom > 80);
  }

  function scrollToBottom(
    behavior: ScrollBehavior = "smooth",
  ) {
    const container = scrollAreaRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }

  useEffect(() => {
    window.requestAnimationFrame(() => {
      scrollToBottom("smooth");
    });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        clearTimeout(responseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    if (window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    }

    window.requestAnimationFrame(() => {
      scrollToBottom("auto");
    });

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  function addVisitorMessage(text: string) {
    const cleanText = text.trim();

    if (!cleanText) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: createMessageId(),
        sender: "visitor",
        text: cleanText,
      },
    ]);
  }

  function addAssistantResponse() {
    setIsTyping(true);

    if (responseTimerRef.current) {
      clearTimeout(responseTimerRef.current);
    }

    responseTimerRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          sender: "assistant",
          text:
            "Thank you for your interest. Continue on WhatsApp and share your requirements, preferred timeline, estimated budget, or any questions you have.",
        },
      ]);

      setIsTyping(false);
    }, 550);
  }

  function handleQuickQuestion(question: string) {
    if (isTyping) {
      return;
    }

    addVisitorMessage(question);
    setInputValue(question);
    setShowQuestions(false);
    addAssistantResponse();
  }

  function createWhatsAppUrl(message: string) {
    const formattedMessage = [
      "Hello Mubarok Hossain,",
      "",
      "I contacted you from your portfolio website.",
      "",
      message.trim(),
      "",
      "I would like to discuss this with you.",
    ].join("\n");

    return (
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(formattedMessage)}`
    );
  }

  function openWhatsApp(message: string) {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return;
    }

    window.open(
      createWhatsAppUrl(cleanMessage),
      "_blank",
      "noopener,noreferrer",
    );
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message = inputValue.trim();

    if (!message) {
      return;
    }

    const duplicateMessage = [...messages]
      .reverse()
      .find(
        (item) =>
          item.sender === "visitor" &&
          item.text === message,
      );

    if (!duplicateMessage) {
      addVisitorMessage(message);
    }

    openWhatsApp(message);
    setInputValue("");
  }

  function continueOnWhatsApp() {
    const latestVisitorMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message.sender === "visitor",
      );

    const message =
      inputValue.trim() ||
      latestVisitorMessage?.text ||
      "I would like to discuss a business opportunity.";

    openWhatsApp(message);
  }

  function handleChatWheel(
    event: WheelEvent<HTMLDivElement>,
  ) {
    const container = scrollAreaRef.current;

    if (!container) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    container.scrollBy({
      top: event.deltaY,
      behavior: "auto",
    });
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

          <div className="pointer-events-none absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-emerald-500/10 blur-[80px]" />

          <header className="relative min-w-0 overflow-hidden border-b border-white/10 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 px-4 py-4 sm:px-5 sm:py-5">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

            <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-violet-500/20 shadow-[0_0_28px_rgba(34,211,238,0.18)] sm:h-14 sm:w-14">
                  <span className="bg-gradient-to-r from-cyan-200 to-violet-200 bg-clip-text text-sm font-extrabold text-transparent sm:text-lg">
                    MH.
                  </span>

                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#060a16] bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
                </div>

                <div className="min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-bold sm:text-lg">
                      Mubarok Hossain.
                    </p>

                    <FiStar className="h-4 w-4 shrink-0 text-violet-300" />
                  </div>

                  <p className="mt-1 truncate text-[9px] uppercase tracking-[0.1em] text-slate-400 sm:text-[10px]">
                    Sales and business consultant.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-200 min-[360px]:inline-flex">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>

                  Live.
                </span>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chatbot"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-400 transition hover:border-violet-300/30 hover:bg-violet-400/10 hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="relative min-h-0 min-w-0">
            <div
              ref={scrollAreaRef}
              onScroll={updateScrollButton}
              onWheel={handleChatWheel}
              className="h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div className="min-w-0 space-y-4 px-4 py-5 sm:px-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex min-w-0 ${
                      message.sender === "visitor"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-[88%] overflow-hidden break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
                        message.sender === "visitor"
                          ? "rounded-br-md border border-violet-300/15 bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white shadow-[0_12px_35px_rgba(99,102,241,0.24)]"
                          : "rounded-bl-md border border-cyan-300/10 bg-gradient-to-br from-white/[0.08] via-blue-400/[0.04] to-violet-400/[0.06] text-slate-300"
                      }`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.1),transparent_35%)]" />

                      <span className="relative">
                        {message.text}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-cyan-300/10 bg-gradient-to-r from-cyan-500/[0.07] to-violet-500/[0.07] px-4 py-4">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-300 [animation-delay:-0.3s]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-blue-300 [animation-delay:-0.15s]" />

                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 border-t border-white/10 px-4 py-5 sm:px-5">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
                      Popular questions.
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Select an option to get started.
                    </p>
                  </div>

                  {!showQuestions && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowQuestions(true)
                      }
                      className="shrink-0 rounded-full border border-violet-300/15 bg-violet-400/10 px-3 py-2 text-xs text-violet-200 transition hover:bg-violet-400/20"
                    >
                      Show all.
                    </button>
                  )}
                </div>

                {showQuestions && (
                  <div className="mt-4 grid min-w-0 gap-2.5">
                    {QUICK_QUESTIONS.map(
                      (question) => (
                        <button
                          key={question.message}
                          type="button"
                          disabled={isTyping}
                          onClick={() =>
                            handleQuickQuestion(
                              question.message,
                            )
                          }
                          className={`group relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r ${question.accent} px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200">
                              {question.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {question.description}
                            </p>
                          </div>

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20">
                            <FiArrowRight
                              className={`h-4 w-4 transition group-hover:translate-x-1 ${question.iconColor}`}
                            />
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollToBottom()}
              aria-label="Scroll to latest message"
              className={`absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/20 bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-[0_12px_35px_rgba(99,102,241,0.35)] transition duration-200 hover:-translate-y-1 ${
                showScrollButton
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none translate-y-3 scale-90 opacity-0"
              }`}
            >
              <FiArrowDown className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative min-w-0 overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#080d1b] to-[#060a16] p-4"
          >
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/35 to-transparent" />

            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_52px] items-end gap-3">
              <textarea
                rows={1}
                value={inputValue}
                onChange={(event) =>
                  setInputValue(event.target.value)
                }
                onFocus={() =>
                  window.requestAnimationFrame(() =>
                    scrollToBottom(),
                  )
                }
                placeholder="Ask Mubarok anything."
                className="min-h-[52px] max-h-24 min-w-0 w-full resize-none rounded-2xl border border-white/10 bg-gradient-to-r from-black/30 to-violet-500/[0.04] px-4 py-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/30 focus:shadow-[0_0_25px_rgba(34,211,238,0.08)]"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Send message on WhatsApp"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 text-slate-950 shadow-[0_14px_38px_rgba(34,211,238,0.24)] transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(34,211,238,0.34)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={continueOnWhatsApp}
              className="mt-3 flex w-full min-w-0 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-violet-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200 transition hover:border-emerald-300/30 hover:from-emerald-500/25 hover:via-cyan-500/15 hover:to-violet-500/15"
            >
              <span className="truncate">
                Continue on WhatsApp.
              </span>

              <FiCheck className="h-4 w-4 shrink-0" />
            </button>

            <p className="mt-3 truncate text-center text-[9px] leading-4 text-slate-600 sm:text-[10px]">
              Your message will open securely in WhatsApp.
            </p>
          </form>
        </section>
      </div>

      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        aria-label={
          isOpen
            ? "Close WhatsApp chatbot"
            : "Open WhatsApp chatbot"
        }
        className="fixed bottom-4 right-4 z-[91] flex h-14 w-14 items-center justify-center rounded-full border border-cyan-200/25 bg-gradient-to-br from-emerald-400 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_20px_60px_rgba(34,211,238,0.3),0_0_35px_rgba(139,92,246,0.2)] transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        {!isOpen && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/20" />

            <span className="absolute inset-2 rounded-full border border-white/20" />
          </>
        )}

        <span className="relative">
          {isOpen ? (
            <FiX className="h-6 w-6 sm:h-7 sm:w-7" />
          ) : (
            <FiMessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          )}
        </span>
      </button>
    </>
  );
}