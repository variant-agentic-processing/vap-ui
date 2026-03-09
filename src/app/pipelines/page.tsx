"use client";

import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitPipelineModal } from "@/components/SubmitPipelineModal";
import { usePipelines } from "@/hooks/usePipelines";
import { formatRelative, formatRuntime } from "@/lib/utils";
import type { Pipeline, PipelineStatus, PipelineType } from "@/types/api";

const TYPE_LABEL: Record<PipelineType, string> = {
  vcf_ingest: "VCF Ingest",
  clinvar_refresh: "ClinVar Refresh",
};

const STATUS_FILTERS: Array<{ label: string; value: PipelineStatus | undefined }> = [
  { label: "All", value: undefined },
  { label: "Running", value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
];

export default function PipelinesPage() {
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | undefined>();
  const [showModal, setShowModal] = useState(false);

  const { pipelines, total, isLoading, error, submit, cancel } = usePipelines(
    statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 },
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Pipelines</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Submit and monitor VCF ingest and ClinVar refresh pipelines.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-brand-cyan px-4 py-2 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-90"
        >
          Submit Pipeline
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex items-center gap-1">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => setStatusFilter(value)}
            className={[
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === value
                ? "bg-brand-border text-brand-cyan"
                : "text-brand-muted hover:bg-brand-border/50 hover:text-brand-text",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
        {!isLoading && (
          <span className="ml-2 text-xs text-brand-muted">{total} total</span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-brand-border bg-brand-surface overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-sm text-red-400">{error}</div>
        ) : isLoading ? (
          <div className="p-8 text-center text-sm text-brand-muted">Loading…</div>
        ) : pipelines.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-brand-muted">No pipelines yet.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 text-xs text-brand-cyan hover:underline"
            >
              Submit your first pipeline →
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left">
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Individual</Th>
                <Th>Started</Th>
                <Th>Runtime</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {pipelines.map((p) => (
                <PipelineRow key={p.id} pipeline={p} onCancel={() => void cancel(p.id)} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <SubmitPipelineModal
          onClose={() => setShowModal(false)}
          onSubmit={async (body) => { await submit(body); }}
        />
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-medium text-brand-muted">{children}</th>
  );
}

function PipelineRow({
  pipeline: p,
  onCancel,
}: {
  pipeline: Pipeline;
  onCancel: () => void;
}) {
  const isActive = p.status === "running" || p.status === "pending";

  return (
    <tr className="group transition-colors hover:bg-brand-border/20">
      <td className="px-4 py-3">
        <span className="text-xs font-medium text-brand-text">
          {TYPE_LABEL[p.type]}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={p.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {p.individual_id ?? <span className="text-brand-border">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {p.started_at
          ? formatRelative(p.started_at)
          : formatRelative(p.created_at)}
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {formatRuntime(p.runtime_minutes)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/pipelines/${p.id}`}
            className="text-xs text-brand-cyan hover:underline"
          >
            View
          </Link>
          {isActive && (
            <button
              onClick={onCancel}
              className="text-xs text-brand-muted hover:text-red-400 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
