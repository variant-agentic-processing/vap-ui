export default function PipelinesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-brand-text">Pipelines</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Submit and monitor VCF ingest and ClinVar refresh pipelines.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-brand-border p-16 text-center">
        <div className="mx-auto mb-3 h-8 w-8 rounded-lg bg-brand-surface ring-1 ring-brand-border flex items-center justify-center">
          <span className="text-brand-cyan text-sm">⚡</span>
        </div>
        <p className="text-sm font-medium text-brand-muted">Phase 2 — coming soon</p>
        <p className="mt-1 text-xs text-brand-border">
          Pipeline list, submit form, live status
        </p>
      </div>
    </div>
  );
}
