import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Timer",
  description: "Fullscreen countdown timer for live events",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Event Timer",
  },
};

export default function TimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
