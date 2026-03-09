"use client";

import { use } from "react";
import Link from "next/link";
import { useIndividualVariants } from "@/hooks/useIndividualVariants";
import type { Variant } from "@/lib/cohort-client";

const SIG_COLORS: Record<string, string> = {
  Pathogenic: "text-red-400",
  Likely_pathogenic: "text-orange-400",
  "Pathogenic/Likely_pathogenic": "text-red-400",
  Uncertain_significance: "text-brand-gold",
  Likely_benign: "text-green-500",
  Benign: "text-green-400",
};

function sigColor(sig: string) {
  return SIG_COLORS[sig] ?? "text-brand-muted";
}

export default function IndividualPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, loading, error } = useIndividualVariants(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-xs text-brand-muted hover:text-brand-text transition-colors"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-brand-text font-mono">{id}</h1>
      </div>

      {/* Truncation banner */}
      {data?.truncated && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3">
          <span className="text-brand-gold">⚠</span>
          <p className="text-sm text-brand-gold">
            Showing {data.returned_count.toLocaleString()} of{" "}
            {data.total_count.toLocaleString()} total variants — first 999 by chromosomal position.
          </p>
        </div>
      )}

      {!data?.truncated && data && (
        <p className="text-xs text-brand-muted">
          {data.returned_count.toLocaleString()} variants total.
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-7 rounded bg-brand-border/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Variants table */}
      {data && (
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="min-w-full border-collapse text-xs">
            <thead className="bg-brand-navy sticky top-0">
              <tr>
                {[
                  "Chr", "Position", "Ref", "Alt", "Genotype", "Depth",
                  "Quality", "Filter", "Gene", "Significance", "Consequence",
                  "Condition", "HGVS c.", "HGVS p.", "rsID", "AF",
                ].map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b border-brand-border px-3 py-2 text-left font-semibold text-brand-cyan"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {data.variants.map((v, i) => (
                <VariantRow key={i} variant={v} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function VariantRow({ variant: v }: { variant: Variant }) {
  return (
    <tr className="transition-colors even:bg-brand-border/10 hover:bg-brand-border/20">
      <td className="px-3 py-1.5 font-mono text-brand-muted">{v.chromosome}</td>
      <td className="px-3 py-1.5 font-mono text-brand-text">{v.position.toLocaleString()}</td>
      <td className="px-3 py-1.5 font-mono text-brand-text">{v.ref}</td>
      <td className="px-3 py-1.5 font-mono text-brand-text">{v.alt}</td>
      <td className="px-3 py-1.5 font-mono text-brand-muted">{v.genotype}</td>
      <td className="px-3 py-1.5 text-right text-brand-muted">{v.depth ?? "—"}</td>
      <td className="px-3 py-1.5 text-right text-brand-muted">
        {v.quality != null ? v.quality.toFixed(0) : "—"}
      </td>
      <td className="px-3 py-1.5 text-brand-muted">{v.filter || "—"}</td>
      <td className="px-3 py-1.5 font-mono text-brand-text">{v.gene_symbol || "—"}</td>
      <td className={`px-3 py-1.5 whitespace-nowrap ${sigColor(v.clinical_significance)}`}>
        {v.clinical_significance.replace(/_/g, " ") || "—"}
      </td>
      <td className="px-3 py-1.5 text-brand-muted max-w-[180px] truncate">
        {v.consequence.replace(/_variant$/, "").replace(/_/g, " ") || "—"}
      </td>
      <td className="px-3 py-1.5 text-brand-muted max-w-[200px] truncate">
        {v.condition_name || "—"}
      </td>
      <td className="px-3 py-1.5 font-mono text-brand-muted text-[11px]">{v.hgvs_c || "—"}</td>
      <td className="px-3 py-1.5 font-mono text-brand-muted text-[11px]">{v.hgvs_p || "—"}</td>
      <td className="px-3 py-1.5 font-mono text-brand-muted">{v.rsid || "—"}</td>
      <td className="px-3 py-1.5 text-right text-brand-muted">
        {v.allele_frequency > 0 ? v.allele_frequency.toExponential(2) : "—"}
      </td>
    </tr>
  );
}
