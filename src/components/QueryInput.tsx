"use client";

import { useEffect, useRef } from "react";

interface QueryInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isStreaming: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function QueryInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  isStreaming,
  placeholder = "Ask a question about the variant dataset…",
  autoFocus = false,
}: QueryInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Refocus after streaming ends
  useEffect(() => {
    if (!isStreaming) ref.current?.focus();
  }, [isStreaming]);

  // Auto-resize
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && value.trim()) onSubmit();
    }
  }

  return (
    <div className="border-t border-brand-border bg-brand-navy px-4 py-4">
      <div className={[
        "flex items-end gap-3 rounded-xl border bg-brand-surface px-4 py-3 transition-colors",
        isStreaming ? "border-brand-cyan/30" : "border-brand-border focus-within:border-brand-cyan/50",
      ].join(" ")}>
        <textarea
          ref={ref}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-brand-text placeholder-brand-muted/50 outline-none disabled:opacity-50"
        />
        <div className="flex shrink-0 items-center gap-2">
          {isStreaming ? (
            <button
              onClick={onCancel}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-red-800/50 hover:text-red-400"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={onSubmit}
              disabled={!value.trim()}
              className="rounded-lg bg-brand-cyan px-3 py-1.5 text-xs font-semibold text-brand-navy transition-opacity hover:opacity-90 disabled:opacity-30"
            >
              Ask
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-brand-border">
        Enter to submit · Shift+Enter for new line
      </p>
    </div>
  );
}
