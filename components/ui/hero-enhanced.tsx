'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getAnimationProps } from '@/lib/motion-utils'

interface HeroEnhancedProps {
  title: string
  subtitle?: string
  description?: string
  cta?: React.ReactNode
  background?: 'gradient' | 'solid' | 'pattern'
  className?: string
}

export function HeroEnhanced({
  title,
  subtitle,
  description,
  cta,
  background = 'gradient',
  className
}: HeroEnhancedProps) {
  const backgroundClasses = {
    gradient: 'bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10',
    solid: 'bg-surface',
    pattern: 'bg-surface relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.15)_1px,transparent_0)] before:bg-[length:20px_20px]'
  }

  return (
    <section className={cn('relative min-h-[80vh] flex items-center justify-center px-6 py-section-y', backgroundClasses[background], className)}>
      <div className="max-w-container-max mx-auto text-center">
        {/* Title with staggered animation */}
        <motion.div
          {...getAnimationProps('fadeIn', { delay: 0 })}
          className="mb-6"
        >
          <h1 className="text-display font-bold text-foreground leading-tight mb-4">
            {title}
          </h1>
        </motion.div>

        {/* Subtitle with delayed animation */}
        {subtitle && (
          <motion.div
            {...getAnimationProps('fadeIn', { delay: 0.2 })}
            className="mb-6"
          >
            <h2 className="text-h2 font-semibold text-foreground/90">
              {subtitle}
            </h2>
          </motion.div>
        )}

        {/* Description with further delayed animation */}
        {description && (
          <motion.div
            {...getAnimationProps('fadeIn', { delay: 0.4 })}
            className="mb-8 max-w-2xl mx-auto"
          >
            <p className="text-body-lg text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}

        {/* CTA with staggered animation */}
        {cta && (
          <motion.div
            {...getAnimationProps('fadeIn', { delay: 0.6 })}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {cta}
          </motion.div>
        )}
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </section>
  )
}
