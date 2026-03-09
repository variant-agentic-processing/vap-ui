"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import { ToolCallStep } from "./ToolCallStep";
import type { QueryStep } from "@/hooks/useAgentQuery";

export interface QueryEntry {
  id: string;
  question: string;
  steps: QueryStep[];
  answer: string | null;
  error: string | null;
  isStreaming?: boolean;
}

export function QueryResult({ entry }: { entry: QueryEntry }) {
  const [stepsOpen, setStepsOpen] = useState(false);
  const hasSteps = entry.steps.length > 0;

  return (
    <div className="space-y-3">
      {/* Question */}
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-border px-4 py-2.5 text-sm text-brand-text">
          {entry.question}
        </div>
      </div>

      {/* Tool calls (collapsible) */}
      {hasSteps && (
        <div className="rounded-xl border border-brand-border/50 bg-brand-surface/50">
          <button
            onClick={() => setStepsOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-brand-muted hover:text-brand-text transition-colors"
          >
            <span className="text-brand-border">{stepsOpen ? "▾" : "▸"}</span>
            <span>
              {entry.steps.length} tool {entry.steps.length === 1 ? "call" : "calls"}
            </span>
            {entry.isStreaming && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
            )}
          </button>
          {stepsOpen && (
            <div className="border-t border-brand-border/50 py-1">
              {entry.steps.map((step, i) => (
                <ToolCallStep key={i} step={step} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Streaming indicator — no steps yet */}
      {entry.isStreaming && !hasSteps && (
        <div className="flex items-center gap-2 px-1 text-xs text-brand-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
          Thinking…
        </div>
      )}

      {/* Answer */}
      {entry.answer && (
        <AnswerBlock text={entry.answer} />
      )}

      {/* Error */}
      {entry.error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {entry.error}
        </div>
      )}
    </div>
  );
}

function AnswerBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="group relative rounded-xl border border-brand-border bg-brand-surface px-5 py-4">
      <button
        onClick={copy}
        className="absolute right-3 top-3 rounded px-2 py-1 text-xs text-brand-border opacity-0 transition-all group-hover:opacity-100 hover:text-brand-muted"
      >
        {copied ? "copied" : "copy"}
      </button>
      <div className="prose prose-invert prose-sm max-w-none
        prose-p:text-brand-text prose-p:leading-relaxed
        prose-headings:text-brand-text
        prose-strong:text-brand-text
        prose-code:text-brand-cyan prose-code:bg-brand-navy prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-brand-navy prose-pre:border prose-pre:border-brand-border prose-pre:text-brand-muted
        prose-ul:text-brand-text prose-ol:text-brand-text
        prose-li:text-brand-text
        prose-a:text-brand-cyan
        prose-blockquote:border-brand-cyan prose-blockquote:text-brand-muted
        prose-hr:border-brand-border
        prose-th:text-brand-text prose-td:text-brand-muted
        prose-table:border-brand-border">
        <Markdown>{text}</Markdown>
      </div>
    </div>
  );
}
