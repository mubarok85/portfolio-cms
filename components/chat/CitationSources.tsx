"use client";

import {
  useState,
} from "react";
import {
  FiChevronDown,
  FiExternalLink,
  FiZap,
} from "react-icons/fi";
import {
  extractCitations,
} from "./citations";

type CitationSourcesProps = {
  content: string;
};

export default function CitationSources({
  content,
}: CitationSourcesProps) {
  const [
    isExpanded,
    setIsExpanded,
  ] = useState(false);

  const citations =
    extractCitations(
      content,
    );

  if (
    citations.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => {
          setIsExpanded(
            (current) =>
              !current,
          );
        }}
        aria-expanded={
          isExpanded
        }
        className="group inline-flex h-7 items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.045] px-2.5 text-[10px] font-medium text-slate-400 shadow-sm transition duration-150 hover:border-white/[0.16] hover:bg-white/[0.075] hover:text-slate-200"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-400/15 text-orange-300">
          <FiZap className="h-2 w-2 fill-current" />
        </span>

        <span>
          Sources.
        </span>

        <span className="text-[9px] text-slate-500">
          {citations.length}
        </span>

        <FiChevronDown
          className={`h-2.5 w-2.5 transition-transform duration-200 ${
            isExpanded
              ? "rotate-180"
              : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.08] bg-black/20">
          {citations.map(
            (
              citation,
              index,
            ) => (
              <div
                key={
                  citation.key
                }
                className="group flex min-w-0 items-center gap-2.5 border-b border-white/[0.06] px-3 py-2.5 last:border-b-0"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-400/10 text-[9px] font-semibold text-orange-200">
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium text-slate-300">
                    Search source{" "}
                    {
                      citation
                        .sourceNumber
                    }.
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-600">
                    Lines{" "}
                    {
                      citation.startLine
                    }
                    {citation.endLine &&
                    citation.endLine !==
                      citation.startLine
                      ? `–${citation.endLine}`
                      : ""}
                    .
                  </p>
                </div>

                <FiExternalLink className="h-3 w-3 shrink-0 text-slate-700" />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}