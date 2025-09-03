'use client'

import { Sparkles, BookOpen, Target, ArrowLeft, Plus, X, GraduationCap, Trophy, Zap } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

type TastingMode = 'study' | 'competition' | 'quick' | null

export default function CreatePage() {
  const [selectedMode, setSelectedMode] = useState<TastingMode>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setSelectedMode(null)
  }

  const handleCreateTasting = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Navigate to appropriate mode creation page
      if (selectedMode === 'study') {
        router.push(`/${locale}/create/study`)
      } else if (selectedMode === 'competition') {
        router.push(`/${locale}/create/competition`)
      } else if (selectedMode === 'quick') {
        router.push(`/${locale}/quick-tasting`)
      } else {
        // Fallback to landing page
        router.push(`/${locale}/landing`)
      }
    } catch (error) {
      console.error('Error creating tasting:', error)
      // Could add error toast here
    } finally {
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

  // Mode selection view
  if (!selectedMode) {
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
                className={`w-full bg-gradient-to-r ${gradient} backdrop-blur-sm border ${borderColor} rounded-xl p-6 text-left hover:shadow-xl hover:shadow-fx transition-all duration-300 active:scale-[0.98] group overflow-hidden relative`}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex items-center space-x-5">
                  {/* Icon with enhanced styling */}
                  <motion.div
                    className={`rounded-2xl ${iconBg} p-4 shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className={`h-8 w-8 ${iconColor}`} />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h2
                      className="text-xl font-semibold text-fx-text mb-2 font-heading group-hover:text-fx-primary transition-colors duration-300"
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
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fx-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

  // Form view (redirecting to dedicated pages for now)
  return (
    <div className="min-h-screen bg-fx-bg">
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
              {selectedMode?.charAt(0).toUpperCase()}{selectedMode?.slice(1)} Mode
            </h1>
            <p className="text-sm text-fx-text2 font-body mt-1">
              Configure your tasting experience
            </p>
          </div>
        </motion.div>

        {/* Enhanced Form Card */}
        <motion.div
          className="bg-white/90 backdrop-blur-sm border border-fx-border rounded-xl p-6 sm:p-8 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-fx-text font-heading mb-3">
              Setup Your Experience
            </h2>
            <p className="text-fx-text2 font-body">
              Let's get your tasting session ready for an exceptional experience
            </p>
          </div>

          <div className="space-y-6">
            {/* Quick Setup Options */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { title: 'Quick Setup', desc: 'Use defaults', icon: Zap },
                { title: 'Custom Setup', desc: 'Full configuration', icon: Target },
                { title: 'Template', desc: 'Pre-built setups', icon: Sparkles }
              ].map((option, index) => (
                <motion.button
                  key={option.title}
                  className="p-4 bg-gradient-to-br from-fx-bg to-white border border-fx-border rounded-lg hover:shadow-soft hover:border-fx-primary/50 transition-all duration-200 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <option.icon className="h-8 w-8 text-fx-primary mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-semibold text-fx-text font-heading">{option.title}</div>
                  <div className="text-xs text-fx-text2 font-body mt-1">{option.desc}</div>
                </motion.button>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              className="text-center pt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button
                onClick={() => handleModeSelect(selectedMode)}
                disabled={isSubmitting}
                className="px-8 py-4 bg-fx-primary text-white rounded-xl font-semibold text-lg hover:bg-fx-primaryHover disabled:opacity-50 transition-all duration-200 btn-primary shadow-soft"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  `Continue to ${selectedMode?.charAt(0).toUpperCase()}${selectedMode?.slice(1)} Setup`
                )}
              </motion.button>
              <p className="text-sm text-fx-muted font-body mt-4">
                You'll be able to customize every detail in the next step
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.main>
    </div>
  )
}
