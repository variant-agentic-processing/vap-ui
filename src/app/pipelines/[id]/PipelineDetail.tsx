"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { usePipeline } from "@/hooks/usePipeline";
import { formatDate, formatRelative, formatRuntime } from "@/lib/utils";
import type { PipelineType, StageStatus } from "@/types/api";

const TYPE_LABEL: Record<PipelineType, string> = {
  vcf_ingest: "VCF Ingest",
  clinvar_refresh: "ClinVar Refresh",
};

const STAGE_ICON: Record<string, string> = {
  completed: "✓",
  running:   "⟳",
  failed:    "✕",
  cancelled: "—",
  pending:   "○",
  deleted:   "—",
};

export function PipelineDetail({ id }: { id: string }) {
  const router = useRouter();
  const { pipeline: p, isLoading, error, cancel, rerun } = usePipeline(id);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-brand-muted">Loading…</div>
    );
  }

  if (error || !p) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-400">{error ?? "Pipeline not found"}</p>
        <Link href="/pipelines" className="mt-2 block text-xs text-brand-cyan hover:underline">
          ← Back to Pipelines
        </Link>
      </div>
    );
  }

  const isActive = p.status === "running" || p.status === "pending";

  return (
    <div>
      {/* Breadcrumb */}
      <Link
        href="/pipelines"
        className="mb-6 inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-text transition-colors"
      >
        ← Pipelines
      </Link>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <StatusBadge status={p.status} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-brand-text">
              {TYPE_LABEL[p.type]}
              {p.individual_id && (
                <span className="ml-2 text-brand-muted">· {p.individual_id}</span>
              )}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-brand-muted">{p.id}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isActive && (
            <button
              onClick={() => void cancel()}
              className="rounded-lg border border-red-800/50 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-600 hover:text-red-300"
            >
              Cancel
            </button>
          )}
          {!isActive && p.status !== "deleted" && (
            <button
              onClick={() => {
                void rerun().then((next) => {
                  if (next) router.push(`/pipelines/${next.id}`);
                });
              }}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:border-brand-cyan/40 hover:text-brand-text"
            >
              Re-run
            </button>
          )}
        </div>
      </div>

      {/* Metadata grid */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaCard label="Started" value={p.started_at ? formatRelative(p.started_at) : "—"} />
        <MetaCard label="Runtime" value={formatRuntime(p.runtime_minutes)} />
        <MetaCard label="Created" value={formatDate(p.created_at)} />
        <MetaCard
          label="Execution"
          value={p.workflow_execution_id ? p.workflow_execution_id.slice(-8) : "—"}
          mono
        />
      </div>

      {/* Error */}
      {p.error && (
        <div className="mb-6 rounded-lg border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {p.error}
        </div>
      )}

      {/* Stages */}
      {p.stages.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted">
            Stages
          </h2>
          <div className="rounded-xl border border-brand-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-brand-muted">Stage</th>
                  <th className="px-4 py-3 text-xs font-medium text-brand-muted">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-brand-muted">Started</th>
                  <th className="px-4 py-3 text-xs font-medium text-brand-muted">Runtime</th>
                  <th className="px-4 py-3 text-xs font-medium text-brand-muted">Records</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50">
                {p.stages.map((stage) => (
                  <StageRow key={stage.name} stage={stage} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-surface px-4 py-3">
      <p className="mb-1 text-xs text-brand-muted">{label}</p>
      <p className={`text-sm font-medium text-brand-text ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function StageRow({ stage: s }: { stage: StageStatus }) {
  const icon = STAGE_ICON[s.status] ?? "○";
  const isRunning = s.status === "running";

  return (
    <tr className="hover:bg-brand-border/10 transition-colors">
      <td className="px-4 py-3">
        <span className="flex items-center gap-2">
          <span
            className={[
              "text-xs font-mono w-3 text-center",
              s.status === "completed" ? "text-green-400" :
              s.status === "failed" ? "text-red-400" :
              isRunning ? "text-brand-cyan animate-spin inline-block" :
              "text-brand-muted",
            ].join(" ")}
          >
            {icon}
          </span>
          <span className="text-xs font-medium text-brand-text">{s.name}</span>
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={s.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {s.started_at ? formatRelative(s.started_at) : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {formatRuntime(s.runtime_minutes)}
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {s.record_count !== null ? s.record_count.toLocaleString() : "—"}
      </td>
    </tr>
  );
}
