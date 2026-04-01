import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  additionalPrecacheEntries: [{ url: "/timer", revision: "timer-route-v1" }],
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

export default withSerwist(nextConfig);
