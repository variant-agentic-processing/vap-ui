"use client";

import { useState } from "react";
import type { QueryStep } from "@/hooks/useAgentQuery";

export function ToolCallStep({ step }: { step: QueryStep }) {
  const [expanded, setExpanded] = useState(false);
  const isCall   = step.type === "tool_call";
  const isError  = step.isError;

  return (
    <button
      onClick={() => setExpanded((e) => !e)}
      className="w-full text-left group"
    >
      <div className={[
        "flex items-start gap-2 rounded-md px-3 py-1.5 text-xs font-mono transition-colors",
        "text-brand-muted hover:bg-brand-border/20",
        isError ? "text-red-400/70" : "",
      ].join(" ")}>
        <span className="mt-0.5 shrink-0 text-brand-border">
          {isCall ? "→" : "←"}
        </span>
        <span className="min-w-0 flex-1 truncate">
          <span className={isError ? "text-red-400/70" : "text-brand-muted/80"}>
            {step.tool}
          </span>
          <span className="text-brand-border"> · </span>
          <span className={isError ? "text-red-400/60" : "text-brand-border"}>
            {step.detail}
          </span>
          {isError && <span className="ml-2 text-red-400/80">[error]</span>}
        </span>
        <span className="shrink-0 text-brand-border opacity-0 group-hover:opacity-100">
          {expanded ? "▴" : "▾"}
        </span>
      </div>
      {expanded && (
        <div className="mx-3 mb-1 rounded bg-brand-navy px-3 py-2 text-xs font-mono text-brand-muted break-all whitespace-pre-wrap">
          {step.detail}
        </div>
      )}
    </button>
  );
}
