const BASE_URL = "/api/mcp";

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export interface CohortBucket {
  value: string;
  count: number;
}

export interface TopGene {
  gene_symbol: string;
  variant_count: number;
  pathogenic_count: number;
}

export interface Individual {
  individual_id: string;
  variant_count: number;
  pathogenic_count: number;
}

export interface IndividualSummary {
  individual_id: string;
  total_variants: number;
  pathogenic_count: number;
  top_genes: TopGene[];
  by_chromosome: { chromosome: string; variant_count: number }[];
}

export function getCohortSummary(): Promise<{ results: CohortBucket[] }> {
  return request("/api/cohort/summary");
}

export function getCohortConsequences(): Promise<{ results: CohortBucket[] }> {
  return request("/api/cohort/consequences");
}

export function getTopGenes(): Promise<{ results: TopGene[] }> {
  return request("/api/cohort/top-genes");
}

export function getIndividuals(genes?: string[]): Promise<{ individuals: Individual[]; gene_filter: string[] }> {
  const qs = genes && genes.length > 0 ? `?genes=${genes.join(",")}` : "";
  return request(`/api/individuals${qs}`);
}

export function getIndividualSummary(id: string): Promise<IndividualSummary> {
  return request(`/api/individuals/${encodeURIComponent(id)}/summary`);
}
