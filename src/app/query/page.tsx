"use client";

import { useEffect, useRef, useState } from "react";
import { QueryInput } from "@/components/QueryInput";
import { QueryResult, type QueryEntry } from "@/components/QueryResult";
import { useAgentQuery } from "@/hooks/useAgentQuery";

export default function QueryPage() {
  const [input, setInput]     = useState("");
  const [history, setHistory] = useState<QueryEntry[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { isStreaming, steps, answer, error, ask, cancel } = useAgentQuery();

  // Auto-scroll to bottom when new content arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [steps.length, answer, isStreaming]);

  // When streaming ends with a result, commit to history
  useEffect(() => {
    if (isStreaming || !activeQuestion) return;
    if (answer === null && error === null) return;

    setHistory((h) => [
      ...h,
      {
        id: Date.now().toString(),
        question: activeQuestion,
        steps,
        answer,
        error,
      },
    ]);
    setActiveQuestion("");
  }, [isStreaming]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit() {
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    setActiveQuestion(q);
    ask(q);
  }

  const activeEntry: QueryEntry | null = activeQuestion
    ? { id: "active", question: activeQuestion, steps, answer, error, isStreaming }
    : null;

  const isEmpty = history.length === 0 && !activeEntry;

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {isEmpty ? (
          <EmptyState onExample={(q) => { setInput(q); }} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-8">
            {history.map((entry) => (
              <QueryResult key={entry.id} entry={entry} />
            ))}
            {activeEntry && <QueryResult entry={activeEntry} />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mx-auto w-full max-w-3xl">
        <QueryInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          onCancel={cancel}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}

const EXAMPLES = [
  "What pathogenic variants does HG002 have in BRCA1 or BRCA2?",
  "Give me a summary of HG002's variant burden",
  "What are the most common consequence types for variants across the cohort?",
  "Are there any stop-gained variants on chr17 between position 7500000 and 7600000?",
];

function EmptyState({ onExample }: { onExample: (q: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-brand-text">Query the variant dataset</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Ask natural-language questions — the agent will query the data and explain its findings.
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
        {EXAMPLES.map((q) => (
          <button
            key={q}
            onClick={() => onExample(q)}
            className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-left text-xs text-brand-muted transition-colors hover:border-brand-cyan/30 hover:text-brand-text"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
