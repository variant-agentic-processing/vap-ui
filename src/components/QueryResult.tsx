"use client";

import { useState } from "react";
import Image from "next/image";
import Markdown from "react-markdown";
import { ToolCallStep } from "./ToolCallStep";
import type { ConversationTurn } from "@/hooks/useAgentQuery";
import type { StreamStatus } from "@/hooks/useStreamTimer";

function VarisAvatar() {
  return (
    <div className="shrink-0 mt-0.5">
      <Image
        src="/varis.jpg"
        alt="Varis"
        width={28}
        height={28}
        className="rounded-full object-cover ring-1 ring-brand-border"
      />
    </div>
  );
}

export type QueryEntry = ConversationTurn & {
  isStreaming?: boolean;
  streamStatus?: StreamStatus;
  elapsed?: number;
};

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

      {/* Varis response */}
      <div className="flex items-start gap-2.5">
        <VarisAvatar />
        <div className="min-w-0 flex-1 space-y-2">
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

          {/* Streaming indicator */}
          {entry.isStreaming && (
            <StreamingStatus
              status={entry.streamStatus ?? "thinking"}
              elapsed={entry.elapsed ?? 0}
              hasSteps={hasSteps}
            />
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
      </div>
    </div>
  );
}

function StreamingStatus({
  status,
  elapsed,
  hasSteps,
}: {
  status: StreamStatus;
  elapsed: number;
  hasSteps: boolean;
}) {
  if (status === "stalled") {
    return (
      <div className="rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3 space-y-1">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-gold">
          <span>⚠</span>
          No response for {elapsed}s — the agent may have lost context
        </div>
        <p className="text-xs text-brand-muted">
          Try stopping and rephrasing with a simpler or more specific question.
        </p>
      </div>
    );
  }

  if (status === "slow") {
    return (
      <div className="flex items-center gap-3 px-1 text-xs text-brand-muted">
        <ThinkingDots />
        <span>Still working… ({elapsed}s)</span>
      </div>
    );
  }

  if (!hasSteps) {
    return (
      <div className="flex items-center gap-3 px-1 text-xs text-brand-muted">
        <ThinkingDots />
        <span>Thinking…</span>
      </div>
    );
  }

  return null;
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-[3px]">
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-brand-cyan" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-brand-cyan" />
      <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-brand-cyan" />
    </span>
  );
}

const markdownComponents: React.ComponentProps<typeof Markdown>["components"] = {
  // Tables — horizontally scrollable, compact, styled to brand palette
  table: ({ children }) => (
    <div className="not-prose my-4 overflow-x-auto rounded-lg border border-brand-border">
      <table className="min-w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-brand-navy">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-brand-border/50">{children}</tbody>
  ),
  tr: ({ children }) => (
    <tr className="transition-colors even:bg-brand-border/10 hover:bg-brand-border/20">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap border-b border-brand-border px-3 py-2 text-left text-xs font-semibold text-brand-cyan">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-xs text-brand-text">{children}</td>
  ),
};

const DISCLAIMER = "This is a research prototype using public 1000 Genomes data. Not for clinical use.";

function splitDisclaimer(text: string): { body: string; disclaimer: string | null } {
  const idx = text.lastIndexOf(DISCLAIMER);
  if (idx === -1) return { body: text, disclaimer: null };
  return {
    body: text.slice(0, idx).trimEnd(),
    disclaimer: DISCLAIMER,
  };
}

function AnswerBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { body, disclaimer } = splitDisclaimer(text);

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
        prose-hr:border-brand-border">
        <Markdown components={markdownComponents}>{body}</Markdown>
      </div>
      {disclaimer && (
        <p className="mt-3 border-t border-brand-border/40 pt-2.5 text-xs text-brand-muted/60 italic">
          {disclaimer}
        </p>
      )}
    </div>
  );
}
