import { Variants } from 'framer-motion'

// Unified Motion Tokens
export const motionTokens = {
  durations: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
  },
  easings: {
    standard: [0.4, 0, 0.2, 1],
    spring: [0.34, 1.56, 0.64, 1],
  },
  stagger: {
    default: 0.05,
    list: 0.075,
  },
}

// Hero Animation Patterns
export const heroVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.durations.normal,
      staggerChildren: motionTokens.stagger.default,
      ease: motionTokens.easings.standard,
    },
  },
}

export const heroChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easings.standard,
    },
  },
}

// Button Animation Patterns
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: motionTokens.durations.fast,
      ease: motionTokens.easings.spring,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: motionTokens.durations.fast,
      ease: motionTokens.easings.spring,
    },
  },
}

// Card Animation Patterns
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easings.spring,
    },
  },
  hover: {
    y: -4,
    transition: {
      duration: motionTokens.durations.fast,
      ease: motionTokens.easings.spring,
    },
  },
}

// List Animation Patterns
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: motionTokens.stagger.list,
      delayChildren: 0.1,
    },
  },
}

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easings.spring,
    },
  },
}

// Modal Animation Patterns
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easings.spring,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: motionTokens.durations.fast,
      ease: motionTokens.easings.standard,
    },
  },
}

// Navigation Animation Patterns
export const navUnderlineVariants: Variants = {
  hidden: { width: 0, x: 0 },
  visible: (custom: number) => ({
    width: custom,
    x: 0,
    transition: {
      duration: motionTokens.durations.normal,
      ease: motionTokens.easings.spring,
    },
  }),
}

// Utility Functions
export const createStaggeredAnimation = (delay: number = motionTokens.stagger.default) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: delay,
    },
  },
})

export const createFadeInUp = (delay: number = 0) => ({
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.durations.normal,
      delay,
      ease: motionTokens.easings.standard,
    },
  },
})

export const createSlideIn = (direction: 'left' | 'right' | 'up' | 'down', delay: number = 0) => {
  const directions = {
    left: { x: -20 },
    right: { x: 20 },
    up: { y: -20 },
    down: { y: 20 },
  }

  return {
    hidden: {
      opacity: 0,
      ...directions[direction],
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: motionTokens.durations.normal,
        delay,
        ease: motionTokens.easings.spring,
      },
    },
  }
}

// Prefers Reduced Motion Hook
export const useReducedMotion = () => {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Animation Props Factory
export const getAnimationProps = (
  variant: 'fadeIn' | 'slideIn' | 'scaleIn' | 'stagger',
  options?: {
    delay?: number
    direction?: 'left' | 'right' | 'up' | 'down'
    reducedMotion?: boolean
  }
) => {
  const { delay = 0, direction = 'up', reducedMotion = false } = options || {}

  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.2 },
    }
  }

  switch (variant) {
    case 'fadeIn':
      return {
        initial: 'hidden',
        animate: 'visible',
        variants: createFadeInUp(delay),
      }
    case 'slideIn':
      return {
        initial: 'hidden',
        animate: 'visible',
        variants: createSlideIn(direction, delay),
      }
    case 'scaleIn':
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        transition: {
          duration: motionTokens.durations.normal,
          delay,
          ease: motionTokens.easings.spring,
        },
      }
    case 'stagger':
      return {
        initial: 'hidden',
        animate: 'visible',
        variants: createStaggeredAnimation(delay),
      }
    default:
      return {}
  }
}
