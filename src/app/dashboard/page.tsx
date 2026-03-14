"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/hooks/useDashboard";
import { useClinvarVersion } from "@/hooks/useClinvarVersion";
import { AgentPanel } from "@/components/AgentPanel";
import { VarisPopover, type PopoverPos } from "@/components/VarisPopover";
import { getSample, type Sample } from "@/lib/sample-client";
import { GENE_NOTES } from "@/lib/variantNotes";

const WARMUP_ENDPOINTS = [
  "/api/agent/health",
  "/api/mcp/health",
  "/api/stats/health",
  "/api/samples/health",
  "/api/workflow/system/status",
];

export default function DashboardPage() {
  useEffect(() => {
    for (const url of WARMUP_ENDPOINTS) {
      void fetch(url, { priority: "low" } as RequestInit).catch(() => undefined);
    }
  }, []);

  const { cohortSummary, topGenes, consequences, individuals, totalVariants, sharedPathogenicGenes, loading, error } =
    useDashboard();
  const { data: clinvar, loading: clinvarLoading } = useClinvarVersion();

  const annotatedVariants = cohortSummary.reduce((s, r) => s + r.count, 0);
  const pathogenicCount =
    cohortSummary.find((r) =>
      ["Pathogenic", "Likely_pathogenic", "Pathogenic/Likely_pathogenic"].includes(r.value)
    )?.count ?? 0;

  return (
    <div className="space-y-8">
      <AgentPanel subtitle="Ask Varis about the cohort" />
      <div>
        <h1 className="text-2xl font-semibold text-brand-text">Dashboard</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Cohort-level analytics across all loaded individuals.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Variants" value={loading ? "—" : (totalVariants?.toLocaleString() ?? "—")} />
        <StatCard label="Individuals" value={loading ? "—" : String(individuals.length)} />
        <StatCard label="Annotated Variants" value={loading ? "—" : annotatedVariants.toLocaleString()} />
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
                        <IndividualIdCell id={ind.individual_id} />
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
                    <GeneSymbolLink symbol={g.gene_symbol} />
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

      {/* Shared pathogenic burden */}
      {(loading || sharedPathogenicGenes.length > 0) && (
        <Section title="Shared Pathogenic Burden">
          {loading ? (
            <LoadingRows />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-brand-border">
                    <th className="pb-2 text-left font-semibold text-brand-cyan">Gene</th>
                    <th className="pb-2 text-right font-semibold text-brand-cyan">Individuals</th>
                    <th className="pb-2 text-right font-semibold text-brand-cyan">Pathogenic Variants</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/40">
                  {sharedPathogenicGenes.map((g) => (
                    <tr key={g.gene_symbol} className="hover:bg-brand-border/20 transition-colors">
                      <td className="py-2 font-mono">
                        <Link href={`/genes/${encodeURIComponent(g.gene_symbol)}`} className="text-brand-cyan hover:underline">
                          {g.gene_symbol}
                        </Link>
                      </td>
                      <td className="py-2 text-right text-brand-gold">{g.individual_count}</td>
                      <td className="py-2 text-right text-brand-muted">{g.pathogenic_count.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

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

const GENE_CARD_HEIGHT = 84;
const SAMPLE_CARD_HEIGHT = 84;

function GeneSymbolLink({ symbol }: { symbol: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const note = GENE_NOTES[symbol] ?? null;

  useEffect(() => {
    if (!pos) return;
    function hide() { setPos(null); }
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [pos]);

  function handleMouseEnter() {
    if (!note || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - GENE_CARD_HEIGHT - 10, left: r.left + r.width / 2 });
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
        className="inline-block w-24 shrink-0"
      >
        <Link
          href={`/genes/${encodeURIComponent(symbol)}`}
          className="font-mono text-xs text-brand-cyan hover:underline truncate block"
        >
          {symbol}
        </Link>
      </span>
      {pos && note && (
        <VarisPopover pos={pos} cardClassName="w-80">
          <p className="text-[11px] font-semibold text-brand-text mb-0.5">{symbol}</p>
          <p className="text-[11px] leading-relaxed text-brand-muted">{note}</p>
        </VarisPopover>
      )}
    </>
  );
}

function IndividualIdCell({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (!pos) return;
    function hide() { setPos(null); }
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [pos]);

  function handleMouseEnter() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - SAMPLE_CARD_HEIGHT - 10, left: r.left + r.width / 2 });
    if (!fetched.current) {
      fetched.current = true;
      getSample(id).then(setSample).catch(() => {});
    }
  }

  const meta = sample
    ? [
        sample.sex ? sample.sex.charAt(0).toUpperCase() + sample.sex.slice(1) : null,
        sample.population_name && sample.population_code
          ? `${sample.population_name} (${sample.population_code})`
          : sample.population_name ?? sample.population_code,
        sample.superpopulation_name && sample.superpopulation_code
          ? `${sample.superpopulation_name} (${sample.superpopulation_code})`
          : sample.superpopulation_name ?? sample.superpopulation_code,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
        className="inline-block"
      >
        <Link
          href={`/individuals/${encodeURIComponent(id)}`}
          className="text-brand-cyan hover:underline"
        >
          {id}
        </Link>
      </span>
      {pos && (
        <VarisPopover pos={pos} cardClassName="w-72">
          {sample ? (
            <>
              <p className="text-[11px] font-semibold text-brand-text truncate">{sample.display_name}</p>
              {meta && <p className="text-[11px] text-brand-muted mt-0.5 leading-relaxed">{meta}</p>}
            </>
          ) : (
            <p className="text-[11px] text-brand-muted animate-pulse">Loading…</p>
          )}
        </VarisPopover>
      )}
    </>
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

