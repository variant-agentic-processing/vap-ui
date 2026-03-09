"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelPipeline,
  createPipeline,
  getPipeline,
} from "@/lib/workflow-client";
import type { Pipeline } from "@/types/api";

const POLL_INTERVAL = 3_000;
const ACTIVE_STATUSES = new Set(["pending", "running"]);

interface UsePipelineState {
  pipeline: Pipeline | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  cancel: () => Promise<void>;
  rerun: () => Promise<Pipeline | null>;
}

export function usePipeline(id: string): UsePipelineState {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setError(null);
    try {
      const p = await getPipeline(id);
      setPipeline(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pipeline");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    void fetch();
  }, [fetch]);

  // Poll while active
  useEffect(() => {
    if (!pipeline || !ACTIVE_STATUSES.has(pipeline.status)) return;
    const interval = setInterval(() => void fetch(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [pipeline?.status, fetch]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancel = useCallback(async () => {
    await cancelPipeline(id);
    void fetch();
  }, [id, fetch]);

  const rerun = useCallback(async (): Promise<Pipeline | null> => {
    if (!pipeline) return null;
    const body =
      pipeline.type === "vcf_ingest"
        ? {
            type: "vcf_ingest" as const,
            individual_id: pipeline.individual_id ?? undefined,
            s3_vcf_uri: (pipeline.config["s3_vcf_uri"] as string) ?? "",
            s3_tbi_uri: (pipeline.config["s3_tbi_uri"] as string) ?? undefined,
          }
        : { type: "clinvar_refresh" as const };
    return createPipeline(body);
  }, [pipeline]);

  return { pipeline, isLoading, error, refresh: fetch, cancel, rerun };
}
