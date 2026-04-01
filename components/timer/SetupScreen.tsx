"use client";

import { useEffect, useMemo, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StoredMediaMeta, TextStyle, TimerConfig } from "./timerTypes";
import { ALARM_PRESETS, useAudioAlarm } from "./useAudioAlarm";
import ClockPreview from "./ClockPreview";

interface SetupScreenProps {
  config: TimerConfig;
  mediaURL: string | null;
  mediaMeta: StoredMediaMeta | null;
  onSaveMedia: (file: File) => Promise<void>;
  onClearMedia: () => Promise<void>;
  onSave: (next: TimerConfig) => void;
  onStart: () => void;
}

const GOOGLE_FONT_LINKS: Record<string, string> = {
  "Roboto Mono": "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap",
  Oswald: "https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap",
  Anton: "https://fonts.googleapis.com/css2?family=Anton&display=swap",
};

const FONT_OPTIONS = ["monospace", "serif", "sans-serif", "Roboto Mono", "Oswald", "Anton"];

function formatBytes(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function SetupScreen({
  config,
  mediaURL,
  mediaMeta,
  onSaveMedia,
  onClearMedia,
  onSave,
  onStart,
}: SetupScreenProps) {
  const [draft, setDraft] = useState<TimerConfig>(config);
  const [titleError, setTitleError] = useState(false);
  const [styleTab, setStyleTab] = useState<"clock" | "title" | "subtitle">("clock");
  const alarm = useAudioAlarm();

  useEffect(() => {
    setDraft(config);
  }, [config]);

  useEffect(() => {
    const selectedFonts = [draft.clockStyle.fontFamily, draft.titleStyle.fontFamily, draft.subtitleStyle.fontFamily];
    selectedFonts.forEach((font) => {
      const href = GOOGLE_FONT_LINKS[font];
      if (!href || typeof document === "undefined") {
        return;
      }

      const existing = document.querySelector<HTMLLinkElement>(`link[data-timer-font="${font}"]`);
      if (existing) {
        return;
      }

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.timerFont = font;
      document.head.appendChild(link);
    });
  }, [draft.clockStyle.fontFamily, draft.subtitleStyle.fontFamily, draft.titleStyle.fontFamily]);

  const activeStyle = useMemo<TextStyle>(() => {
    if (styleTab === "clock") {
      return draft.clockStyle;
    }
    if (styleTab === "title") {
      return draft.titleStyle;
    }
    return draft.subtitleStyle;
  }, [draft.clockStyle, draft.subtitleStyle, draft.titleStyle, styleTab]);

  const updateStyle = (nextStyle: TextStyle) => {
    setDraft((prev) => {
      const next: TimerConfig = {
        ...prev,
        ...(styleTab === "clock" ? { clockStyle: nextStyle } : {}),
        ...(styleTab === "title" ? { titleStyle: nextStyle } : {}),
        ...(styleTab === "subtitle" ? { subtitleStyle: nextStyle } : {}),
      };
      onSave(next);
      return next;
    });
  };

  const updateDuration = (key: "days" | "hours" | "minutes" | "seconds", value: number) => {
    const current = {
      days: Math.floor(draft.targetSeconds / 86400),
      hours: Math.floor((draft.targetSeconds % 86400) / 3600),
      minutes: Math.floor((draft.targetSeconds % 3600) / 60),
      seconds: draft.targetSeconds % 60,
    };

    const clamped = Math.max(0, Number.isFinite(value) ? Math.floor(value) : 0);
    const nextDuration = {
      ...current,
      [key]: key === "hours" ? Math.min(clamped, 23) : key === "minutes" || key === "seconds" ? Math.min(clamped, 59) : clamped,
    };

    const total =
      nextDuration.days * 86400 +
      nextDuration.hours * 3600 +
      nextDuration.minutes * 60 +
      nextDuration.seconds;

    setDraft((prev) => {
      const next = { ...prev, targetSeconds: total };
      onSave(next);
      return next;
    });
  };

  const applyConfig = (next: TimerConfig) => {
    setDraft(next);
    onSave(next);
  };

  const onPickBackground = async (file: File | null) => {
    if (!file) {
      return;
    }

    await onSaveMedia(file);
    applyConfig({ ...draft, backgroundMediaKey: "background" });
  };

  const canStart = draft.eventTitle.trim().length > 0 && draft.targetSeconds >= 1;

  const startTimer = async () => {
    if (!canStart) {
      setTitleError(draft.eventTitle.trim().length === 0);
      return;
    }

    try {
      const target = document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        await target.webkitRequestFullscreen();
      }
    } catch {
      // Ignore unsupported fullscreen and continue.
    }

    onStart();
  };

  const duration = {
    days: Math.floor(draft.targetSeconds / 86400),
    hours: Math.floor((draft.targetSeconds % 86400) / 3600),
    minutes: Math.floor((draft.targetSeconds % 3600) / 60),
    seconds: draft.targetSeconds % 60,
  };

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#a1a1aa]">Title *</label>
                <Input
                  value={draft.eventTitle}
                  onChange={(event) => {
                    const next = { ...draft, eventTitle: event.target.value };
                    setTitleError(false);
                    applyConfig(next);
                  }}
                  placeholder="e.g. Demo Deadline"
                />
                {titleError && <p className="mt-2 text-sm text-red-400">Title is required before starting.</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm text-[#a1a1aa]">Subtitle</label>
                <Input
                  value={draft.subtitle}
                  onChange={(event) => applyConfig({ ...draft, subtitle: event.target.value })}
                  placeholder="Optional subtitle"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timer Duration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([
                ["days", duration.days],
                ["hours", duration.hours],
                ["minutes", duration.minutes],
                ["seconds", duration.seconds],
              ] as const).map(([key, value]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm capitalize text-[#a1a1aa]">{key}</label>
                  <Input
                    type="number"
                    min={0}
                    max={key === "days" ? 999 : 59}
                    value={value}
                    onChange={(event) => updateDuration(key, Number(event.target.value))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ClockPreview config={draft} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Styling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {([
                  ["clock", "Clock"],
                  ["title", "Title"],
                  ["subtitle", "Subtitle"],
                ] as const).map(([key, label]) => (
                  <Button
                    key={key}
                    variant={styleTab === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStyleTab(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-[#a1a1aa]">Font family</label>
                  <select
                    className="h-10 w-full border border-[#333333] bg-[#0a0a0a] px-3 text-sm"
                    value={activeStyle.fontFamily}
                    onChange={(event) => updateStyle({ ...activeStyle, fontFamily: event.target.value })}
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-[#a1a1aa]">Font size ({activeStyle.fontSize}px)</label>
                  <input
                    className="h-10 w-full"
                    type="range"
                    min={24}
                    max={200}
                    value={activeStyle.fontSize}
                    onChange={(event) => updateStyle({ ...activeStyle, fontSize: Number(event.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 border border-[#333333] bg-[#0a0a0a] px-3 py-2 text-sm">
                  <span>Color</span>
                  <input
                    type="color"
                    value={activeStyle.color}
                    onChange={(event) => updateStyle({ ...activeStyle, color: event.target.value })}
                  />
                </label>

                <Button
                  variant={activeStyle.fontWeight === "bold" ? "default" : "outline"}
                  onClick={() =>
                    updateStyle({
                      ...activeStyle,
                      fontWeight: activeStyle.fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                >
                  {activeStyle.fontWeight === "bold" ? "Bold On" : "Bold Off"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Background</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {([
                  ["default", "Default"],
                  ["image", "Image"],
                  ["video", "Video"],
                ] as const).map(([type, label]) => (
                  <Button
                    key={type}
                    variant={draft.backgroundType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyConfig({ ...draft, backgroundType: type })}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              {draft.backgroundType !== "default" && (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept={draft.backgroundType === "image" ? "image/*" : "video/mp4,video/webm"}
                    onChange={(event) => void onPickBackground(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-[#a1a1aa] file:mr-3 file:border file:border-[#333333] file:bg-[#101010] file:px-3 file:py-1.5 file:text-white"
                  />

                  {mediaMeta && (
                    <div className="text-sm text-[#a1a1aa]">
                      <p>{mediaMeta.name}</p>
                      <p>{formatBytes(mediaMeta.size)}</p>
                    </div>
                  )}

                  {mediaURL && (
                    <Button variant="outline" size="sm" onClick={() => void onClearMedia()}>
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alarm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-[#a1a1aa]">Preset</label>
                <select
                  className="h-10 w-full border border-[#333333] bg-[#0a0a0a] px-3 text-sm"
                  value={ALARM_PRESETS.findIndex(
                    (preset) =>
                      preset.config.pattern === draft.alarmConfig.pattern &&
                      preset.config.frequency === draft.alarmConfig.frequency,
                  )}
                  onChange={(event) => {
                    const preset = ALARM_PRESETS[Number(event.target.value)] ?? ALARM_PRESETS[0];
                    applyConfig({ ...draft, alarmConfig: preset.config });
                  }}
                >
                  {ALARM_PRESETS.map((preset, index) => (
                    <option key={preset.label} value={index}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 flex items-center gap-2 text-sm text-[#a1a1aa]">
                  <Volume2 className="h-4 w-4" />
                  Volume ({Math.round(draft.alarmConfig.volume * 100)}%)
                </label>
                <input
                  className="h-10 w-full"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={draft.alarmConfig.volume}
                  onChange={(event) =>
                    applyConfig({
                      ...draft,
                      alarmConfig: {
                        ...draft.alarmConfig,
                        volume: Number(event.target.value),
                      },
                    })
                  }
                />
              </div>

              <Button
                variant="secondary"
                onClick={() => alarm.play(draft.alarmConfig)}
                className="w-full"
              >
                <Play className="h-4 w-4" /> Preview Alarm
              </Button>
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" disabled={!canStart} onClick={() => void startTimer()}>
            Start Timer
          </Button>
        </div>
      </div>
    </main>
  );
}
