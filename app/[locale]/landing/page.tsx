'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()
  const _rotWords = ['coffee','spirits','wine','beer','tea'];
  const [rotIdx,setRotIdx] = useState(0);
  useEffect(()=>{ const el=document.getElementById('fw-rot-word'); if(el) el.textContent=_rotWords[0]; const t=setInterval(()=>{ setRotIdx(i=>{ const n=(i+1)%_rotWords.length; const node=document.getElementById('fw-rot-word'); if(node) node.textContent=_rotWords[n]; return n; }); },2200); return ()=>clearInterval(t); },[])

  const handleIconClick = (route: string) => {
    router.push(route)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <svg aria-hidden='true' className='pointer-events-none select-none absolute inset-0 w-full h-full' viewBox='0 0 1440 3120' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stop-color='#4A1F1A'/><stop offset='55%' stop-color='#6C3B2A'/><stop offset='85%' stop-color='#2C3A31'/><stop offset='100%' stop-color='#1C1F1C'/></linearGradient><filter id='b' x='-20%' y='-20%' width='140%' height='140%'><feGaussianBlur stdDeviation='40'/></filter><linearGradient id='gold' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#D7B76E' stop-opacity='.20'/><stop offset='1' stop-color='#C6A456' stop-opacity='.05'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><g filter='url(#b)' opacity='.45'><path d='M200 2800 C 400 2400, 1040 2500, 1240 2100' fill='none' stroke='url(#gold)' stroke-width='140' stroke-linecap='round'/><path d='M-60 2200 C 240 1850, 900 1900, 1160 1500' fill='none' stroke='url(#gold)' stroke-width='110' stroke-linecap='round'/><path d='M80 1400 C 360 1180, 1080 1120, 1320 840' fill='none' stroke='url(#gold)' stroke-width='120' stroke-linecap='round'/></g><g filter='url(#b)' opacity='.22' fill='#F5EFE6'><path d='M990 980 c0 70 -60 120 -140 120 -80 0 -140 -50 -140 -120 0 -30 10 -60 30 -80 h220 c20 20 30 50 30 80z'/><rect x='840' y='1090' width='60' height='110' rx='30'/><rect x='820' y='1200' width='100' height='18' rx='9'/><ellipse cx='310' cy='1960' rx='70' ry='44'/><ellipse cx='370' cy='2010' rx='62' ry='40'/><path d='M520 2420 q120 -120 220 -10 q100 110 -40 220' fill='none' stroke='#F5EFE6' stroke-width='26' stroke-linecap='round'/></g></svg>

      {/* Gradient overlay */}
      <div className="absolute inset-0 fw-bg-overlay" />

      {/* Header */}
      <header className="relative z-10 h-[var(--fw-header-h)] flex items-center justify-center">
        <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/5 shadow-[var(--fw-shadow-soft)]">
          <h1 className="font-[var(--fw-poetic-serif,_Playfair_Display)] text-[22px] fw-gradient-cream-gold fw-text-shadow">
            FLAVATIX
          </h1>
        </div>
        <span className="sr-only">FlavorWheel landing</span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-10 pb-16 flex flex-col items-center text-center">
        {/* Slogan */}
        <h2 className="font-[var(--fw-poetic-serif,_Playfair_Display)] text-[30px] leading-tight fw-gradient-cream-gold fw-text-shadow max-w-[16ch] mx-auto mb-6">
          Discover the World in<br/>Every Sip
        </h2>

        {/* Rotating Subline */}
        <p aria-live='polite' className='mt-2 text-[17px] text-[rgba(245,239,230,0.92)] fw-text-shadow'>
          <span>Discover the art of </span>
          <span id='fw-rot-word' className='fw-rot-word text-[20px] font-semibold align-baseline'>coffee</span>
          <span> tasting</span>
        </p>

        {/* Icon Grid */}
        <section aria-label="Primary actions" className="grid grid-cols-2 gap-6 w-full max-w-[400px] mx-auto mt-6">
          {/* Flavor Wheels */}
          <button
            onClick={() => handleIconClick('/wheels')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.35)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Explore Flavor Wheels"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D7B76E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="drop-shadow-[0_0_14px_rgba(215,183,110,.22)]">
              <circle cx="12" cy="12" r="8"/>
              <path d="M12 4v16M4 12h16"/>
              <path d="M6.3 6.3l11.4 11.4M17.7 6.3L6.3 17.7" opacity=".65"/>
            </svg>
          </button>

          {/* Quick Tasting */}
          <button
            onClick={() => handleIconClick('/quick-tasting')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.35)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Start Quick Tasting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D7B76E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="drop-shadow-[0_0_14px_rgba(215,183,110,.22)]">
              <path d="M7 3h10l-1 7a6 6 0 0 1-8 0L7 3z"/>
              <path d="M12 14v5"/>
              <path d="M8 21h8"/>
            </svg>
          </button>

          {/* Reviews */}
          <button
            onClick={() => handleIconClick('/review')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.35)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Write Reviews"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D7B76E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="drop-shadow-[0_0_14px_rgba(215,183,110,.22)]">
              <rect x="5" y="3" width="12" height="18" rx="2"/>
              <path d="M9 7h6M9 11h6M9 15h4"/>
              <path d="M5 8h-1M5 12h-1M5 16h-1"/>
            </svg>
          </button>

          {/* Quick Tasting (Speed Mode) */}
          <button
            onClick={() => handleIconClick('/quick-tasting?speed=true')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,.35)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Speed Tasting"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D7B76E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" className="drop-shadow-[0_0_14px_rgba(215,183,110,.22)]">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/>
            </svg>
          </button>
        </section>

        {/* Auth Buttons */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => router.push('/login')}
            className="btn-ghost px-5 py-2.5 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Log in to your account"
          >
            Log in
          </button>
          <button
            onClick={() => router.push('/register')}
            className="btn-ghost px-5 py-2.5 rounded-full text-fw-gold-400 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Create a new account"
          >
            Create account
          </button>
        </div>
      </main>
    </div>
  )
}
