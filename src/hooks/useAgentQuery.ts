"use client";

import { useCallback, useRef, useState } from "react";
import { streamQuery } from "@/lib/agent-client";
import type { Message, AgentEvent, AnswerEvent, ToolCallEvent, ToolResultEvent } from "@/types/api";

export interface QueryStep {
  type: "tool_call" | "tool_result";
  tool: string;
  detail: string;
  isError?: boolean;
}

export interface ConversationTurn {
  id: string;
  question: string;
  steps: QueryStep[];
  answer: string | null;
  error: string | null;
  isStreaming?: boolean;
  streamStatus?: import("@/hooks/useStreamTimer").StreamStatus;
  elapsed?: number;
}

export interface QueryState {
  isStreaming: boolean;
  turns: ConversationTurn[];
  activeTurn: ConversationTurn | null;
  ask: (question: string, context?: string) => void;
  cancel: () => void;
  reset: () => void;
}

export function useAgentQuery(): QueryState {
  const [isStreaming, setIsStreaming] = useState(false);
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [activeTurn, setActiveTurn] = useState<ConversationTurn | null>(null);
  const messagesRef = useRef<Message[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    messagesRef.current = [];
    setTurns([]);
    setActiveTurn(null);
    setIsStreaming(false);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const ask = useCallback((question: string, context?: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: Message = { role: "user", content: question };
    messagesRef.current = [...messagesRef.current, userMessage];

    const turnId = Date.now().toString();
    const newTurn: ConversationTurn = {
      id: turnId,
      question,
      steps: [],
      answer: null,
      error: null,
      isStreaming: true,
    };
    setActiveTurn(newTurn);
    setIsStreaming(true);

    let currentSteps: QueryStep[] = [];
    let currentAnswer: string | null = null;
    let currentError: string | null = null;

    void (async () => {
      try {
        for await (const event of streamQuery(messagesRef.current, controller.signal, context)) {
          handleEvent(event);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        currentError = err instanceof Error ? err.message : "Unknown error";
        setActiveTurn((t) => t ? { ...t, error: currentError } : null);
      } finally {
        // Commit completed turn to history and append assistant message
        if (currentAnswer !== null) {
          messagesRef.current = [
            ...messagesRef.current,
            { role: "assistant", content: currentAnswer },
          ];
        }
        setTurns((prev) => [
          ...prev,
          { id: turnId, question, steps: currentSteps, answer: currentAnswer, error: currentError },
        ]);
        setActiveTurn(null);
        setIsStreaming(false);
      }
    })();

    function handleEvent(event: AgentEvent) {
      switch (event.type) {
        case "tool_call": {
          const e = event as ToolCallEvent;
          const argsStr = JSON.stringify(e.args, null, 0);
          const step: QueryStep = {
            type: "tool_call",
            tool: e.tool,
            detail: argsStr.length > 120 ? argsStr.slice(0, 120) + "…" : argsStr,
          };
          currentSteps = [...currentSteps, step];
          setActiveTurn((t) => t ? { ...t, steps: currentSteps } : null);
          break;
        }
        case "tool_result": {
          const e = event as ToolResultEvent;
          const step: QueryStep = {
            type: "tool_result",
            tool: e.tool,
            detail: `${e.chars} chars`,
            isError: e.is_error,
          };
          currentSteps = [...currentSteps, step];
          setActiveTurn((t) => t ? { ...t, steps: currentSteps } : null);
          break;
        }
        case "answer":
          currentAnswer = (event as AnswerEvent).text;
          setActiveTurn((t) => t ? { ...t, answer: currentAnswer } : null);
          break;
        case "error":
          currentError = event.message;
          setActiveTurn((t) => t ? { ...t, error: currentError } : null);
          break;
        case "done":
          break;
      }
    }
  }, []);

  return { isStreaming, turns, activeTurn, ask, cancel, reset };
}
