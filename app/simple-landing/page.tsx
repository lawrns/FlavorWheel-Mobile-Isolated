'use client'

import { useRouter } from 'next/navigation'

export default function SimpleLandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 to-amber-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">FlavorWheel México</h1>
        <p className="text-center text-lg mb-8">
          Discover the art of tasting Mexican beverages
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/test')}
            className="bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg"
          >
            Test Page
          </button>
          <button
            onClick={() => router.push('/en/login')}
            className="bg-amber-600 hover:bg-amber-700 px-6 py-3 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}
