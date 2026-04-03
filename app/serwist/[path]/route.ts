import { createSerwistRoute } from "@serwist/turbopack";

const revision = "timer-route-v1";

export const {
  dynamic,
  dynamicParams,
  revalidate,
  generateStaticParams,
  GET,
} = createSerwistRoute({
  swSrc: "app/sw.ts",
  additionalPrecacheEntries: [{ url: "/timer", revision }],
  useNativeEsbuild: true,
});
