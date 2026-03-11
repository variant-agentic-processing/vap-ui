"use client";

import { useMemo, useState } from "react";
import { PipelineDetailModal } from "@/components/PipelineDetailModal";
import { StatusBadge } from "@/components/StatusBadge";
import { SubmitPipelineModal } from "@/components/SubmitPipelineModal";
import { usePipelines } from "@/hooks/usePipelines";
import { useHealth, type ServiceHealth, type ServiceState, type ClinvarState } from "@/hooks/useHealth";
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

type PageTab = "pipelines" | "system";

export default function ToolsPage() {
  const [tab, setTab] = useState<PageTab>("pipelines");

  return (
    <div>
      <AgentPanel subtitle="Ask Varis about pipelines" />

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-brand-text">Tools</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Pipeline management and system status.
        </p>
      </div>

      {/* Top-level tabs */}
      <div className="mb-6 flex items-center gap-1 border-b border-brand-border">
        {(["pipelines", "system"] as PageTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              "px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-brand-cyan text-brand-cyan"
                : "border-transparent text-brand-muted hover:text-brand-text",
            ].join(" ")}
          >
            {t === "pipelines" ? "Pipelines" : "System Status"}
          </button>
        ))}
      </div>

      {tab === "pipelines" ? <PipelinesTab /> : <SystemTab />}
    </div>
  );
}

// ─── Pipelines tab ────────────────────────────────────────────────────────────

function PipelinesTab() {
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
    <>
      <div className="mb-4 flex items-center justify-between">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1">
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

        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-brand-cyan px-4 py-2 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-90"
        >
          Submit Pipeline
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-brand-border bg-brand-surface overflow-hidden max-h-[calc(100vh-280px)] overflow-y-auto">
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
    </>
  );
}

// ─── System status tab ────────────────────────────────────────────────────────

const STATUS_DOT: Record<ServiceHealth, string> = {
  checking:    "bg-brand-muted animate-pulse",
  healthy:     "bg-green-400",
  degraded:    "bg-brand-gold",
  unreachable: "bg-red-500",
};

const STATUS_COLOR: Record<ServiceHealth, string> = {
  checking:    "text-brand-muted",
  healthy:     "text-green-400",
  degraded:    "text-brand-gold",
  unreachable: "text-red-400",
};

const STATUS_LABEL: Record<ServiceHealth, string> = {
  checking:    "Checking…",
  healthy:     "Healthy",
  degraded:    "Degraded",
  unreachable: "Unreachable",
};

function ServiceCard({ name, state }: { name: string; state: ServiceState }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-text">{name}</span>
        <span className={`flex items-center gap-2 text-xs font-medium ${STATUS_COLOR[state.status]}`}>
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT[state.status]}`} />
          {STATUS_LABEL[state.status]}
        </span>
      </div>
      {state.detail && (
        <p className="mt-1.5 text-xs text-brand-muted">{state.detail}</p>
      )}
    </div>
  );
}

function SystemTab() {
  const { workflow, agent, mcp, stats, sample, clinvar, refresh } = useHealth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-brand-muted">Live status of all platform services.</p>
        <button
          onClick={refresh}
          className="text-xs text-brand-muted transition-colors hover:text-brand-cyan"
        >
          Refresh
        </button>
      </div>

      {/* Services */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted">Services</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ServiceCard name="workflow-service" state={workflow} />
          <ServiceCard name="agent-service" state={agent} />
          <ServiceCard name="variant-mcp-server" state={mcp} />
          <ServiceCard name="stats-service" state={stats} />
          <ServiceCard name="sample-service" state={sample} />
        </div>
      </div>

      {/* Data freshness */}
      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted">Data</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ClinvarCard clinvar={clinvar} />
          <StatsComputedCard state={stats} />
        </div>
      </div>
    </div>
  );
}

function parseVersionDate(version: string): Date | null {
  // Handle YYYYMMDD format (e.g. "20250303")
  if (/^\d{8}$/.test(version)) {
    return new Date(
      parseInt(version.slice(0, 4)),
      parseInt(version.slice(4, 6)) - 1,
      parseInt(version.slice(6, 8)),
    );
  }
  // Handle YYYY-MM-DD — parse as local midnight to avoid UTC-offset display shift
  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(version);
  if (isoDate?.[1] && isoDate[2] && isoDate[3]) {
    return new Date(parseInt(isoDate[1]), parseInt(isoDate[2]) - 1, parseInt(isoDate[3]));
  }
  const d = new Date(version);
  return isNaN(d.getTime()) ? null : d;
}

function ClinvarCard({ clinvar }: { clinvar: ClinvarState | null }) {
  const isChecking = clinvar === null;
  const isStale = clinvar?.isStale ?? false;

  const displayDate = (() => {
    if (!clinvar?.loadedAt && !clinvar?.version) return null;
    const loaded = clinvar.loadedAt ? new Date(clinvar.loadedAt) : null;
    const version = clinvar.version ? parseVersionDate(clinvar.version) : null;
    if (!loaded && !version) return null;
    if (!loaded) return version;
    if (!version) return loaded;
    return version > loaded ? version : loaded;
  })();

  return (
    <div className={[
      "rounded-xl border px-5 py-4",
      isStale ? "border-brand-gold/40 bg-brand-gold/5" : "border-brand-border bg-brand-surface",
    ].join(" ")}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-text">ClinVar</span>
        {isChecking ? (
          <span className="text-xs text-brand-muted">Checking…</span>
        ) : isStale ? (
          <span className="text-xs font-medium text-brand-gold">Stale</span>
        ) : (
          <span className="text-xs font-medium text-green-400">Current</span>
        )}
      </div>
      {clinvar && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs text-brand-muted">
            Version <span className="font-mono text-brand-text">{clinvar.version ?? "—"}</span>
          </p>
          {displayDate && (
            <p className="text-xs text-brand-muted">
              Loaded {displayDate.toLocaleDateString()}
              {isStale && " · refresh recommended"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatsComputedCard({ state }: { state: ServiceState }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-brand-text">Dashboard Stats</span>
        {state.status === "checking" ? (
          <span className="text-xs text-brand-muted">Checking…</span>
        ) : state.status === "unreachable" ? (
          <span className="text-xs font-medium text-red-400">Unavailable</span>
        ) : state.detail?.startsWith("Not") ? (
          <span className="text-xs font-medium text-brand-gold">Not computed</span>
        ) : (
          <span className="text-xs font-medium text-green-400">Ready</span>
        )}
      </div>
      {state.detail && state.status !== "unreachable" && (
        <p className="mt-1.5 text-xs text-brand-muted">{state.detail}</p>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

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
