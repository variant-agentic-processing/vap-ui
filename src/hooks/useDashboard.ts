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

interface DashboardData {
  cohortSummary: CohortBucket[];
  consequences: CohortBucket[];
  topGenes: TopGene[];
  individuals: Individual[];
  loading: boolean;
  error: string | null;
}

export function useDashboard(genes: string[]): DashboardData {
  const [cohortSummary, setCohortSummary] = useState<CohortBucket[]>([]);
  const [consequences, setConsequences] = useState<CohortBucket[]>([]);
  const [topGenes, setTopGenes] = useState<TopGene[]>([]);
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const genesKey = genes.join(",");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const activeGenes = genesKey ? genesKey.split(",") : [];

    Promise.all([
      getCohortSummary(),
      getCohortConsequences(),
      getTopGenes(),
      getIndividuals(activeGenes.length > 0 ? activeGenes : undefined),
    ])
      .then(([summary, cons, genes, inds]) => {
        setCohortSummary(summary.results);
        setConsequences(cons.results);
        setTopGenes(genes.results);
        setIndividuals(inds.individuals);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load dashboard data");
      })
      .finally(() => setLoading(false));
  }, [genesKey]);

  return { cohortSummary, consequences, topGenes, individuals, loading, error };
}
