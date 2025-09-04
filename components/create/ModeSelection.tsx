'use client'

import { GraduationCap, Trophy, Zap, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

type TastingMode = 'study' | 'competition' | 'quick' | 'mode-selection' | null

interface ModeSelectionProps {
  onModeSelect: (mode: TastingMode) => void
  locale: string
}

export function ModeSelection({ onModeSelect, locale }: ModeSelectionProps) {
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
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as any }
    }
  }

  const handleModeClick = (mode: TastingMode) => {
    onModeSelect(mode)
  }

  return (
    <div className="min-h-screen bg-fx-bg pb-24 md:pb-32">
      <motion.main
        className="mx-auto max-w-[768px] px-4 sm:px-6 py-6 md:py-8"
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
              onClick={() => handleModeClick(mode)}
              className={`w-full bg-gradient-to-r ${gradient} backdrop-blur-sm border ${borderColor} rounded-xl p-4 md:p-6 text-left hover:shadow-fx transition-all duration-normal ease-standard active:scale-[0.98] group overflow-hidden relative min-h-[120px] md:min-h-[140px] touch-manipulation`}
              data-testid={`create-${mode}-mode`}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-normal ease-standard" />

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
                {/* Icon with enhanced styling */}
                <motion.div
                  className={`rounded-2xl ${iconBg} p-3 md:p-4 shadow-lg ${shadowColor} group-hover:scale-110 transition-transform duration-normal ease-standard self-start sm:self-center`}
                  whileHover={{ rotate: 5 }}
                >
                  <Icon className={`h-6 w-6 md:h-8 md:w-8 ${iconColor}`} />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-lg md:text-xl font-semibold text-fx-text mb-2 font-heading group-hover:text-fx-primary transition-colors duration-normal ease-standard"
                    style={{ fontFamily: "'Playfair Display', ui-serif, Georgia, serif" }}
                  >
                    {title}
                  </h2>
                  <p className="text-fx-text2 font-body leading-relaxed text-sm md:text-base">
                    {description}
                  </p>
                </div>

                {/* Action indicator */}
                <motion.div
                  className="text-fx-primary self-end sm:self-center"
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-5 w-5 md:h-6 md:w-6" />
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
