"use client";

import { useEffect, useRef, useState } from "react";

export function useTimer(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (targetSeconds <= 0) {
      return;
    }

    setRunning(true);
    setFinished(false);
  };

  const pause = () => setRunning(false);

  const reset = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(targetSeconds);
  };

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          setRunning(false);
          setFinished(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  const showDays = targetSeconds >= 86400;

  return {
    remaining,
    running,
    finished,
    start,
    pause,
    reset,
    days,
    hours,
    minutes,
    seconds,
    showDays,
  };
}
