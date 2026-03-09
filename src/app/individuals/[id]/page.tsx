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

// Column definitions: label and default width in px
const COLUMNS: { label: string; width: number }[] = [
  { label: "Chr",          width: 64  },
  { label: "Position",     width: 90  },
  { label: "Ref",          width: 52  },
  { label: "Alt",          width: 52  },
  { label: "Genotype",     width: 72  },
  { label: "Depth",        width: 58  },
  { label: "Quality",      width: 64  },
  { label: "GQ",           width: 52  },
  { label: "Filter",       width: 64  },
  { label: "Gene",         width: 80  },
  { label: "Significance", width: 160 },
  { label: "Review Status",width: 160 },
  { label: "Consequence",  width: 160 },
  { label: "Condition",    width: 200 },
  { label: "HGVS c.",      width: 160 },
  { label: "HGVS p.",      width: 140 },
  { label: "rsID",         width: 100 },
  { label: "ClinVar ID",   width: 90  },
  { label: "Last Eval.",   width: 90  },
  { label: "AF",           width: 72  },
];

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
        <Link href="/dashboard" className="text-xs text-brand-muted hover:text-brand-text transition-colors">
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
        <p className="text-xs text-brand-muted">{data.returned_count.toLocaleString()} variants total.</p>
      )}

      {error && (
        <div className="rounded-xl border border-red-800/40 bg-red-900/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-7 rounded bg-brand-border/30 animate-pulse" />
          ))}
        </div>
      )}

      {data && (
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table
            className="border-collapse text-xs"
            style={{ tableLayout: "fixed", width: `${COLUMNS.reduce((s, c) => s + c.width, 0)}px` }}
          >
            <colgroup>
              {COLUMNS.map((col) => (
                <col key={col.label} style={{ width: col.width }} />
              ))}
            </colgroup>
            <thead className="bg-brand-navy sticky top-0 z-10">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.label}
                    title={col.label}
                    className="border-b border-brand-border px-3 py-2 text-left font-semibold text-brand-cyan overflow-hidden"
                    style={{ resize: "horizontal", overflow: "hidden", whiteSpace: "nowrap" }}
                  >
                    {col.label}
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

function VariantRow({ variant: v }: { variant: Variant }) {
  const sigClass = sigColor(v.clinical_significance);
  const reviewLabel = v.review_status.replace(/_/g, " ").replace(/,/g, ", ");
  const consequenceLabel = v.consequence.replace(/_variant$/, "").replace(/_/g, " ");
  const sigLabel = v.clinical_significance.replace(/_/g, " ");

  return (
    <tr className="transition-colors even:bg-brand-border/10 hover:bg-brand-border/20">
      <Cell value={v.chromosome}  className="text-brand-muted" mono />
      <Cell value={v.position.toLocaleString()} className="text-brand-text" mono />
      <Cell value={v.ref}         className="text-brand-text" mono />
      <Cell value={v.alt}         className="text-brand-text" mono />
      <Cell value={v.genotype}    className="text-brand-muted" mono />
      <Cell value={v.depth}       className="text-right text-brand-muted" />
      <Cell value={v.quality != null ? v.quality.toFixed(0) : null} className="text-right text-brand-muted" />
      <Cell value={v.genotype_quality != null ? v.genotype_quality.toFixed(0) : null} className="text-right text-brand-muted" />
      <Cell value={v.filter}      className="text-brand-muted" />
      <Cell value={v.gene_symbol} className="text-brand-text" mono />
      <Cell value={sigLabel || null}       className={sigClass} />
      <Cell value={reviewLabel || null}    className="text-brand-muted" />
      <Cell value={consequenceLabel || null} className="text-brand-muted" />
      <Cell value={v.condition_name}       className="text-brand-muted" />
      <Cell value={v.hgvs_c}     className="text-brand-muted text-[11px]" mono />
      <Cell value={v.hgvs_p}     className="text-brand-muted text-[11px]" mono />
      <Cell value={v.rsid}        className="text-brand-muted" mono />
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
            title={`ClinVar variation ${v.clinvar_variation_id}`}
          >
            {v.clinvar_variation_id}
          </a>
        ) : "—"}
      </td>
      <Cell value={v.clinvar_last_evaluated || null} className="text-brand-muted" />
      <Cell value={v.allele_frequency > 0 ? v.allele_frequency.toExponential(2) : null} className="text-right text-brand-muted" />
    </tr>
  );
}
