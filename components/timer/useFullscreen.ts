"use client";

import { RefObject, useEffect, useState } from "react";

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type WebkitDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = async () => {
    const el = (ref.current ?? document.documentElement) as FullscreenElement;

    try {
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        await el.webkitRequestFullscreen();
      }
    } catch {
      // Ignore unsupported or denied fullscreen requests.
    }
  };

  const exit = async () => {
    const webkitDocument = document as WebkitDocument;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (webkitDocument.webkitExitFullscreen) {
        await webkitDocument.webkitExitFullscreen();
      }
    } catch {
      // Ignore failed exits.
    }
  };

  useEffect(() => {
    const handler = () => {
      const webkitDocument = document as WebkitDocument;
      setIsFullscreen(Boolean(document.fullscreenElement ?? webkitDocument.webkitFullscreenElement));
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler as EventListener);

    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler as EventListener);
    };
  }, []);

  return { isFullscreen, enter, exit };
}
