"use client";

import { useCallback, useEffect, useState } from "react";
import { getAgentHealth } from "@/lib/agent-client";
import { getSystemStatus } from "@/lib/workflow-client";

export type ServiceHealth = "checking" | "healthy" | "degraded" | "unreachable";

export interface HealthState {
  workflow: ServiceHealth;
  agent: ServiceHealth;
  agentTools: number | null;
  refresh: () => void;
}

export function useHealth(): HealthState {
  const [workflow, setWorkflow] = useState<ServiceHealth>("checking");
  const [agent, setAgent] = useState<ServiceHealth>("checking");
  const [agentTools, setAgentTools] = useState<number | null>(null);

  const check = useCallback(async () => {
    setWorkflow("checking");
    setAgent("checking");

    const [workflowResult, agentResult] = await Promise.allSettled([
      getSystemStatus(),
      getAgentHealth(),
    ]);

    if (workflowResult.status === "fulfilled") {
      const status = workflowResult.value;
      const ch = status.clickhouse as { connected?: boolean };
      setWorkflow(ch.connected === false ? "degraded" : "healthy");
    } else {
      setWorkflow("unreachable");
    }

    if (agentResult.status === "fulfilled") {
      setAgent("healthy");
      setAgentTools(agentResult.value.tools);
    } else {
      setAgent("unreachable");
      setAgentTools(null);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { workflow, agent, agentTools, refresh: check };
}
