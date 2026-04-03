"use client";

import type { TimerConfig } from "./timerTypes";
import { FlipClock } from "./FlipClock";

interface ClockPreviewProps {
  config: TimerConfig;
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

export default function ClockPreview({ config }: ClockPreviewProps) {
  const titleColor = config.titleStyle.color || "#ffffff";
  const subtitleColor = config.subtitleStyle.color || "#d4d4d8";
  const digitColor = config.clockStyle.color || "#ffffff";
  const digitSize = Math.max(16, config.clockStyle.fontSize || 64);
  const digitFamily = config.clockStyle.fontFamily || "monospace";

  return (
    <div className="border border-[#333333] bg-black/70 p-6">
      <div className="mb-6 text-center">
        <h3
          className="break-words leading-tight"
          style={{
            color: titleColor,
            fontFamily: config.titleStyle.fontFamily,
            fontSize: `${Math.max(22, Math.min(44, config.titleStyle.fontSize))}px`,
            fontWeight: config.titleStyle.fontWeight,
          }}
        >
          {config.eventTitle || "Event title preview"}
        </h3>

        <p
          className="mt-2 break-words"
          style={{
            color: subtitleColor,
            fontFamily: config.subtitleStyle.fontFamily,
            fontSize: `${Math.max(14, Math.min(30, config.subtitleStyle.fontSize))}px`,
            fontWeight: config.subtitleStyle.fontWeight,
          }}
        >
          {config.subtitle || "Optional subtitle preview"}
        </p>
      </div>

      <div className="mx-auto max-w-fit scale-75 origin-top sm:scale-90 lg:scale-100">
        <FlipClock
          remainingSeconds={Math.max(0, config.targetSeconds)}
          showDays={config.targetSeconds >= 86400}
          size={mapSize(config.clockStyle.fontSize)}
          digitColor={digitColor}
          digitFontFamily={digitFamily}
          digitFontSize={digitSize}
          className={config.clockStyle.fontWeight === "bold" ? "font-bold" : "font-normal"}
        />
      </div>
    </div>
  );
}
