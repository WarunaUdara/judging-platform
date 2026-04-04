import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { DEFAULT_CONFIG } from "@/components/timer/TimerConfigScreen";

describe("timer implementation behavior checks", () => {
  it("uses the current TimerConfig shape and sane defaults", () => {
    expect(DEFAULT_CONFIG).toMatchObject({
      durationSeconds: 2 * 60 * 60,
      size: "xl",
      showBrackets: true,
      fontFamily: "Hacked KerX",
    });

    expect(DEFAULT_CONFIG.durationSeconds).toBeGreaterThanOrEqual(1);
    expect(DEFAULT_CONFIG.primaryColor).toContain("oklch(");
    expect(DEFAULT_CONFIG.backgroundColor).toContain("oklch(");
  });

  it("uses auto day visibility in FlipClock from TimerApp", () => {
    const timerAppSource = readFileSync(
      join(process.cwd(), "components/timer/TimerApp.tsx"),
      "utf8"
    );

    expect(timerAppSource).toContain('showDays="auto"');
  });

  it("persists config with the current storage key", () => {
    const timerAppSource = readFileSync(
      join(process.cwd(), "components/timer/TimerApp.tsx"),
      "utf8"
    );

    expect(timerAppSource).toContain('const STORAGE_KEY = "cryptx-timer-config"');
    expect(timerAppSource).toContain("localStorage.getItem(STORAGE_KEY)");
    expect(timerAppSource).toContain("localStorage.setItem(STORAGE_KEY");
  });

  it("keeps current control fade and background behavior", () => {
    const timerAppSource = readFileSync(
      join(process.cwd(), "components/timer/TimerApp.tsx"),
      "utf8"
    );

    expect(timerAppSource).toContain("}, 3000)");
    expect(timerAppSource).toContain('src="/timer_background.webp"');
  });
});
