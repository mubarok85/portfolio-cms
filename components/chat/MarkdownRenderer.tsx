"use client";

import type {
  ReactNode,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FiZap,
} from "react-icons/fi";
import {
  isCitationUrl,
  prepareCitationMarkdown,
} from "./citations";

type MarkdownRendererProps = {
  content: string;
};

function renderBlockedLink(
  children: ReactNode,
) {
  return (
    <span className="font-medium text-slate-200">
      {children}
    </span>
  );
}

export default function MarkdownRenderer({
  content,
}: MarkdownRendererProps) {
  const preparedContent =
    prepareCitationMarkdown(
      content,
    );

  return (
    <div className="min-w-0 max-w-full text-sm leading-7 text-slate-300">
      <ReactMarkdown
        remarkPlugins={[
          remarkGfm,
        ]}
        skipHtml
        components={{
          h1: ({
            children,
          }) => (
            <h1 className="mb-3 mt-5 text-xl font-bold leading-tight text-white first:mt-0">
              {children}
            </h1>
          ),

          h2: ({
            children,
          }) => (
            <h2 className="mb-3 mt-5 text-lg font-bold leading-tight text-white first:mt-0">
              {children}
            </h2>
          ),

          h3: ({
            children,
          }) => (
            <h3 className="mb-2.5 mt-4 text-base font-semibold leading-tight text-slate-100 first:mt-0">
              {children}
            </h3>
          ),

          h4: ({
            children,
          }) => (
            <h4 className="mb-2 mt-4 text-sm font-semibold text-slate-100 first:mt-0">
              {children}
            </h4>
          ),

          p: ({
            children,
          }) => (
            <p className="mb-3 break-words leading-7 text-slate-300 last:mb-0">
              {children}
            </p>
          ),

          strong: ({
            children,
          }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),

          em: ({
            children,
          }) => (
            <em className="text-slate-200">
              {children}
            </em>
          ),

          ul: ({
            children,
          }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-cyan-300">
              {children}
            </ul>
          ),

          ol: ({
            children,
          }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-violet-300">
              {children}
            </ol>
          ),

          li: ({
            children,
          }) => (
            <li className="pl-1 leading-7 text-slate-300 [&>p]:mb-0">
              {children}
            </li>
          ),

          blockquote: ({
            children,
          }) => (
            <blockquote className="my-4 rounded-r-2xl border-l-2 border-violet-400/70 bg-violet-400/[0.07] px-4 py-3 text-slate-300 [&>p]:mb-0">
              {children}
            </blockquote>
          ),

          a: ({
            href,
            children,
          }) => {
            if (
              isCitationUrl(
                href,
              )
            ) {
              return (
                <span
                  title="Search citation reference"
                  className="mx-0.5 inline-flex translate-y-[1px] items-center gap-1 rounded-full border border-orange-300/20 bg-orange-400/10 px-2 py-0.5 text-[10px] font-semibold leading-4 text-orange-200 shadow-[0_5px_18px_rgba(251,146,60,0.08)]"
                >
                  <FiZap className="h-2.5 w-2.5 fill-current" />

                  <span>
                    {children}
                  </span>
                </span>
              );
            }

            return renderBlockedLink(
              children,
            );
          },

          code: ({
            className,
            children,
          }) => {
            const isBlock =
              Boolean(className);

            if (!isBlock) {
              return (
                <code className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.88em] text-cyan-200">
                  {children}
                </code>
              );
            }

            return (
              <code
                className={`${className || ""} font-mono text-xs leading-6 text-slate-300`}
              >
                {children}
              </code>
            );
          },

          pre: ({
            children,
          }) => (
            <div className="my-4 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#02050d] shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2.5">
                <span className="h-2 w-2 rounded-full bg-rose-300/70" />

                <span className="h-2 w-2 rounded-full bg-amber-300/70" />

                <span className="h-2 w-2 rounded-full bg-emerald-300/70" />

                <span className="ml-1 text-[10px] uppercase tracking-[0.12em] text-slate-500">
                  Code.
                </span>
              </div>

              <pre className="max-w-full overflow-x-auto p-4">
                {children}
              </pre>
            </div>
          ),

          table: ({
            children,
          }) => (
            <div className="my-4 max-w-full overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full border-collapse text-left text-xs">
                {children}
              </table>
            </div>
          ),

          thead: ({
            children,
          }) => (
            <thead className="bg-white/[0.07] text-slate-200">
              {children}
            </thead>
          ),

          tbody: ({
            children,
          }) => (
            <tbody className="divide-y divide-white/10">
              {children}
            </tbody>
          ),

          tr: ({
            children,
          }) => (
            <tr className="divide-x divide-white/10">
              {children}
            </tr>
          ),

          th: ({
            children,
          }) => (
            <th className="whitespace-nowrap px-3 py-2.5 font-semibold text-white">
              {children}
            </th>
          ),

          td: ({
            children,
          }) => (
            <td className="min-w-[120px] break-words px-3 py-2.5 align-top text-slate-300">
              {children}
            </td>
          ),

          hr: () => (
            <hr className="my-5 border-0 border-t border-white/10" />
          ),
        }}
      >
        {preparedContent}
      </ReactMarkdown>
    </div>
  );
}