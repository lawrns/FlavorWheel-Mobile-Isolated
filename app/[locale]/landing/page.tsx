import { Coffee, Wine, Sparkles, Star, Plus } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-amber-50">
      <main className="mx-auto max-w-sm px-6 py-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <Coffee className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Discover the art of Spirits tasting!
          </h1>
          <p className="text-base text-gray-600">
            Join 10,000 reviewers worldwide discovering new flavors everyday!
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-amber-50 border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 font-semibold">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome to Flavatix!</h2>
              <p className="text-sm text-gray-600">Discover authentic flavors</p>
            </div>
          </div>
          <button className="w-full bg-gray-900 text-white py-3 px-4 rounded-full hover:bg-gray-800 transition-colors font-semibold">
            Sign In
          </button>
        </div>

        {/* Main Action Buttons - 4 buttons as specified */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <button className="bg-green-600 text-white py-4 px-6 rounded-full hover:bg-green-700 transition-colors flex flex-col items-center space-y-2">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-semibold">Quick Taste</span>
          </button>

          <button className="bg-gray-900 text-white py-4 px-6 rounded-full hover:bg-gray-800 transition-colors flex flex-col items-center space-y-2">
            <Plus className="h-6 w-6" />
            <span className="text-sm font-semibold">Create Tasting</span>
          </button>

          <button className="bg-gray-900 text-white py-4 px-6 rounded-full hover:bg-gray-800 transition-colors flex flex-col items-center space-y-2">
            <Star className="h-6 w-6" />
            <span className="text-sm font-semibold">Review</span>
          </button>

          <button className="bg-green-600 text-white py-4 px-6 rounded-full hover:bg-green-700 transition-colors flex flex-col items-center space-y-2">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-semibold">Flavor Wheels</span>
          </button>
        </div>

        {/* Explore Flavor Profiles Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Flavor Profiles</h2>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
              <div className="rounded-full bg-purple-100 p-2">
                <Wine className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Wine Wheel</h3>
                <p className="text-sm text-gray-600">Explore wine flavor dimensions</p>
              </div>
              <Plus className="h-5 w-5 text-gray-600" />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
              <div className="rounded-full bg-orange-100 p-2">
                <Coffee className="h-5 w-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Coffee Wheel</h3>
                <p className="text-sm text-gray-600">Discover coffee taste profiles</p>
              </div>
              <Plus className="h-5 w-5 text-gray-600" />
            </div>

            <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
              <div className="rounded-full bg-yellow-100 p-2">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Master Wheel</h3>
                <p className="text-sm text-gray-600">Advanced flavor analysis tools</p>
              </div>
              <Plus className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Global Flavors Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Explore Global Flavors & Flavor Wheels
          </h2>
          <div className="mb-4 flex justify-center">
            <div className="relative h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
              <div className="text-center">
                <Wine className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <Coffee className="h-5 w-5 text-orange-600 mx-auto" />
                <div className="text-xs text-gray-600 mt-1">🍷🥛🧀</div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mb-4">
            Professional tools awaiting your first sip!
          </p>
          <button className="w-full bg-green-600 text-white py-3 px-4 rounded-full hover:bg-green-700 transition-colors font-semibold">
            Explore All Wheels
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-600">
            Flavatix - Your Perfect Tasting Journey Begins Here!
          </p>
        </div>
      </main>
    </div>
  )
}
