"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./Modal";
import { StatusBadge } from "./StatusBadge";
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

export function PipelineDetailModal({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { pipeline: p, isLoading, error, cancel, rerun } = usePipeline(id);

  const isActive = p?.status === "running" || p?.status === "pending";

  return (
    <Modal
      title={
        p
          ? `${TYPE_LABEL[p.type]}${p.individual_id ? ` · ${p.individual_id}` : ""}`
          : "Pipeline"
      }
      onClose={onClose}
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-brand-muted">Loading…</div>
      ) : error || !p ? (
        <div className="py-8 text-center text-sm text-red-400">
          {error ?? "Pipeline not found"}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Status + actions row */}
          <div className="flex items-center justify-between">
            <StatusBadge status={p.status} />
            <div className="flex items-center gap-2">
              {isActive && (
                <button
                  onClick={() => void cancel().then(onClose)}
                  className="rounded-lg border border-red-800/50 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:border-red-600"
                >
                  Cancel
                </button>
              )}
              {!isActive && p.status !== "deleted" && (
                <button
                  onClick={() => {
                    void rerun().then((next) => {
                      if (next) {
                        onClose();
                        router.refresh();
                      }
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
          <div className="grid grid-cols-2 gap-2">
            <MetaCard label="Started"  value={p.started_at ? formatRelative(p.started_at) : "—"} />
            <MetaCard label="Runtime"  value={formatRuntime(p.runtime_minutes)} />
            <MetaCard label="Created"  value={formatDate(p.created_at)} />
            <MetaCard label="Execution" value={p.workflow_execution_id ? p.workflow_execution_id.slice(-8) : "—"} mono />
          </div>

          {/* Error */}
          {p.error && (
            <div className="rounded-lg border border-red-800/40 bg-red-900/10 px-3 py-2 text-xs text-red-400">
              {p.error}
            </div>
          )}

          {/* Stages */}
          {p.stages.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Stages
              </p>
              <div className="rounded-lg border border-brand-border overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-brand-border text-left">
                      <th className="px-3 py-2 font-medium text-brand-muted">Stage</th>
                      <th className="px-3 py-2 font-medium text-brand-muted">Status</th>
                      <th className="px-3 py-2 font-medium text-brand-muted">Runtime</th>
                      <th className="px-3 py-2 font-medium text-brand-muted">Records</th>
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

          {/* ID footer */}
          <p className="font-mono text-xs text-brand-border">{p.id}</p>
        </div>
      )}
    </Modal>
  );
}

function MetaCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-lg border border-brand-border bg-brand-navy px-3 py-2">
      <p className="mb-0.5 text-xs text-brand-muted">{label}</p>
      <p className={`text-xs font-medium text-brand-text ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function StageRow({ stage: s }: { stage: StageStatus }) {
  const icon = STAGE_ICON[s.status] ?? "○";
  return (
    <tr className="hover:bg-brand-border/10 transition-colors">
      <td className="px-3 py-2">
        <span className="flex items-center gap-1.5">
          <span className={[
            "w-3 text-center font-mono",
            s.status === "completed" ? "text-green-400" :
            s.status === "failed"    ? "text-red-400" :
            s.status === "running"   ? "text-brand-cyan" :
            "text-brand-muted",
          ].join(" ")}>{icon}</span>
          <span className="font-medium text-brand-text">{s.name}</span>
        </span>
      </td>
      <td className="px-3 py-2"><StatusBadge status={s.status} size="sm" /></td>
      <td className="px-3 py-2 text-brand-muted">{formatRuntime(s.runtime_minutes)}</td>
      <td className="px-3 py-2 text-brand-muted">
        {s.record_count !== null ? s.record_count.toLocaleString() : "—"}
      </td>
    </tr>
  );
}
