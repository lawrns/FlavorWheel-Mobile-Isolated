'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LandingPage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <div className="min-h-screen bg-fx-bg">
      {/* Skip Links for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 z-50 rounded-md bg-fx-primary px-4 py-2 text-fx-text-inverse"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:left-40 focus:top-4 z-50 rounded-md bg-fx-primary px-4 py-2 text-fx-text-inverse"
      >
        Skip to navigation
      </a>

      {/* Header */}
      <header id="navigation" className="relative z-10 pt-8 pb-6 flex items-center justify-between px-6" role="banner">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-fx-accent rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-fx-text-inverse font-bold text-xl">F</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-fx-text-primary font-heading">FlavorWheel México</h2>
            <p className="text-sm text-fx-text-secondary">Discover authentic flavors</p>
          </div>
        </div>
        <Link
          href={`/${locale}/profile`}
          className="p-2 rounded-full bg-fx-card shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <svg className="w-6 h-6 text-fx-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </Link>
      </header>

      {/* Main Content */}
      <section id="main-content" className="relative z-10 px-6 py-12 text-center" tabIndex={-1}>
        {/* Hero Section */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-fx-text-primary font-heading">
            <span className="block mb-2">Discover the World</span>
            <span className="block bg-gradient-to-r from-fx-accent to-fx-secondary bg-clip-text text-transparent">
              In Every Sip
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-fx-text-secondary mb-12 leading-relaxed max-w-4xl mx-auto">
            Transform your tasting experience with AI-powered flavor intelligence and expert tasting expertise
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link
              href={`/${locale}/create`}
              className="group px-8 py-4 bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[200px]"
            >
              <span className="flex items-center justify-center gap-3">
                Start Your Flavor Journey
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link
              href={`/${locale}/create`}
              className="group px-8 py-4 border-2 border-fx-accent text-fx-accent font-semibold text-lg rounded-xl hover:bg-fx-accent hover:text-fx-text-inverse transition-all duration-300 min-w-[200px] shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6v6m0-6h1m0 0H9" />
                </svg>
                Watch Demo
              </span>
            </Link>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-20">
          <div className="bg-fx-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-fx-border-default max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-fx-text-primary mb-6 font-heading">
              Join 10,000+ Passionate Tasters
            </h3>

            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-fx-accent mb-2">10,000+</div>
                <div className="text-sm text-fx-text-secondary font-medium">Expert Tasters</div>
              </div>

              <div className="text-center border-x border-fx-border-default px-4">
                <div className="text-3xl md:text-4xl font-bold text-fx-secondary mb-2">50,000+</div>
                <div className="text-sm text-fx-text-secondary font-medium">Tastings Completed</div>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-fx-primary mb-2">25,000+</div>
                <div className="text-sm text-fx-text-secondary font-medium">Reviews Shared</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-fx-border-default">
              <p className="text-sm text-fx-text-secondary italic">
                "Transforming how the world experiences flavor, one sip at a time."
              </p>
            </div>
          </div>
        </div>

        {/* Feature Showcase */}
        <section className="w-full max-w-6xl mx-auto mb-24">
          <h3 className="text-3xl md:text-4xl font-bold text-fx-text-primary mb-12 text-center font-heading">
            Experience AI-Powered Tasting
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI Analysis Feature */}
            <div className="group bg-fx-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-fx-border-default hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-fx-accent to-fx-accent-hover rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-fx-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-fx-text-primary mb-4 font-heading">AI Flavor Analysis</h4>
              <p className="text-fx-text-secondary mb-6 leading-relaxed">Advanced machine learning identifies complex flavor profiles and provides personalized tasting insights.</p>
              <Link
                href={`/${locale}/create`}
                className="w-full inline-block text-center py-3 bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Try AI Analysis
              </Link>
            </div>

            {/* Community Feature */}
            <div className="group bg-fx-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-fx-border-default hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-fx-secondary to-fx-secondary-hover rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-fx-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-fx-text-primary mb-4 font-heading">Expert Community</h4>
              <p className="text-fx-text-secondary mb-6 leading-relaxed">Connect with professional tasters, share experiences, and discover new flavor perspectives.</p>
              <Link
                href={`/${locale}/social`}
                className="w-full inline-block text-center py-3 bg-gradient-to-r from-fx-secondary to-fx-secondary-hover text-fx-text-inverse font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Join Community
              </Link>
            </div>

            {/* Mobile Experience Feature */}
            <div className="group bg-fx-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-fx-border-default hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-fx-secondary to-fx-secondary-hover rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-fx-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-fx-text-primary mb-4 font-heading">Mobile-First Design</h4>
              <p className="text-fx-text-secondary mb-6 leading-relaxed">Optimized for tasting environments with camera integration and offline functionality.</p>
              <Link
                href={`/${locale}/quick-tasting`}
                className="w-full inline-block text-center py-3 bg-gradient-to-r from-fx-secondary to-fx-secondary-hover text-fx-text-inverse font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Quick Tasting
              </Link>
            </div>

            {/* Professional Tools Feature */}
            <div className="group bg-fx-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-fx-border-default hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-fx-primary to-fx-primary-hover rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-fx-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-fx-text-primary mb-4 font-heading">Professional Tools</h4>
              <p className="text-fx-text-secondary mb-6 leading-relaxed">Industry-standard templates, expert validation, and comprehensive tasting reports.</p>
              <Link
                href={`/${locale}/review`}
                className="w-full inline-block text-center py-3 bg-gradient-to-r from-fx-primary to-fx-primary-hover text-fx-text-inverse font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Expert Reviews
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center">
          <div className="bg-fx-card/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-fx-border-default max-w-4xl mx-auto">
            <h3 className="text-3xl md:text-4xl font-bold text-fx-text-primary mb-6 font-heading">
              Ready to Transform Your Tasting Experience?
            </h3>
            <p className="text-xl text-fx-text-secondary mb-8 max-w-3xl mx-auto">
              Join thousands of flavor enthusiasts who have already discovered the world in every sip.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href={`/${locale}/register`}
                className="px-10 py-4 bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[220px] text-center"
              >
                Start Free Today
              </Link>

              <Link
                href={`/${locale}/login`}
                className="px-10 py-4 border-2 border-fx-accent text-fx-accent font-bold text-lg rounded-2xl hover:bg-fx-accent hover:text-fx-text-inverse transition-all duration-300 min-w-[220px] shadow-lg hover:shadow-xl text-center"
              >
                Sign In
              </Link>
            </div>

            <p className="text-sm text-fx-text-secondary mt-6">
              No credit card required • Full access to all features
            </p>
          </div>
        </section>
      </section>

      {/* Test elements for E2E */}
      <div data-testid="app-ready" className="sr-only">App Ready</div>
    </div>
  )
}