import { useEffect, useState } from "react";
import { getSample, type Sample } from "@/lib/sample-client";

interface UseSampleState {
  sample: Sample | null;
  loading: boolean;
}

export function useSample(individualId: string): UseSampleState {
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSample(null);
    getSample(individualId)
      .then(setSample)
      .catch(() => {
        // Gracefully degrade — individual page still works without sample metadata
      })
      .finally(() => setLoading(false));
  }, [individualId]);

  return { sample, loading };
}
