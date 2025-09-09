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
        {/* Enhanced Hero Section */}
        <div className="mb-20">
          {/* Value Proposition Badge */}
          <div className="inline-flex items-center gap-2 bg-fx-accent/10 text-fx-accent px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-fx-accent rounded-full animate-pulse"></span>
            Transform tasting from art to science
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-fx-text-primary font-heading max-w-6xl mx-auto">
            <span className="block mb-2">Professional Flavor</span>
            <span className="block bg-gradient-to-r from-fx-accent via-fx-secondary to-fx-primary bg-clip-text text-transparent">
              Analysis Platform
            </span>
          </h1>

          <p className="text-lg md:text-xl text-fx-text-secondary mb-8 leading-relaxed max-w-4xl mx-auto">
            Join 10,000+ professional tasters who use AI-powered flavor intelligence to transform subjective tasting into data-driven insights.
            Experience the future of beverage evaluation.
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm text-fx-text-secondary">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-fx-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              AI-powered analysis
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-fx-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              Expert community
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-fx-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
              Mobile-first design
            </div>
          </div>

          {/* Enhanced Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href={`/${locale}/register`}
              className="group px-8 py-4 bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[220px]"
            >
              <span className="flex items-center justify-center gap-3">
                Start Free Trial
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>

            <Link
              href={`/${locale}/quick-tasting`}
              className="group px-8 py-4 bg-fx-card border-2 border-fx-accent text-fx-accent font-semibold text-lg rounded-xl hover:bg-fx-accent hover:text-fx-text-inverse transition-all duration-300 min-w-[220px] shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Try Quick Tasting
              </span>
            </Link>

            <Link
              href="#demo"
              className="group px-8 py-4 bg-transparent border-2 border-fx-border-default text-fx-text-primary font-semibold text-lg rounded-xl hover:bg-fx-bg-subtle hover:border-fx-accent transition-all duration-300 min-w-[220px] shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m0 6V4m0 6v6m0-6h1m0 0H9" />
                </svg>
                Watch Demo
              </span>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-fx-text-secondary">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Free 14-day trial
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Cancel anytime
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Section */}
        <div className="mb-20">
          <div className="bg-fx-card/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-fx-border-default max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-fx-text-primary mb-4 font-heading">
                Trusted by Industry Professionals
              </h3>
              <p className="text-fx-text-secondary max-w-2xl mx-auto">
                Join sommeliers, beverage directors, and flavor experts who rely on our AI-powered platform
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-fx-accent mb-2 bg-gradient-to-r from-fx-accent to-fx-accent-hover bg-clip-text text-transparent">
                  2,847
                </div>
                <div className="text-sm text-fx-text-secondary font-medium">Active Tasters</div>
                <div className="text-xs text-fx-text-muted mt-1">+23% this month</div>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-fx-secondary mb-2 bg-gradient-to-r from-fx-secondary to-fx-secondary-hover bg-clip-text text-transparent">
                  18,492
                </div>
                <div className="text-sm text-fx-text-secondary font-medium">Tastings Completed</div>
                <div className="text-xs text-fx-text-muted mt-1">+156 this week</div>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-fx-primary mb-2 bg-gradient-to-r from-fx-primary to-fx-primary-hover bg-clip-text text-transparent">
                  94%
                </div>
                <div className="text-sm text-fx-text-secondary font-medium">Accuracy Rate</div>
                <div className="text-xs text-fx-text-muted mt-1">AI flavor detection</div>
              </div>

              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-fx-accent mb-2 bg-gradient-to-r from-fx-accent to-fx-secondary bg-clip-text text-transparent">
                4.9/5
                </div>
                <div className="text-sm text-fx-text-secondary font-medium">User Rating</div>
                <div className="text-xs text-fx-text-muted mt-1">Based on 1,203 reviews</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-gradient-to-r from-fx-bg-subtle to-fx-accent/5 rounded-2xl p-6 border border-fx-border-subtle">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-fx-accent to-fx-secondary rounded-full flex items-center justify-center text-fx-text-inverse font-bold">
                  MS
                </div>
                <div>
                  <div className="font-semibold text-fx-text-primary">Maria Sanchez</div>
                  <div className="text-sm text-fx-text-secondary">Master Sommelier, Michelin-starred restaurant</div>
                </div>
              </div>
              <blockquote className="text-fx-text-secondary italic">
                "FlavorWheel has revolutionized how we train our sommeliers. The AI accuracy in detecting subtle flavor notes
                is remarkable, and the community insights help us stay ahead of emerging trends."
              </blockquote>
            </div>
          </div>
        </div>

        {/* Feature Comparison Grid */}
        <section className="w-full max-w-7xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-fx-text-primary mb-6 font-heading">
              Why Professional Tasters Choose FlavorWheel
            </h3>
            <p className="text-lg text-fx-text-secondary max-w-3xl mx-auto">
              See how our AI-powered platform compares to traditional tasting methods
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-fx-card/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-fx-border-default overflow-hidden">
            <div className="grid md:grid-cols-3 gap-8">
              {/* Traditional Method */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-fx-text-primary mb-4">Traditional Notes</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Subjective interpretation
                  </div>
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Limited data tracking
                  </div>
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Manual organization
                  </div>
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    No trend analysis
                  </div>
                </div>
              </div>

              {/* VS Divider */}
              <div className="hidden md:flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-fx-text-secondary mb-2">VS</div>
                  <div className="w-px h-20 bg-fx-border-default"></div>
                </div>
              </div>

              {/* FlavorWheel AI */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-fx-accent to-fx-secondary rounded-2xl flex items-center justify-center mb-6 mx-auto">
                  <svg className="w-8 h-8 text-fx-text-inverse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-xl font-semibold text-fx-text-primary mb-4">AI-Powered Analysis</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    94% accuracy in flavor detection
                  </div>
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    Automated data tracking & insights
                  </div>
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                      Smart categorization & search
                    </div>
                  <div className="flex items-center gap-2 text-fx-text-secondary">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                    </svg>
                    Trend analysis & recommendations
                  </div>
                </div>
              </div>
            </div>

            {/* CTA within comparison */}
            <div className="mt-12 pt-8 border-t border-fx-border-default">
              <div className="text-center">
                <h4 className="text-xl font-semibold text-fx-text-primary mb-4">
                  Experience the Difference
                </h4>
                <p className="text-fx-text-secondary mb-6 max-w-2xl mx-auto">
                  Join professional tasters who have transformed their workflow with AI-powered flavor analysis
                </p>
                <Link
                  href={`/${locale}/register`}
                  className="inline-block px-8 py-4 bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse font-semibold text-lg rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Free Trial Today
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-fx-card/95 to-fx-card/90 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-fx-border-default max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-fx-accent/10 text-fx-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-fx-accent rounded-full animate-pulse"></span>
                Limited Time: Free Professional Training Included
              </div>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-fx-text-primary mb-6 font-heading">
              Start Your Professional Tasting Journey Today
            </h3>

            <p className="text-lg text-fx-text-secondary mb-8 max-w-3xl mx-auto">
              Join 2,847+ professional tasters who trust FlavorWheel for accurate, data-driven flavor analysis.
              Transform how you evaluate beverages with AI-powered insights.
            </p>

            {/* Urgency Elements */}
            <div className="bg-gradient-to-r from-fx-accent/5 to-fx-secondary/5 rounded-2xl p-6 mb-8 border border-fx-accent/20">
              <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-fx-text-secondary">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  14-day free trial
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Professional training included
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link
                href={`/${locale}/register`}
                className="px-10 py-4 bg-gradient-to-r from-fx-accent to-fx-accent-hover text-fx-text-inverse font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 min-w-[240px] text-center"
              >
                🚀 Start Free Trial Now
              </Link>

              <Link
                href={`/${locale}/quick-tasting`}
                className="px-10 py-4 bg-fx-card border-2 border-fx-accent text-fx-accent font-bold text-lg rounded-2xl hover:bg-fx-accent hover:text-fx-text-inverse transition-all duration-300 min-w-[240px] shadow-lg hover:shadow-xl text-center"
              >
                Try Quick Tasting
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm text-fx-text-secondary mb-2">
                No credit card required • Full professional access • 14-day trial
              </p>
              <p className="text-xs text-fx-text-muted">
                Join sommeliers, beverage directors, and flavor experts worldwide
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* Test elements for E2E */}
      <div data-testid="app-ready" className="sr-only">App Ready</div>
    </div>
  )
}