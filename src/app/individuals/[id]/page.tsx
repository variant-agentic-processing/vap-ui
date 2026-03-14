"use client";

import { use } from "react";
import Link from "next/link";
import { useIndividualVariants } from "@/hooks/useIndividualVariants";
import { useSample } from "@/hooks/useSample";
import { useClinvarVersion } from "@/hooks/useClinvarVersion";
import { AgentPanel } from "@/components/AgentPanel";
import { ZygosityBadge } from "@/components/ZygosityBadge";
import type { Sample } from "@/lib/sample-client";
import type { Variant } from "@/lib/cohort-client";

function buildContext(individualId: string, sample: Sample | null): string {
  const parts = [`The user is viewing individual ${individualId}.`];
  if (sample) {
    const pop = [sample.population_name, sample.population_code ? `(${sample.population_code})` : null]
      .filter(Boolean).join(" ");
    const superpop = [sample.superpopulation_name, sample.superpopulation_code ? `(${sample.superpopulation_code})` : null]
      .filter(Boolean).join(" ");
    const details = [sample.sex, pop, superpop].filter(Boolean).join(", ");
    if (details) parts.push(`Individual details: ${details}.`);
  }
  parts.push("Focus answers on this individual unless the user explicitly asks about others.");
  return parts.join(" ");
}

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
  { label: "Ref",          width: 52  },
  { label: "Alt",          width: 52  },
  { label: "Genotype",     width: 96  },
  { label: "Depth",        width: 58  },
  { label: "Quality",      width: 64  },
  { label: "GQ",           width: 52  },
  { label: "Filter",       width: 64  },
  { label: "Gene",         width: 80  },
  { label: "Significance", width: 160 },
  { label: "ClinVar ID",   width: 90  },
  { label: "rsID",         width: 100 },
  { label: "Review Status",width: 160 },
  { label: "Condition",    width: 200 },
  { label: "Consequence",  width: 160 },
  { label: "Position",     width: 90  },
  { label: "HGVS c.",      width: 160 },
  { label: "HGVS p.",      width: 140 },
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
  const { sample } = useSample(id);
  const { data: clinvar } = useClinvarVersion();

  return (
    <div className="space-y-6">
      <AgentPanel
        context={buildContext(id, sample ?? null)}
        title={sample?.display_name ?? id}
        subtitle="Ask Varis about this individual"
      />
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/samples" className="text-xs text-brand-muted hover:text-brand-text transition-colors">
          ← Samples
        </Link>
        {clinvar?.loaded_version && (
          <span className="rounded-full border border-brand-border bg-brand-surface px-3 py-1 text-xs text-brand-muted">
            ClinVar <span className="text-brand-text font-mono">{clinvar.loaded_version}</span>
          </span>
        )}
      </div>

      {/* Sample metadata card */}
      {sample && (
        <div className="rounded-xl border border-brand-border bg-brand-surface px-5 py-4">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-lg font-semibold text-brand-text">{sample.display_name}</span>
            <span className="font-mono text-sm text-brand-muted">{sample.individual_id}</span>
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            {[
              sample.sex ? sample.sex.charAt(0).toUpperCase() + sample.sex.slice(1) : null,
              sample.population_name && sample.population_code
                ? `${sample.population_name} (${sample.population_code})`
                : sample.population_name ?? sample.population_code,
              sample.superpopulation_name && sample.superpopulation_code
                ? `${sample.superpopulation_name} (${sample.superpopulation_code})`
                : sample.superpopulation_name ?? sample.superpopulation_code,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}

      {/* Truncation banner */}
      {data?.truncated && (
        <div className="flex items-center gap-3 rounded-xl border border-brand-gold/30 bg-brand-gold/10 px-4 py-3">
          <span className="text-brand-gold">⚠</span>
          <p className="text-sm text-brand-gold">
            Showing {data.returned_count.toLocaleString()} of{" "}
            {data.total_count.toLocaleString()} total variants — ranked by clinical significance, most pathogenic first.
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
        <div
          className="overflow-auto rounded-xl border border-brand-border"
          style={{ maxHeight: "560px" }}
        >
          <table
            className="border-collapse text-xs"
            style={{ tableLayout: "fixed", width: `${COLUMNS.reduce((s, c) => s + c.width, 0)}px` }}
          >
            <colgroup>
              {COLUMNS.map((col) => (
                <col key={col.label} style={{ width: col.width }} />
              ))}
            </colgroup>
            <thead className="sticky top-0 z-10 bg-brand-navy">
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
      <Cell value={v.ref}         className="text-brand-text" mono />
      <Cell value={v.alt}         className="text-brand-text" mono />
      <td title={v.genotype || undefined} className="px-3 py-1.5 font-mono overflow-hidden" style={{ whiteSpace: "nowrap" }}>
        <span className="text-brand-muted">{v.genotype || "—"}</span>
        <ZygosityBadge genotype={v.genotype} />
      </td>
      <Cell value={v.depth}       className="text-right text-brand-muted" />
      <Cell value={v.quality != null ? v.quality.toFixed(0) : null} className="text-right text-brand-muted" />
      <Cell value={v.genotype_quality != null ? v.genotype_quality.toFixed(0) : null} className="text-right text-brand-muted" />
      <Cell value={v.filter}      className="text-brand-muted" />
      <Cell value={v.gene_symbol} className="text-brand-text" mono />
      <Cell value={sigLabel || null} className={sigClass} />
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
            title={v.rsid}
          >
            {v.rsid}
          </a>
        ) : "—"}
      </td>
      <Cell value={reviewLabel || null}      className="text-brand-muted" />
      <Cell value={v.condition_name}         className="text-brand-muted" />
      <Cell value={consequenceLabel || null} className="text-brand-muted" />
      <Cell value={v.position.toLocaleString()} className="text-brand-text" mono />
      <Cell value={v.hgvs_c}     className="text-brand-muted text-[11px]" mono />
      <Cell value={v.hgvs_p}     className="text-brand-muted text-[11px]" mono />
      <Cell value={v.clinvar_last_evaluated || null} className="text-brand-muted" />
      <Cell value={v.allele_frequency > 0 ? v.allele_frequency.toExponential(2) : null} className="text-right text-brand-muted" />
    </tr>
  );
}
