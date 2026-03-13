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

export interface Variant {
  chromosome: string;
  position: number;
  ref: string;
  alt: string;
  genotype: string;
  depth: number | null;
  quality: number | null;
  filter: string;
  genotype_quality: number | null;
  allele_depth: string | null;
  gene_symbol: string;
  clinical_significance: string;
  condition_name: string;
  consequence: string;
  hgvs_c: string;
  hgvs_p: string;
  rsid: string;
  review_status: string;
  allele_frequency: number;
  clinvar_variation_id: number | null;
  clinvar_last_evaluated: string | null;
}

export interface IndividualVariants {
  individual_id: string;
  total_count: number;
  returned_count: number;
  truncated: boolean;
  variants: Variant[];
}

export function getIndividualVariants(id: string): Promise<IndividualVariants> {
  return request(`/api/individuals/${encodeURIComponent(id)}/variants`);
}

export interface GeneVariant extends Variant {
  individual_id: string;
}

export interface GeneVariants {
  gene_symbol: string;
  total_count: number;
  pathogenic_count: number;
  distinct_individuals: number;
  truncated: boolean;
  variants: GeneVariant[];
}

export function getGeneVariants(symbol: string): Promise<GeneVariants> {
  return request(`/api/genes/${encodeURIComponent(symbol)}/variants`);
}
