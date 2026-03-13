"use client";

import { useEffect, useState } from "react";
import { getGeneVariants, type GeneVariants } from "@/lib/cohort-client";

export function useGeneVariants(symbol: string) {
  const [data, setData] = useState<GeneVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getGeneVariants(symbol)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load gene data"))
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, loading, error };
}
