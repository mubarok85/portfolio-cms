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
  id: number;
  sender: "assistant" | "visitor";
  text: string;
};

const whatsappNumber = "8801881527885";

const quickQuestions = [
  "I want to hire you.",
  "I need a project quotation.",
  "I want to discuss a website project.",
  "I want to discuss a mobile application.",
  "I need business consultation.",
  "I want to discuss a partnership.",
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "assistant",
    text:
      "Hi, I am Mubarok Hossain. I can help you with sales consultation, business development, websites, mobile applications, and project planning.",
  },
];

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

  const [inputValue, setInputValue] = useState("");

  const [selectedQuestion, setSelectedQuestion] =
    useState("");

  const [isTyping, setIsTyping] = useState(false);

  const messagesRef = useRef<HTMLDivElement>(null);

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

  function addAssistantResponse(question: string) {
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now(),
          sender: "assistant",
          text:
            "Thank you for your interest. Please continue on WhatsApp, and include any project details, requirements, budget, or timeline you already have.",
        },
      ]);

      setIsTyping(false);
      setSelectedQuestion(question);
    }, 650);
  }

  function selectQuickQuestion(question: string) {
    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "visitor",
        text: question,
      },
    ]);

    setInputValue(question);
    addAssistantResponse(question);
  }

  function openWhatsApp(message: string) {
    const cleanMessage = message.trim();

    if (!cleanMessage) {
      return;
    }

    const whatsappMessage = [
      "Hello Mubarok Hossain,",
      "",
      "I contacted you from your portfolio website.",
      "",
      cleanMessage,
      "",
      "I would like to discuss this with you.",
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}` +
      `?text=${encodeURIComponent(whatsappMessage)}`;

    window.open(
      whatsappUrl,
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

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        sender: "visitor",
        text: message,
      },
    ]);

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
      latestVisitorMessage?.text ||
      selectedQuestion ||
      inputValue ||
      "I would like to discuss a business opportunity.";

    openWhatsApp(message);
  }

  return (
    <>
      <div
        className={`fixed bottom-24 right-4 z-[90] w-[calc(100%-32px)] max-w-[390px] origin-bottom-right transition-all duration-300 sm:bottom-24 sm:right-6 ${
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-5 scale-95 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07101b]/95 text-white shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          <div className="relative border-b border-white/10 bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-violet-500/10 px-5 py-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.15),transparent_35%)]" />

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10">
                  <span className="text-lg font-extrabold text-emerald-200">
                    MH.
                  </span>

                  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#07101b] bg-emerald-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-lg font-bold">
                    Mubarok Hossain.
                  </p>

                  <p className="mt-1 truncate text-xs uppercase tracking-[0.12em] text-slate-400">
                    Sales and business consultant.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Live.
                </span>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chatbot"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={messagesRef}
            className="max-h-[320px] space-y-4 overflow-y-auto px-5 py-5"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "visitor"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
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

          <div className="border-t border-white/10 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Popular questions.
            </p>

            <div className="mt-3 space-y-2">
              {quickQuestions.slice(0, 4).map(
                (question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() =>
                      selectQuickQuestion(question)
                    }
                    className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-left text-sm text-slate-400 transition hover:border-emerald-300/20 hover:bg-emerald-400/[0.06] hover:text-white"
                  >
                    <span>{question}</span>

                    <FiArrowRight className="h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-1" />
                  </button>
                ),
              )}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-4"
          >
            <div className="flex items-end gap-3">
              <textarea
                rows={1}
                value={inputValue}
                onChange={(event) =>
                  setInputValue(event.target.value)
                }
                placeholder="Ask Mubarok anything."
                className="min-h-[52px] max-h-28 flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/25"
              />

              <button
                type="submit"
                aria-label="Send message on WhatsApp"
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.3)] transition hover:-translate-y-1 hover:bg-emerald-400"
              >
                <FiSend className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={continueOnWhatsApp}
              className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
            >
              Continue on WhatsApp.
              <FiCheck className="h-4 w-4" />
            </button>

            <p className="mt-3 text-center text-[10px] leading-5 text-slate-600">
              Your message will open securely in WhatsApp.
            </p>
          </form>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={
          isOpen
            ? "Close WhatsApp chatbot"
            : "Open WhatsApp chatbot"
        }
        className="fixed bottom-5 right-4 z-[91] flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/20 bg-gradient-to-br from-emerald-400 to-cyan-500 text-slate-950 shadow-[0_18px_55px_rgba(16,185,129,0.35)] transition duration-300 hover:-translate-y-1 hover:scale-105 sm:bottom-6 sm:right-6"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />

        <span className="relative">
          {isOpen ? (
            <FiX className="h-7 w-7" />
          ) : (
            <FiMessageCircle className="h-7 w-7" />
          )}
        </span>
      </button>
    </>
  );
}