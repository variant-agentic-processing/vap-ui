import type {
  Pipeline,
  PipelineCreate,
  PipelineListResponse,
  PipelineStatus,
  PipelineType,
  PipelineUpdate,
  SystemStatus,
} from "@/types/api";

const BASE_URL =
  process.env.NEXT_PUBLIC_WORKFLOW_SERVICE_URL ?? "http://localhost:8080";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export interface ListPipelinesParams {
  type?: PipelineType;
  status?: PipelineStatus;
  limit?: number;
  cursor?: string;
}

export function listPipelines(
  params?: ListPipelinesParams,
): Promise<PipelineListResponse> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.status) qs.set("status", params.status);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.cursor) qs.set("cursor", params.cursor);
  const query = qs.toString();
  return request<PipelineListResponse>(`/pipelines${query ? `?${query}` : ""}`);
}

export function getPipeline(id: string): Promise<Pipeline> {
  return request<Pipeline>(`/pipelines/${id}`);
}

export function createPipeline(body: PipelineCreate): Promise<Pipeline> {
  return request<Pipeline>("/pipelines", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updatePipeline(id: string, body: PipelineUpdate): Promise<Pipeline> {
  return request<Pipeline>(`/pipelines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function cancelPipeline(id: string): Promise<Pipeline> {
  return request<Pipeline>(`/pipelines/${id}/cancel`, { method: "POST" });
}

export function deletePipeline(id: string): Promise<void> {
  return request<void>(`/pipelines/${id}`, { method: "DELETE" });
}

export function getSystemStatus(): Promise<SystemStatus> {
  return request<SystemStatus>("/system/status");
}
