'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Centralized brand constants to prevent drift
export const BRAND_NAME = 'FlavatiX'
export const BRAND_TAGLINE = 'Discover the art of wine tasting! Join 10K+ tasters worldwide and unlock new flavors today!'
export const BRAND_TAGLINE_SHORT = 'Discover the art of wine tasting!'

interface BrandHeaderProps {
  variant?: 'full' | 'compact' | 'minimal'
  showIcon?: boolean
  showTagline?: boolean
  className?: string
  animated?: boolean
}

export function BrandHeader({
  variant = 'full',
  showIcon = true,
  showTagline = true,
  className,
  animated = true,
}: BrandHeaderProps) {
  const iconSizes = {
    full: 'h-16 w-16 text-2xl',
    compact: 'h-12 w-12 text-xl',
    minimal: 'h-8 w-8 text-lg',
  }

  const titleSizes = {
    full: 'text-2xl md:text-3xl',
    compact: 'text-xl md:text-2xl',
    minimal: 'text-lg md:text-xl',
  }

  const taglineSizes = {
    full: 'text-sm md:text-base',
    compact: 'text-xs md:text-sm',
    minimal: 'text-xs',
  }

  const content = (
    <div className={cn('text-center space-y-2', className)}>
      {showIcon && (
        <div className="flex justify-center">
          <div
            className={cn(
              'flex items-center justify-center rounded-full bg-fx-primary',
              iconSizes[variant]
            )}
          >
            <img
              src="/images/flavatix_logo.png"
              alt="FlavatiX Logo"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        <h1 className={cn('font-bold text-fx-text-primary font-heading', titleSizes[variant])}>
          {BRAND_NAME}
        </h1>
        {showTagline && (
          <p className={cn('text-fx-text-secondary', taglineSizes[variant])}>
            {variant === 'minimal' ? BRAND_TAGLINE_SHORT : BRAND_TAGLINE}
          </p>
        )}
      </div>
    </div>
  )

  if (!animated) {
    return content
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  )
}

interface BrandTitleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function BrandTitle({ className, size = 'md' }: BrandTitleProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <span className={cn('font-bold text-fx-primary font-heading', sizeClasses[size], className)}>
      {BRAND_NAME}
    </span>
  )
}

interface BrandIconProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

export function BrandIcon({ size = 'md', className, animated = false }: BrandIconProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-lg',
    md: 'h-12 w-12 text-xl',
    lg: 'h-16 w-16 text-2xl',
  }

  const icon = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-fx-primary',
        sizeClasses[size],
        className
      )}
    >
      <img
        src="/images/flavatix_logo.png"
        alt="FlavatiX Logo"
        className="h-full w-full object-contain"
      />
    </div>
  )

  if (!animated) {
    return icon
  }

  return (
    <motion.div
      animate={{
        rotate: [0, -5, 5, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {icon}
    </motion.div>
  )
}

interface LogoOnlyProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  animated?: boolean
  onClick?: () => void
}

export function LogoOnly({ size = 'md', className, animated = false, onClick }: LogoOnlyProps) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  }

  const logo = (
    <img
      src="/images/flavatix_logo.png"
      alt="FlavatiX Logo"
      className={cn('object-contain', onClick && 'cursor-pointer', sizeClasses[size], className)}
      onClick={onClick}
    />
  )

  if (!animated) return logo

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {logo}
    </motion.div>
  )
}

interface ResponsiveBrandProps {
  showIconOnMobile?: boolean
  showTitleOnMobile?: boolean
  className?: string
  onClick?: () => void
}

export function ResponsiveBrand({
  showIconOnMobile = true,
  showTitleOnMobile = false,
  className,
  onClick
}: ResponsiveBrandProps) {
  return (
    <div className={cn('flex items-center gap-2', onClick && 'cursor-pointer', className)} onClick={onClick}>
      {/* Always show icon */}
      {showIconOnMobile && <BrandIcon size="sm" />}

      {/* Responsive title */}
      <div className={cn(
        'transition-all duration-200',
        showTitleOnMobile ? 'block' : 'hidden sm:block'
      )}>
        <BrandTitle size="sm" />
      </div>
    </div>
  )
}
