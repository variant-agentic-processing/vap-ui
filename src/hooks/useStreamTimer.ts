"use client";

import { useEffect, useRef, useState } from "react";

export type StreamStatus = "idle" | "thinking" | "working" | "slow" | "stalled";

interface StreamTimerState {
  elapsed: number;       // seconds since stream started
  lastActivity: number;  // seconds since last event (step or answer chunk)
  status: StreamStatus;
}

export function useStreamTimer(
  isStreaming: boolean,
  activityKey: number,   // increment this whenever a step/answer arrives
): StreamTimerState {
  const [elapsed, setElapsed]           = useState(0);
  const [lastActivity, setLastActivity] = useState(0);
  const startedAt    = useRef<number | null>(null);
  const lastEventAt  = useRef<number | null>(null);

  // Reset when streaming starts
  useEffect(() => {
    if (isStreaming) {
      startedAt.current   = Date.now();
      lastEventAt.current = Date.now();
      setElapsed(0);
      setLastActivity(0);
    } else {
      startedAt.current   = null;
      lastEventAt.current = null;
      setElapsed(0);
      setLastActivity(0);
    }
  }, [isStreaming]);

  // Update lastEventAt whenever activity arrives
  useEffect(() => {
    if (isStreaming && activityKey > 0) {
      lastEventAt.current = Date.now();
    }
  }, [activityKey, isStreaming]);

  // Tick every second while streaming
  useEffect(() => {
    if (!isStreaming) return;
    const id = setInterval(() => {
      const now = Date.now();
      setElapsed(Math.floor((now - (startedAt.current ?? now)) / 1000));
      setLastActivity(Math.floor((now - (lastEventAt.current ?? now)) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isStreaming]);

  let status: StreamStatus = "idle";
  if (isStreaming) {
    if (lastActivity >= 120)    status = "stalled";
    else if (lastActivity >= 45) status = "slow";
    else if (elapsed >= 15)     status = "working";
    else                        status = "thinking";
  }

  return { elapsed, lastActivity, status };
}
