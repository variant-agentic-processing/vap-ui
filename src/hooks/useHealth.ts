"use client";

import { useCallback, useEffect, useState } from "react";
import { getAgentHealth } from "@/lib/agent-client";
import { getSystemStatus, getClinvarVersion } from "@/lib/workflow-client";

export type ServiceHealth = "checking" | "healthy" | "degraded" | "unreachable";

export interface ServiceState {
  status: ServiceHealth;
  detail?: string;
}

export interface ClinvarState {
  version: string | null;
  loadedAt: string | null;
  isStale: boolean;
}

export interface HealthState {
  workflow: ServiceState;
  agent: ServiceState;
  mcp: ServiceState;
  stats: ServiceState;
  sample: ServiceState;
  clinvar: ClinvarState | null;
  refresh: () => void;
}

async function getMcpHealth(): Promise<{ status: string; clickhouse: string; individuals?: number; variants?: number }> {
  const res = await fetch("/api/mcp/health");
  if (!res.ok) throw new Error(`MCP health check failed: ${res.status}`);
  return res.json();
}

async function getStatsHealth(): Promise<{ status: string; computed_at?: string | null }> {
  const res = await fetch("/api/stats/health");
  if (!res.ok) throw new Error(`Stats health check failed: ${res.status}`);
  return res.json();
}

async function getSampleHealth(): Promise<{ status: string }> {
  const res = await fetch("/api/samples/health");
  if (!res.ok) throw new Error(`Sample health check failed: ${res.status}`);
  return res.json();
}

function isClinvarStale(loadedAt: string | null): boolean {
  if (!loadedAt) return true;
  const diffDays = (Date.now() - new Date(loadedAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 30;
}

export function useHealth(): HealthState {
  const [workflow, setWorkflow] = useState<ServiceState>({ status: "checking" });
  const [agent, setAgent] = useState<ServiceState>({ status: "checking" });
  const [mcp, setMcp] = useState<ServiceState>({ status: "checking" });
  const [stats, setStats] = useState<ServiceState>({ status: "checking" });
  const [sample, setSample] = useState<ServiceState>({ status: "checking" });
  const [clinvar, setClinvar] = useState<ClinvarState | null>(null);

  const check = useCallback(async () => {
    setWorkflow({ status: "checking" });
    setAgent({ status: "checking" });
    setMcp({ status: "checking" });
    setStats({ status: "checking" });
    setSample({ status: "checking" });

    const [workflowResult, agentResult, mcpResult, statsResult, sampleResult, clinvarResult] =
      await Promise.allSettled([
        getSystemStatus(),
        getAgentHealth(),
        getMcpHealth(),
        getStatsHealth(),
        getSampleHealth(),
        getClinvarVersion(),
      ]);

    if (workflowResult.status === "fulfilled") {
      const s = workflowResult.value;
      const ch = s.clickhouse as { connected?: boolean };
      const p = s.pipelines;
      const parts = [
        `ClickHouse ${ch.connected === false ? "disconnected" : "connected"}`,
        `${p.running}/${p.concurrency_limit} pipelines running`,
        !p.can_submit ? "· at capacity" : "",
      ].filter(Boolean);
      setWorkflow({
        status: ch.connected === false ? "degraded" : "healthy",
        detail: parts.join(" · "),
      });
    } else {
      setWorkflow({ status: "unreachable" });
    }

    if (agentResult.status === "fulfilled") {
      const a = agentResult.value;
      setAgent({ status: "healthy", detail: `${a.tools} tools · ${a.name ?? "Varis"}` });
    } else {
      setAgent({ status: "unreachable" });
    }

    if (mcpResult.status === "fulfilled") {
      const m = mcpResult.value;
      const isHealthy = m.status === "healthy" && m.clickhouse === "connected";
      const detail = isHealthy && m.individuals != null
        ? `${m.individuals.toLocaleString()} individuals · ${(m.variants ?? 0).toLocaleString()} variants`
        : undefined;
      setMcp({ status: isHealthy ? "healthy" : "degraded", detail });
    } else {
      setMcp({ status: "unreachable" });
    }

    if (statsResult.status === "fulfilled") {
      const s = statsResult.value;
      const detail = s.computed_at
        ? `Last computed ${new Date(s.computed_at).toLocaleString()}`
        : "Not yet computed";
      setStats({ status: "healthy", detail });
    } else {
      setStats({ status: "unreachable" });
    }

    if (sampleResult.status === "fulfilled") {
      setSample({ status: "healthy" });
    } else {
      setSample({ status: "unreachable" });
    }

    if (clinvarResult.status === "fulfilled") {
      const cv = clinvarResult.value;
      setClinvar({
        version: cv.loaded_version,
        loadedAt: cv.completed_at,
        isStale: isClinvarStale(cv.completed_at),
      });
    } else {
      setClinvar(null);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { workflow, agent, mcp, stats, sample, clinvar, refresh: check };
}
