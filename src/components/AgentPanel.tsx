"use client";

import { useState } from "react";
import Image from "next/image";
import { QueryInput } from "./QueryInput";
import { ConversationThread } from "./ConversationThread";
import { useAgentQuery } from "@/hooks/useAgentQuery";
import { useStreamTimer } from "@/hooks/useStreamTimer";

const AGENT_NAME = "Varis";

interface AgentPanelProps {
  context?: string;
  title?: string;
  subtitle?: string;
}

export function AgentPanel({ context, title = AGENT_NAME, subtitle = "Ask a question" }: AgentPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { isStreaming, turns, activeTurn, ask, cancel, reset } = useAgentQuery();
  const { status: streamStatus, elapsed } = useStreamTimer(isStreaming, activeTurn?.steps.length ?? 0);

  function handleClose() {
    setIsOpen(false);
    reset();
    setInput("");
  }

  function handleSubmit() {
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    ask(q, context);
  }

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan text-brand-navy shadow-lg transition-transform hover:scale-105"
          title={subtitle}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97Z" clipRule="evenodd" />
          </svg>
        </button>
      )}

      {/* Side drawer */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 z-40 flex h-[600px] w-[420px] flex-col rounded-tl-2xl border-l border-t border-brand-border bg-brand-navy shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="group relative shrink-0">
                <Image
                  src="/varis.jpg"
                  alt="Varis"
                  width={40}
                  height={40}
                  className="rounded-full object-cover ring-1 ring-brand-border cursor-pointer"
                />
                <div className="pointer-events-none absolute bottom-full left-0 mb-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50 w-40">
                  <Image
                    src="/varis.jpg"
                    alt="Varis"
                    width={160}
                    height={160}
                    className="rounded-2xl object-cover ring-1 ring-brand-border shadow-2xl"
                    style={{ width: 160, height: 160 }}
                  />
                </div>
              </div>
              <div>
                <p className="text-base font-semibold text-brand-text">{title}</p>
                <p className="text-xs text-brand-muted">{subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {turns.length > 0 && (
                <button
                  onClick={reset}
                  className="rounded px-2 py-1 text-xs text-brand-muted transition-colors hover:text-brand-text"
                >
                  New chat
                </button>
              )}
              <button
                onClick={handleClose}
                className="rounded px-2 py-1 text-xs text-brand-muted transition-colors hover:text-brand-text"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <ConversationThread
              turns={turns}
              activeTurn={activeTurn}
              streamStatus={streamStatus}
              elapsed={elapsed}
              emptyState={
                <div className="flex h-full items-center justify-center text-center px-4">
                  <p className="text-sm text-brand-muted">{subtitle}.</p>
                </div>
              }
            />
          </div>

          {/* Input */}
          <div className="border-t border-brand-border">
            <QueryInput
              value={input}
              onChange={setInput}
              onSubmit={handleSubmit}
              onCancel={cancel}
              isStreaming={isStreaming}
            />
          </div>
        </div>
      )}
    </>
  );
}
