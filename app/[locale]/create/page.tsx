'use client'

import { Sparkles, Star, BookOpen, Target, ArrowLeft, Plus, X, Wine, Coffee } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type TastingMode = 'study' | 'competition' | 'quick' | null

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<TastingMode>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleModeSelect = (mode: TastingMode) => {
    if (mode === 'study') {
      router.push('/en/create/study')
    } else {
      setSelectedMode(mode)
    }
  }

  const handleBackToModes = () => {
    setSelectedMode(null)
  }

  const handleCreateTasting = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert(`Tasting created successfully! Mode: ${selectedMode}`)
    router.push('/en/landing')
    setIsSubmitting(false)
  }

  // Mode selection view
  if (!selectedMode) {
    return (
      <div className="min-h-screen bg-amber-50">
        <main className="mx-auto max-w-sm px-6 py-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              What would you like to create?
            </h1>
            <p className="text-base text-gray-600">
              Choose the type of experience you want to share
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                mode: 'study' as const,
                icon: BookOpen,
                title: 'Study Mode',
                description: 'Flexible tasting for learning with prose input and flavor wheel generation',
                color: 'bg-purple-100',
                iconColor: 'text-purple-600'
              },
              {
                mode: 'competition' as const,
                icon: Target,
                title: 'Competition Mode',
                description: 'Structured competition with scoring and ranking',
                color: 'bg-yellow-100',
                iconColor: 'text-yellow-600'
              },
              {
                mode: 'quick' as const,
                icon: Sparkles,
                title: 'Quick Tasting',
                description: 'Simple 4-category evaluation',
                color: 'bg-blue-100',
                iconColor: 'text-blue-600'
              },
            ].map(({ mode, icon: Icon, title, description, color, iconColor }) => (
              <button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <div className="flex items-center space-x-2">
                  <div className={`rounded-full ${color} p-3`}>
                    <Icon className="h-6 w-6" style={{ color: iconColor.replace('text-', '') }} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
                    <p className="text-sm text-gray-600">{description}</p>
                  </div>
                  <div className="text-gray-600">
                    <Plus className="h-5 w-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-600">
              Select a mode to configure your tasting experience
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Form view
  return (
    <div className="min-h-screen bg-amber-50">
      <main className="mx-auto max-w-sm px-6 py-6">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button
            onClick={handleBackToModes}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-900" />
          </button>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Create {selectedMode?.charAt(0).toUpperCase()}{selectedMode?.slice(1)} Tasting
            </h1>
            <p className="text-sm text-gray-600">
              {selectedMode === 'study' && 'Flexible tasting with prose input for flavor wheel generation'}
              {selectedMode === 'competition' && 'Structured competition with scoring'}
              {selectedMode === 'quick' && 'Simple evaluation'}
            </p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tasting Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Wine Appreciation Session"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                placeholder="Optional description of your tasting session"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="blind"
                className="w-4 h-4 text-green-600 bg-white border-gray-200 rounded focus:ring-green-600"
              />
              <label htmlFor="blind" className="text-sm text-gray-600">
                Blind Tasting
              </label>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Items to Taste</h2>
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">Item 1</span>
                <button className="text-gray-600 hover:text-gray-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter item name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-green-600"
                required
              />
            </div>
          </div>

          <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-600 hover:text-green-600 hover:border-green-600 transition-colors flex items-center justify-center space-x-2">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-semibold">Add Item</span>
          </button>
        </div>

        {/* Mode-specific sections */}
        {selectedMode === 'competition' && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Competition Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ranking"
                  className="w-4 h-4 text-green-600 bg-white border-gray-200 rounded focus:ring-green-600"
                />
                <label htmlFor="ranking" className="text-sm text-gray-600">
                  Enable participant ranking
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleCreateTasting}
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-4 px-6 rounded-full hover:bg-green-700 transition-colors font-semibold text-base disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Tasting'}
        </button>
      </main>
    </div>
  )
}
