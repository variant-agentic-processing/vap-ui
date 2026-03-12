"use client";

import { useEffect, useState } from "react";
import {
  getCohortSummary,
  getCohortConsequences,
  getTopGenes,
  getIndividuals,
  type CohortBucket,
  type Individual,
  type TopGene,
} from "@/lib/cohort-client";
import { getDashboardStats } from "@/lib/workflow-client";

export interface SharedPathogenicGene {
  gene_symbol: string;
  individual_count: number;
  pathogenic_count: number;
}

interface DashboardData {
  cohortSummary: CohortBucket[];
  consequences: CohortBucket[];
  topGenes: TopGene[];
  individuals: Individual[];
  totalVariants: number | null;
  sharedPathogenicGenes: SharedPathogenicGene[];
  loading: boolean;
  error: string | null;
}

export function useDashboard(): DashboardData {
  const [cohortSummary, setCohortSummary] = useState<CohortBucket[]>([]);
  const [consequences, setConsequences] = useState<CohortBucket[]>([]);
  const [topGenes, setTopGenes] = useState<TopGene[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [totalVariants, setTotalVariants] = useState<number | null>(null);
  const [sharedPathogenicGenes, setSharedPathogenicGenes] = useState<SharedPathogenicGene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getDashboardStats()
      .then((stats) => {
        setCohortSummary(stats.cohort_summary);
        setConsequences(stats.consequences);
        setTopGenes(stats.top_genes);
        setIndividuals(stats.individuals);
        setTotalVariants(stats.total_variants ?? null);
        setSharedPathogenicGenes(stats.shared_pathogenic_genes ?? []);
      })
      .catch(() => {
        // Cache miss or stats-service unavailable — fall back to live queries
        return Promise.all([
          getCohortSummary(),
          getCohortConsequences(),
          getTopGenes(),
          getIndividuals(),
        ]).then(([summary, cons, genes, inds]) => {
          setCohortSummary(summary.results);
          setConsequences(cons.results);
          setTopGenes(genes.results);
          setIndividuals(inds.individuals);
          setTotalVariants(inds.individuals.reduce((s: number, i: Individual) => s + i.variant_count, 0));
        });
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, []);

  return { cohortSummary, consequences, topGenes, individuals, totalVariants, sharedPathogenicGenes, loading, error };
}
