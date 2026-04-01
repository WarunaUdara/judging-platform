"use client";

import { useState } from "react";
import type { TimerConfig } from "./timerTypes";

const STORAGE_KEY = "event-timer-v1";

export const DEFAULT_CONFIG: TimerConfig = {
  eventTitle: "",
  subtitle: "",
  targetSeconds: 3600,
  clockStyle: {
    fontFamily: "monospace",
    fontSize: 96,
    color: "#ffffff",
    fontWeight: "bold",
  },
  titleStyle: {
    fontFamily: "sans-serif",
    fontSize: 48,
    color: "#ffffff",
    fontWeight: "bold",
  },
  subtitleStyle: {
    fontFamily: "sans-serif",
    fontSize: 28,
    color: "#dddddd",
    fontWeight: "normal",
  },
  alarmConfig: {
    type: "sine",
    frequency: 880,
    duration: 5,
    volume: 0.7,
    pattern: "beep-beep",
  },
  backgroundType: "default",
  backgroundMediaKey: null,
};

export function useTimerStorage() {
  const [config, setConfig] = useState<TimerConfig>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_CONFIG;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return DEFAULT_CONFIG;
      }

      const parsed = JSON.parse(raw) as Partial<TimerConfig>;
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        clockStyle: { ...DEFAULT_CONFIG.clockStyle, ...parsed.clockStyle },
        titleStyle: { ...DEFAULT_CONFIG.titleStyle, ...parsed.titleStyle },
        subtitleStyle: { ...DEFAULT_CONFIG.subtitleStyle, ...parsed.subtitleStyle },
        alarmConfig: { ...DEFAULT_CONFIG.alarmConfig, ...parsed.alarmConfig },
      };
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const loaded = true;

  const saveConfig = (next: TimerConfig) => {
    setConfig(next);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore quota errors.
      }
    }
  };

  return { config, saveConfig, loaded };
}
