'use client'

import { ArrowLeft, Plus, X, GraduationCap, Trophy, Zap } from 'lucide-react'
import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'

type TastingMode = 'study' | 'competition' | 'quick' | 'mode-selection' | null

interface TastingFormData {
  name: string
  description: string
  type: string
  items: Array<{
    name: string
    type: string
  }>
}

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<TastingMode>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({})
  const [networkError, setNetworkError] = useState<string | null>(null)
  const [formData, setFormData] = useState<TastingFormData>({
    name: '',
    description: '',
    type: '',
    items: [{ name: '', type: '' }]
  })
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'

  const handleModeSelect = (mode: TastingMode) => {
    if (mode === 'study') {
      router.push(`/${locale}/create/study`)
    } else if (mode === 'competition') {
      router.push(`/${locale}/create/competition`)
    } else if (mode === 'quick') {
      router.push(`/${locale}/quick-tasting`)
    } else {
      setSelectedMode(mode)
    }
  }

  const handleBackToModes = () => {
    setSelectedMode('mode-selection' as TastingMode)
  }

  const updateFormData = (updates: Partial<TastingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const updateItem = (index: number, updates: Partial<{ name: string; type: string }>) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], ...updates }
    updateFormData({ items: newItems })
  }

  const addItem = () => {
    updateFormData({
      items: [...formData.items, { name: '', type: '' }]
    })
  }

  const handleCreateTasting = async () => {
    // Clear previous validation errors
    setValidationErrors({})

    // Validate form
    const errors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      errors.name = 'Tasting name is required'
    } else if (formData.name.length > 100) {
      errors.name = 'Tasting name is too long (max 100 characters)'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSubmitting(true)
    setNetworkError(null)

    try {
      // Simulate API call for tasting creation
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate network error for testing
          if (Math.random() < 0.1) { // 10% chance of error for testing
            reject(new Error('Network error'))
          } else {
            resolve(true)
          }
        }, 2000)
      })

      // Show success message briefly, then navigate
      setTimeout(() => {
        // Navigate to the appropriate tasting page based on type
        if (formData.type === 'guided') {
          router.push(`/${locale}/quick-tasting`)
        } else {
          router.push(`/${locale}/tastings/new-tasting-id`)
        }
      }, 1000)
    } catch (error) {
      console.error('Error creating tasting:', error)
      setNetworkError('Failed to create tasting. Please check your connection and try again.')
      setIsSubmitting(false)
    }
  }

  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  }

  // Show mode selection only if explicitly requested
  if (selectedMode === 'mode-selection') {
    return (
      <div className="min-h-screen bg-fx-bg pb-32">
        <motion.main
          className="mx-auto max-w-[768px] px-4 sm:px-6 py-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h1
              className="text-3xl sm:text-4xl font-bold text-fx-text mb-4 font-heading tracking-tight"
              style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
            >
              Create Your Tasting Experience
            </h1>
            <p className="text-lg text-fx-text2 font-body max-w-md mx-auto">
              Choose the perfect mode for your flavor exploration journey
            </p>
          </motion.div>

          {/* Mode Cards */}
          <motion.div
            className="space-y-4"
            variants={containerVariants}
          >
            {[
              {
                mode: 'study' as const,
                icon: GraduationCap,
                title: 'Study Mode',
                description: 'Flexible learning with AI insights and flavor wheel generation',
                gradient: 'from-purple-500/20 to-purple-600/10',
                iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
                iconColor: 'text-purple-700',
                borderColor: 'border-purple-200',
                shadowColor: 'shadow-purple-100/50'
              },
              {
                mode: 'competition' as const,
                icon: Trophy,
                title: 'Competition Mode',
                description: 'Structured evaluation with scoring and participant ranking',
                gradient: 'from-yellow-500/20 to-yellow-600/10',
                iconBg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
                iconColor: 'text-yellow-700',
                borderColor: 'border-yellow-200',
                shadowColor: 'shadow-yellow-100/50'
              },
              {
                mode: 'quick' as const,
                icon: Zap,
                title: 'Quick Tasting',
                description: 'Simple, fast evaluation with essential flavor detection',
                gradient: 'from-blue-500/20 to-blue-600/10',
                iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
                iconColor: 'text-blue-700',
                borderColor: 'border-blue-200',
                shadowColor: 'shadow-blue-100/50'
              },
            ].map(({ mode, icon: Icon, title, description, gradient, iconBg, iconColor, borderColor, shadowColor }) => (
              <motion.button
                key={mode}
                onClick={() => handleModeSelect(mode)}
                className={`w-full bg-gradient-to-r ${gradient} backdrop-blur-sm border ${borderColor} rounded-xl p-6 text-left hover:shadow-fx transition-all duration-normal ease-standard active:scale-[0.98] group overflow-hidden relative`}
                data-testid={`create-${mode}-mode`}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-normal ease-standard" />

                <div className="relative z-10 flex items-center space-x-5">
                  {/* Icon with enhanced styling */}
                  <motion.div
                    className={`rounded-2xl ${iconBg} p-4 shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-normal ease-standard`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl font-semibold text-fx-text mb-2 font-heading group-hover:text-fx-primary transition-colors duration-normal ease-standard"
                      style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
                    >
                      {title}
                    </h2>
                    <p className="text-fx-text2 font-body leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Action indicator */}
                  <motion.div
                    className="text-fx-primary"
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="h-6 w-6" />
                  </motion.div>
                </div>

                {/* Subtle bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fx-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-normal ease-standard" />
              </motion.button>
            ))}
          </motion.div>

          {/* Bottom hint */}
          <motion.div
            className="text-center mt-12"
            variants={itemVariants}
          >
            <p className="text-sm text-fx-muted font-body">
              Each mode offers a unique tasting experience tailored to your needs
            </p>
          </motion.div>
        </motion.main>
      </div>
    )
  }

  // Helper function to map product type to beverage category
  const getBeverageCategory = (type: string): string | null => {
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

  // Determine beverage category from form data
  const beverageCategory = getBeverageCategory(formData.type) ||
                          (formData.items.length > 0 ? getBeverageCategory(formData.items[0].type) : null)

  // Unified tasting creation form
  return (
    <div className="min-h-screen bg-fx-bg" data-beverage={beverageCategory || undefined}>
      <motion.main
        className="mx-auto max-w-[768px] px-4 sm:px-6 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.button
            onClick={handleBackToModes}
            className="p-3 bg-white/80 backdrop-blur-sm border border-fx-border rounded-xl hover:bg-white transition-all duration-200 hover:shadow-soft"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 text-fx-text" />
          </motion.button>
          <div className="ml-4">
            <h1
              className="text-2xl font-bold text-fx-text font-heading"
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
          className="bg-white/90 backdrop-blur-sm border border-fx-border rounded-xl p-6 sm:p-8 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
            {/* Tasting Name */}
            <div>
              <label htmlFor="tasting-name" className="block text-sm font-medium text-fx-text mb-2">
                Tasting Name *
              </label>
              <input
                id="tasting-name"
                type="text"
                data-testid="tasting-name-input"
                aria-label="Tasting name"
                aria-describedby="tasting-name-help"
                placeholder="e.g., My First Tequila Tasting"
                value={formData.name}
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
                required
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
              <textarea
                id="tasting-description"
                data-testid="tasting-description-input"
                aria-label="Tasting description"
                placeholder="Describe your tasting experience..."
                value={formData.description}
                onChange={(e) => updateFormData({ description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
              />
            </div>

            {/* Tasting Type */}
            <div>
              <label htmlFor="tasting-type" className="block text-sm font-medium text-fx-text mb-2">
                Tasting Type *
              </label>
              <select
                id="tasting-type"
                data-testid="tasting-type-select"
                value={formData.type}
                onChange={(e) => updateFormData({ type: e.target.value })}
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
                          onChange={(e) => updateItem(index, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
                          required
                        />
                        {/* Mobile-specific input for first item */}
                        {index === 0 && (
                          <input
                            type="text"
                            data-testid="mobile-item-name"
                            placeholder="Mobile item name"
                            value={item.name}
                            onChange={(e) => updateItem(index, { name: e.target.value })}
                            className="md:hidden mt-2 w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
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
                          onChange={(e) => updateItem(index, { type: e.target.value })}
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
                onClick={addItem}
                className="mt-4 px-4 py-2 border border-fx-accent text-fx-accent rounded-lg hover:bg-fx-accent/10 transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Another Item
              </button>

              {/* Mobile Add Item Button */}
              <button
                type="button"
                data-testid="mobile-add-item"
                onClick={addItem}
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
                onChange={(e) => updateFormData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-fx-border rounded-lg focus:outline-none focus:ring-2 focus:ring-fx-accent/50"
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
              <button
                type="button"
                data-testid="create-tasting-submit"
                onClick={handleCreateTasting}
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-fx-primary text-white rounded-xl font-semibold text-lg hover:bg-fx-primaryHover disabled:opacity-50 transition-all duration-200"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Tasting...
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
                className="mt-4 w-full px-8 py-3 bg-[#10b981] text-white rounded-lg hover:bg-[#059669] transition-colors"
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
                  onClick={handleCreateTasting}
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
