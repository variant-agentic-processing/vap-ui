"use client";

import { use } from "react";
import Link from "next/link";
import { useGeneVariants } from "@/hooks/useGeneVariants";
import { AgentPanel } from "@/components/AgentPanel";
import { ZygosityBadge } from "@/components/ZygosityBadge";
import { VarisCell } from "@/components/VarisCell";
import type { GeneVariant } from "@/lib/cohort-client";
import {
  CLINICAL_SIG_NOTES,
  CONSEQUENCE_NOTES,
  REVIEW_STATUS_NOTES,
  chromNote,
  afNote,
} from "@/lib/variantNotes";

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

export default function GenePage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = use(params);
  const gene = decodeURIComponent(symbol);
  const { data, loading, error } = useGeneVariants(gene);

  return (
    <div className="space-y-6">
      <AgentPanel subtitle={`Ask Varis about ${gene}`} />

      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-xs text-brand-muted hover:text-brand-text transition-colors">
          ← Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-brand-text">{gene}</h1>
          <p className="mt-1 text-sm text-brand-muted">Cross-cohort variant analysis</p>
        </div>

        {data && (
          <div className="flex gap-4">
            <StatPill label="Variants" value={data.total_count.toLocaleString()} />
            <StatPill label="Pathogenic" value={data.pathogenic_count.toLocaleString()} accent />
            <StatPill label="Individuals" value={data.distinct_individuals.toLocaleString()} />
          </div>
        )}
      </div>

      {data?.truncated && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3">
          <span className="text-brand-gold">⚠</span>
          <p className="text-sm text-brand-gold">
            Showing first 500 variants — most pathogenic first.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error.includes("not found") ? `No variants found for gene "${gene}".` : error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-7 rounded bg-brand-border/30 animate-pulse" />
          ))}
        </div>
      )}

      {data && data.variants.length > 0 && (
        <div className="overflow-auto rounded-xl border border-brand-border" style={{ maxHeight: "600px" }}>
          <table className="border-collapse text-xs" style={{ tableLayout: "fixed", width: "1644px" }}>
            <colgroup>
              <col style={{ width: 110 }} />
              <col style={{ width: 60 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 52 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 140 }} />
              <col style={{ width: 72 }} />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-brand-navy">
              <tr>
                {["Individual", "Chr", "Ref", "Alt", "Genotype", "Significance",
                  "ClinVar ID", "rsID", "Review Status", "Condition", "Consequence",
                  "Position", "HGVS c.", "HGVS p.", "AF"].map((label) => (
                  <th
                    key={label}
                    className="border-b border-brand-border px-3 py-2 text-left font-semibold text-brand-cyan overflow-hidden"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {data.variants.map((v, i) => (
                <GeneVariantRow key={i} variant={v} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-center min-w-[80px]">
      <p className="text-xs text-brand-muted">{label}</p>
      <p className={`mt-0.5 text-xl font-semibold ${accent ? "text-brand-gold" : "text-brand-text"}`}>
        {value}
      </p>
    </div>
  );
}

function Cell({
  value,
  className = "text-brand-muted",
  mono = false,
}: {
  value: string | number | null | undefined;
  className?: string;
  mono?: boolean;
}) {
  const display = value != null && value !== "" ? String(value) : "—";
  return (
    <td
      title={display !== "—" ? display : undefined}
      className={`px-3 py-1.5 overflow-hidden ${className} ${mono ? "font-mono" : ""}`}
      style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
    >
      {display}
    </td>
  );
}

function GeneVariantRow({ variant: v }: { variant: GeneVariant }) {
  const sigClass = sigColor(v.clinical_significance);
  const sigLabel = v.clinical_significance.replace(/_/g, " ");
  const reviewLabel = v.review_status.replace(/_/g, " ").replace(/,/g, ", ");
  const consequenceLabel = v.consequence.replace(/_variant$/, "").replace(/_/g, " ");

  return (
    <tr className="transition-colors even:bg-brand-border/10 hover:bg-brand-border/20">
      <td
        className="px-3 py-1.5 font-mono overflow-hidden text-brand-cyan"
        style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
      >
        <Link href={`/individuals/${encodeURIComponent(v.individual_id)}`} className="hover:underline">
          {v.individual_id}
        </Link>
      </td>
      <VarisCell value={v.chromosome} className="text-brand-muted" mono varisNote={chromNote(v.chromosome)} />
      <Cell value={v.ref}        className="text-brand-text" mono />
      <Cell value={v.alt}        className="text-brand-text" mono />
      <td title={v.genotype || undefined} className="px-3 py-1.5 font-mono overflow-hidden" style={{ whiteSpace: "nowrap" }}>
        <span className="text-brand-muted">{v.genotype || "—"}</span>
        <ZygosityBadge genotype={v.genotype} />
      </td>
      <VarisCell value={sigLabel || null} className={sigClass} varisNote={CLINICAL_SIG_NOTES[v.clinical_significance] ?? null} />
      <td
        className="px-3 py-1.5 text-brand-muted font-mono overflow-hidden"
        style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
      >
        {v.clinvar_variation_id ? (
          <a
            href={`https://www.ncbi.nlm.nih.gov/clinvar/variation/${v.clinvar_variation_id}/`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-cyan hover:underline"
          >
            {v.clinvar_variation_id}
          </a>
        ) : "—"}
      </td>
      <td
        className="px-3 py-1.5 text-brand-muted font-mono overflow-hidden"
        style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
      >
        {v.rsid ? (
          <a
            href={`https://www.ncbi.nlm.nih.gov/snp/${v.rsid}`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-cyan hover:underline"
          >
            {v.rsid}
          </a>
        ) : "—"}
      </td>
      <VarisCell value={reviewLabel || null} className="text-brand-muted" varisNote={REVIEW_STATUS_NOTES[v.review_status] ?? null} />
      <Cell value={v.condition_name}         className="text-brand-muted" />
      <VarisCell value={consequenceLabel || null} className="text-brand-muted" varisNote={CONSEQUENCE_NOTES[v.consequence] ?? null} />
      <Cell value={v.position.toLocaleString()} className="text-brand-text" mono />
      <Cell value={v.hgvs_c} className="text-brand-muted text-[11px]" mono />
      <Cell value={v.hgvs_p} className="text-brand-muted text-[11px]" mono />
      <VarisCell value={v.allele_frequency > 0 ? v.allele_frequency.toExponential(2) : null} className="text-right text-brand-muted" varisNote={afNote(v.allele_frequency)} />
    </tr>
  );
}
