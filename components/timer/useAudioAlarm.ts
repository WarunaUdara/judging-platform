"use client";

import type { AlarmConfig, AlarmPattern } from "./timerTypes";

function createCtx(): AudioContext {
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    throw new Error("AudioContext is not supported in this browser");
  }

  return new Ctor();
}

function playBeepBeep(ctx: AudioContext, cfg: AlarmConfig) {
  [0, 0.3, 0.8, 1.1, 1.6, 1.9].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.frequency, ctx.currentTime + offset);
    gain.gain.setValueAtTime(cfg.volume, ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + 0.25);
  });
}

function playTripleBeep(ctx: AudioContext, cfg: AlarmConfig) {
  [0, 0.25, 0.5].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(cfg.frequency, ctx.currentTime + offset);
    gain.gain.setValueAtTime(cfg.volume, ctx.currentTime + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + offset);
    osc.stop(ctx.currentTime + offset + 0.2);
  });
}

function playContinuous(ctx: AudioContext, cfg: AlarmConfig) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = cfg.type;
  osc.frequency.setValueAtTime(cfg.frequency, ctx.currentTime);
  gain.gain.setValueAtTime(cfg.volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + cfg.duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + cfg.duration);
}

function playEscalating(ctx: AudioContext, cfg: AlarmConfig) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = cfg.type;
  osc.frequency.setValueAtTime(cfg.frequency, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(cfg.frequency * 2, ctx.currentTime + cfg.duration);
  gain.gain.setValueAtTime(cfg.volume, ctx.currentTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + cfg.duration);
}

function playSiren(ctx: AudioContext, cfg: AlarmConfig) {
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  lfo.frequency.value = 2;
  lfoGain.gain.value = cfg.frequency * 0.3;
  osc.type = cfg.type;
  osc.frequency.value = cfg.frequency;
  gain.gain.value = cfg.volume;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(ctx.destination);
  lfo.start();
  osc.start();
  lfo.stop(ctx.currentTime + cfg.duration);
  osc.stop(ctx.currentTime + cfg.duration);
}

export const ALARM_PRESETS: { label: string; config: AlarmConfig }[] = [
  { label: "Classic Alarm", config: { type: "square", frequency: 880, duration: 4, volume: 0.7, pattern: "beep-beep" } },
  { label: "Siren", config: { type: "sine", frequency: 660, duration: 6, volume: 0.7, pattern: "siren" } },
  { label: "Gentle Bell", config: { type: "sine", frequency: 523, duration: 3, volume: 0.5, pattern: "triple-beep" } },
  { label: "Escalating Buzz", config: { type: "sawtooth", frequency: 220, duration: 5, volume: 0.6, pattern: "escalating" } },
  { label: "Emergency", config: { type: "square", frequency: 1000, duration: 8, volume: 0.8, pattern: "beep-beep" } },
];

export function useAudioAlarm() {
  const play = (cfg: AlarmConfig) => {
    if (typeof window === "undefined") {
      return;
    }

    let ctx: AudioContext;
    try {
      ctx = createCtx();
    } catch {
      return;
    }

    const patternMap: Record<AlarmPattern, (c: AudioContext, config: AlarmConfig) => void> = {
      "beep-beep": playBeepBeep,
      "triple-beep": playTripleBeep,
      continuous: playContinuous,
      escalating: playEscalating,
      siren: playSiren,
    };

    (patternMap[cfg.pattern] ?? playContinuous)(ctx, cfg);

    setTimeout(() => {
      void ctx.close().catch(() => undefined);
    }, (cfg.duration + 1) * 1000);
  };

  return { play };
}
