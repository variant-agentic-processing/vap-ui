// ─── Workflow Service ────────────────────────────────────────────────────────

export type PipelineType = "vcf_ingest" | "clinvar_refresh";

export type PipelineStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "deleted";

export interface StageStatus {
  name: string;
  status: PipelineStatus;
  started_at: string | null;
  completed_at: string | null;
  duration_s: number | null;
  batch_job_id: string | null;
  record_count: number | null;
  error: string | null;
  runtime_minutes: number | null;
}

export interface Pipeline {
  id: string;
  type: PipelineType;
  status: PipelineStatus;
  individual_id: string | null;
  name: string;
  tags: string[];
  notes: string | null;
  config: Record<string, unknown>;
  stages: StageStatus[];
  error: string | null;
  workflow_execution_id: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  runtime_minutes: number | null;
}

export interface PipelineListResponse {
  pipelines: Pipeline[];
  total: number;
  cursor: string | null;
}

export interface PipelineCreate {
  type: PipelineType;
  individual_id?: string;
  name?: string;
  config?: Record<string, unknown>;
  tags?: string[];
  notes?: string;
  s3_vcf_uri?: string;
  s3_tbi_uri?: string;
}

export interface PipelineUpdate {
  name?: string;
  tags?: string[];
  notes?: string;
}

export interface SystemStatus {
  clickhouse: Record<string, unknown>;
  pipelines: {
    running: number;
    concurrency_limit: number;
    can_submit: boolean;
  };
  storage: Record<string, unknown>;
}

// ─── Agent Service ───────────────────────────────────────────────────────────

export interface AgentHealth {
  status: string;
  tools: number;
}

export interface ToolCallEvent {
  type: "tool_call";
  tool: string;
  args: Record<string, unknown>;
}

export interface ToolResultEvent {
  type: "tool_result";
  tool: string;
  chars: number;
  is_error: boolean;
}

export interface AnswerEvent {
  type: "answer";
  text: string;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export interface DoneEvent {
  type: "done";
}

export type AgentEvent =
  | ToolCallEvent
  | ToolResultEvent
  | AnswerEvent
  | ErrorEvent
  | DoneEvent;
