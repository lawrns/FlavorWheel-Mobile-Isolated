'use client'

import { useEffect, useState } from 'react'
import { preloadCommonIcons } from '@/components/ui/optimized-icon'

export function IconPreloader() {
  const [hasPreloaded, setHasPreloaded] = useState(false)

  useEffect(() => {
    // Only preload once and ensure we're on client side
    if (hasPreloaded || typeof window === 'undefined') {
      return
    }

    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      try {
        preloadCommonIcons()
        setHasPreloaded(true)
      } catch (error) {
        console.error('Icon preloading failed:', error)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [hasPreloaded])

  // This component doesn't render anything
  return null
}
