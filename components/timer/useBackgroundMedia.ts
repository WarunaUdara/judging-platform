"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StoredMediaMeta } from "./timerTypes";

const DB_NAME = "timer-media-db";
const DB_VERSION = 1;
const STORE = "media";
const FILE_KEY = "background";
const META_KEY = "background-meta";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function useBackgroundMedia() {
  const [mediaURL, setMediaURL] = useState<string | null>(null);
  const [meta, setMeta] = useState<StoredMediaMeta | null>(null);
  const objectURLRef = useRef<string | null>(null);

  const revokeURL = useCallback(() => {
    if (objectURLRef.current) {
      URL.revokeObjectURL(objectURLRef.current);
      objectURLRef.current = null;
    }
  }, []);

  const saveMedia = useCallback(
    async (file: File) => {
      if (typeof window === "undefined") {
        return;
      }

      revokeURL();

      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, "readwrite");
        tx.objectStore(STORE).put(file, FILE_KEY);
        tx.objectStore(STORE).put(
          { name: file.name, size: file.size, type: file.type } satisfies StoredMediaMeta,
          META_KEY,
        );
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      const url = URL.createObjectURL(file);
      objectURLRef.current = url;
      setMediaURL(url);
      setMeta({ name: file.name, size: file.size, type: file.type });
    },
    [revokeURL],
  );

  const loadMedia = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const db = await openDB();
      const result = await new Promise<File | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(FILE_KEY);
        req.onsuccess = () => resolve(req.result as File | undefined);
        req.onerror = () => reject(req.error);
      });

      const savedMeta = await new Promise<StoredMediaMeta | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, "readonly");
        const req = tx.objectStore(STORE).get(META_KEY);
        req.onsuccess = () => resolve(req.result as StoredMediaMeta | undefined);
        req.onerror = () => reject(req.error);
      });

      if (result) {
        revokeURL();
        const url = URL.createObjectURL(result);
        objectURLRef.current = url;
        setMediaURL(url);
      }

      setMeta(savedMeta ?? null);
    } catch {
      // Ignore IndexedDB failures.
    }
  }, [revokeURL]);

  const clearMedia = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    revokeURL();
    setMediaURL(null);
    setMeta(null);

    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(FILE_KEY);
      tx.objectStore(STORE).delete(META_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }, [revokeURL]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMedia();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      revokeURL();
    };
  }, [loadMedia, revokeURL]);

  return { mediaURL, meta, saveMedia, clearMedia };
}
