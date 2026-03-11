"use client";

import { useCallback, useEffect, useState } from "react";
import { getAgentHealth } from "@/lib/agent-client";
import { getSystemStatus } from "@/lib/workflow-client";

export type ServiceHealth = "checking" | "healthy" | "degraded" | "unreachable";

export interface ServiceState {
  status: ServiceHealth;
  detail?: string;
}

export interface HealthState {
  workflow: ServiceState;
  agent: ServiceState;
  stats: ServiceState;
  refresh: () => void;
}

async function getStatsHealth(): Promise<{ status: string }> {
  const res = await fetch("/api/stats/health");
  if (!res.ok) throw new Error(`Stats health check failed: ${res.status}`);
  return res.json() as Promise<{ status: string }>;
}

export function useHealth(): HealthState {
  const [workflow, setWorkflow] = useState<ServiceState>({ status: "checking" });
  const [agent, setAgent] = useState<ServiceState>({ status: "checking" });
  const [stats, setStats] = useState<ServiceState>({ status: "checking" });

  const check = useCallback(async () => {
    setWorkflow({ status: "checking" });
    setAgent({ status: "checking" });
    setStats({ status: "checking" });

    const [workflowResult, agentResult, statsResult] = await Promise.allSettled([
      getSystemStatus(),
      getAgentHealth(),
      getStatsHealth(),
    ]);

    if (workflowResult.status === "fulfilled") {
      const s = workflowResult.value;
      const ch = s.clickhouse as { connected?: boolean };
      const pipelines = s.pipelines;
      const detail = `ClickHouse ${ch.connected === false ? "disconnected" : "connected"} · ${pipelines.running}/${pipelines.concurrency_limit} pipelines running`;
      setWorkflow({ status: ch.connected === false ? "degraded" : "healthy", detail });
    } else {
      setWorkflow({ status: "unreachable" });
    }

    if (agentResult.status === "fulfilled") {
      const a = agentResult.value;
      setAgent({ status: "healthy", detail: `${a.tools} tools · ${a.name ?? "Varis"}` });
    } else {
      setAgent({ status: "unreachable" });
    }

    if (statsResult.status === "fulfilled") {
      setStats({ status: "healthy" });
    } else {
      setStats({ status: "unreachable" });
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { workflow, agent, stats, refresh: check };
}
