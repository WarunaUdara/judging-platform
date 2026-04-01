import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

declare const self: typeof globalThis & {
  __SW_MANIFEST: (import("serwist").PrecacheEntry | string)[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();
