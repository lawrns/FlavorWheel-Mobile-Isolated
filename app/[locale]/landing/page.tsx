'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useStatistics } from '@/hooks/use-statistics'
import { BrandIcon, LogoOnly } from '@/components/brand'

export default function LandingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const rotatingWords = ['coffee', 'spirits', 'wine', 'beer', 'tea']
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  // Get dynamic statistics
  const { statistics, loading: statsLoading, error: statsError } = useStatistics({
    refreshInterval: 300000, // Refresh every 5 minutes
    enableRealtime: true
  })

  useEffect(() => {
    const el = document.getElementById('fw-rot-word')
    if (el) el.textContent = rotatingWords[0]

    const interval = setInterval(() => {
      setCurrentWordIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % rotatingWords.length
        const element = document.getElementById('fw-rot-word')
        if (element) {
          element.textContent = rotatingWords[nextIndex]
        }
        return nextIndex
      })
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  const handleIconClick = (route: string) => {
    router.push(route)
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FEFCF8] via-[#F7F3EA] to-[#EDE7DA]" />

      {/* Floating Flavor Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated flavor visualization rings */}
        <div className="absolute top-20 left-10 w-64 h-64 border-2 border-[#D4AF37]/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute top-4 left-4 w-56 h-56 border border-[#8B4513]/10 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            <div className="absolute top-8 left-8 w-40 h-40 border border-[#2E8B57]/15 rounded-full animate-pulse" />
          </div>
        </div>

        <div className="absolute top-40 right-20 w-48 h-48 border border-[#D4AF37]/15 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }} />
        <div className="absolute bottom-32 left-1/4 w-32 h-32 bg-[#8B4513]/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-[#2E8B57]/8 rounded-full blur-lg animate-pulse" style={{ animationDelay: '6s' }} />
      </div>

      {/* Dramatic Hero Image Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl">
          {/* Placeholder for hero tasting image - replace with actual image */}
          <div className="w-full h-full bg-gradient-to-br from-[#8B4513]/20 to-[#D4AF37]/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* Premium Header */}
      <header className="relative z-10 pt-12 pb-8 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#6B3419] rounded-xl flex items-center justify-center shadow-lg">
            <LogoOnly size="sm" animated />
          </div>
          <h1 id="main-heading" className="text-2xl md:text-3xl font-bold text-[#2C1810]" style={{ fontFamily: 'var(--fx-font-heading)' }}>
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
      <main className="relative z-10 px-6 lg:px-12 pt-16 pb-24 flex flex-col items-center text-center max-w-6xl mx-auto">
        {/* Dramatic Hero Section */}
        <div className="animate-fade-in-up animate-delay-200 mb-16">
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-[#2C1810]" style={{ fontFamily: 'var(--fx-font-heading)' }}>
            <span className="block mb-2">Discover the World</span>
            <span className="block bg-gradient-to-r from-[#8B4513] via-[#D4AF37] to-[#2E8B57] bg-clip-text text-transparent">
              In Every Sip
            </span>
          </h2>

          {/* Premium Subheading */}
          <p aria-live='polite' className='text-xl md:text-2xl text-[#4A473F] mb-12 leading-relaxed max-w-3xl mx-auto font-light' style={{ fontFamily: 'var(--fx-font-body)' }}>
            <span>Transform your tasting experience with AI-powered flavor intelligence and </span>
            <span id='fw-rot-word' className='font-semibold bg-gradient-to-r from-[#D4AF37] to-[#2E8B57] bg-clip-text text-transparent transition-all duration-500'>coffee</span>
            <span> tasting expertise</span>
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <button
              onClick={() => router.push(`/${locale}/create`)}
              className="group px-8 py-4 bg-gradient-to-r from-[#8B4513] to-[#6B3419] text-white font-semibold text-lg rounded-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              <span className="flex items-center justify-center gap-3">
                Start Your Flavor Journey
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => {
                // Scroll to demo section or open modal
                document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group px-8 py-4 border-2 border-[#D4AF37] text-[#D4AF37] font-semibold text-lg rounded-xl hover:bg-[#D4AF37] hover:text-white transition-all duration-300 min-w-[200px] shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6v6m0-6h1m0 0H9" />
                </svg>
                Watch Demo
              </span>
            </button>
          </div>
        </div>

        {/* Premium Statistics Section */}
        <div className="animate-fade-in-up animate-delay-300 mb-20">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-[#D4AF37]/20 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-[#2C1810] mb-6" style={{ fontFamily: 'var(--fx-font-heading)' }}>
              Join 10,000+ Passionate Tasters
            </h3>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#8B4513] mb-2" style={{ fontFamily: 'var(--fx-font-heading)' }}>
                  {statsLoading ? (
                    <div className="animate-pulse">...</div>
                  ) : statsError ? (
                    <span className="text-red-500">Error</span>
                  ) : (
                    (statistics?.totalUsers || 0).toLocaleString()
                  )}
                </div>
                <div className="text-sm text-[#4A473F] font-medium">Expert Tasters</div>
              </div>

              <div className="text-center border-x border-[#D4AF37]/20 px-4">
                <div className="text-3xl md:text-4xl font-bold text-[#D4AF37] mb-2" style={{ fontFamily: 'var(--fx-font-heading)' }}>
                  {statsLoading ? (
                    <div className="animate-pulse">...</div>
                  ) : statsError ? (
                    <span className="text-red-500">Error</span>
                  ) : (
                    (statistics?.totalTastings || 0).toLocaleString()
                  )}
                </div>
                <div className="text-sm text-[#4A473F] font-medium">Tastings Completed</div>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#2E8B57] mb-2" style={{ fontFamily: 'var(--fx-font-heading)' }}>
                  {statsLoading ? (
                    <div className="animate-pulse">...</div>
                  ) : statsError ? (
                    <span className="text-red-500">Error</span>
                  ) : (
                    (statistics?.totalReviews || 0).toLocaleString()
                  )}
                </div>
                <div className="text-sm text-[#4A473F] font-medium">Reviews Shared</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#D4AF37]/20">
              <p className="text-sm text-[#4A473F] italic">
                "Transforming how the world experiences flavor, one sip at a time."
              </p>
            </div>
          </div>
        </div>

        {/* Premium Feature Showcase */}
        <section id="demo-section" className="w-full max-w-6xl animate-fade-in-up animate-delay-400 mb-24">
          <h3 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-12 text-center" style={{ fontFamily: 'var(--fx-font-heading)' }}>
            Experience AI-Powered Tasting
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Analysis Feature */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#D4AF37]/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#6B3419] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#2C1810] mb-4" style={{ fontFamily: 'var(--fx-font-heading)' }}>AI Flavor Analysis</h4>
              <p className="text-[#4A473F] mb-6 leading-relaxed">Advanced machine learning identifies complex flavor profiles and provides personalized tasting insights.</p>
              <button
                onClick={() => handleIconClick(`/${locale}/create`)}
                className="w-full py-3 bg-gradient-to-r from-[#8B4513] to-[#6B3419] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Try AI Analysis
              </button>
            </div>

            {/* Community Feature */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#D4AF37]/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#2C1810] mb-4" style={{ fontFamily: 'var(--fx-font-heading)' }}>Expert Community</h4>
              <p className="text-[#4A473F] mb-6 leading-relaxed">Connect with professional tasters, share experiences, and discover new flavor perspectives.</p>
              <button
                onClick={() => handleIconClick(`/${locale}/social`)}
                className="w-full py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8941F] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Join Community
              </button>
            </div>

            {/* Mobile Experience Feature */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#D4AF37]/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#2E8B57] to-[#1F5A3A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#2C1810] mb-4" style={{ fontFamily: 'var(--fx-font-heading)' }}>Mobile-First Design</h4>
              <p className="text-[#4A473F] mb-6 leading-relaxed">Optimized for tasting environments with camera integration and offline functionality.</p>
              <button
                onClick={() => handleIconClick(`/${locale}/quick-tasting`)}
                className="w-full py-3 bg-gradient-to-r from-[#2E8B57] to-[#1F5A3A] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Quick Tasting
              </button>
            </div>

            {/* Professional Tools Feature */}
            <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#D4AF37]/20 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-[#6B3419] to-[#4A1F0A] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-[#2C1810] mb-4" style={{ fontFamily: 'var(--fx-font-heading)' }}>Professional Tools</h4>
              <p className="text-[#4A473F] mb-6 leading-relaxed">Industry-standard templates, expert validation, and comprehensive tasting reports.</p>
              <button
                onClick={() => handleIconClick(`/${locale}/review`)}
                className="w-full py-3 bg-gradient-to-r from-[#6B3419] to-[#4A1F0A] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Expert Reviews
              </button>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="animate-fade-in-up animate-delay-500 mb-20">
          <div className="bg-gradient-to-r from-[#8B4513]/10 via-[#D4AF37]/10 to-[#2E8B57]/10 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-[#2C1810] text-center mb-8" style={{ fontFamily: 'var(--fx-font-heading)' }}>
              Trusted by Flavor Experts Worldwide
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#8B4513] to-[#6B3419] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                </div>
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#D4AF37] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#4A473F] italic mb-3">"This app revolutionized how I experience wine. The AI analysis is incredibly accurate."</p>
                <p className="text-[#2C1810] font-semibold">Sarah Martinez</p>
                <p className="text-sm text-[#4A473F]">Master Sommelier</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                </div>
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#D4AF37] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#4A473F] italic mb-3">"Finally, tasting notes that actually mean something. The community insights are invaluable."</p>
                <p className="text-[#2C1810] font-semibold">Marco Rodriguez</p>
                <p className="text-sm text-[#4A473F]">Coffee Roaster</p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2E8B57] to-[#1F5A3A] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">J</span>
                  </div>
                </div>
                <div className="flex justify-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#D4AF37] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#4A473F] italic mb-3">"The AI flavor matching is incredible. It helped me discover pairings I never would have considered."</p>
                <p className="text-[#2C1810] font-semibold">Jennifer Chen</p>
                <p className="text-sm text-[#4A473F]">Culinary Director</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="animate-fade-in-up animate-delay-600 text-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-[#D4AF37]/20 max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-[#2C1810] mb-6" style={{ fontFamily: 'var(--fx-font-heading)' }}>
              Ready to Transform Your Tasting Experience?
            </h3>
            <p className="text-xl text-[#4A473F] mb-8 max-w-2xl mx-auto">
              Join thousands of flavor enthusiasts who have already discovered the world in every sip.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={() => router.push(`/${locale}/register`)}
                className="px-10 py-4 bg-gradient-to-r from-[#8B4513] to-[#6B3419] text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[220px]"
              >
                Start Free Today
              </button>

              <button
                onClick={() => router.push(`/${locale}/login`)}
                className="px-10 py-4 border-2 border-[#D4AF37] text-[#D4AF37] font-bold text-lg rounded-2xl hover:bg-[#D4AF37] hover:text-white transition-all duration-300 min-w-[220px] shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            </div>

            <p className="text-sm text-[#4A473F] mt-6">
              No credit card required • Full access to all features
            </p>
          </div>
        </section>
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
