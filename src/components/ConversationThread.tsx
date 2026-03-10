"use client";

import { useEffect, useRef } from "react";
import { QueryResult } from "./QueryResult";
import type { ConversationTurn } from "@/hooks/useAgentQuery";
import type { StreamStatus } from "@/hooks/useStreamTimer";

interface ConversationThreadProps {
  turns: ConversationTurn[];
  activeTurn: ConversationTurn | null;
  streamStatus?: StreamStatus;
  elapsed?: number;
  emptyState?: React.ReactNode;
}

export function ConversationThread({
  turns,
  activeTurn,
  streamStatus,
  elapsed,
  emptyState,
}: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, activeTurn?.steps.length, activeTurn?.answer]);

  const isEmpty = turns.length === 0 && activeTurn === null;

  if (isEmpty && emptyState) {
    return <>{emptyState}</>;
  }

  const activeEntry = activeTurn
    ? { ...activeTurn, isStreaming: true, streamStatus, elapsed }
    : null;

  return (
    <div className="space-y-8">
      {turns.map((turn) => (
        <QueryResult key={turn.id} entry={turn} />
      ))}
      {activeEntry && <QueryResult entry={activeEntry} />}
      <div ref={bottomRef} />
    </div>
  );
}
