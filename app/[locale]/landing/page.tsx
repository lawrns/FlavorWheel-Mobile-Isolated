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
      <img
        src="/landing/fw-lounge-bg.svg"
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 fw-bg-overlay" />

      {/* Header */}
      <header className="relative z-10 h-[var(--fw-header-h)] flex items-center justify-center">
        <div className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/5 shadow-[var(--fw-shadow-soft)]">
          <h1 className="font-poetic text-[22px] tracking-wide fw-gradient-cream-gold fw-text-shadow">
            FLAVATIX
          </h1>
        </div>
        <span className="sr-only">FlavorWheel landing</span>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 pt-10 pb-16 flex flex-col items-center text-center">
        {/* Slogan */}
        <h2 className="font-poetic text-[32px] leading-tight fw-gradient-cream-gold fw-text-shadow max-w-[16ch] mx-auto mb-6">
          Discover the World in<br/>Every Sip
        </h2>

        {/* Rotating Subline */}
        <p aria-live='polite' className='mt-2 text-[17px] text-[rgba(245,239,230,0.92)] fw-text-shadow'>
          <span>Discover the art of </span>
          <span id='fw-rot-word' className='fw-rot-word text-[19px] font-semibold align-baseline'></span>
          <span> tasting</span>
        </p>

        {/* Icon Grid */}
        <section aria-label="Primary actions" className="grid grid-cols-2 gap-6 w-full max-w-[400px] mx-auto mt-6">
          {/* Flavor Wheels */}
          <button
            onClick={() => handleIconClick('/wheels')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[var(--fw-shadow-soft)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Explore Flavor Wheels"
          >
            <img
              src="/landing/ic-wheel.svg"
              alt=""
              aria-hidden
              className="w-12 h-12 fw-gold-glow"
            />
          </button>

          {/* Quick Tasting */}
          <button
            onClick={() => handleIconClick('/quick-tasting')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[var(--fw-shadow-soft)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Start Quick Tasting"
          >
            <img
              src="/landing/ic-glass.svg"
              alt=""
              aria-hidden
              className="w-12 h-12 fw-gold-glow"
            />
          </button>

          {/* Reviews */}
          <button
            onClick={() => handleIconClick('/review')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[var(--fw-shadow-soft)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Write Reviews"
          >
            <img
              src="/landing/ic-notebook.svg"
              alt=""
              aria-hidden
              className="w-12 h-12 fw-gold-glow"
            />
          </button>

          {/* Quick Tasting (Speed Mode) */}
          <button
            onClick={() => handleIconClick('/quick-tasting?speed=true')}
            className="aspect-square rounded-3xl backdrop-blur-md bg-white/6 border border-white/15 shadow-[var(--fw-shadow-soft)] hover:shadow-2xl transition-transform active:scale-[.98] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[var(--fw-gold-500)]/50"
            aria-label="Speed Tasting"
          >
            <img
              src="/landing/ic-bolt.svg"
              alt=""
              aria-hidden
              className="w-12 h-12 fw-gold-glow"
            />
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
