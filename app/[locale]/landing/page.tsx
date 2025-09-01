'use client'

import { Sparkles, Plus, MessageCircle, Target, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  // Mock data for overview metrics (would come from API in real app)
  const metrics = {
    tastings: 12,
    score: 87,
    streak: 5
  }

  return (
    <div
      className="overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        backgroundImage: 'url(/images/Landing%20BG%20HD.png)',
        minHeight: '100vh'
      }}
    >
      <main id="landing" className="px-6 py-8 max-w-sm mx-auto min-h-screen pb-32 relative">
        {/* Backdrop overlay for better text readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl mx-4 mt-4 mb-8"></div>

        {/* Content wrapper with proper z-index */}
        <div className="relative z-10">
        {/* Hero Section */}
        <section className="hero mb-8">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-black mb-3">
              Welcome back
            </h1>
            <p className="text-base text-gray-600">
              Explore the world of flavors
            </p>
          </div>
        </section>

        {/* CTA Stack */}
        <nav className="cta-stack space-y-4 mb-8" role="nav" aria-label="Primary actions">
          <button
            onClick={() => router.push('/quick-tasting')}
            className="w-full bg-black text-white rounded-xl py-4 px-4 flex items-center justify-between text-xl font-bold hover:bg-gray-800 transition-colors"
            aria-label="Start a quick tasting"
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <span>Quick Taste</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => router.push('/create')}
            className="w-full bg-black text-white rounded-xl py-4 px-4 flex items-center justify-between text-xl font-bold hover:bg-gray-800 transition-colors"
            aria-label="Create a tasting session"
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-3">
              <Plus className="h-6 w-6" />
              <span>Create Tasting</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => router.push('/review')}
            className="w-full bg-black text-white rounded-xl py-4 px-4 flex items-center justify-between text-xl font-bold hover:bg-gray-800 transition-colors"
            aria-label="Write a review"
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6" />
              <span>Review</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => router.push('/wheels')}
            className="w-full bg-black text-white rounded-xl py-4 px-4 flex items-center justify-between text-xl font-bold hover:bg-gray-800 transition-colors"
            aria-label="Browse flavor wheels"
            style={{ minHeight: '48px' }}
          >
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6" />
              <span>Flavor Wheels</span>
            </div>
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>

        {/* Overview Card */}
        <section className="overview-card">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-black mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">
                  {metrics.tastings}
                </div>
                <div className="text-sm text-gray-600">
                  Tastings
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">
                  {metrics.score}
                </div>
                <div className="text-sm text-gray-600">
                  Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">
                  {metrics.streak}
                </div>
                <div className="text-sm text-gray-600">
                  Streak
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Spacer for bottom navigation */}
        <div className="h-32"></div>
        </div>
      </main>
    </div>
  )
}
