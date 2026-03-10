"use client";

import { useState } from "react";
import { QueryInput } from "@/components/QueryInput";
import { ConversationThread } from "@/components/ConversationThread";
import { useAgentQuery } from "@/hooks/useAgentQuery";
import { useStreamTimer } from "@/hooks/useStreamTimer";

export default function QueryPage() {
  const [input, setInput] = useState("");
  const { isStreaming, turns, activeTurn, ask, cancel } = useAgentQuery();
  const { status: streamStatus, elapsed } = useStreamTimer(isStreaming, activeTurn?.steps.length ?? 0);

  function handleSubmit() {
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    ask(q);
  }

  const isEmpty = turns.length === 0 && activeTurn === null;

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="mx-auto max-w-3xl h-full">
          <ConversationThread
            turns={turns}
            activeTurn={activeTurn}
            streamStatus={streamStatus}
            elapsed={elapsed}
            emptyState={isEmpty ? <EmptyState onExample={(q) => { setInput(q); }} /> : undefined}
          />
        </div>
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
