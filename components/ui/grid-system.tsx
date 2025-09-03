'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: boolean
  animate?: boolean
}

const gridVariants = {
  columns: {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12',
  },
  gaps: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
}

export function Grid({
  children,
  className,
  columns = 3,
  gap = 'md',
  responsive = true,
  animate = false,
}: GridProps) {
  const gridClasses = cn(
    'grid',
    responsive ? gridVariants.columns[columns] : `grid-cols-${columns}`,
    gridVariants.gaps[gap],
    className
  )

  if (!animate) {
    return <div className={gridClasses}>{children}</div>
  }

  return (
    <motion.div
      className={gridClasses}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: 'easeOut',
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  center?: boolean
}

const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

const containerPadding = {
  none: 'px-0',
  sm: 'px-4',
  md: 'px-6',
  lg: 'px-8',
}

export function Container({
  children,
  className,
  size = 'lg',
  padding = 'md',
  center = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        containerSizes[size],
        containerPadding[padding],
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

interface SectionProps {
  children: React.ReactNode
  className?: string
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  background?: 'none' | 'muted' | 'surface' | 'primary' | 'gradient'
  animate?: boolean
}

const sectionPadding = {
  xs: 'py-8',
  sm: 'py-12',
  md: 'py-16',
  lg: 'py-20',
  xl: 'py-24',
  '2xl': 'py-32',
}

const sectionBackgrounds = {
  none: '',
  muted: 'bg-muted/50',
  surface: 'bg-surface',
  primary: 'bg-primary/5',
  gradient: 'bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10',
}

export function Section({
  children,
  className,
  padding = 'lg',
  background = 'none',
  animate = false,
}: SectionProps) {
  const content = (
    <section
      className={cn(
        sectionPadding[padding],
        sectionBackgrounds[background],
        className
      )}
    >
      {children}
    </section>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.section
      className={cn(
        sectionPadding[padding],
        sectionBackgrounds[background],
        className
      )}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.section>
  )
}

interface FlexProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  wrap?: boolean
  responsive?: boolean
}

const flexAlignments = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const flexJustifications = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

const flexGaps = {
  xs: 'gap-2',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
  xl: 'gap-12',
}

export function Flex({
  children,
  className,
  direction = 'row',
  align = 'center',
  justify = 'start',
  gap = 'md',
  wrap = false,
  responsive = false,
}: FlexProps) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        responsive && direction === 'row' && 'md:flex-row flex-col',
        flexAlignments[align],
        flexJustifications[justify],
        flexGaps[gap],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  )
}

interface StackProps {
  children: React.ReactNode
  className?: string
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  animate?: boolean
}

const stackSpacing = {
  xs: 'space-y-2',
  sm: 'space-y-4',
  md: 'space-y-6',
  lg: 'space-y-8',
  xl: 'space-y-12',
}

export function Stack({
  children,
  className,
  spacing = 'md',
  align = 'stretch',
  animate = false,
}: StackProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col',
        stackSpacing[spacing],
        align === 'center' && 'items-center',
        align === 'start' && 'items-start',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        className
      )}
    >
      {children}
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      className={cn(
        'flex flex-col',
        stackSpacing[spacing],
        align === 'center' && 'items-center',
        align === 'start' && 'items-start',
        align === 'end' && 'items-end',
        align === 'stretch' && 'items-stretch',
        className
      )}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: 'easeOut',
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
