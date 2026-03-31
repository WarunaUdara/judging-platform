import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Users, BarChart3, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold">CryptX Judging</span>
          </div>
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Powered by Firebase & Next.js</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent leading-tight">
              Judging Platform for Modern Hackathons
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Real-time scoring, weighted criteria, and live leaderboards. 
              Built for CryptX and beyond.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="text-base">
                  Get Started
                </Button>
              </Link>
              <a href="https://cryptx.lk" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="text-base">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 border-t border-gray-800">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-blue-500/50 transition-all">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Multi-Competition Support</h3>
              <p className="text-gray-400">
                Manage multiple hackathons with different criteria, team sizes, and evaluators.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-green-500/50 transition-all">
              <BarChart3 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Weighted Scoring</h3>
              <p className="text-gray-400">
                Configure custom criteria with precise weights. Live calculation as evaluators score.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-purple-500/50 transition-all">
              <Trophy className="w-12 h-12 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Leaderboard</h3>
              <p className="text-gray-400">
                Instant updates via Firebase Realtime Database. No polling, no delays.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 bg-black/50">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Built for <a href="https://cryptx.lk" className="text-blue-400 hover:underline">CryptX</a></p>
        </div>
      </footer>
    </div>
  );
}
