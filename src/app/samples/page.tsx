"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { createPipeline } from "@/lib/workflow-client";
import { useSamples } from "@/hooks/useSamples";
import type { Sample } from "@/lib/sample-client";

const SUPERPOPULATIONS = [
  { code: "AFR", name: "African" },
  { code: "AMR", name: "American" },
  { code: "EAS", name: "East Asian" },
  { code: "EUR", name: "European" },
  { code: "SAS", name: "South Asian" },
];

const POPULATIONS = [
  "ACB", "ASW", "BEB", "CDX", "CEU", "CHB", "CHS", "CLM",
  "ESN", "FIN", "GBR", "GIH", "GWD", "IBS", "ITU", "JPT",
  "KHV", "LWK", "MSL", "MXL", "PEL", "PJL", "PUR", "STU", "TSI", "YRI",
];

function s3VcfUri(individualId: string): string {
  return `s3://1000genomes-dragen/data/dragen-3.7.6/hg38-graph-based/${individualId}/${individualId}.hard-filtered.vcf.gz`;
}

export default function SamplesPage() {
  const [search, setSearch] = useState("");
  const [population, setPopulation] = useState("");
  const [superpopulation, setSuperpopulation] = useState("");
  const [sex, setSex] = useState("");
  const [ingested, setIngested] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);

  // Defer the search string so keystrokes don't trigger a fetch on every character
  const deferredSearch = useDeferredValue(search);

  const params = useMemo(
    () => ({
      q: deferredSearch || undefined,
      population: population || undefined,
      superpopulation: superpopulation || undefined,
      sex: sex || undefined,
      ingested: ingested === "" ? undefined : ingested === "true",
      page,
      page_size: 50,
    }),
    [deferredSearch, population, superpopulation, sex, ingested, page],
  );

  const { data, loading, error, refetch } = useSamples(params);

  const resetPage = useCallback(() => setPage(1), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-brand-text">Samples</h1>
        <p className="mt-1 text-sm text-brand-muted">
          1000 Genomes individuals — {data ? data.total.toLocaleString() : "…"} matching
        </p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          placeholder="Search by name…"
          className="w-full rounded-lg border border-brand-border bg-brand-surface px-4 py-2 text-sm text-brand-text placeholder:text-brand-muted focus:border-brand-cyan focus:ring-0"
        />

        <div className="flex flex-wrap gap-3">
          {/* Superpopulation */}
          <select
            value={superpopulation}
            onChange={(e) => { setSuperpopulation(e.target.value); resetPage(); }}
            className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text"
          >
            <option value="">All ancestries</option>
            {SUPERPOPULATIONS.map((s) => (
              <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
            ))}
          </select>

          {/* Population */}
          <select
            value={population}
            onChange={(e) => { setPopulation(e.target.value); resetPage(); }}
            className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text"
          >
            <option value="">All populations</option>
            {POPULATIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Sex */}
          <select
            value={sex}
            onChange={(e) => { setSex(e.target.value); resetPage(); }}
            className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text"
          >
            <option value="">All sexes</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Ingested */}
          <select
            value={ingested}
            onChange={(e) => { setIngested(e.target.value as "" | "true" | "false"); resetPage(); }}
            className="rounded-lg border border-brand-border bg-brand-surface px-3 py-1.5 text-sm text-brand-text"
          >
            <option value="">All statuses</option>
            <option value="true">Ingested</option>
            <option value="false">Not ingested</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto rounded-xl border border-brand-border">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-brand-surface">
            <tr>
              {["Name", "ID", "Sex", "Population", "Ancestry", "Status", "Action"].map((h) => (
                <th key={h} className="border-b border-brand-border px-4 py-2.5 text-left text-xs font-semibold text-brand-cyan">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {loading && !data && (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-2.5">
                      <div className="h-4 rounded bg-brand-border/30 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {data?.samples.map((s) => (
              <SampleRow key={s.individual_id} sample={s} onIngestSuccess={refetch} />
            ))}
            {data?.samples.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-brand-muted">
                  No samples match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-brand-muted">
          <span>
            Page {data.page} of {data.pages} — {data.total.toLocaleString()} results
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-xs hover:bg-brand-border/30 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-brand-border px-3 py-1.5 text-xs hover:bg-brand-border/30 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SampleRow({
  sample: s,
  onIngestSuccess,
}: {
  sample: Sample;
  onIngestSuccess: () => void;
}) {
  const [ingestState, setIngestState] = useState<"idle" | "loading" | "queued" | "error">("idle");
  const [ingestError, setIngestError] = useState<string | null>(null);

  async function handleIngest() {
    setIngestState("loading");
    setIngestError(null);
    try {
      await createPipeline({
        type: "vcf_ingest",
        individual_id: s.individual_id,
        name: `VCF Ingest ${s.individual_id}`,
        s3_vcf_uri: s3VcfUri(s.individual_id),
      });
      setIngestState("queued");
      onIngestSuccess();
    } catch (e) {
      setIngestError(e instanceof Error ? e.message : "Failed");
      setIngestState("error");
    }
  }

  const popLabel = s.population_name
    ? `${s.population_name}${s.population_code ? ` (${s.population_code})` : ""}`
    : s.population_code ?? "—";

  const ancestryLabel = s.superpopulation_name ?? s.superpopulation_code ?? "—";

  return (
    <tr className="transition-colors even:bg-brand-border/10 hover:bg-brand-border/20">
      {/* Name */}
      <td className="px-4 py-2.5 font-medium text-brand-text">
        {s.ingested ? (
          <Link href={`/individuals/${s.individual_id}`} className="text-brand-cyan hover:underline">
            {s.display_name}
          </Link>
        ) : (
          s.display_name
        )}
      </td>

      {/* ID */}
      <td className="px-4 py-2.5 font-mono text-xs text-brand-muted">{s.individual_id}</td>

      {/* Sex */}
      <td className="px-4 py-2.5 text-brand-muted capitalize">{s.sex ?? "—"}</td>

      {/* Population */}
      <td className="px-4 py-2.5 text-brand-muted">{popLabel}</td>

      {/* Ancestry */}
      <td className="px-4 py-2.5 text-brand-muted">{ancestryLabel}</td>

      {/* Status */}
      <td className="px-4 py-2.5">
        {s.ingested ? (
          <span className="inline-flex items-center rounded-full bg-brand-cyan/10 px-2 py-0.5 text-xs font-medium text-brand-cyan">
            Ingested
          </span>
        ) : (
          <span className="text-xs text-brand-muted">Not ingested</span>
        )}
      </td>

      {/* Action */}
      <td className="px-4 py-2.5">
        {s.ingested ? null : ingestState === "queued" ? (
          <span className="text-xs text-brand-gold">Queued</span>
        ) : ingestState === "error" ? (
          <span className="text-xs text-red-400" title={ingestError ?? undefined}>Failed</span>
        ) : (
          <button
            onClick={() => void handleIngest()}
            disabled={ingestState === "loading"}
            className="rounded-lg border border-brand-border px-2.5 py-1 text-xs text-brand-muted transition-colors hover:border-brand-cyan hover:text-brand-cyan disabled:opacity-50"
          >
            {ingestState === "loading" ? "…" : "Ingest"}
          </button>
        )}
      </td>
    </tr>
  );
}
