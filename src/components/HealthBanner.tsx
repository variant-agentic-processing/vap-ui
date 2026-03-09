"use client";

import { useHealth, type ServiceHealth } from "@/hooks/useHealth";

const DOT: Record<ServiceHealth, string> = {
  checking:    "bg-brand-muted animate-pulse",
  healthy:     "bg-green-400",
  degraded:    "bg-brand-gold",
  unreachable: "bg-red-500",
};

const LABEL_COLOR: Record<ServiceHealth, string> = {
  checking:    "text-brand-muted",
  healthy:     "text-green-400",
  degraded:    "text-brand-gold",
  unreachable: "text-red-400",
};

const LABEL_TEXT: Record<ServiceHealth, string> = {
  checking:    "checking",
  healthy:     "healthy",
  degraded:    "degraded",
  unreachable: "unreachable",
};

function ServiceDot({ status, label }: { status: ServiceHealth; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-brand-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      <span>{label}</span>
      <span className={`font-medium ${LABEL_COLOR[status]}`}>
        {LABEL_TEXT[status]}
      </span>
    </span>
  );
}

export function HealthBanner() {
  const { workflow, agent, agentTools, refresh } = useHealth();

  const hasIssue =
    workflow === "unreachable" ||
    workflow === "degraded" ||
    agent === "unreachable" ||
    agent === "degraded";

  return (
    <div
      className={[
        "border-b px-6 py-2",
        hasIssue
          ? "border-brand-gold/30 bg-brand-gold/10"
          : "border-brand-border bg-brand-surface/60",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <ServiceDot status={workflow} label="workflow-service" />
          <span className="text-brand-border">·</span>
          <ServiceDot
            status={agent}
            label={
              agentTools !== null
                ? `agent-service · ${agentTools} tools`
                : "agent-service"
            }
          />
        </div>
        <button
          onClick={refresh}
          className="text-xs text-brand-muted transition-colors hover:text-brand-cyan"
        >
          refresh
        </button>
      </div>
    </div>
  );
}
