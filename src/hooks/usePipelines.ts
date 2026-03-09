"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelPipeline,
  createPipeline,
  listPipelines,
  type ListPipelinesParams,
} from "@/lib/workflow-client";
import type { Pipeline, PipelineCreate } from "@/types/api";

const POLL_INTERVAL = 5_000;
const ACTIVE_STATUSES = new Set(["pending", "running"]);

interface UsePipelinesState {
  pipelines: Pipeline[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  submit: (body: PipelineCreate) => Promise<Pipeline>;
  cancel: (id: string) => Promise<void>;
}

export function usePipelines(params?: ListPipelinesParams): UsePipelinesState {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setError(null);
    try {
      const res = await listPipelines(params);
      setPipelines(res.pipelines);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pipelines");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    void fetch();
  }, [fetch]);

  // Poll while any pipeline is active
  useEffect(() => {
    const hasActive = pipelines.some((p) => ACTIVE_STATUSES.has(p.status));
    if (!hasActive) return;
    const id = setInterval(() => void fetch(), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [pipelines, fetch]);

  const submit = useCallback(
    async (body: PipelineCreate): Promise<Pipeline> => {
      const pipeline = await createPipeline(body);
      void fetch();
      return pipeline;
    },
    [fetch],
  );

  const cancel = useCallback(
    async (id: string): Promise<void> => {
      await cancelPipeline(id);
      void fetch();
    },
    [fetch],
  );

  return { pipelines, total, isLoading, error, refresh: fetch, submit, cancel };
}
