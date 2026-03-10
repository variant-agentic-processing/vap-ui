const BASE_URL = "/api/samples";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export interface Sample {
  individual_id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  sex: string | null;
  biosample_id: string | null;
  population_code: string | null;
  population_name: string | null;
  superpopulation_code: string | null;
  superpopulation_name: string | null;
  ingested: boolean;
  ingested_at: string | null;
  pipeline_run_id: string | null;
}

export interface SampleListResponse {
  samples: Sample[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface ListSamplesParams {
  q?: string;
  population?: string;
  superpopulation?: string;
  sex?: string;
  ingested?: boolean;
  page?: number;
  page_size?: number;
}

export function listSamples(params?: ListSamplesParams): Promise<SampleListResponse> {
  const qs = new URLSearchParams();
  if (params?.q) qs.set("q", params.q);
  if (params?.population) qs.set("population", params.population);
  if (params?.superpopulation) qs.set("superpopulation", params.superpopulation);
  if (params?.sex) qs.set("sex", params.sex);
  if (params?.ingested !== undefined) qs.set("ingested", String(params.ingested));
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const search = qs.toString();
  return request<SampleListResponse>(search ? `?${search}` : "");
}

export function getSample(individualId: string): Promise<Sample> {
  return request<Sample>(`/${encodeURIComponent(individualId)}`);
}
