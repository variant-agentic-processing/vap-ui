"use client";

import { useHealth, type ServiceHealth } from "@/hooks/useHealth";

const DOT: Record<ServiceHealth, string> = {
  checking: "bg-gray-300 animate-pulse",
  healthy: "bg-green-500",
  degraded: "bg-amber-400",
  unreachable: "bg-red-500",
};

const LABEL: Record<ServiceHealth, string> = {
  checking: "checking",
  healthy: "healthy",
  degraded: "degraded",
  unreachable: "unreachable",
};

function ServiceDot({ status, label }: { status: ServiceHealth; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
      {label}
      <span className="text-gray-400">·</span>
      <span
        className={
          status === "healthy"
            ? "text-green-600"
            : status === "degraded"
              ? "text-amber-600"
              : status === "unreachable"
                ? "text-red-600"
                : "text-gray-400"
        }
      >
        {LABEL[status]}
      </span>
    </span>
  );
}

export function HealthBanner() {
  const { workflow, agent, agentTools, refresh } = useHealth();

  const allHealthy = workflow === "healthy" && agent === "healthy";

  return (
    <div
      className={[
        "border-b px-6 py-2",
        allHealthy ? "border-gray-100 bg-gray-50" : "border-amber-100 bg-amber-50",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <ServiceDot status={workflow} label="workflow-service" />
          <ServiceDot
            status={agent}
            label={
              agentTools !== null
                ? `agent-service (${agentTools} tools)`
                : "agent-service"
            }
          />
        </div>
        <button
          onClick={refresh}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          refresh
        </button>
      </div>
    </div>
  );
}
