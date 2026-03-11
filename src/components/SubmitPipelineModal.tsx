"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import type { PipelineCreate, PipelineType } from "@/types/api";

interface SubmitPipelineModalProps {
  onClose: () => void;
  onSubmit: (body: PipelineCreate) => Promise<void>;
  lockedType?: PipelineType;
}

export function SubmitPipelineModal({ onClose, onSubmit, lockedType }: SubmitPipelineModalProps) {
  const [type, setType] = useState<PipelineType>(lockedType ?? "vcf_ingest");
  const [individualId, setIndividualId] = useState("");
  const [forceNormalize, setForceNormalize] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = type === "clinvar_refresh" || individualId.trim() !== "";

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
              config: {
                ...(forceNormalize && { force_normalize: true }),
                ...(forceLoad && { force_load: true }),
              },
            }
          : {
              type: "clinvar_refresh",
              config: {},
            };
      await onSubmit(body);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  const title = lockedType === "vcf_ingest"
    ? "Submit VCF Ingest"
    : lockedType === "clinvar_refresh"
    ? "Submit ClinVar Refresh"
    : "Submit Pipeline";

  return (
    <Modal title={title} onClose={onClose}>
      {/* Type tabs — only shown when not locked to a specific type */}
      {!lockedType && (
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
      )}

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
            <div className="rounded-lg border border-brand-border bg-brand-navy/50 p-4 space-y-3">
              <p className="text-xs font-medium text-brand-muted">Overrides</p>
              <CheckboxOption
                checked={forceNormalize}
                onChange={setForceNormalize}
                label="Force normalize"
                hint="Re-run bcftools normalization even if output already exists in GCS"
              />
              <CheckboxOption
                checked={forceLoad}
                onChange={setForceLoad}
                label="Force load"
                hint="Re-load into ClickHouse even if a completed record already exists"
              />
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-brand-border bg-brand-navy/50 p-4">
            <p className="text-xs text-brand-muted">
              Downloads the latest ClinVar release from NCBI. If the VCF version matches the
              currently loaded version, the pipeline will stop early — no reload needed.
            </p>
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

function CheckboxOption({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-brand-border accent-brand-cyan"
      />
      <div>
        <span className="text-xs font-medium text-brand-text">{label}</span>
        <p className="text-xs text-brand-muted">{hint}</p>
      </div>
    </label>
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
