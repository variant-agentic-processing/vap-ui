"use client";

import { useEffect, useState } from "react";
import { getClinvarVersion } from "@/lib/workflow-client";
import type { ClinvarVersion } from "@/types/api";

export function useClinvarVersion(): { data: ClinvarVersion | null; loading: boolean } {
  const [data, setData] = useState<ClinvarVersion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClinvarVersion()
      .then(setData)
      .catch(() => setData({ loaded_version: null, completed_at: null, last_run_at: null }))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}
