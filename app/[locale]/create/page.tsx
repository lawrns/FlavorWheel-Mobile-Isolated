'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function CreatePage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href={`/${locale}/landing`} className="inline-block mb-6 text-blue-600 hover:text-blue-800">
            ← Back to Landing
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Create Your Tasting Experience
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Choose your tasting mode and start discovering new flavors with AI-powered insights
          </p>
        </div>

        {/* Tasting Options */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Study Mode */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Study Mode</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Learn and practice with guided tastings. Perfect for developing your palate and understanding flavor profiles.
            </p>
            <Link
              href={`/${locale}/create/study`}
              className="w-full inline-block text-center py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Start Study Session
            </Link>
          </div>

          {/* Competition Mode */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Competition Mode</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Challenge yourself and compete with other tasters. Test your skills in blind tastings and earn recognition.
            </p>
            <Link
              href={`/${locale}/create/competition`}
              className="w-full inline-block text-center py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Start Competition
            </Link>
          </div>

          {/* Quick Tasting */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Tasting</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Fast and simple tasting notes. Perfect for on-the-go flavor discoveries and quick evaluations.
            </p>
            <Link
              href={`/${locale}/quick-tasting`}
              className="w-full inline-block text-center py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Quick Tasting
            </Link>
            </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 max-w-4xl mx-auto">
            <h4 className="text-2xl font-bold text-gray-900 mb-4">New to Tasting?</h4>
            <p className="text-gray-700 mb-6">
              Our AI-powered system will guide you through each step, helping you develop your palate and discover new flavor dimensions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/${locale}/dashboard`}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                View Dashboard
              </Link>
              <Link
                href={`/${locale}/settings`}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}