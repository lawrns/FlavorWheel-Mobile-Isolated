'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStatistics } from '@/hooks/use-statistics'

interface LandingPageProps {
  params: {
    locale: string
  }
}

export default function LandingPage({ params }: LandingPageProps) {
  const router = useRouter()
  const locale = params.locale || 'en'
  const _rotWords = ['coffee','spirits','wine','beer','tea'];
  const [rotIdx,setRotIdx] = useState(0);

  // Get dynamic statistics
  const { statistics, loading: statsLoading } = useStatistics({
    refreshInterval: 300000, // Refresh every 5 minutes
    enableRealtime: true
  })

  useEffect(()=>{ const el=document.getElementById('fw-rot-word'); if(el) el.textContent=_rotWords[0]; const t=setInterval(()=>{ setRotIdx(i=>{ const n=(i+1)%_rotWords.length; const node=document.getElementById('fw-rot-word'); if(node) node.textContent=_rotWords[n]; return n; }); },2200); return ()=>clearInterval(t); },[])

  const handleIconClick = (route: string) => {
    router.push(route)
  }

  return (
    <div className="relative min-h-screen overflow-hidden page-bg-primary">
      {/* Background */}
      <svg aria-hidden='true' className='pointer-events-none select-none absolute inset-0 w-full h-full' viewBox='0 0 1440 3120' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='#4A1F1A'/><stop offset='55%' stop-color='#6C3B2A'/><stop offset='85%' stop-color='#2C3A31'/><stop offset='100%' stop-color='#1C1F1C'/></linearGradient><filter id='b' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='40'/></filter><linearGradient id='gold' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#D7B76E' stop-opacity='.20'/><stop offset='1' stop-color='#C6A456' stop-opacity='.05'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><g filter='url(#b)' opacity='.45'><path d='M200 2800 C 400 2400, 1040 2500, 1240 2100' fill='none' stroke='url(#gold)' stroke-width='140' stroke-linecap='round'/><path d='M-60 2200 C 240 1850, 900 1900, 1160 1500' fill='none' stroke='url(#gold)' stroke-width='110' stroke-linecap='round'/><path d='M80 1400 C 360 1180, 1080 1120, 1320 840' fill='none' stroke='url(#gold)' stroke-width='120' stroke-linecap='round'/></g><g filter='url(#b)' opacity='.22' fill='#F5EFE6'><path d='M990 980 c0 70 -60 120 -140 120 -80 0 -140 -50 -140 -120 0 -30 10 -60 30 -80 h220 c20 20 30 50 30 80z'/><rect x='840' y='1090' width='60' height='110' rx='30'/><rect x='820' y='1200' width='100' height='18' rx='9'/><ellipse cx='310' cy='1960' rx='70' ry='44'/><ellipse cx='370' cy='2010' rx='62' ry='40'/><path d='M520 2420 q120 -120 220 -10 q100 110 -40 220' fill='none' stroke='#F5EFE6' stroke-width='26' stroke-linecap='round'/></g></svg>

      {/* Gradient overlay */}
      <div className="absolute inset-0 fw-bg-overlay" />

      {/* Header */}
      <header className="relative z-10 h-[var(--fw-header-h)] flex items-center justify-center">
        <div className="card-premium px-6 py-3 animate-fade-in-up">
          <h1 className="text-display text-gradient-warm fw-text-shadow">
            FLAVATIX
          </h1>
        </div>
        <span className="sr-only">FlavorWheel landing</span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-10 pb-16 flex flex-col items-center text-center">
        {/* Hero Section */}
        <div className="animate-fade-in-up animate-delay-200">
          <h2 className="text-hero fw-text-shadow max-w-[18ch] mx-auto mb-8">
            Discover the World in<br/>
            <span className="text-gradient-accent">Every Sip</span>
          </h2>

          {/* Rotating Subline */}
          <p aria-live='polite' className='text-body-large text-[rgba(245,239,230,0.92)] fw-text-shadow mb-12'>
            <span>Discover the art of </span>
            <span id='fw-rot-word' className='text-gradient-accent text-title font-semibold align-baseline'>coffee</span>
            <span> tasting</span>
          </p>
        </div>

        {/* Icon Grid */}
        <section aria-label="Primary actions" className="grid grid-cols-2 gap-6 w-full max-w-[420px] mx-auto animate-fade-in-up animate-delay-400">
          {/* Flavor Wheels */}
          <button
            onClick={() => handleIconClick(`/${locale}/flavor-wheels`)}
            className="group aspect-square card-beautiful hover:card-premium flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Explore Flavor Wheels"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--fx-accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="transition-all duration-300 group-hover:stroke-[var(--fx-accent-hover)] drop-shadow-[0_0_14px_rgba(212,175,55,0.22)]">
              <circle cx="12" cy="12" r="8"/>
              <path d="M12 4v16M4 12h16"/>
              <path d="M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" opacity=".65"/>
            </svg>
          </button>

          {/* Quick Tasting */}
          <button
            onClick={() => handleIconClick('/quick-tasting')}
            className="group aspect-square card-beautiful hover:card-premium flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Start Quick Tasting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--fx-primary)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="transition-all duration-300 group-hover:stroke-[var(--fx-primary-hover)] drop-shadow-[0_0_14px_rgba(74,107,74,0.22)]">
              <path d="M7 3h10l-1 7a6 6 0 0 1-8 0L7 3z"/>
              <path d="M12 14v5"/>
              <path d="M8 21h8"/>
            </svg>
          </button>

          {/* Social Community */}
          <button
            onClick={() => handleIconClick(`/${locale}/social`)}
            className="group aspect-square card-beautiful hover:card-premium flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Join Social Community"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--fx-accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="transition-all duration-300 group-hover:stroke-[var(--fx-accent-hover)] drop-shadow-[0_0_14px_rgba(212,175,55,0.22)]">
              <path d="M16 4h.01M16 20h.01M8 8l8 8M8 16l8-8"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </button>

          {/* Reviews */}
          <button
            onClick={() => handleIconClick(`/${locale}/review`)}
            className="group aspect-square card-beautiful hover:card-premium flex items-center justify-center transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Read Reviews"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--fx-primary)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="transition-all duration-300 group-hover:stroke-[var(--fx-primary-hover)] drop-shadow-[0_0_14px_rgba(74,107,74,0.22)]">
              <rect x="5" y="3" width="12" height="18" rx="2"/>
              <path d="M9 7h6M9 11h6M9 15h4"/>
              <path d="M5 8h-1M5 12h-1M5 16h-1"/>
            </svg>
          </button>
        </section>

        {/* Auth Buttons */}
        <div className="mt-12 flex items-center justify-center gap-4 animate-fade-in-up animate-delay-500">
          <button
            onClick={() => router.push(`/${locale}/login`)}
            className="btn-secondary-beautiful px-6 py-3 text-body font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Log in to your account"
          >
            Log in
          </button>
          <button
            onClick={() => router.push(`/${locale}/register`)}
            className="btn-accent-beautiful px-6 py-3 text-body font-semibold transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent/50"
            aria-label="Create a new account"
          >
            Create account
          </button>
        </div>
      </main>
    </div>
  )
}
