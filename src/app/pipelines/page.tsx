"use client";

import { useMemo, useState } from "react";
import { PipelineDetailModal } from "@/components/PipelineDetailModal";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitPipelineModal } from "@/components/SubmitPipelineModal";
import { usePipelines } from "@/hooks/usePipelines";
import { AgentPanel } from "@/components/AgentPanel";
import { formatDate, formatRuntime } from "@/lib/utils";
import type { Pipeline, PipelineStatus, PipelineType } from "@/types/api";

const TYPE_LABEL: Record<PipelineType, string> = {
  vcf_ingest: "VCF Ingest",
  clinvar_refresh: "ClinVar Refresh",
};

const STATUS_FILTERS: Array<{ label: string; value: PipelineStatus | undefined }> = [
  { label: "All",       value: undefined },
  { label: "Running",   value: "running" },
  { label: "Completed", value: "completed" },
  { label: "Failed",    value: "failed" },
];

type SortField = "type" | "status" | "individual_id" | "started_at" | "runtime_minutes";
type SortDir   = "asc" | "desc";

function sortPipelines(pipelines: Pipeline[], field: SortField, dir: SortDir): Pipeline[] {
  return [...pipelines].sort((a, b) => {
    let av: string | number | null;
    let bv: string | number | null;

    switch (field) {
      case "type":           av = a.type;             bv = b.type;             break;
      case "status":         av = a.status;           bv = b.status;           break;
      case "individual_id":  av = a.individual_id;    bv = b.individual_id;    break;
      case "started_at":     av = a.started_at ?? a.created_at; bv = b.started_at ?? b.created_at; break;
      case "runtime_minutes": av = a.runtime_minutes; bv = b.runtime_minutes;  break;
    }

    if (av === null && bv === null) return 0;
    if (av === null) return dir === "asc" ? 1 : -1;
    if (bv === null) return dir === "asc" ? -1 : 1;

    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return dir === "asc" ? cmp : -cmp;
  });
}

export default function PipelinesPage() {
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | undefined>();
  const [showModal,    setShowModal]    = useState(false);
  const [selectedId,   setSelectedId]  = useState<string | null>(null);
  const [sortField,    setSortField]   = useState<SortField>("started_at");
  const [sortDir,      setSortDir]     = useState<SortDir>("desc");

  const queryParams = useMemo(
    () => (statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 }),
    [statusFilter],
  );
  const { pipelines, total, isLoading, error, submit, cancel } = usePipelines(queryParams);

  const sorted = useMemo(
    () => sortPipelines(pipelines, sortField, sortDir),
    [pipelines, sortField, sortDir],
  );

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "started_at" ? "desc" : "asc");
    }
  }

  return (
    <div>
      <AgentPanel subtitle="Ask Locus about pipelines" />
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
      <div className="rounded-xl border border-brand-border bg-brand-surface overflow-hidden max-h-[calc(100vh-220px)] overflow-y-auto">
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
            <thead className="sticky top-0 bg-brand-surface z-10">
              <tr className="border-b border-brand-border text-left">
                <SortTh field="type"            active={sortField} dir={sortDir} onSort={handleSort}>Type</SortTh>
                <SortTh field="status"          active={sortField} dir={sortDir} onSort={handleSort}>Status</SortTh>
                <SortTh field="individual_id"   active={sortField} dir={sortDir} onSort={handleSort}>Individual</SortTh>
                <SortTh field="started_at"      active={sortField} dir={sortDir} onSort={handleSort}>Start Time</SortTh>
                <SortTh field="runtime_minutes" active={sortField} dir={sortDir} onSort={handleSort}>Runtime</SortTh>
                <th className="px-4 py-3 text-xs font-medium text-brand-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {sorted.map((p) => (
                <PipelineRow
                  key={p.id}
                  pipeline={p}
                  onView={() => setSelectedId(p.id)}
                  onCancel={() => void cancel(p.id)}
                />
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
      {selectedId && (
        <PipelineDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}

function SortTh({
  field,
  active,
  dir,
  onSort,
  children,
}: {
  field: SortField;
  active: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
  children: React.ReactNode;
}) {
  const isActive = field === active;
  return (
    <th className="px-4 py-3">
      <button
        onClick={() => onSort(field)}
        className={[
          "flex items-center gap-1 text-xs font-medium transition-colors",
          isActive ? "text-brand-cyan" : "text-brand-muted hover:text-brand-text",
        ].join(" ")}
      >
        {children}
        <span className="text-[10px]">
          {isActive ? (dir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function PipelineRow({
  pipeline: p,
  onView,
  onCancel,
}: {
  pipeline: Pipeline;
  onView: () => void;
  onCancel: () => void;
}) {
  const isActive = p.status === "running" || p.status === "pending";
  const startTime = p.started_at ?? p.created_at;

  return (
    <tr className="group transition-colors hover:bg-brand-border/20">
      <td className="px-4 py-3 text-xs font-medium text-brand-text">
        {TYPE_LABEL[p.type]}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={p.status} size="sm" />
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {p.individual_id ?? <span className="text-brand-border">—</span>}
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {formatDate(startTime)}
      </td>
      <td className="px-4 py-3 text-xs text-brand-muted">
        {formatRuntime(p.runtime_minutes)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={onView} className="text-xs text-brand-cyan hover:underline">
            View
          </button>
          {isActive && (
            <button
              onClick={onCancel}
              className="text-xs text-brand-muted transition-colors hover:text-red-400"
            >
              Cancel
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
