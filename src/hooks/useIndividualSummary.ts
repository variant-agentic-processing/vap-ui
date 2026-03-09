"use client";

import { useEffect, useState } from "react";
import { getIndividualSummary, type IndividualSummary } from "@/lib/cohort-client";

interface IndividualSummaryState {
  summary: IndividualSummary | null;
  loading: boolean;
  error: string | null;
}

export function useIndividualSummary(id: string): IndividualSummaryState {
  const [summary, setSummary] = useState<IndividualSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSummary(null);

    getIndividualSummary(id)
      .then(setSummary)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load individual summary");
      })
      .finally(() => setLoading(false));
  }, [id]);

  return { summary, loading, error };
}
