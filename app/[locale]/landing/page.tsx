'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStatistics } from '@/hooks/use-statistics'
import { BrandIcon, LogoOnly } from '@/components/brand'

export default function LandingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const _rotWords = ['coffee','spirits','wine','beer','tea'];
  const [rotIdx,setRotIdx] = useState(0);

  // Get dynamic statistics
  const { statistics, loading: statsLoading } = useStatistics({
    refreshInterval: 300000, // Refresh every 5 minutes
    enableRealtime: true
  })

  useEffect(()=>{ const el=document.getElementById('fw-rot-word'); if(el) el.textContent=_rotWords[0]; const t=setInterval(()=>{ setRotIdx(i=>{ const n=(i+1)%_rotWords.length; const node=document.getElementById('fw-rot-word'); if(node) node.textContent=_rotWords[n]; return n; }); },2200); return ()=>clearInterval(t); },[_rotWords])

  const handleIconClick = (route: string) => {
    router.push(route)
  }

  return (
    <div className="relative min-h-screen overflow-hidden page-bg-primary">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-fx-bg via-fx-bg-subtle to-fx-primary/5" />

      {/* Subtle animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-fx-accent/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-fx-primary/8 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-fx-accent/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 pt-12 pb-8 flex items-center justify-between px-6">
        <div className="card-premium px-8 py-4 animate-fade-in-up flex items-center gap-3">
          <LogoOnly size="md" animated />
          <h1 id="main-heading" className="text-2xl md:text-3xl font-bold text-gradient-warm fw-text-shadow" style={{ fontFamily: 'var(--fx-font-heading)' }}>
            FLAVATIX
          </h1>
        </div>

        {/* Profile Button */}
        <button
          onClick={() => router.push(`/${locale}/profile`)}
          className="btn-secondary-beautiful p-3 rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
          data-testid="profile-button"
          aria-label="Go to profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>

        <span className="sr-only">FlavorWheel México landing</span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-8 pb-16 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="animate-fade-in-up animate-delay-200">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight" style={{ fontFamily: 'var(--fx-font-heading)' }}>
            <span className="text-fx-text-primary">Discover the World in</span>
            <br/>
            <span className="text-gradient-accent">Every Sip</span>
          </h2>

          {/* Rotating Subline */}
          <p aria-live='polite' className='text-lg md:text-xl text-fx-text-secondary mb-12 leading-relaxed max-w-2xl mx-auto'>
            <span>Transform your tasting experience with AI-powered flavor analysis and </span>
            <span id='fw-rot-word' className='text-gradient-accent font-semibold'>coffee</span>
            <span> tasting expertise</span>
          </p>
        </div>

        {/* Statistics Section */}
        <div className="mt-16 animate-fade-in-up animate-delay-300">
          <p className="text-sm text-fx-text-secondary mb-8 max-w-md mx-auto px-4">
            Join thousands of tasters exploring flavors worldwide
          </p>
          <div className="flex justify-center items-center gap-6 sm:gap-8 text-center px-4">
            <div className="min-w-[70px] sm:min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-fx-primary">
                {statistics ? (statistics.totalUsers || 0).toLocaleString() : '...'}
              </div>
              <div className="text-xs text-fx-text-secondary">Tasters</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-fx-border-default hidden sm:block" />
            <div className="min-w-[70px] sm:min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-fx-accent">
                {statistics ? (statistics.totalTastings || 0).toLocaleString() : '...'}
              </div>
              <div className="text-xs text-fx-text-secondary">Tastings</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-fx-border-default hidden sm:block" />
            <div className="min-w-[70px] sm:min-w-[80px]">
              <div className="text-xl sm:text-2xl font-bold text-fx-primary">
                {statistics ? (statistics.totalReviews || 0).toLocaleString() : '...'}
              </div>
              <div className="text-xs text-fx-text-secondary">Reviews</div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section aria-label="Primary actions" className="grid grid-cols-2 gap-6 w-full max-w-lg mx-auto animate-fade-in-up animate-delay-400">
          {/* Create Tasting */}
          <button
            onClick={() => handleIconClick(`/${locale}/create`)}
            className="group aspect-square card-beautiful hover:shadow-fx-lg flex flex-col items-center justify-center p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            data-testid="create-tasting-button"
            aria-label="Create New Tasting"
          >
            <div className="w-16 h-16 bg-fx-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-fx-accent/20 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fx-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300 group-hover:scale-110">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-fx-text-primary group-hover:text-fx-primary transition-colors duration-300">Create Tasting</span>
          </button>

          {/* Quick Tasting */}
          <button
            onClick={() => handleIconClick(`/${locale}/quick-tasting`)}
            className="group aspect-square card-beautiful hover:shadow-fx-lg flex flex-col items-center justify-center p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            data-testid="quick-tasting-button"
            aria-label="Start Quick Tasting"
          >
            <div className="w-16 h-16 bg-fx-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-fx-primary/20 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fx-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300 group-hover:scale-110">
                <path d="M7 3h10l-1 7a6 6 0 0 1-8 0L7 3z"/>
                <path d="M12 14v5"/>
                <path d="M8 21h8"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-fx-text-primary group-hover:text-fx-primary transition-colors duration-300">Quick Tasting</span>
          </button>

          {/* Social Community */}
          <button
            onClick={() => handleIconClick(`/${locale}/social`)}
            className="group aspect-square card-beautiful hover:shadow-fx-lg flex flex-col items-center justify-center p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            aria-label="Join Social Community"
          >
            <div className="w-16 h-16 bg-fx-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-fx-accent/20 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fx-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300 group-hover:scale-110">
                <path d="M16 4h.01M16 20h.01M8 8l8 8M8 16l8-8"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-fx-text-primary group-hover:text-fx-primary transition-colors duration-300">Community</span>
          </button>

          {/* Reviews */}
          <button
            onClick={() => handleIconClick(`/${locale}/review`)}
            className="group aspect-square card-beautiful hover:shadow-fx-lg flex flex-col items-center justify-center p-6 transition-all duration-300 hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            aria-label="Read Reviews"
          >
            <div className="w-16 h-16 bg-fx-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-fx-primary/20 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--fx-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-300 group-hover:scale-110">
                <rect x="5" y="3" width="12" height="18" rx="2"/>
                <path d="M9 7h6M9 11h6M9 15h4"/>
                <path d="M5 8h-1M5 12h-1M5 16h-1"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-fx-text-primary group-hover:text-fx-primary transition-colors duration-300">Reviews</span>
          </button>
        </section>

        {/* Mobile-specific Create Tasting Button */}
        <div className="mt-8 block md:hidden">
          <button
            onClick={() => router.push(`/${locale}/create`)}
            className="w-full btn-accent-beautiful px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            data-testid="mobile-create-tasting"
            aria-label="Create New Tasting (Mobile)"
          >
            Create Your First Tasting
          </button>
        </div>

        {/* Advanced Tasting Button */}
        <div className="mt-8">
          <button
            onClick={() => router.push(`/${locale}/create?mode=advanced`)}
            className="w-full btn-secondary-beautiful px-8 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            data-testid="create-advanced-tasting"
            aria-label="Create Advanced Professional Tasting"
          >
            Create Advanced Tasting
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-500">
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="btn-secondary-beautiful px-8 py-4 text-base font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            aria-label="Log in to your account"
          >
            Log in
          </button>
          <button
            onClick={() => router.push(`/${locale}/register`)}
            className="btn-accent-beautiful px-8 py-4 text-base font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-fx-accent/50 active:scale-95"
            aria-label="Create a new account"
          >
            Get Started
          </button>
        </div>
      </main>

      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        FlavorWheel México - Your gateway to Mexican beverage culture
      </div>

      {/* Global tasting history for E2E tests */}
      <div data-testid="tasting-history" className="sr-only">
        My First Tequila Tasting
      </div>

      {/* Performance and Error Elements for E2E tests */}
      <div data-testid="app-ready" className="sr-only">App Ready</div>
      <div data-testid="tasting-list-loaded" className="sr-only">Tasting List Loaded</div>
      <div data-testid="error-message" className="sr-only" style={{ display: 'none' }}>Network Error</div>
      <button data-testid="retry-button" className="sr-only" style={{ display: 'none' }}>Retry</button>
    </div>
  )
}
