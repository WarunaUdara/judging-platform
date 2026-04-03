"use client";

import { useState } from "react";
import { X, Clock, Palette, Type, Monitor } from "lucide-react";

export interface TimerConfig {
  durationSeconds: number;
  size: "sm" | "md" | "lg" | "xl";
  primaryColor: string;
  backgroundColor: string;
  borderColor: string;
  mutedColor: string;
  showBrackets: boolean;
  fontFamily: "Hacked KerX" | "Uncut Sans";
}

export const DEFAULT_CONFIG: TimerConfig = {
  durationSeconds: 2 * 60 * 60, // 2 hours
  size: "xl",
  primaryColor: "oklch(0.6522 0.2135 37.99)", // Orange
  backgroundColor: "oklch(0.1805 0.0155 101.8)", // Dark gray-green
  borderColor: "oklch(0.2755 0.0126 100.48)", // Gray border
  mutedColor: "oklch(0.709 0.01 56.259)", // Muted gray
  showBrackets: true,
  fontFamily: "Hacked KerX",
};

const PRESET_COLORS = [
  { name: "Ember Orange", value: "oklch(0.6522 0.2135 37.99)" },
  { name: "Neon Blue", value: "oklch(0.6 0.25 230)" },
  { name: "Cyber Green", value: "oklch(0.7 0.25 145)" },
  { name: "Violet", value: "oklch(0.65 0.25 285)" },
  { name: "Hot Pink", value: "oklch(0.65 0.28 340)" },
  { name: "White", value: "oklch(0.95 0 0)" },
];

const PRESET_TIMES = [
  { label: "5 Minutes", seconds: 5 * 60 },
  { label: "15 Minutes", seconds: 15 * 60 },
  { label: "30 Minutes", seconds: 30 * 60 },
  { label: "1 Hour", seconds: 60 * 60 },
  { label: "2 Hours", seconds: 2 * 60 * 60 },
  { label: "3 Hours", seconds: 3 * 60 * 60 },
];

interface TimerConfigScreenProps {
  config: TimerConfig;
  onSave: (config: TimerConfig) => void;
  onClose: () => void;
}

export default function TimerConfigScreen({ config, onSave, onClose }: TimerConfigScreenProps) {
  const [localConfig, setLocalConfig] = useState<TimerConfig>(config);

  // Calculate hours, minutes, seconds from total seconds
  const hours = Math.floor(localConfig.durationSeconds / 3600);
  const minutes = Math.floor((localConfig.durationSeconds % 3600) / 60);
  const seconds = localConfig.durationSeconds % 60;

  const updateDuration = (h: number, m: number, s: number) => {
    const total = h * 3600 + m * 60 + s;
    setLocalConfig({ ...localConfig, durationSeconds: Math.max(1, total) });
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[--timer-background] border border-[--timer-border] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[--timer-card] border-b border-[--timer-border] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-['Uncut_Sans'] font-bold text-[--timer-foreground]">
            Timer Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[--timer-muted] transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-[--timer-muted-foreground]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Duration Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-[--timer-primary]" />
              <h3 className="text-lg font-['Uncut_Sans'] font-semibold text-[--timer-foreground]">
                Duration
              </h3>
            </div>

            {/* Preset times */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setLocalConfig({ ...localConfig, durationSeconds: preset.seconds })}
                  className={`p-3 border font-['Uncut_Sans'] text-sm transition-colors ${
                    localConfig.durationSeconds === preset.seconds
                      ? "border-[--timer-primary] bg-[--timer-primary]/10 text-[--timer-primary]"
                      : "border-[--timer-border] bg-[--timer-card] text-[--timer-foreground] hover:border-[--timer-muted-foreground]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom time inputs */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => updateDuration(parseInt(e.target.value) || 0, minutes, seconds)}
                  className="w-full bg-[--timer-card] border border-[--timer-border] px-4 py-3 text-[--timer-foreground] font-['Hacked_KerX'] text-lg focus:outline-none focus:border-[--timer-primary]"
                />
              </div>
              <div>
                <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => updateDuration(hours, parseInt(e.target.value) || 0, seconds)}
                  className="w-full bg-[--timer-card] border border-[--timer-border] px-4 py-3 text-[--timer-foreground] font-['Hacked_KerX'] text-lg focus:outline-none focus:border-[--timer-primary]"
                />
              </div>
              <div>
                <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                  Seconds
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => updateDuration(hours, minutes, parseInt(e.target.value) || 0)}
                  className="w-full bg-[--timer-card] border border-[--timer-border] px-4 py-3 text-[--timer-foreground] font-['Hacked_KerX'] text-lg focus:outline-none focus:border-[--timer-primary]"
                />
              </div>
            </div>
          </section>

          {/* Color Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-[--timer-primary]" />
              <h3 className="text-lg font-['Uncut_Sans'] font-semibold text-[--timer-foreground]">
                Colors
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                  Primary Color (Digits & Brackets)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setLocalConfig({ ...localConfig, primaryColor: preset.value })}
                      className={`p-3 border font-['Uncut_Sans'] text-sm transition-colors flex items-center gap-2 ${
                        localConfig.primaryColor === preset.value
                          ? "border-[--timer-primary] bg-[--timer-card]"
                          : "border-[--timer-border] bg-[--timer-card] hover:border-[--timer-muted-foreground]"
                      }`}
                    >
                      <div
                        className="w-4 h-4 border border-[--timer-border]"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span className="text-[--timer-foreground]">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={localConfig.primaryColor}
                  onChange={(e) => setLocalConfig({ ...localConfig, primaryColor: e.target.value })}
                  placeholder="oklch(0.65 0.25 37)"
                  className="w-full bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] font-mono focus:outline-none focus:border-[--timer-primary]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                    Background Color
                  </label>
                  <input
                    type="text"
                    value={localConfig.backgroundColor}
                    onChange={(e) => setLocalConfig({ ...localConfig, backgroundColor: e.target.value })}
                    className="w-full bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] font-mono focus:outline-none focus:border-[--timer-primary]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                    Border Color
                  </label>
                  <input
                    type="text"
                    value={localConfig.borderColor}
                    onChange={(e) => setLocalConfig({ ...localConfig, borderColor: e.target.value })}
                    className="w-full bg-[--timer-card] border border-[--timer-border] px-4 py-2 text-sm text-[--timer-foreground] font-mono focus:outline-none focus:border-[--timer-primary]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Display Settings */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Monitor className="w-5 h-5 text-[--timer-primary]" />
              <h3 className="text-lg font-['Uncut_Sans'] font-semibold text-[--timer-foreground]">
                Display
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                  Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["sm", "md", "lg", "xl"] as const).map((sizeOption) => (
                    <button
                      key={sizeOption}
                      onClick={() => setLocalConfig({ ...localConfig, size: sizeOption })}
                      className={`p-3 border font-['Uncut_Sans'] text-sm uppercase transition-colors ${
                        localConfig.size === sizeOption
                          ? "border-[--timer-primary] bg-[--timer-primary]/10 text-[--timer-primary]"
                          : "border-[--timer-border] bg-[--timer-card] text-[--timer-foreground] hover:border-[--timer-muted-foreground]"
                      }`}
                    >
                      {sizeOption}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-['Uncut_Sans'] text-[--timer-muted-foreground] uppercase tracking-wider mb-2">
                  Font Family
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["Hacked KerX", "Uncut Sans"] as const).map((font) => (
                    <button
                      key={font}
                      onClick={() => setLocalConfig({ ...localConfig, fontFamily: font })}
                      className={`p-3 border text-sm transition-colors ${
                        localConfig.fontFamily === font
                          ? "border-[--timer-primary] bg-[--timer-primary]/10 text-[--timer-primary]"
                          : "border-[--timer-border] bg-[--timer-card] text-[--timer-foreground] hover:border-[--timer-muted-foreground]"
                      }`}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.showBrackets}
                    onChange={(e) => setLocalConfig({ ...localConfig, showBrackets: e.target.checked })}
                    className="w-5 h-5 bg-[--timer-card] border border-[--timer-border] accent-[--timer-primary]"
                  />
                  <span className="text-sm font-['Uncut_Sans'] text-[--timer-foreground]">
                    Show Corner Brackets
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Preview */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-5 h-5 text-[--timer-primary]" />
              <h3 className="text-lg font-['Uncut_Sans'] font-semibold text-[--timer-foreground]">
                Preview
              </h3>
            </div>
            <div 
              className="p-8 border border-[--timer-border] flex items-center justify-center"
              style={{
                backgroundColor: localConfig.backgroundColor,
              }}
            >
              <div className="text-center">
                <div 
                  className="text-6xl font-bold mb-2"
                  style={{
                    color: localConfig.primaryColor,
                    fontFamily: localConfig.fontFamily,
                  }}
                >
                  {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </div>
                <div 
                  className="text-xs uppercase tracking-widest"
                  style={{ color: localConfig.mutedColor }}
                >
                  {localConfig.size} · {localConfig.fontFamily} · {localConfig.showBrackets ? "Brackets ON" : "Brackets OFF"}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[--timer-card] border-t border-[--timer-border] p-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-[--timer-border] bg-transparent text-[--timer-foreground] font-['Uncut_Sans'] hover:bg-[--timer-muted] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 border border-[--timer-primary] text-[--timer-foreground] font-['Uncut_Sans'] transition-colors"
            style={{ backgroundColor: localConfig.primaryColor }}
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
