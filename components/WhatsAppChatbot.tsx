"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiArrowRight,
  FiCheck,
  FiMessageCircle,
  FiSend,
  FiX,
} from "react-icons/fi";

type ChatMessage = {
  id: string;
  sender: "assistant" | "visitor";
  text: string;
};

const WHATSAPP_NUMBER = "8801881527885";

const QUICK_QUESTIONS = [
  "I want to hire you.",
  "I need a project quotation.",
  "I want to discuss a website project.",
  "I want to discuss a mobile application.",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome",
    sender: "assistant",
    text:
      "Hi, I am Mubarok Hossain. I can help you with sales consultation, business development, websites, mobile applications, and project planning.",
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

  const [showQuestions, setShowQuestions] = useState(true);

  const messagesRef = useRef<HTMLDivElement>(null);

  const responseTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = messagesRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
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

    const handleViewport = () => {
      if (window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow =
          previousOverflow;
      }
    };

    handleViewport();

    window.addEventListener("resize", handleViewport);

    return () => {
      window.removeEventListener(
        "resize",
        handleViewport,
      );

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
            "Thank you for your interest. Continue on WhatsApp and share your requirements, preferred timeline, and estimated budget.",
        },
      ]);

      setIsTyping(false);
    }, 500);
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

    const latestMessage = [...messages]
      .reverse()
      .find(
        (item) =>
          item.sender === "visitor" &&
          item.text === message,
      );

    if (!latestMessage) {
      addVisitorMessage(message);
    }

    openWhatsApp(message);
    setInputValue("");
  }

  function continueOnWhatsApp() {
    const latestVisitorMessage = [...messages]
      .reverse()
      .find(
        (message) => message.sender === "visitor",
      );

    const message =
      inputValue.trim() ||
      latestVisitorMessage?.text ||
      "I would like to discuss a business opportunity.";

    openWhatsApp(message);
  }

  return (
    <>
      <div
        className={`fixed inset-x-3 bottom-[82px] z-[90] mx-auto w-auto max-w-[390px] transition-all duration-300 sm:inset-x-auto sm:bottom-24 sm:right-5 sm:mx-0 sm:w-[380px] lg:right-6 lg:w-[390px] ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-[0.97] opacity-0"
        }`}
      >
        <section className="grid max-h-[calc(100dvh-98px)] w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[26px] border border-white/10 bg-[#07101b] text-white shadow-[0_30px_100px_rgba(0,0,0,0.62)] sm:max-h-[680px]">
          <header className="relative min-w-0 overflow-hidden border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-violet-500/10 px-4 py-4 sm:px-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.14),transparent_36%)]" />

            <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10">
                  <span className="text-sm font-extrabold text-emerald-200">
                    MH.
                  </span>

                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#07101b] bg-emerald-400" />
                </div>

                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-base font-bold">
                    Mubarok Hossain.
                  </p>

                  <p className="mt-1 truncate text-[9px] uppercase tracking-[0.09em] text-slate-400">
                    Sales and business consultant.
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-200 min-[360px]:inline-flex">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  Live.
                </span>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chatbot"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="min-h-0 min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain">
            <div
              ref={messagesRef}
              className="min-w-0 space-y-4 px-4 py-5 sm:px-5"
            >
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
                    className={`max-w-[88%] overflow-hidden break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      message.sender === "visitor"
                        ? "rounded-br-md bg-gradient-to-r from-blue-500 to-violet-500 text-white"
                        : "rounded-bl-md border border-white/10 bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-4">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 border-t border-white/10 px-4 py-5 sm:px-5">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Popular questions.
                </p>

                {!showQuestions && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowQuestions(true)
                    }
                    className="shrink-0 text-xs text-emerald-300 transition hover:text-emerald-200"
                  >
                    Show all.
                  </button>
                )}
              </div>

              {showQuestions && (
                <div className="mt-3 grid min-w-0 gap-2">
                  {QUICK_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      disabled={isTyping}
                      onClick={() =>
                        handleQuickQuestion(question)
                      }
                      className="group grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left text-sm leading-5 text-slate-400 transition hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="min-w-0 break-words">
                        {question}
                      </span>

                      <FiArrowRight className="h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="min-w-0 overflow-hidden border-t border-white/10 bg-[#07101b] p-4"
          >
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_52px] items-end gap-3">
              <textarea
                rows={1}
                value={inputValue}
                onChange={(event) =>
                  setInputValue(event.target.value)
                }
                placeholder="Ask Mubarok anything."
                className="min-h-[52px] max-h-24 min-w-0 w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/25"
              />

              <button
                type="submit"
                disabled={!inputValue.trim()}
                aria-label="Send message on WhatsApp"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.3)] transition hover:-translate-y-1 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={continueOnWhatsApp}
              className="mt-3 flex w-full min-w-0 items-center justify-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
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
        className="fixed bottom-4 right-4 z-[91] flex h-14 w-14 items-center justify-center rounded-full border border-emerald-300/20 bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-[0_18px_55px_rgba(16,185,129,0.35)] transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
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