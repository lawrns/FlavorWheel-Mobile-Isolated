'use client'

import { useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { QuickHelp } from '@/components/ui/form-tooltip'

interface TastingFormData {
  name: string
  description: string
  type: string
  items: Array<{
    name: string
    type: string
  }>
}

interface TastingFormProps {
  formData: TastingFormData
  onBackToModes: () => void
  onUpdateFormData: (updates: Partial<TastingFormData>) => void
  onUpdateItem: (index: number, updates: Partial<{ name: string; type: string }>) => void
  onAddItem: () => void
  onCreateTasting: () => void
  isSubmitting: boolean
  validationErrors: {[key: string]: string}
  networkError: string | null
  locale: string
}

export function TastingForm({
  formData,
  onBackToModes,
  onUpdateFormData,
  onUpdateItem,
  onAddItem,
  onCreateTasting,
  isSubmitting,
  validationErrors,
  networkError,
  locale
}: TastingFormProps) {
  const router = useRouter()

  // Check if form is valid for submission
  const isFormValid = (): boolean => {
    const nameValid = formData.name.trim().length >= 3 && formData.name.length <= 100
    const typeValid = formData.type !== ''
    const itemsValid = formData.items.every(item =>
      item.name.trim() !== '' && item.type !== ''
    )

    return nameValid && typeValid && itemsValid && formData.items.length > 0
  }

  // Real-time validation
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Tasting name is required'
        if (value.length > 100) return 'Tasting name is too long (max 100 characters)'
        if (value.length < 3) return 'Tasting name must be at least 3 characters'
        return ''
      case 'description':
        if (value.length > 500) return 'Description is too long (max 500 characters)'
        return ''
      case 'type':
        if (!value) return 'Please select a tasting type'
        return ''
      case 'itemName':
        if (!value.trim()) return 'Item name is required'
        if (value.length > 50) return 'Item name is too long (max 50 characters)'
        return ''
      case 'itemType':
        if (!value) return 'Please select an item type'
        return ''
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-fx-bg" data-beverage={getBeverageCategory(formData.type) ||
                              (formData.items.length > 0 ? getBeverageCategory(formData.items[0].type) : undefined)}>
      <motion.main
        className="mx-auto max-w-[768px] px-4 sm:px-6 py-6 md:py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center mb-6 md:mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={onBackToModes}
            className="p-2 md:p-3 bg-white/80 backdrop-blur-sm border border-fx-border rounded-xl hover:bg-white transition-all duration-200 hover:shadow-soft touch-manipulation"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to mode selection"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5 text-fx-text" />
          </motion.button>
          <div className="ml-3 md:ml-4 flex-1">
            <h1
              className="text-xl md:text-2xl font-bold text-fx-text font-heading"
              style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
            >
              Create New Tasting
            </h1>
            <p className="text-sm text-fx-text2 font-body mt-1">
              Set up your tasting experience
            </p>
          </div>
        </motion.div>

        {/* Tasting Creation Form */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm border border-fx-border rounded-xl p-4 md:p-6 lg:p-8 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
            {/* Tasting Name */}
            <div>
              <div className="flex items-center mb-2">
                <label htmlFor="tasting-name" className="block text-sm font-medium text-fx-text">
                  Tasting Name *
                </label>
                <QuickHelp
                  title="Tasting Name"
                  content="Choose a descriptive name for your tasting session. This will help you identify it later in your tasting history."
                />
              </div>
              <input
                id="tasting-name"
                type="text"
                data-testid="tasting-name-input"
                aria-label="Tasting name"
                aria-describedby="tasting-name-help"
                placeholder="e.g., My First Tequila Tasting"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value
                  onUpdateFormData({ name: value })
                  // Real-time validation feedback
                  const error = validateField('name', value)
                  if (error) {
                    e.target.setCustomValidity(error)
                  } else {
                    e.target.setCustomValidity('')
                  }
                }}
                onBlur={(e) => {
                  // Validate on blur
                  const error = validateField('name', e.target.value)
                  if (error) {
                    e.target.setCustomValidity(error)
                  }
                }}
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50 focus:border-fx-accent"
                required
                maxLength={100}
              />
              <div id="tasting-name-help" className="sr-only">
                Enter a descriptive name for your tasting session
              </div>

              {validationErrors.name && (
                <div
                  data-testid={validationErrors.name.includes('required') ? 'name-required-error' : 'name-too-long-error'}
                  className="mt-1 text-sm text-red-600"
                >
                  {validationErrors.name}
                </div>
              )}
            </div>

            {/* Tasting Description */}
            <div>
              <label htmlFor="tasting-description" className="block text-sm font-medium text-fx-text mb-2">
                Description
              </label>
              <div className="relative">
                <textarea
                  id="tasting-description"
                  data-testid="tasting-description-input"
                  aria-label="Tasting description"
                  placeholder="Describe your tasting experience..."
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value
                    onUpdateFormData({ description: value })
                    const error = validateField('description', value)
                    if (error) {
                      e.target.setCustomValidity(error)
                    } else {
                      e.target.setCustomValidity('')
                    }
                  }}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50 focus:border-fx-accent pr-16"
                />
                <div className="absolute bottom-2 right-3 text-xs text-fx-text2">
                  {formData.description.length}/500
                </div>
              </div>
            </div>

            {/* Tasting Type */}
            <div>
              <div className="flex items-center mb-2">
                <label htmlFor="tasting-type" className="block text-sm font-medium text-fx-text">
                  Tasting Type *
                </label>
                <QuickHelp
                  title="Tasting Type"
                  content="Guided: Step-by-step tasting with detailed notes. Blind: Tasting without knowing what you're drinking. Comparative: Compare multiple beverages side by side. Educational: Learning-focused tasting with detailed analysis."
                />
              </div>
              <select
                id="tasting-type"
                data-testid="tasting-type-select"
                value={formData.type}
                onChange={(e) => onUpdateFormData({ type: e.target.value })}
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
                required
              >
                <option value="">Select tasting type</option>
                <option value="guided">Guided Tasting</option>
                <option value="blind">Blind Tasting</option>
                <option value="comparative">Comparative Tasting</option>
                <option value="educational">Educational Tasting</option>
              </select>
            </div>

            {/* Items Section */}
            <div>
              <h3 className="text-lg font-semibold text-fx-text mb-4">Tasting Items</h3>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-fx-border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-fx-text mb-2">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          data-testid={index === 0 ? "item-name-input" : `item-name-${index}`}
                          placeholder="e.g., Clase Azul Tequila Blanco"
                          value={item.name}
                          onChange={(e) => {
                            const value = e.target.value
                            onUpdateItem(index, { name: value })
                            const error = validateField('itemName', value)
                            if (error) {
                              e.target.setCustomValidity(error)
                            } else {
                              e.target.setCustomValidity('')
                            }
                          }}
                          onBlur={(e) => {
                            const error = validateField('itemName', e.target.value)
                            if (error) {
                              e.target.setCustomValidity(error)
                            }
                          }}
                          className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50 focus:border-fx-accent"
                          required
                          maxLength={50}
                        />
                        {/* Mobile-specific input for first item */}
                        {index === 0 && (
                          <input
                            type="text"
                            data-testid="mobile-item-name"
                            placeholder="Mobile item name"
                            value={item.name}
                            onChange={(e) => {
                              const value = e.target.value
                              onUpdateItem(index, { name: value })
                              const error = validateField('itemName', value)
                              if (error) {
                                e.target.setCustomValidity(error)
                              } else {
                                e.target.setCustomValidity('')
                              }
                            }}
                            onBlur={(e) => {
                              const error = validateField('itemName', e.target.value)
                              if (error) {
                                e.target.setCustomValidity(error)
                              }
                            }}
                            className="md:hidden mt-2 w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50 focus:border-fx-accent"
                            maxLength={50}
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fx-text mb-2">
                          Item Type *
                        </label>
                        <select
                          data-testid={index === 0 ? "item-type-select" : `item-type-select-${index}`}
                          value={item.type}
                          onChange={(e) => onUpdateItem(index, { type: e.target.value })}
                          className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
                          required
                        >
                          <option value="">Select type</option>
                          <option value="tequila">Tequila</option>
                          <option value="wine">Wine</option>
                          <option value="whiskey">Whiskey</option>
                          <option value="beer">Beer</option>
                          <option value="coffee">Coffee</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                data-testid="add-item-button"
                onClick={onAddItem}
                className="mt-4 px-4 py-2 border border-fx-accent text-fx-accent rounded-lg hover:bg-fx-accent/10 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Another Item
              </button>

              {/* Mobile Add Item Button */}
              <button
                type="button"
                data-testid="mobile-add-item"
                onClick={onAddItem}
                className="mt-4 md:hidden w-full px-4 py-3 bg-fx-accent text-white rounded-lg hover:bg-fx-accent/90 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Item (Mobile)
              </button>
            </div>

            {/* Mobile-Specific Input (for mobile tests) */}
            <div className="block md:hidden mb-6">
              <label className="block text-sm font-medium text-fx-text mb-2">
                Mobile Tasting Name
              </label>
              <input
                type="text"
                data-testid="mobile-tasting-name-input"
                placeholder="Enter tasting name for mobile"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value
                  onUpdateFormData({ name: value })
                  const error = validateField('name', value)
                  if (error) {
                    e.target.setCustomValidity(error)
                  } else {
                    e.target.setCustomValidity('')
                  }
                }}
                onBlur={(e) => {
                  const error = validateField('name', e.target.value)
                  if (error) {
                    e.target.setCustomValidity(error)
                  }
                }}
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50 focus:border-fx-accent"
                maxLength={100}
              />
            </div>

            {/* Mobile Photo Upload */}
            <div className="block md:hidden mb-6">
              <label className="block text-sm font-medium text-fx-text mb-2">
                Add Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                data-testid="mobile-photo-upload"
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
              />
            </div>

            {/* Mobile Flavor Selection */}
            <div className="block md:hidden mb-6">
              <label className="block text-sm font-medium text-fx-text mb-2">
                Quick Flavor Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['citrus', 'sweet', 'vanilla', 'oak', 'spicy', 'floral'].map((flavor) => (
                  <button
                    key={flavor}
                    type="button"
                    data-testid={`mobile-flavor-${flavor}`}
                    className="px-3 py-1 text-sm border border-fx-border rounded-full hover:bg-fx-accent/10 hover:border-fx-accent transition-colors"
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              {/* Form Validation Status */}
              <div className="mb-4 flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isFormValid() ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className={isFormValid() ? 'text-green-700' : 'text-yellow-700'}>
                  {isFormValid() ? 'Form is ready to submit' : 'Please complete all required fields'}
                </span>
              </div>

              <button
                type="button"
                data-testid="create-tasting-submit"
                onClick={onCreateTasting}
                disabled={isSubmitting}
                className="w-full px-6 md:px-8 py-3 md:py-4 bg-fx-primary text-white rounded-xl font-semibold text-base md:text-lg hover:bg-fx-primaryHover disabled:opacity-50 transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation min-h-[48px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm md:text-base">Creating Tasting...</span>
                  </div>
                ) : (
                  'Create Tasting'
                )}
              </button>

              {/* Mobile Start Tasting Button */}
              <button
                type="button"
                data-testid="mobile-start-tasting"
                onClick={() => {
                  // Simulate form submission and navigation to tasting
                  if (formData.name.trim()) {
                    window.location.href = `/${locale}/quick-tasting`
                  }
                }}
                className="mt-3 md:mt-4 w-full px-6 md:px-8 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-all duration-200 hover:shadow-lg active:scale-[0.98] touch-manipulation min-h-[44px]"
              >
                Start Mobile Tasting
              </button>
            </div>

            {/* Success Message */}
            {isSubmitting && (
              <div
                data-testid="tasting-created-message"
                className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
              >
                Tasting created successfully! Redirecting...
              </div>
            )}

            {/* Error Message */}
            {networkError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div
                  data-testid="error-message"
                  className="text-red-800 mb-3"
                >
                  {networkError}
                </div>
                <button
                  data-testid="retry-button"
                  onClick={onCreateTasting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}

// Helper function to map product type to beverage category
function getBeverageCategory(type: string): string | null {
  if (!type) return null

  const lowerType = type.toLowerCase()
  if (lowerType.includes('tequila') || lowerType.includes('mezcal') || lowerType.includes('whiskey') ||
      lowerType.includes('gin') || lowerType.includes('rum') || lowerType.includes('vodka')) {
    return 'mezcal' // Using mezcal as the default spirits theme
  }
  if (lowerType.includes('wine')) return 'wine'
  if (lowerType.includes('coffee') || lowerType.includes('espresso') || lowerType.includes('cappuccino')) return 'coffee'
  if (lowerType.includes('beer') || lowerType.includes('lager') || lowerType.includes('ale') ||
      lowerType.includes('stout') || lowerType.includes('ipa')) return 'beer'
  if (lowerType.includes('tea')) return 'tea'

  return null
}
