"use client";

import { useState } from "react";
import type { AppPhase } from "./timerTypes";
import SetupScreen from "./SetupScreen";
import TimerDisplay from "./TimerDisplay";
import { useBackgroundMedia } from "./useBackgroundMedia";
import { useTimerStorage } from "./useTimerStorage";

export default function TimerApp() {
  const [phase, setPhase] = useState<AppPhase>("setup");
  const { config, saveConfig, loaded } = useTimerStorage();
  const { mediaURL, meta, saveMedia, clearMedia } = useBackgroundMedia();

  if (!loaded) {
    return null;
  }

  return phase === "setup" ? (
    <SetupScreen
      config={config}
      mediaURL={mediaURL}
      mediaMeta={meta}
      onSaveMedia={saveMedia}
      onClearMedia={clearMedia}
      onSave={saveConfig}
      onStart={() => setPhase("running")}
    />
  ) : (
    <TimerDisplay config={config} mediaURL={mediaURL} onBack={() => setPhase("setup")} />
  );
}
