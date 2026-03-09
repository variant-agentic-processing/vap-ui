"use client";

import { useCallback, useEffect, useState } from "react";
import {
  cancelPipeline,
  createPipeline,
  listPipelines,
  type ListPipelinesParams,
} from "@/lib/workflow-client";
import type { Pipeline, PipelineCreate } from "@/types/api";

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
    setIsLoading(true);
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

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const submit = useCallback(async (body: PipelineCreate): Promise<Pipeline> => {
    const pipeline = await createPipeline(body);
    void fetch();
    return pipeline;
  }, [fetch]);

  const cancel = useCallback(async (id: string): Promise<void> => {
    await cancelPipeline(id);
    void fetch();
  }, [fetch]);

  return { pipelines, total, isLoading, error, refresh: fetch, submit, cancel };
}
