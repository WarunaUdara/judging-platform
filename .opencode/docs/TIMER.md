# Event Timer Feature — Integration Prompt for Existing Next.js App

## Purpose

Add a self-contained, browser-cached, fullscreen event countdown timer as a route group inside
an existing Next.js (App Router) application. The timer is designed for live events: it shows a
title, optional subtitle, a flip-clock countdown, a fully customizable background (image or video),
and plays a synthesized alarm via the Web Audio API when time runs out.

---

## Step-by-Step Execution Plan

> **IMPORTANT — Every step that says "investigate" means: read the actual files in this repo
> before writing any code. Do not assume folder names, config shapes, import aliases, styling
> systems, or installed packages. Confirm them first.**

---

### Step 1 — Investigate: Project Structure

Run or read the following before touching anything:

```bash
# 1. Top-level layout
ls -1

# 2. App directory tree (2 levels)
find app -maxdepth 2 -type f | sort

# 3. Components directory (if present)
find components -maxdepth 2 -type f 2>/dev/null | sort

# 4. Lib/utils (check for cn, clsx, etc.)
find lib -maxdepth 2 -type f 2>/dev/null | sort
```

Answer these questions from what you find:

- What is the root layout file? (`app/layout.tsx` or `src/app/layout.tsx`?)
- Does it use a `src/` directory?
- What global CSS file is imported? What CSS framework is active (Tailwind v3, Tailwind v4, plain CSS)?
- Are there existing route groups? (folders named `(something)`)
- Is there a `components/ui/` directory (shadcn/ui)?
- What is the import alias? (`@/` → check `tsconfig.json` `paths`)

---

### Step 2 — Investigate: Package Dependencies

```bash
cat package.json
```

Confirm:

- Exact Next.js version (`"next": "X.X.X"`) — this matters for font loading and route group behaviour
- Is `class-variance-authority` (`cva`) installed? The flip clock code depends on it.
- Is `tailwind-merge` or `clsx` installed? The `cn()` utility depends on one or both.
- Is `@serwist/next` or `next-pwa` or any PWA/service-worker package already installed?
- Is `screenfull` installed?
- Is `lucide-react` installed (for icons on control buttons)?

---

### Step 3 — Investigate: Tailwind Configuration

```bash
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null || cat postcss.config.js 2>/dev/null
```

- What `content` globs are set? Confirm `components/timer/**` will be picked up or add it.
- Are custom keyframes defined? The flip clock needs `animate-flip-top` and `animate-flip-bottom`
  — check if they already exist before adding duplicates.
- What CSS variables are used for theming? (e.g. `--background`, `--primary`, etc.)
  The flip clock uses `bg-primary`, `text-primary-foreground` etc. from shadcn conventions.

---

### Step 4 — Investigate: Existing `cn()` Utility

```bash
cat lib/utils.ts 2>/dev/null || cat lib/utils.tsx 2>/dev/null
```

The flip clock imports `cn` from `@/lib/utils`. Confirm this function exists and its exact
export shape before proceeding. If it doesn't exist, you'll need to create it:

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### Step 5 — Investigate: Root Layout & Global Fonts

```bash
cat app/layout.tsx 2>/dev/null || cat src/app/layout.tsx 2>/dev/null
```

- What fonts are loaded in the root layout?
- Are they loaded via `next/font/google` or a `<link>` tag?
- Does the root layout import a global CSS file that sets CSS variables?
  The timer route inherits these — good. But confirm the font variables so the setup screen
  can offer them as valid font options.
- Does the root layout wrap `children` in any context providers that the timer might conflict with?

---

### Step 6 — Investigate: Existing Service Worker / PWA Setup

```bash
ls public/
cat next.config.ts 2>/dev/null || cat next.config.js 2>/dev/null || cat next.config.mjs 2>/dev/null
```

- Is there already a `public/sw.js`?
- Does `next.config` already wrap with `withSerwist`, `withPWA`, or similar?
- Is there a `manifest.ts` or `manifest.json`?

If a PWA setup already exists, you must **extend** it, not replace it.
If none exists, add Serwist fresh (see Section 11 below).

---

### Step 7 — Investigate: TypeScript Configuration

```bash
cat tsconfig.json
```

- Confirm `@/` alias maps to the correct root (`./src` or `./`).
- Confirm `"jsx": "preserve"` is set (required for Next.js).
- Note `"strict"` mode — affects how you type optional props.

---

### Step 8 — Install Missing Dependencies

Based on your findings in Steps 2–4, install only what is missing:

```bash
# Required for flip clock (if not present)
npm install class-variance-authority clsx tailwind-merge

# Required for PWA/caching (if not present)
npm install @serwist/next serwist

# Optional: cross-browser fullscreen (if you want vendor-prefix safety)
npm install screenfull
```

Do not re-install packages that are already in `package.json`.

---

### Step 9 — Create the File Structure

Once investigation is complete, create these files (adjust root path `app/` vs `src/app/`
based on what you found in Step 1):

```
app/
  (timer)/
    layout.tsx
    timer/
      page.tsx

components/
  timer/
    TimerApp.tsx
    SetupScreen.tsx
    TimerDisplay.tsx
    ClockPreview.tsx
    FlipClock.tsx              ← (the provided flip clock code, adapted)
    useTimer.ts
    useFullscreen.ts
    useAudioAlarm.ts
    useTimerStorage.ts
    useBackgroundMedia.ts
    timerTypes.ts
```

---

### Step 10 — Build Each File

Build in this order (each depends on the previous):

1. `timerTypes.ts` — all interfaces (no dependencies)
2. `useTimerStorage.ts` — localStorage hook
3. `useBackgroundMedia.ts` — IndexedDB hook
4. `useTimer.ts` — countdown logic
5. `useFullscreen.ts` — Fullscreen API hook
6. `useAudioAlarm.ts` — Web Audio API hook
7. `FlipClock.tsx` — adapted from provided code (see Section below)
8. `ClockPreview.tsx` — live style preview
9. `SetupScreen.tsx` — configuration UI
10. `TimerDisplay.tsx` — fullscreen display
11. `TimerApp.tsx` — root state machine
12. `app/(timer)/layout.tsx` — route group layout
13. `app/(timer)/timer/page.tsx` — page entry point

---

### Step 11 — Configure Service Worker / Caching

After confirming what exists in Step 6:

**If no PWA setup exists**, add Serwist:

```ts
// next.config.ts
import withSerwistInit from "@serwist/next";
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
});
export default withSerwist({ /* existing config */ });
```

```ts
// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";
declare const self: ServiceWorkerGlobalScope & { __SW_MANIFEST: any };
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
});
serwist.addEventListeners();
```

**If PWA already exists**, add the `/timer` route to `additionalPrecacheEntries` in the
existing config only — do not duplicate the service worker setup.

---

### Step 12 — Tailwind Keyframes for Flip Animation

Check if these keyframes already exist (Step 3). If not, add to `tailwind.config.ts`:

```ts
theme: {
  extend: {
    keyframes: {
      "flip-top-anim": {
        "0%":       { transform: "rotateX(0deg)", zIndex: "30" },
        "50%, 100%": { transform: "rotateX(-90deg)", zIndex: "10" },
      },
      "flip-bottom-anim": {
        "0%, 50%": { transform: "rotateX(90deg)", zIndex: "10" },
        "100%":    { transform: "rotateX(0deg)", zIndex: "30" },
      },
    },
    animation: {
      "flip-top":    "flip-top-anim 0.6s ease-in forwards",
      "flip-bottom": "flip-bottom-anim 0.6s ease-out forwards",
    },
  },
},
```

---

## Complete TypeScript Interfaces

```ts
// components/timer/timerTypes.ts

export interface TimerConfig {
  eventTitle: string;           // required — validated before start
  subtitle: string;             // optional
  targetSeconds: number;        // total countdown duration in seconds
  clockStyle: ClockStyle;
  titleStyle: TextStyle;
  subtitleStyle: TextStyle;
  alarmConfig: AlarmConfig;
  backgroundType: "default" | "image" | "video";
  backgroundMediaKey: string | null; // key used in IndexedDB
}

export interface TextStyle {
  fontFamily: string;           // e.g. "monospace", "serif", "Oswald"
  fontSize: number;             // px
  color: string;                // hex e.g. "#ffffff"
  fontWeight: "normal" | "bold";
}

export interface ClockStyle extends TextStyle {
  // showDays is derived at runtime from targetSeconds >= 86400
  // it is NOT stored — always re-derived from targetSeconds
}

export interface AlarmConfig {
  type: OscillatorType;         // "sine" | "square" | "triangle" | "sawtooth"
  frequency: number;            // Hz — e.g. 880
  duration: number;             // seconds to play the alarm
  volume: number;               // 0.0–1.0
  pattern: AlarmPattern;
}

export type AlarmPattern =
  | "beep-beep"
  | "continuous"
  | "escalating"
  | "siren"
  | "triple-beep";

export type AppPhase = "setup" | "running";
```

---

## localStorage Hook

```ts
// components/timer/useTimerStorage.ts
"use client";
import { useEffect, useState } from "react";
import { TimerConfig } from "./timerTypes";

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
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<TimerConfig>;
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      }
    } catch {
      // corrupt storage — use defaults
    }
    setLoaded(true);
  }, []);

  const saveConfig = (next: TimerConfig) => {
    setConfig(next);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // quota exceeded — silently ignore
      }
    }
  };

  return { config, saveConfig, loaded };
}
```

---

## IndexedDB Background Media Hook

```ts
// components/timer/useBackgroundMedia.ts
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const DB_NAME = "timer-media-db";
const DB_VERSION = 1;
const STORE = "media";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function useBackgroundMedia() {
  const [mediaURL, setMediaURL] = useState<string | null>(null);
  const objectURLRef = useRef<string | null>(null);

  const revokeURL = () => {
    if (objectURLRef.current) {
      URL.revokeObjectURL(objectURLRef.current);
      objectURLRef.current = null;
    }
  };

  const saveMedia = useCallback(async (file: File) => {
    if (typeof window === "undefined") return;
    revokeURL();
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, "background");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    const url = URL.createObjectURL(file);
    objectURLRef.current = url;
    setMediaURL(url);
  }, []);

  const loadMedia = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const db = await openDB();
      const result = await new Promise<File | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get("background");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (result) {
        revokeURL();
        const url = URL.createObjectURL(result);
        objectURLRef.current = url;
        setMediaURL(url);
      }
    } catch {
      // IDB unavailable — silently ignore
    }
  }, []);

  const clearMedia = useCallback(async () => {
    if (typeof window === "undefined") return;
    revokeURL();
    setMediaURL(null);
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete("background");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }, []);

  useEffect(() => {
    loadMedia();
    return revokeURL; // cleanup object URL on unmount
  }, [loadMedia]);

  return { mediaURL, saveMedia, clearMedia };
}
```

---

## Countdown Timer Hook

```ts
// components/timer/useTimer.ts
"use client";
import { useEffect, useRef, useState } from "react";

export function useTimer(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start  = () => { setRunning(true); setFinished(false); };
  const pause  = () => setRunning(false);
  const reset  = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(targetSeconds);
  };

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const days    = Math.floor(remaining / 86400);
  const hours   = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  // showDays is derived from the ORIGINAL targetSeconds, not remaining
  // so the days column doesn't disappear mid-countdown
  const showDays = targetSeconds >= 86400;

  return { remaining, running, finished, start, pause, reset, days, hours, minutes, seconds, showDays };
}
```

---

## Fullscreen Hook

```ts
// components/timer/useFullscreen.ts
"use client";
import { RefObject, useLayoutEffect, useState } from "react";

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = async () => {
    const el = ref.current ?? document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    } catch (e) {
      // fullscreen denied — continue without it (iOS Safari)
      console.warn("Fullscreen not available:", e);
    }
  };

  const exit = async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    } catch {}
  };

  useLayoutEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
    };
  }, []);

  return { isFullscreen, enter, exit };
}
```

---

## Web Audio API Alarm Hook

```ts
// components/timer/useAudioAlarm.ts
"use client";
import { AlarmConfig, AlarmPattern } from "./timerTypes";

function createCtx(): AudioContext {
  return new ((window as any).AudioContext || (window as any).webkitAudioContext)();
}

function playBeepBeep(ctx: AudioContext, cfg: AlarmConfig) {
  // Three pairs: beep at 0s, 0.3s, 0.8s, 1.1s, 1.6s, 1.9s
  [0, 0.3, 0.8, 1.1, 1.6, 1.9].forEach((offset) => {
    const osc  = ctx.createOscillator();
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
    const osc  = ctx.createOscillator();
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
  const osc  = ctx.createOscillator();
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
  const osc  = ctx.createOscillator();
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
  const osc     = ctx.createOscillator();
  const lfo     = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain    = ctx.createGain();
  lfo.frequency.value = 2;              // sweep speed
  lfoGain.gain.value  = cfg.frequency * 0.3; // sweep depth
  osc.type            = cfg.type;
  osc.frequency.value = cfg.frequency;
  gain.gain.value     = cfg.volume;
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
  { label: "Classic Alarm",   config: { type: "square",   frequency: 880,  duration: 4, volume: 0.7, pattern: "beep-beep"   } },
  { label: "Siren",           config: { type: "sine",     frequency: 660,  duration: 6, volume: 0.7, pattern: "siren"       } },
  { label: "Gentle Bell",     config: { type: "sine",     frequency: 523,  duration: 3, volume: 0.5, pattern: "triple-beep" } },
  { label: "Escalating Buzz", config: { type: "sawtooth", frequency: 220,  duration: 5, volume: 0.6, pattern: "escalating"  } },
  { label: "Emergency",       config: { type: "square",   frequency: 1000, duration: 8, volume: 0.8, pattern: "beep-beep"   } },
];

export function useAudioAlarm() {
  const play = (cfg: AlarmConfig) => {
    if (typeof window === "undefined") return;
    const ctx = createCtx();
    const patternMap: Record<AlarmPattern, (c: AudioContext, cfg: AlarmConfig) => void> = {
      "beep-beep":   playBeepBeep,
      "triple-beep": playTripleBeep,
      "continuous":  playContinuous,
      "escalating":  playEscalating,
      "siren":       playSiren,
    };
    (patternMap[cfg.pattern] ?? playContinuous)(ctx, cfg);
    // Close context after alarm finishes to free audio resources
    setTimeout(() => ctx.close().catch(() => {}), (cfg.duration + 1) * 1000);
  };

  return { play };
}
```

---

## The Flip Clock Component

This is the provided flip clock adapted to work inside the timer context.
The key changes from the original:

- `targetDate` prop replaced with `remainingSeconds: number` for direct countdown control
- `size` variants extended to accept a raw `fontSize` from `ClockStyle` via inline styles
- Color and fontFamily overrides passed through inline styles where Tailwind can't reach custom values
- `style jsx global` replaced with a regular `<style>` tag (safer in App Router)

```tsx
// components/timer/FlipClock.tsx
"use client";

import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import {
  FC,
  HTMLAttributes,
  memo,
  ReactNode,
  useEffect,
  useState,
} from "react";

// ─── Flip Unit ────────────────────────────────────────────────────────────────

const flipUnitVariants = cva(
  "relative subpixel-antialiased perspective-[1000px] rounded-md overflow-hidden",
  {
    variants: {
      size: {
        sm: "w-10 min-w-10 h-14 text-3xl",
        md: "w-14 min-w-14 h-20 text-5xl",
        lg: "w-17 min-w-17 h-24 text-6xl",
        xl: "w-22 min-w-22 h-32 text-8xl",
      },
      variant: {
        default:     "bg-primary text-primary-foreground",
        secondary:   "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline:     "border border-input bg-background text-foreground",
        muted:       "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  }
);

interface FlipUnitProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flipUnitVariants> {
  digit: number | string;
}

const commonCardStyle = cn(
  "absolute inset-x-0 overflow-hidden h-1/2 bg-inherit text-inherit"
);

const FlipUnit: FC<FlipUnitProps> = memo(function FlipUnit({
  digit, size, variant, className, style,
}: FlipUnitProps) {
  const [prevDigit, setPrevDigit] = useState(digit);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (digit !== prevDigit) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setFlipping(false);
        setPrevDigit(digit);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [digit, prevDigit]);

  return (
    <div
      className={cn(flipUnitVariants({ size, variant }), className)}
      style={style}
    >
      {/* Background Top: new digit waiting */}
      <div className={cn(commonCardStyle, "rounded-t-lg top-0")}>
        <DigitSpan position="top">{digit}</DigitSpan>
      </div>
      {/* Background Bottom: old digit staying */}
      <div className={cn(commonCardStyle, "rounded-b-lg translate-y-full")}>
        <DigitSpan position="bottom">{prevDigit}</DigitSpan>
      </div>
      {/* Top Flap: old digit falling */}
      <div
        className={cn(
          commonCardStyle,
          "z-20 origin-bottom backface-hidden rounded-t-lg",
          flipping && "animate-flip-top"
        )}
      >
        <DigitSpan position="top">{prevDigit}</DigitSpan>
      </div>
      {/* Bottom Flap: new digit appearing */}
      <div
        className={cn(
          commonCardStyle,
          "z-10 origin-top backface-hidden rounded-b-lg translate-y-full",
          flipping && "animate-flip-bottom"
        )}
        style={{ transform: "rotateX(90deg)" }}
      >
        <DigitSpan position="bottom">{digit}</DigitSpan>
      </div>
      {/* Center divider */}
      <div className="absolute top-1/2 left-0 w-full h-px -translate-y-1/2 bg-background/50 z-30" />
    </div>
  );
});

interface DigitSpanProps {
  children: ReactNode;
  position?: "top" | "bottom";
}

function DigitSpan({ children, position }: DigitSpanProps) {
  return (
    <span
      className="absolute left-0 right-0 w-full flex items-center justify-center h-[200%]"
      style={{ top: position === "top" ? "0%" : "-100%" }}
    >
      {children}
    </span>
  );
}

// ─── Separator ────────────────────────────────────────────────────────────────

type FlipClockSize = NonNullable<VariantProps<typeof flipUnitVariants>["size"]>;
const heightMap: Record<FlipClockSize, string> = {
  sm: "text-4xl",
  md: "text-5xl",
  lg: "text-6xl",
  xl: "text-8xl",
};

function ClockSeparator({ size, color }: { size?: FlipClockSize; color?: string }) {
  return (
    <span
      className={cn("text-center -translate-y-[8%]", size ? heightMap[size] : heightMap["md"])}
      style={color ? { color } : undefined}
    >
      :
    </span>
  );
}

// ─── FlipClock ────────────────────────────────────────────────────────────────

const flipClockVariants = cva(
  "relative flex justify-center items-center font-mono font-medium",
  {
    variants: {
      size: {
        sm: "text-3xl space-x-1",
        md: "text-5xl space-x-2",
        lg: "text-6xl space-x-2",
        xl: "text-8xl space-x-3",
      },
      variant: {
        default: "", secondary: "", destructive: "", outline: "", muted: "",
      },
    },
    defaultVariants: { size: "md", variant: "default" },
  }
);

interface FlipClockProps
  extends VariantProps<typeof flipClockVariants>,
    HTMLAttributes<HTMLDivElement> {
  // Direct seconds remaining — used for the event timer
  remainingSeconds: number;
  showDays?: boolean;
  // Style overrides (from ClockStyle config)
  digitColor?: string;
  digitFontSize?: number;
  digitFontFamily?: string;
}

export function FlipClock({
  remainingSeconds,
  showDays = false,
  size,
  variant,
  className,
  digitColor,
  digitFontSize,
  digitFontFamily,
  ...props
}: FlipClockProps) {
  const days    = Math.floor(remainingSeconds / 86400);
  const hours   = Math.floor((remainingSeconds % 86400) / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const daysStr    = String(days).padStart(3, "0");
  const hoursStr   = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");
  const secondsStr = String(seconds).padStart(2, "0");

  // Build inline style for custom color/font overrides
  const unitStyle: React.CSSProperties = {
    ...(digitColor     ? { color: digitColor }           : {}),
    ...(digitFontSize  ? { fontSize: digitFontSize }     : {}),
    ...(digitFontFamily ? { fontFamily: digitFontFamily } : {}),
  };

  return (
    <div
      className={cn(flipClockVariants({ size, variant }), className)}
      aria-live="polite"
      aria-label={`${showDays ? `${days} days ` : ""}${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
      {...props}
    >
      {/* Days */}
      {showDays && (
        <>
          {daysStr.split("").map((digit, i) => (
            <FlipUnit key={`d-${i}`} digit={digit} size={size} variant={variant} style={unitStyle} />
          ))}
          <ClockSeparator size={size!} color={digitColor} />
        </>
      )}

      {/* Hours */}
      {hoursStr.split("").map((digit, i) => (
        <FlipUnit key={`h-${i}`} digit={digit} size={size} variant={variant} style={unitStyle} />
      ))}
      <ClockSeparator size={size!} color={digitColor} />

      {/* Minutes */}
      {minutesStr.split("").map((digit, i) => (
        <FlipUnit key={`m-${i}`} digit={digit} size={size} variant={variant} style={unitStyle} />
      ))}
      <ClockSeparator size={size!} color={digitColor} />

      {/* Seconds */}
      {secondsStr.split("").map((digit, i) => (
        <FlipUnit key={`s-${i}`} digit={digit} size={size} variant={variant} style={unitStyle} />
      ))}

      {/* Flip animation keyframes — scoped here to avoid global collision */}
      <style>{`
        .animate-flip-top    { animation: flip-top-anim 0.6s ease-in forwards; }
        .animate-flip-bottom { animation: flip-bottom-anim 0.6s ease-out forwards; }
        @keyframes flip-top-anim {
          0%        { transform: rotateX(0deg);   z-index: 30; }
          50%, 100% { transform: rotateX(-90deg); z-index: 10; }
        }
        @keyframes flip-bottom-anim {
          0%, 50% { transform: rotateX(90deg); z-index: 10; }
          100%    { transform: rotateX(0deg);  z-index: 30; }
        }
      `}</style>
    </div>
  );
}
```

---

## Setup Screen Specification

```tsx
// components/timer/SetupScreen.tsx
// All sections below — build each as a sub-component or section within SetupScreen

/*
LAYOUT (desktop: two-column grid; mobile: single column):
┌──────────────────────────┬──────────────────────────┐
│  Event Info              │  Live Preview            │
│  ─ Title (required)      │  (ClockPreview)          │
│  ─ Subtitle (optional)   │                          │
├──────────────────────────┤                          │
│  Timer Duration          │                          │
│  ─ Days / Hours /        │                          │
│    Minutes / Seconds     │                          │
├──────────────────────────┴──────────────────────────┤
│  Styling: Clock | Title | Subtitle (tabs)           │
│  ─ Font family selector                             │
│  ─ Font size slider (24–200px)                      │
│  ─ Color picker (<input type="color">)              │
│  ─ Bold toggle                                      │
├─────────────────────────────────────────────────────┤
│  Background                                         │
│  ─ Toggle: Default | Image | Video                  │
│  ─ File picker (shown when Image or Video selected) │
│  ─ Thumbnail/filename preview when loaded           │
├─────────────────────────────────────────────────────┤
│  Alarm                                              │
│  ─ Preset dropdown (5 options)                      │
│  ─ Volume slider                                    │
│  ─ [Preview Alarm] button                           │
├─────────────────────────────────────────────────────┤
│  [Start Timer →]  (disabled until title + duration) │
└─────────────────────────────────────────────────────┘

VALIDATION:
- eventTitle.trim() must not be empty
- targetSeconds must be >= 1
- Show inline error on title field if empty and user tries to start

FONTS TO OFFER:
- System: "monospace", "serif", "sans-serif"  (no extra load)
- Google: "Roboto Mono", "Oswald", "Anton"
  → Load these lazily: inject <link> into <head> via useEffect
    only when user selects them. Do NOT preload all three.

COLOR PICKER:
- Use native <input type="color"> — no library needed
- Wrap in a styled label for consistent appearance

BACKGROUND FILE UPLOAD:
- <input type="file" accept="image/*"> for image mode
- <input type="file" accept="video/mp4,video/webm"> for video mode
- On change: call saveMedia(file) from useBackgroundMedia hook
- Show filename + file size below the input when a file is loaded
- Show a [Clear] button to call clearMedia()
*/
```

---

## Timer Display Screen Specification

```tsx
// components/timer/TimerDisplay.tsx

/*
LAYOUT (fullscreen fixed, position: fixed, inset: 0, z-index: 50):

┌─────────────────────────────────────────────────────────────────────┐
│  [Background layer: image/video/gradient — position absolute z-0]  │
│  [Overlay layer: rgba(0,0,0,0.4) — position absolute z-1]          │
│                                                                     │
│                     EVENT TITLE                                     │  ← titleStyle
│                     Subtitle                                        │  ← subtitleStyle
│                                                                     │
│              [  FlipClock  ]                                        │  ← clockStyle
│                                                                     │
│  [Pause/Resume]    [Reset]    [⛶ / ⛶ Fullscreen]                  │  ← fade after 3s idle
│                                                                     │
│  [← Back to Setup]  (bottom left, always visible)                  │
└─────────────────────────────────────────────────────────────────────┘

BACKGROUND:
- backgroundType === "default":
    CSS: background: linear-gradient(135deg, #0f0c29, #302b63, #24243e)
    with a slow keyframe animation shifting background-position
- backgroundType === "image":
    <img src={mediaURL} style={{ objectFit: "cover", position: "absolute", inset: 0, zIndex: 0 }} />
- backgroundType === "video":
    <video src={mediaURL} autoPlay loop muted playsInline
           style={{ objectFit: "cover", position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%" }} />

CONTROL FADE:
- Track last interaction with mousemove + touchstart listeners
- After 3000ms of inactivity: set controlsVisible = false
  (opacity-0 transition, pointer-events: none)
- Any mouse/touch: reset timer, set controlsVisible = true

FINISHED STATE (when useTimer.finished === true):
- Play alarm: call alarm.play(config.alarmConfig)
  inside useEffect(() => { if (finished) alarm.play(...) }, [finished])
- Show "TIME'S UP!" text overlay with a pulse CSS animation
- Flash the timer digits (CSS opacity pulse animation)
- Alarm plays once — do not loop unless the user clicks [Play Again]

FULLSCREEN:
- On mount (from setup → display transition): call fullscreen.enter()
  — this works because the navigation was triggered by a user click
- The ref for fullscreen should be the outermost <div> of TimerDisplay
- [Exit Fullscreen] button calls fullscreen.exit()
- Pressing Escape is handled natively by the browser — no extra code

IOS SAFARI FALLBACK:
- iOS Safari does not support the Fullscreen API
- If fullscreen.enter() throws: fall back gracefully
  (the component still fills the screen via position:fixed + inset:0)
- Add meta tag in (timer)/layout.tsx:
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
*/
```

---

## Route Group Files

```tsx
// app/(timer)/layout.tsx
// (adjust path to src/app/(timer)/layout.tsx if your project uses src/)
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Timer",
  description: "Fullscreen countdown timer for live events",
};

export default function TimerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      {/*
        No header, footer, sidebar, or nav from the parent app.
        This layout intentionally renders ONLY children.
        The (timer) route group folder name means the URL is /timer,
        not /(timer)/timer.
      */}
      {children}
    </>
  );
}
```

```tsx
// app/(timer)/timer/page.tsx
import TimerApp from "@/components/timer/TimerApp";

export default function TimerPage() {
  return <TimerApp />;
}
```

```tsx
// components/timer/TimerApp.tsx
"use client";
import { useState } from "react";
import { AppPhase } from "./timerTypes";
import { useTimerStorage }    from "./useTimerStorage";
import { useBackgroundMedia } from "./useBackgroundMedia";
import SetupScreen   from "./SetupScreen";
import TimerDisplay  from "./TimerDisplay";

export default function TimerApp() {
  const [phase, setPhase] = useState<AppPhase>("setup");
  const { config, saveConfig, loaded } = useTimerStorage();
  const { mediaURL, saveMedia, clearMedia } = useBackgroundMedia();

  if (!loaded) return null; // avoid hydration mismatch flash

  return phase === "setup" ? (
    <SetupScreen
      config={config}
      mediaURL={mediaURL}
      onSaveMedia={saveMedia}
      onClearMedia={clearMedia}
      onSave={saveConfig}
      onStart={() => setPhase("running")}
    />
  ) : (
    <TimerDisplay
      config={config}
      mediaURL={mediaURL}
      onBack={() => setPhase("setup")}
    />
  );
}
```

---

## Critical Gotchas — Must Read Before Building

| Issue | What to do |
|---|---|
| `AudioContext` is suspended until user gesture | Only call `alarm.play()` inside a click handler or `useEffect` that fires after interaction. Never on page load. |
| `localStorage` not available during SSR | Always guard with `typeof window !== "undefined"` or inside `useEffect` |
| IndexedDB not available during SSR | Same guard — open IDB only inside `useEffect` or async functions called from event handlers |
| Fullscreen must be triggered by user gesture | Wire `fullscreen.enter()` to the Start button click. Not to a `useEffect`. |
| The fullscreen element must contain the video | Do not put `video` outside the fullscreen container div. If `video` is a sibling of the fullscreen element, it won't be visible. |
| Object URL memory leak | Always call `URL.revokeObjectURL()` in the `useEffect` cleanup of `useBackgroundMedia` |
| `showDays` derived from original duration, not remaining | If the user sets 2 days, days column should show even when `remaining` drops below 86400 |
| Service worker only active in production | Run `next build && next start` to test caching. In dev mode, SW is typically disabled by Serwist. |
| Tailwind not scanning `components/timer/` | Check `content` array in `tailwind.config.ts` — add `"./components/timer/**/*.{ts,tsx}"` if missing |
| `style jsx` not supported in App Router client components | Use a plain `<style>` tag or move keyframes to `tailwind.config.ts` |
| Next.js `metadata` export in a Client Component | Only export `metadata` from Server Components (`page.tsx`, `layout.tsx`). Do not add it to files with `"use client"`. |

---

## Testing Checklist

After building, verify each of these manually:

- [ ] Route loads at `/timer` without errors
- [ ] Setup screen persists config after page refresh (localStorage)
- [ ] Background image/video persists after page refresh (IndexedDB)
- [ ] Days field hidden when duration < 1 day; visible when >= 1 day
- [ ] Clock style changes (font, color, size) reflect live in the preview
- [ ] [Preview Alarm] button plays the correct tone
- [ ] Start button disabled when title is empty
- [ ] Fullscreen activates on Start (desktop Chrome/Firefox/Edge)
- [ ] Timer counts down correctly; reaches 0 and triggers alarm
- [ ] "TIME'S UP!" overlay appears when finished
- [ ] Controls fade after 3 seconds of mouse inactivity
- [ ] Controls reappear on mouse movement
- [ ] [Reset] returns to 00:00:00 without exiting fullscreen
- [ ] [← Back to Setup] exits fullscreen and returns to setup
- [ ] iOS Safari: no crash, timer works even without Fullscreen API
- [ ] After `next build && next start`: page loads offline (SW cache active)
