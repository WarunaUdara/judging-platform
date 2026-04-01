import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#333333] sticky top-0 z-50 bg-black">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">CryptX</span>
            <span className="text-[#888888]">/</span>
            <span className="text-[#888888]">Judging</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <p className="text-sm text-[#888888] uppercase tracking-widest">
              Hackathon Judging Platform
            </p>
            
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
              Score. Rank. Decide.
            </h1>
            
            <p className="text-lg md:text-xl text-[#a1a1a1] max-w-xl mx-auto">
              Real-time weighted scoring and live leaderboards for hackathon competitions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/login">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-[#333333]">
          <div className="container mx-auto px-4 py-20">
            <div className="grid md:grid-cols-3 gap-px bg-[#333333]">
              <div className="bg-black p-8 md:p-10">
                <p className="text-sm text-[#888888] mb-3">01</p>
                <h3 className="text-lg font-medium mb-3">Multi-Competition</h3>
                <p className="text-[#888888] text-sm leading-relaxed">
                  Manage multiple events with custom criteria, team sizes, and evaluator pools.
                </p>
              </div>

              <div className="bg-black p-8 md:p-10">
                <p className="text-sm text-[#888888] mb-3">02</p>
                <h3 className="text-lg font-medium mb-3">Weighted Scoring</h3>
                <p className="text-[#888888] text-sm leading-relaxed">
                  Define criteria weights with precision. Scores calculate in real-time.
                </p>
              </div>

              <div className="bg-black p-8 md:p-10">
                <p className="text-sm text-[#888888] mb-3">03</p>
                <h3 className="text-lg font-medium mb-3">Live Leaderboard</h3>
                <p className="text-[#888888] text-sm leading-relaxed">
                  Instant rank updates via Firebase Realtime Database. Zero polling.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t border-[#333333]">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-wrap justify-center items-center gap-8 text-[#888888] text-sm">
              <span>Next.js</span>
              <span className="text-[#333333]">/</span>
              <span>Firebase</span>
              <span className="text-[#333333]">/</span>
              <span>Vercel</span>
              <span className="text-[#333333]">/</span>
              <span>TypeScript</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333] py-8 bg-black">
        <div className="container mx-auto px-4 text-center text-[#888888] text-sm">
          <p>
            Built for{' '}
            <a 
              href="https://cryptx.lk" 
              className="text-white hover:text-[#c0c0c0] transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              CryptX
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
