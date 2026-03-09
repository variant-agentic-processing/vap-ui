import type { AgentEvent, AgentHealth } from "@/types/api";

const BASE_URL = "/api/agent";

export async function getAgentHealth(): Promise<AgentHealth> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error(`Agent health check failed: ${res.status}`);
  return res.json() as Promise<AgentHealth>;
}

/**
 * Stream a question to the agent service.
 * Yields typed AgentEvent objects as they arrive over SSE.
 *
 * Usage:
 *   for await (const event of streamQuery("What variants does HG002 have?")) {
 *     // handle event
 *   }
 */
export async function* streamQuery(
  question: string,
  signal?: AbortSignal,
): AsyncGenerator<AgentEvent> {
  const res = await fetch(`${BASE_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Agent query failed: ${res.status}${body ? `: ${body}` : ""}`);
  }

  if (!res.body) throw new Error("No response body from agent service");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6)) as AgentEvent;
          yield event;
          if (event.type === "done") return;
        } catch {
          // skip malformed lines
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
