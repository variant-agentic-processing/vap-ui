"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useClinvarVersion } from "@/hooks/useClinvarVersion";
import { AgentPanel } from "@/components/AgentPanel";

export default function DashboardPage() {
  const [geneInput, setGeneInput] = useState("");
  const [activeGenes, setActiveGenes] = useState<string[]>([]);

  const { cohortSummary, topGenes, consequences, individuals, loading, error } =
    useDashboard(activeGenes);
  const { data: clinvar, loading: clinvarLoading } = useClinvarVersion();

  function applyGeneFilter() {
    const genes = geneInput
      .split(",")
      .map((g) => g.trim().toUpperCase())
      .filter(Boolean);
    setActiveGenes(genes);
  }

  function clearFilter() {
    setGeneInput("");
    setActiveGenes([]);
  }

  const totalVariants = cohortSummary.reduce((s, r) => s + r.count, 0);
  const pathogenicCount =
    cohortSummary.find((r) =>
      ["Pathogenic", "Likely_pathogenic", "Pathogenic/Likely_pathogenic"].includes(r.value)
    )?.count ?? 0;

  return (
    <div className="space-y-8">
      <AgentPanel subtitle="Ask Locus about the cohort" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Cohort-level analytics across all loaded individuals.
          </p>
        </div>

        {/* Gene filter */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={geneInput}
            onChange={(e) => setGeneInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyGeneFilter()}
            placeholder="Filter by gene (e.g. BRCA1, TP53)"
            className="w-72 rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text placeholder:text-brand-muted"
          />
          <button
            onClick={applyGeneFilter}
            className="rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 px-3 py-1.5 text-sm text-brand-cyan hover:bg-brand-cyan/20 transition-colors"
          >
            Apply
          </button>
          {activeGenes.length > 0 && (
            <button
              onClick={clearFilter}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-sm text-brand-muted hover:text-brand-text transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {activeGenes.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-brand-muted">
          <span>Filtering by:</span>
          {activeGenes.map((g) => (
            <span key={g} className="rounded px-2 py-0.5 bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">
              {g}
            </span>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Individuals" value={loading ? "—" : String(individuals.length)} />
        <StatCard label="Annotated Variants" value={loading ? "—" : totalVariants.toLocaleString()} />
        <StatCard
          label="Pathogenic / Likely Pathogenic"
          value={loading ? "—" : pathogenicCount.toLocaleString()}
          accent
        />
        <ClinvarStatCard version={clinvarLoading ? null : (clinvar?.loaded_version ?? null)} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Individuals */}
        <Section title="Individuals">
          {loading ? (
            <LoadingRows />
          ) : individuals.length === 0 ? (
            <p className="text-sm text-brand-muted py-4">No individuals found.</p>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: "260px", scrollbarGutter: "stable" }}>
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-brand-surface">
                  <tr className="border-b border-brand-border">
                    <th className="pb-2 text-left font-semibold text-brand-cyan">ID</th>
                    <th className="pb-2 text-right font-semibold text-brand-cyan">Variants</th>
                    <th className="pb-2 text-center font-semibold text-brand-cyan">Pathogenic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {individuals.map((ind) => (
                    <tr key={ind.individual_id} className="transition-colors hover:bg-brand-border/20">
                      <td className="py-2 font-mono">
                        <Link
                          href={`/individuals/${encodeURIComponent(ind.individual_id)}`}
                          className="text-brand-cyan hover:underline"
                        >
                          {ind.individual_id}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-brand-muted">{ind.variant_count.toLocaleString()}</td>
                      <td className="py-2 text-center text-brand-gold">{ind.pathogenic_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Top Genes by Pathogenic Burden">
          {loading ? (
            <LoadingRows />
          ) : (
            <div className="space-y-1.5">
              {topGenes.slice(0, 12).map((g) => {
                const max = topGenes[0]?.pathogenic_count ?? 1;
                const pct = max > 0 ? (g.pathogenic_count / max) * 100 : 0;
                return (
                  <div key={g.gene_symbol} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 font-mono text-xs text-brand-text truncate">
                      {g.gene_symbol}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-brand-border overflow-hidden">
                      <div className="h-full rounded-full bg-brand-gold" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs text-brand-muted shrink-0">
                      {g.pathogenic_count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Clinical significance breakdown */}
      <Section title="Clinical Significance">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="flex flex-wrap gap-3">
            {cohortSummary.map((r) => {
              const color = sigColor(r.value);
              return (
                <div
                  key={r.value}
                  className={`rounded-lg border px-4 py-3 min-w-[140px] ${color.border} ${color.bg}`}
                >
                  <p className={`text-xs font-medium truncate ${color.text}`}>
                    {r.value.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-brand-text">
                    {r.count.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* Consequence types */}
      <Section title="Consequence Types">
        {loading ? (
          <LoadingRows />
        ) : (
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            {consequences.slice(0, 16).map((c) => {
              const max = consequences[0]?.count ?? 1;
              const pct = (c.count / max) * 100;
              return (
                <div key={c.value} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 text-xs text-brand-muted truncate">
                    {c.value.replace(/_variant$/, "").replace(/_/g, " ")}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-brand-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-cyan/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs text-brand-muted shrink-0">
                    {c.count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface px-5 py-4">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${accent ? "text-brand-gold" : "text-brand-text"}`}>
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface px-5 py-4">
      <h2 className="mb-4 text-sm font-semibold text-brand-text">{title}</h2>
      {children}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-4 rounded bg-brand-border/30 animate-pulse" />
      ))}
    </div>
  );
}

function ClinvarStatCard({ version }: { version: string | null }) {
  const isStale = (() => {
    if (!version) return false;
    const released = new Date(version);
    const ageMs = Date.now() - released.getTime();
    return ageMs > 30 * 24 * 60 * 60 * 1000;
  })();

  return (
    <div className={[
      "rounded-xl border px-5 py-4",
      isStale ? "border-red-800/40 bg-red-900/10" : "border-brand-border bg-brand-surface",
    ].join(" ")}>
      <p className={`text-xs ${isStale ? "text-red-400/70" : "text-brand-muted"}`}>ClinVar Release</p>
      <p className={`mt-1 text-3xl font-semibold ${isStale ? "text-red-400" : "text-brand-text"}`}>
        {version ?? "—"}
      </p>
      {isStale && (
        <p className="mt-1.5 text-xs text-red-400/80">Refresh recommended</p>
      )}
    </div>
  );
}

function sigColor(sig: string) {
  if (sig.toLowerCase().includes("pathogenic") && !sig.toLowerCase().includes("likely"))
    return { border: "border-red-800/40", bg: "bg-red-900/10", text: "text-red-400" };
  if (sig.toLowerCase().includes("likely_pathogenic"))
    return { border: "border-orange-800/40", bg: "bg-orange-900/10", text: "text-orange-400" };
  if (sig.toLowerCase().includes("benign"))
    return { border: "border-green-800/40", bg: "bg-green-900/10", text: "text-green-400" };
  if (sig.toLowerCase().includes("uncertain"))
    return { border: "border-brand-gold/30", bg: "bg-brand-gold/10", text: "text-brand-gold" };
  return { border: "border-brand-border", bg: "bg-brand-navy", text: "text-brand-muted" };
}

