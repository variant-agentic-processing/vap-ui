"use client";

import { useCallback, useRef, useState } from "react";
import { streamQuery } from "@/lib/agent-client";
import type { AgentEvent, AnswerEvent, ToolCallEvent, ToolResultEvent } from "@/types/api";

export interface QueryStep {
  type: "tool_call" | "tool_result";
  tool: string;
  detail: string;
  isError?: boolean;
}

export interface QueryState {
  isStreaming: boolean;
  steps: QueryStep[];
  answer: string | null;
  error: string | null;
  ask: (question: string) => void;
  cancel: () => void;
  reset: () => void;
}

export function useAgentQuery(): QueryState {
  const [isStreaming, setIsStreaming] = useState(false);
  const [steps, setSteps] = useState<QueryStep[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setSteps([]);
    setAnswer(null);
    setError(null);
    setIsStreaming(false);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const ask = useCallback((question: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    reset();
    setIsStreaming(true);

    void (async () => {
      try {
        for await (const event of streamQuery(question, controller.signal)) {
          handleEvent(event);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsStreaming(false);
      }
    })();

    function handleEvent(event: AgentEvent) {
      switch (event.type) {
        case "tool_call": {
          const e = event as ToolCallEvent;
          const argsStr = JSON.stringify(e.args, null, 0);
          setSteps((prev) => [
            ...prev,
            {
              type: "tool_call",
              tool: e.tool,
              detail:
                argsStr.length > 120 ? argsStr.slice(0, 120) + "…" : argsStr,
            },
          ]);
          break;
        }
        case "tool_result": {
          const e = event as ToolResultEvent;
          setSteps((prev) => [
            ...prev,
            {
              type: "tool_result",
              tool: e.tool,
              detail: `${e.chars} chars`,
              isError: e.is_error,
            },
          ]);
          break;
        }
        case "answer":
          setAnswer((event as AnswerEvent).text);
          break;
        case "error":
          setError(event.message);
          break;
        case "done":
          break;
      }
    }
  }, [reset]);

  return { isStreaming, steps, answer, error, ask, cancel, reset };
}
