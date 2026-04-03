"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Maximize, Minimize, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { TimerConfig } from "./timerTypes";
import { FlipClock } from "./FlipClock";
import { useAudioAlarm } from "./useAudioAlarm";
import { useFullscreen } from "./useFullscreen";
import { useTimer } from "./useTimer";

interface TimerDisplayProps {
  config: TimerConfig;
  mediaURL: string | null;
  onBack: () => void;
}

function mapSize(fontSize: number): "sm" | "md" | "lg" | "xl" {
  if (fontSize < 34) {
    return "sm";
  }
  if (fontSize < 56) {
    return "md";
  }
  if (fontSize < 84) {
    return "lg";
  }
  return "xl";
}

export default function TimerDisplay({ config, mediaURL, onBack }: TimerDisplayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const { isFullscreen, enter, exit } = useFullscreen(rootRef);
  const { remaining, running, finished, start, pause, reset, showDays } = useTimer(config.targetSeconds);
  const alarm = useAudioAlarm();

  const [controlsVisible, setControlsVisible] = useState(true);

  useEffect(() => {
    const kickOff = async () => {
      await enter();
      start();
    };

    void kickOff();
  }, [enter, start]);

  useEffect(() => {
    if (finished) {
      alarm.play(config.alarmConfig);
    }
  }, [alarm, config.alarmConfig, finished]);

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

  const handleBack = async () => {
    await exit();
    onBack();
  };

  const isTimeUp = finished || remaining === 0;

  const backgroundLayer = useMemo(() => {
    if (config.backgroundType === "image" && mediaURL) {
      return (
        <Image
          src={mediaURL}
          alt="Background"
          fill
          unoptimized
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      );
    }

    if (config.backgroundType === "video" && mediaURL) {
      return (
        <video
          src={mediaURL}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      );
    }

    return <div className="timer-gradient absolute inset-0 z-0" />;
  }, [config.backgroundType, mediaURL]);

  const titleColor = config.titleStyle.color || "#ffffff";
  const subtitleColor = config.subtitleStyle.color || "#d4d4d8";
  const digitColor = config.clockStyle.color || "#ffffff";
  const digitFontSize = Math.max(16, config.clockStyle.fontSize || 64);
  const digitFamily = config.clockStyle.fontFamily || "monospace";

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 overflow-hidden bg-black text-white">
      {backgroundLayer}
      <div className="absolute inset-0 z-[1] bg-black/45" />

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-4 text-center">
        <h1
          className="max-w-6xl break-words leading-tight"
          style={{
            color: titleColor,
            fontFamily: config.titleStyle.fontFamily,
            fontSize: `clamp(2rem, 5vw, ${config.titleStyle.fontSize}px)`,
            fontWeight: config.titleStyle.fontWeight,
          }}
        >
          {config.eventTitle}
        </h1>

        {config.subtitle && (
          <p
            className="mt-2 max-w-5xl break-words"
            style={{
              color: subtitleColor,
              fontFamily: config.subtitleStyle.fontFamily,
              fontSize: `clamp(1rem, 2.5vw, ${config.subtitleStyle.fontSize}px)`,
              fontWeight: config.subtitleStyle.fontWeight,
            }}
          >
            {config.subtitle}
          </p>
        )}

        <div className={`mt-8 max-w-full ${isTimeUp ? "animate-timeup-flash" : ""}`}>
          <FlipClock
            remainingSeconds={remaining}
            showDays={showDays}
            size={mapSize(config.clockStyle.fontSize)}
            digitColor={digitColor}
            digitFontFamily={digitFamily}
            digitFontSize={digitFontSize}
            className={config.clockStyle.fontWeight === "bold" ? "font-bold" : "font-normal"}
          />
        </div>

        {isTimeUp && (
          <div className="mt-8 animate-timeup-pulse text-4xl font-black tracking-[0.2em] text-red-300 sm:text-6xl">
            TIME&apos;S UP!
          </div>
        )}
      </div>

      <div
        className={`absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 transition-opacity duration-500 ${
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <Button variant="secondary" onClick={() => (running ? pause() : start())}>
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pause" : "Resume"}
        </Button>

        <Button variant="outline" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <Button variant="outline" onClick={() => void (isFullscreen ? exit() : enter())}>
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>

        {isTimeUp && (
          <Button variant="default" onClick={() => alarm.play(config.alarmConfig)}>
            <Volume2 className="h-4 w-4" />
            Play Again
          </Button>
        )}
      </div>

      <div className="absolute bottom-6 left-6 z-20">
        <Button variant="ghost" onClick={() => void handleBack()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Setup
        </Button>
      </div>

      <style>{`
        .timer-gradient {
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          background-size: 400% 400%;
          animation: timer-gradient-shift 18s ease infinite;
        }

        @keyframes timer-gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-timeup-pulse {
          animation: timeup-pulse 1s ease-in-out infinite;
        }

        .animate-timeup-flash {
          animation: timeup-flash 0.8s ease-in-out infinite;
        }

        @keyframes timeup-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.04); }
        }

        @keyframes timeup-flash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
