import {
  ArrowRight,
  Cloud,
  Code2,
  Database,
  FileCode,
  Layers,
  Scale,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-[#333333] border-b bg-black/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image
              alt="CryptX Logo"
              className="object-contain"
              height={40}
              src="/logo.webp"
              width={40}
            />
            <span className="font-semibold text-xl tracking-tight">CryptX</span>
            <span className="text-[#333333]">/</span>
            <span className="text-[#888888]">Judging</span>
          </div>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-4xl space-y-8 text-center">
            {/* Hero Logo */}
            <div className="mb-4 flex justify-center">
              <Image
                alt="CryptX Logo"
                className="object-contain"
                height={140}
                priority
                src="/logo.webp"
                width={140}
              />
            </div>

            <p className="font-medium text-[#a1a1aa] text-sm uppercase tracking-[0.2em]">
              Hackathon Judging Platform
            </p>

            <h1 className="font-semibold text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Score. Rank. Decide.
            </h1>

            <p className="mx-auto max-w-2xl text-[#a1a1aa] text-lg leading-relaxed md:text-xl">
              Real-time weighted scoring and live leaderboards for hackathon
              competitions. Built for organizers who need precision.
            </p>

            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Link href="/login">
                <Button size="xl" variant="cta">
                  Get Started
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="xl" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-[#333333] border-t" id="features">
          <div className="container mx-auto px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="mb-12 text-center md:mb-16">
              <h2 className="mb-4 font-semibold text-2xl md:text-3xl">
                Everything you need
              </h2>
              <p className="mx-auto max-w-lg text-[#a1a1aa]">
                A complete judging solution designed for hackathons of any
                scale.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-px bg-[#333333] md:grid-cols-3">
              <div className="flex flex-col bg-black p-8 md:p-10">
                <div className="mb-6 flex h-10 w-10 items-center justify-center border border-[#333333]">
                  <Layers className="h-5 w-5 text-[#f54e00]" />
                </div>
                <p className="mb-3 font-medium text-[#c0c0c0] text-xs tracking-widest">
                  01
                </p>
                <h3 className="mb-3 font-semibold text-lg text-white">
                  Multi-Competition
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Manage multiple events simultaneously with custom criteria,
                  team sizes, and dedicated evaluator pools for each
                  competition.
                </p>
              </div>

              <div className="flex flex-col bg-black p-8 md:p-10">
                <div className="mb-6 flex h-10 w-10 items-center justify-center border border-[#333333]">
                  <Scale className="h-5 w-5 text-[#f54e00]" />
                </div>
                <p className="mb-3 font-medium text-[#c0c0c0] text-xs tracking-widest">
                  02
                </p>
                <h3 className="mb-3 font-semibold text-lg text-white">
                  Weighted Scoring
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Define criteria weights with precision. Scores calculate in
                  real-time with automatic weighted averages and normalization.
                </p>
              </div>

              <div className="flex flex-col bg-black p-8 md:p-10">
                <div className="mb-6 flex h-10 w-10 items-center justify-center border border-[#333333]">
                  <Zap className="h-5 w-5 text-[#f54e00]" />
                </div>
                <p className="mb-3 font-medium text-[#c0c0c0] text-xs tracking-widest">
                  03
                </p>
                <h3 className="mb-3 font-semibold text-lg text-white">
                  Live Leaderboard
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Instant rank updates powered by Supabase Realtime. Zero
                  polling, zero delays. See results as they happen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-[#333333] border-t">
          <div className="container mx-auto px-4 py-12 sm:px-6 md:py-16 lg:px-8">
            <p className="mb-8 text-center text-[#71717a] text-xs uppercase tracking-widest">
              Built with
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <div className="flex items-center gap-2 text-[#888888]">
                <Code2 className="h-5 w-5" />
                <span className="font-medium text-sm">Next.js</span>
              </div>
              <div className="hidden text-[#333333] sm:block">|</div>
              <div className="flex items-center gap-2 text-[#888888]">
                <Database className="h-5 w-5" />
                <span className="font-medium text-sm">Supabase</span>
              </div>
              <div className="hidden text-[#333333] sm:block">|</div>
              <div className="flex items-center gap-2 text-[#888888]">
                <Cloud className="h-5 w-5" />
                <span className="font-medium text-sm">Vercel</span>
              </div>
              <div className="hidden text-[#333333] sm:block">|</div>
              <div className="flex items-center gap-2 text-[#888888]">
                <FileCode className="h-5 w-5" />
                <span className="font-medium text-sm">TypeScript</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-[#333333] border-t">
          <div className="container mx-auto px-4 py-16 sm:px-6 md:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl space-y-6 text-center">
              <h2 className="font-semibold text-2xl md:text-3xl">
                Ready to streamline your judging?
              </h2>
              <p className="text-[#a1a1aa]">
                Set up your competition in minutes. Invite evaluators with a
                single link.
              </p>
              <Link href="/login">
                <Button className="mt-4" size="lg" variant="cta">
                  Start Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-[#333333] border-t bg-black py-8">
        <div className="container mx-auto px-4 text-center text-[#71717a] text-sm sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-2">
            <p>Hosted by ICTS - University of Sri Jayewardenepura</p>
            <p>
              Built for{" "}
              <a
                className="text-white transition-colors hover:text-[#c0c0c0]"
                href="https://cryptx.lk"
                rel="noopener noreferrer"
                target="_blank"
              >
                CryptX
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
