"use client";

import { useEffect, useState } from "react";
import { getIndividualVariants, type IndividualVariants } from "@/lib/cohort-client";

interface IndividualVariantsState {
  data: IndividualVariants | null;
  loading: boolean;
  error: string | null;
}

export function useIndividualVariants(id: string): IndividualVariantsState {
  const [data, setData] = useState<IndividualVariants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setData(null);

    getIndividualVariants(id)
      .then(setData)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load variants");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}
