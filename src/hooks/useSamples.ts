import { useCallback, useEffect, useState } from "react";
import { listSamples, type ListSamplesParams, type SampleListResponse } from "@/lib/sample-client";

interface UseSamplesState {
  data: SampleListResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSamples(params: ListSamplesParams): UseSamplesState {
  const [data, setData] = useState<SampleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable string key to detect param changes without deep equality
  const paramsKey = JSON.stringify(params);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    listSamples(JSON.parse(paramsKey) as ListSamplesParams)
      .then(setData)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Failed to load samples");
      })
      .finally(() => setLoading(false));
  }, [paramsKey]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
