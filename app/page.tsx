import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layers, Scale, Zap, Code2, Database, Cloud, FileCode } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#333333] sticky top-0 z-50 bg-black/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="CryptX Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
            <span className="text-xl font-semibold tracking-tight">CryptX</span>
            <span className="text-[#333333]">/</span>
            <span className="text-[#888888]">Judging</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 lg:py-40">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <p className="text-sm text-[#a1a1aa] uppercase tracking-[0.2em] font-medium">
              Hackathon Judging Platform
            </p>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1]">
              Score. Rank. Decide.
            </h1>
            
            <p className="text-lg md:text-xl text-[#a1a1aa] max-w-2xl mx-auto leading-relaxed">
              Real-time weighted scoring and live leaderboards for hackathon competitions. 
              Built for organizers who need precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/login">
                <Button variant="cta" size="xl">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-[#333333]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4">
                Everything you need
              </h2>
              <p className="text-[#a1a1aa] max-w-lg mx-auto">
                A complete judging solution designed for hackathons of any scale.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#333333]">
              <div className="bg-black p-8 md:p-10 flex flex-col">
                <div className="w-10 h-10 border border-[#333333] flex items-center justify-center mb-6">
                  <Layers className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <p className="text-xs text-[#c0c0c0] font-medium tracking-widest mb-3">01</p>
                <h3 className="text-lg font-semibold text-white mb-3">Multi-Competition</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Manage multiple events simultaneously with custom criteria, team sizes, and dedicated evaluator pools for each competition.
                </p>
              </div>

              <div className="bg-black p-8 md:p-10 flex flex-col">
                <div className="w-10 h-10 border border-[#333333] flex items-center justify-center mb-6">
                  <Scale className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <p className="text-xs text-[#c0c0c0] font-medium tracking-widest mb-3">02</p>
                <h3 className="text-lg font-semibold text-white mb-3">Weighted Scoring</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Define criteria weights with precision. Scores calculate in real-time with automatic weighted averages and normalization.
                </p>
              </div>

              <div className="bg-black p-8 md:p-10 flex flex-col">
                <div className="w-10 h-10 border border-[#333333] flex items-center justify-center mb-6">
                  <Zap className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <p className="text-xs text-[#c0c0c0] font-medium tracking-widest mb-3">03</p>
                <h3 className="text-lg font-semibold text-white mb-3">Live Leaderboard</h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Instant rank updates powered by Firebase Realtime Database. Zero polling, zero delays. See results as they happen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="border-t border-[#333333]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
            <p className="text-xs text-[#71717a] uppercase tracking-widest text-center mb-8">
              Built with
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              <div className="flex items-center gap-2 text-[#888888]">
                <Code2 className="w-5 h-5" />
                <span className="text-sm font-medium">Next.js</span>
              </div>
              <div className="hidden sm:block text-[#333333]">|</div>
              <div className="flex items-center gap-2 text-[#888888]">
                <Database className="w-5 h-5" />
                <span className="text-sm font-medium">Firebase</span>
              </div>
              <div className="hidden sm:block text-[#333333]">|</div>
              <div className="flex items-center gap-2 text-[#888888]">
                <Cloud className="w-5 h-5" />
                <span className="text-sm font-medium">Vercel</span>
              </div>
              <div className="hidden sm:block text-[#333333]">|</div>
              <div className="flex items-center gap-2 text-[#888888]">
                <FileCode className="w-5 h-5" />
                <span className="text-sm font-medium">TypeScript</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-[#333333]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-semibold">
                Ready to streamline your judging?
              </h2>
              <p className="text-[#a1a1aa]">
                Set up your competition in minutes. Invite evaluators with a single link.
              </p>
              <Link href="/login">
                <Button variant="cta" size="lg" className="mt-4">
                  Start Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#333333] py-8 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#71717a] text-sm">
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
