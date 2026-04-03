"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Maximize, Minimize, Pause, Play, RotateCcw, Settings } from "lucide-react";
import { FlipClock } from "./FlipClock";
import TimerConfigScreen, { DEFAULT_CONFIG, type TimerConfig } from "./TimerConfigScreen";

const STORAGE_KEY = "cryptx-timer-config";

export default function TimerApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  // Load config from localStorage
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load config:", e);
      }
    }
  }, []);

  const saveConfig = useCallback((newConfig: TimerConfig) => {
    setConfig(newConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    // Reset timer to new duration
    setRemaining(newConfig.durationSeconds);
    setRunning(false);
    setTargetDate(null);
  }, []);

  // Timer state
  const [remaining, setRemaining] = useState(config.durationSeconds);
  const [running, setRunning] = useState(false);
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  // Update remaining when config changes
  useEffect(() => {
    if (!running) {
      setRemaining(config.durationSeconds);
    }
  }, [config.durationSeconds, running]);

  // Start the timer
  const start = useCallback(() => {
    const target = new Date(Date.now() + remaining * 1000);
    setTargetDate(target);
    setRunning(true);
  }, [remaining]);

  // Pause the timer
  const pause = useCallback(() => {
    setRunning(false);
    setTargetDate(null);
  }, []);

  // Reset the timer
  const reset = useCallback(() => {
    setRunning(false);
    setTargetDate(null);
    setRemaining(config.durationSeconds);
  }, [config.durationSeconds]);

  // Countdown effect
  useEffect(() => {
    if (!running || !targetDate) return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((targetDate.getTime() - Date.now()) / 1000));
      setRemaining(diff);
      if (diff === 0) {
        setRunning(false);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [running, targetDate]);

  // Fullscreen API
  const enterFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (containerRef.current as HTMLDivElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      }
    } catch (err) {
      console.error("Exit fullscreen error:", err);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    const showAndReset = () => {
      setControlsVisible(true);

      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }

      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    showAndReset();
    window.addEventListener("mousemove", showAndReset);
    window.addEventListener("touchstart", showAndReset, { passive: true });

    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
      window.removeEventListener("mousemove", showAndReset);
      window.removeEventListener("touchstart", showAndReset);
    };
  }, []);

  const isTimeUp = remaining === 0;

  // Don't render until mounted (avoid hydration mismatch)
  if (!mounted) {
    return null;
  }

  // Apply custom CSS variables
  const customStyles = {
    "--timer-primary": config.primaryColor,
    "--timer-background": config.backgroundColor,
    "--timer-border": config.borderColor,
    "--timer-muted-foreground": config.mutedColor,
  } as React.CSSProperties;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        style={customStyles}
      >
        {/* Background image */}
        <Image
          src="/timer_background.webp"
          alt=""
          fill
          priority
          className="object-cover"
          quality={90}
        />

        {/* Centered FlipClock */}
        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          <FlipClock
            remainingSeconds={remaining}
            countdown
            size={config.size}
            variant="default"
            showDays="auto"
            className={config.showBrackets ? "" : "[&_span[class*='absolute']]:hidden"}
            style={{ fontFamily: config.fontFamily }}
          />

          {isTimeUp && (
            <div 
              className="mt-8 animate-pulse text-4xl font-bold tracking-[0.2em] sm:text-6xl"
              style={{ 
                color: config.primaryColor,
                fontFamily: "Uncut Sans",
              }}
            >
              TIME&apos;S UP!
            </div>
          )}
        </div>

        {/* Controls overlay */}
        <div
          className={`absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 transition-opacity duration-500 ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button
            onClick={() => setShowConfig(true)}
            className="flex items-center gap-2 bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] hover:bg-[--timer-muted] transition-colors font-['Uncut_Sans']"
          >
            <Settings className="h-4 w-4" />
            Config
          </button>

          <button
            onClick={() => {
              if (running) {
                pause();
              } else {
                start();
              }
            }}
            className="flex items-center gap-2 bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] hover:bg-[--timer-muted] transition-colors font-['Uncut_Sans']"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pause" : "Start"}
          </button>

          <button
            onClick={reset}
            className="flex items-center gap-2 bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] hover:bg-[--timer-muted] transition-colors font-['Uncut_Sans']"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            onClick={async () => {
              if (isFullscreen) {
                await exitFullscreen();
              } else {
                await enterFullscreen();
              }
            }}
            className="flex items-center gap-2 bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] hover:bg-[--timer-muted] transition-colors font-['Uncut_Sans']"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            {isFullscreen ? "Exit" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Config Screen Modal */}
      {showConfig && (
        <TimerConfigScreen
          config={config}
          onSave={saveConfig}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  );
}
