"use client";

import type {
  RefObject,
  WheelEvent,
} from "react";
import {
  FiArrowDown,
  FiArrowRight,
} from "react-icons/fi";
import GeneratedImageCard from "./GeneratedImageCard";
import MarkdownRenderer from "./MarkdownRenderer";
import ThinkingIndicator from "./ThinkingIndicator";
import {
  QUICK_QUESTIONS,
} from "./constants";
import type {
  ChatMessage,
  ThinkingMode,
} from "./types";

type ChatMessagesProps = {
  messages: ChatMessage[];
  isBusy: boolean;
  isWaitingForFirstToken: boolean;
  thinkingMode: ThinkingMode;
  errorMessage: string;
  showQuestions: boolean;
  showScrollButton: boolean;
  regeneratingMessageId: string | null;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  onWheel: (
    event: WheelEvent<HTMLDivElement>,
  ) => void;
  onQuickQuestion: (
    question: string,
  ) => void;
  onRegenerateImage: (
    prompt: string,
    messageId: string,
  ) => void;
  onScrollToBottom: () => void;
};

export default function ChatMessages({
  messages,
  isBusy,
  isWaitingForFirstToken,
  thinkingMode,
  errorMessage,
  showQuestions,
  showScrollButton,
  regeneratingMessageId,
  scrollAreaRef,
  onScroll,
  onWheel,
  onQuickQuestion,
  onRegenerateImage,
  onScrollToBottom,
}: ChatMessagesProps) {
  return (
    <div className="relative min-h-0 min-w-0">
      <div
        ref={
          scrollAreaRef
        }
        onScroll={
          onScroll
        }
        onWheel={
          onWheel
        }
        className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="space-y-4 px-4 py-5">
          {messages.map(
            (message) => (
              <div
                key={
                  message.id
                }
                className={`flex ${
                  message.sender ===
                  "visitor"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.kind ===
                "image" ? (
                  <div className="w-[92%]">
                    <GeneratedImageCard
                      imageUrl={
                        message.imageUrl
                      }
                      prompt={
                        message.prompt
                      }
                      isRegenerating={
                        regeneratingMessageId ===
                        message.id
                      }
                      onRegenerate={() => {
                        onRegenerateImage(
                          message.prompt,
                          message.id,
                        );
                      }}
                    />
                  </div>
                ) : message.sender ===
                  "visitor" ? (
                  <div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 px-4 py-3 text-sm leading-6 text-white shadow-[0_12px_30px_rgba(79,70,229,0.2)]">
                    {
                      message.text
                    }
                  </div>
                ) : (
                  <div className="relative max-w-[92%] overflow-hidden rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.055] px-4 py-3.5 shadow-[0_12px_35px_rgba(0,0,0,0.18)]">
                    <MarkdownRenderer
                      content={
                        message.text
                      }
                    />

                    {message.isStreaming && (
                      <span
                        aria-hidden="true"
                        className="ml-1 inline-block h-4 w-[2px] animate-pulse rounded-full bg-cyan-300 align-middle"
                      />
                    )}
                  </div>
                )}
              </div>
            ),
          )}

          {isBusy &&
            isWaitingForFirstToken && (
              <ThinkingIndicator
                mode={
                  thinkingMode
                }
              />
            )}

          {errorMessage && (
            <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-xs leading-5 text-rose-200">
              {errorMessage}
            </p>
          )}
        </div>

        {showQuestions && (
          <div className="border-t border-white/10 px-4 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-300">
              Suggested prompts.
            </p>

            <div className="mt-4 grid gap-2.5">
              {QUICK_QUESTIONS.map(
                (
                  question,
                ) => (
                  <button
                    key={
                      question.message
                    }
                    type="button"
                    disabled={
                      isBusy
                    }
                    onClick={() => {
                      onQuickQuestion(
                        question.message,
                      );
                    }}
                    className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r ${question.accent} px-4 py-3.5 text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50`}
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
        onClick={
          onScrollToBottom
        }
        aria-label="Scroll to latest message"
        className={`absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-[0_12px_30px_rgba(34,211,238,0.2)] transition ${
          showScrollButton
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <FiArrowDown className="h-5 w-5" />
      </button>
    </div>
  );
}