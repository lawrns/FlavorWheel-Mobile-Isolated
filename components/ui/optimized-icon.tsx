'use client'

import { useEffect, useState } from 'react'
import { OptimizedIcon as BaseOptimizedIcon, SVGOptimizer, svgUtils } from '@/lib/svg-optimizer'

interface OptimizedIconProps {
  name: string
  className?: string
  size?: number | string
  color?: string
  title?: string
  onClick?: () => void
}

// Icon registry - preload commonly used icons
const ICON_REGISTRY: Record<string, string> = {
  // Common UI icons
  'chevron-down': `<path d="m6 9 6 6 6-6"/>`,
  'chevron-up': `<path d="m18 15-6-6-6 6"/>`,
  'chevron-left': `<path d="m15 18-6-6 6-6"/>`,
  'chevron-right': `<path d="m9 18 6-6-6-6"/>`,
  'close': `<path d="M18 6L6 18M6 6l12 12"/>`,
  'menu': `<path d="M3 12h18M3 6h18M3 18h18"/>`,
  'search': `<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>`,
  'heart': `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  'star': `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>`,
  'user': `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
  'settings': `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
  'home': `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>`,
  'plus': `<path d="M12 5v14M5 12h14"/>`,
  'minus': `<path d="M5 12h14"/>`,
  'edit': `<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>`,
  'trash': `<polyline points="3,6 5,6 21,6"/><path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2,-2V6m3,0V4a2,2 0 0,1,2,-2h4a2,2 0 0,1,2,2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,

  // FlavorWheel specific icons
  'flavor-wheel': `<circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20 10 10 0 0 1 0-20"/><path d="M2 12a10 10 0 0 1 20 0 10 10 0 0 1-20 0"/><circle cx="12" cy="12" r="2"/><path d="M12 4v16M4 12h16"/>`,
  'tasting': `<path d="M8 2v4m8-4v4M3 10h18l-2 8H5l-2-8z"/><path d="M7 18a2 2 0 1 0 4 0H7z"/><path d="M17 18a2 2 0 1 0 4 0h-4z"/>`,
  'spirit-bottle': `<path d="M8 2v6m8-6v6M3 10h18l-3 12H6L3 10z"/><path d="M7 22a2 2 0 0 1-2-2V10h10v10a2 2 0 0 1-2 2H7z"/>`,
  'rating-star': `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>`,
}

// SVG Sprite system for better performance
class IconSpriteManager {
  private static instance: IconSpriteManager
  private spriteElement: HTMLDivElement | null = null
  private loadedIcons = new Set<string>()

  static getInstance(): IconSpriteManager {
    if (!IconSpriteManager.instance) {
      IconSpriteManager.instance = new IconSpriteManager()
    }
    return IconSpriteManager.instance
  }

  private constructor() {
    // Don't initialize immediately - wait for first use
  }

  private initializeSprite(): void {
    if (this.spriteElement) return // Already initialized

    // Check if document is ready
    if (typeof window === 'undefined' || !document || !document.body) {
      console.warn('Document not ready for sprite initialization')
      return
    }

    try {
      // Create sprite container
      this.spriteElement = document.createElement('div')
      this.spriteElement.id = 'icon-sprite-container'
      this.spriteElement.style.display = 'none'
      this.spriteElement.setAttribute('aria-hidden', 'true')

      // Add to document
      document.body.appendChild(this.spriteElement)
    } catch (error) {
      console.error('Failed to initialize icon sprite:', error)
    }
  }

  addIcon(name: string, svg: string): void {
    // Initialize sprite if not already done
    this.initializeSprite()

    if (!this.spriteElement || this.loadedIcons.has(name)) return

    try {
      const optimizedSvg = SVGOptimizer.optimize(svg)
      const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol')
      symbol.id = `icon-${name}`
      symbol.setAttribute('viewBox', '0 0 24 24')
      symbol.innerHTML = optimizedSvg

      this.spriteElement.appendChild(symbol)
      this.loadedIcons.add(name)
    } catch (error) {
      console.error(`Failed to add icon ${name}:`, error)
    }
  }

  isIconLoaded(name: string): boolean {
    return this.loadedIcons.has(name)
  }

  useSprite(name: string): boolean {
    return this.loadedIcons.has(name)
  }
}

const spriteManager = IconSpriteManager.getInstance()

// Preload commonly used icons
export function preloadCommonIcons(): void {
  // Only run on client side and when document is ready
  if (typeof window === 'undefined' || !document || !document.body) {
    return
  }

  try {
    const commonIcons = ['search', 'user', 'settings', 'home', 'close', 'menu', 'chevron-down']

    commonIcons.forEach(iconName => {
      if (ICON_REGISTRY[iconName]) {
        spriteManager.addIcon(iconName, ICON_REGISTRY[iconName])
      }
    })
  } catch (error) {
    console.error('Failed to preload common icons:', error)
  }
}

export function OptimizedIcon({
  name,
  className = '',
  size = 24,
  color,
  title,
  onClick
}: OptimizedIconProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [svgContent, setSvgContent] = useState<string>('')

  useEffect(() => {
    const loadIcon = async () => {
      try {
        let svg = ICON_REGISTRY[name]

        if (!svg) {
          // Try to load from external source or generate placeholder
          svg = `<circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/>` // Default icon
        }

        // Optimize the SVG
        const optimizedSvg = SVGOptimizer.optimize(svg)

        // Add to sprite for better performance
        spriteManager.addIcon(name, optimizedSvg)

        setSvgContent(optimizedSvg)
        setIsLoaded(true)
      } catch (error) {
        console.error(`Failed to load icon: ${name}`, error)
        setIsLoaded(true) // Still mark as loaded to show fallback
      }
    }

    if (!isLoaded) {
      loadIcon()
    }
  }, [name, isLoaded])

  if (!isLoaded) {
    // Loading placeholder
    return (
      <div
        className={`inline-block animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={title || `${name} icon loading`}
      />
    )
  }

  // Use sprite if available for better performance
  if (spriteManager.useSprite(name)) {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        onClick={onClick}
        role="img"
        aria-label={title || `${name} icon`}
      >
        <use href={`#icon-${name}`} />
      </svg>
    )
  }

  // Fallback for missing icons - show a simple placeholder
  if (!ICON_REGISTRY[name]) {
    console.warn(`Icon "${name}" not found in registry`)
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        role="img"
        aria-label={title || `${name} icon (fallback)`}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M6 12h12" />
      </svg>
    )
  }

  // Fallback to inline SVG
  return (
    <BaseOptimizedIcon
      svg={svgContent}
      className={className}
      size={size}
      color={color}
      title={title}
      onClick={onClick}
    />
  )
}

// Icon variants for different use cases
export function createIconVariant(baseIcon: string, variant: 'outline' | 'filled' | 'minimal' = 'outline') {
  return function IconVariant(props: Omit<OptimizedIconProps, 'name'>) {
    return <OptimizedIcon {...props} name={`${baseIcon}-${variant}`} />
  }
}

// Export common icon components
export const SearchIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="search" />
)

export const UserIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="user" />
)

export const SettingsIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="settings" />
)

export const HomeIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="home" />
)

export const CloseIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="close" />
)

export const MenuIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="menu" />
)

export const ChevronDownIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="chevron-down" />
)

export const FlavorWheelIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="flavor-wheel" />
)

export const TastingIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="tasting" />
)

export const SpiritBottleIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="spirit-bottle" />
)

export const RatingStarIcon = (props: Omit<OptimizedIconProps, 'name'>) => (
  <OptimizedIcon {...props} name="rating-star" />
)
