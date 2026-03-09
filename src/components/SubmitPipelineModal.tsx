"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import type { PipelineCreate, PipelineType } from "@/types/api";

interface SubmitPipelineModalProps {
  onClose: () => void;
  onSubmit: (body: PipelineCreate) => Promise<void>;
}

export function SubmitPipelineModal({ onClose, onSubmit }: SubmitPipelineModalProps) {
  const [type, setType] = useState<PipelineType>("vcf_ingest");
  const [individualId, setIndividualId] = useState("");
  const [s3VcfUri, setS3VcfUri] = useState("");
  const [s3TbiUri, setS3TbiUri] = useState("");
  const [forceDownload, setForceDownload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    type === "clinvar_refresh" ||
    (individualId.trim() !== "" && s3VcfUri.trim() !== "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const body: PipelineCreate =
        type === "vcf_ingest"
          ? {
              type: "vcf_ingest",
              individual_id: individualId.trim(),
              s3_vcf_uri: s3VcfUri.trim(),
              s3_tbi_uri: s3TbiUri.trim() || undefined,
            }
          : {
              type: "clinvar_refresh",
              config: forceDownload ? { force_download: true } : {},
            };
      await onSubmit(body);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal title="Submit Pipeline" onClose={onClose}>
      {/* Type tabs */}
      <div className="mb-5 flex rounded-lg bg-brand-navy p-1">
        {(["vcf_ingest", "clinvar_refresh"] as PipelineType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={[
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              type === t
                ? "bg-brand-border text-brand-cyan shadow-cyan-sm"
                : "text-brand-muted hover:text-brand-text",
            ].join(" ")}
          >
            {t === "vcf_ingest" ? "VCF Ingest" : "ClinVar Refresh"}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        {type === "vcf_ingest" ? (
          <>
            <Field label="Individual ID" required>
              <input
                type="text"
                value={individualId}
                onChange={(e) => setIndividualId(e.target.value)}
                placeholder="HG002"
                className={inputClass}
                required
              />
            </Field>
            <Field label="S3 VCF URI" required>
              <input
                type="text"
                value={s3VcfUri}
                onChange={(e) => setS3VcfUri(e.target.value)}
                placeholder="s3://bucket/HG002.vcf.gz"
                className={inputClass}
                required
              />
            </Field>
            <Field label="S3 TBI URI" hint="optional">
              <input
                type="text"
                value={s3TbiUri}
                onChange={(e) => setS3TbiUri(e.target.value)}
                placeholder="s3://bucket/HG002.vcf.gz.tbi"
                className={inputClass}
              />
            </Field>
          </>
        ) : (
          <div className="rounded-lg border border-brand-border bg-brand-navy/50 p-4 text-sm text-brand-muted">
            <p>Downloads the latest ClinVar release from NCBI and reloads the annotations table.</p>
            <label className="mt-4 flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={forceDownload}
                onChange={(e) => setForceDownload(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-brand-border accent-brand-cyan"
              />
              <span className="text-brand-text">Force download (bypass cache)</span>
            </label>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-900/20 px-3 py-2 text-xs text-red-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className={secondaryBtn}>
            Cancel
          </button>
          <button type="submit" disabled={!isValid || isSubmitting} className={primaryBtn}>
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-text">
        {label}
        {required && <span className="text-brand-cyan">*</span>}
        {hint && <span className="font-normal text-brand-muted">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-brand-border bg-brand-navy px-3 py-2 text-sm text-brand-text placeholder-brand-muted/50 transition-colors focus:border-brand-cyan/50 focus:bg-brand-navy outline-none";

const primaryBtn =
  "rounded-lg bg-brand-cyan px-4 py-1.5 text-xs font-semibold text-brand-navy transition-opacity hover:opacity-90 disabled:opacity-40";

const secondaryBtn =
  "rounded-lg border border-brand-border px-4 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:text-brand-text";
