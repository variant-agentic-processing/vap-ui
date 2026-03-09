import type { PipelineStatus } from "@/types/api";

const STYLES: Record<PipelineStatus, string> = {
  pending:   "bg-brand-muted/20 text-brand-muted",
  running:   "bg-brand-cyan/15 text-brand-cyan ring-1 ring-brand-cyan/30",
  completed: "bg-green-900/30 text-green-400",
  failed:    "bg-red-900/30 text-red-400",
  cancelled: "bg-brand-gold/20 text-brand-gold",
  deleted:   "bg-gray-800 text-gray-500",
};

const DOT: Record<PipelineStatus, string> = {
  pending:   "bg-brand-muted",
  running:   "bg-brand-cyan animate-pulse",
  completed: "bg-green-400",
  failed:    "bg-red-400",
  cancelled: "bg-brand-gold",
  deleted:   "bg-gray-500",
};

interface StatusBadgeProps {
  status: PipelineStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const text = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${text} ${STYLES[status]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} />
      {status}
    </span>
  );
}
