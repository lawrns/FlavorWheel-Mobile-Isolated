'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface ResponsiveImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  sizes?: string
  // Custom srcset generation
  generateSrcSet?: boolean
  baseWidth?: number
  maxWidth?: number
  step?: number
  // Progressive loading options
  enableProgressive?: boolean
  lqipSrc?: string // Low Quality Image Placeholder
  aspectRatio?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  loading?: 'lazy' | 'eager'
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  generateSrcSet = true,
  baseWidth = 320,
  maxWidth = 1920,
  step = 320,
  enableProgressive = true,
  lqipSrc,
  aspectRatio,
  objectFit = 'cover',
  loading = 'lazy',
  ...props
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLQIPLoaded, setIsLQIPLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [supportsWebP, setSupportsWebP] = useState<boolean | null>(null)

  // WebP support detection
  const checkWebPSupport = useCallback(() => {
    if (supportsWebP !== null) return supportsWebP

    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d')
    if (!ctx) return false

    const img = new Image()
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
    img.onload = () => setSupportsWebPSupport(true)
    img.onerror = () => setSupportsWebPSupport(false)

    return false
  }, [supportsWebP])

  const setSupportsWebPSupport = (supported: boolean) => {
    setSupportsWebP(supported)
  }

  // Generate srcset for different screen sizes with WebP support
  const generateSrcSetString = useCallback(() => {
    if (!generateSrcSet) return undefined

    const srcSet = []
    const format = supportsWebP ? 'webp' : 'jpg'

    for (let w = baseWidth; w <= maxWidth; w += step) {
      // For Next.js images, we can use the width parameter
      const url = `${src}?w=${w}&q=${quality}&fm=${format}`
      srcSet.push(`${url} ${w}w`)
    }
    return srcSet.join(', ')
  }, [generateSrcSet, baseWidth, maxWidth, step, src, quality, supportsWebP])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    onError?.()
  }, [onError])

  const handleLQIPLoad = useCallback(() => {
    setIsLQIPLoaded(true)
  }, [])

  // Determine if we should show progressive loading
  const shouldUseProgressive = enableProgressive && (lqipSrc || blurDataURL)

  // Calculate aspect ratio if provided
  const style = aspectRatio ? { aspectRatio: aspectRatio.toString() } : {}

  // If we have width and height, use Next.js Image component for optimization
  if (width && height) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={style}>
        {/* Low Quality Image Placeholder (LQIP) */}
        {shouldUseProgressive && lqipSrc && (
          <img
            src={lqipSrc}
            alt=""
            className={`absolute inset-0 w-full h-full object-${objectFit} blur-sm scale-110 transition-opacity duration-300 ${
              isLQIPLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLQIPLoad}
            aria-hidden="true"
          />
        )}

        {/* Main Image */}
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          quality={quality}
          priority={priority}
          placeholder={shouldUseProgressive ? 'empty' : placeholder}
          blurDataURL={blurDataURL}
          sizes={sizes}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-${objectFit} transition-opacity duration-500 ${
            isLoaded ? 'opacity-100' : shouldUseProgressive ? 'opacity-0' : 'opacity-100'
          }`}
          style={style}
          {...props}
        />

        {/* Loading skeleton or blur effect */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
            {shouldUseProgressive && isLQIPLoaded && (
              <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm" />
            )}
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs">Failed to load image</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Fallback to regular img with srcset for responsive images without fixed dimensions
  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Low Quality Image Placeholder (LQIP) */}
      {shouldUseProgressive && lqipSrc && (
        <img
          src={lqipSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-${objectFit} blur-sm scale-110 transition-opacity duration-300 ${
            isLQIPLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLQIPLoad}
          aria-hidden="true"
        />
      )}

      <img
        src={src}
        alt={alt}
        srcSet={generateSrcSetString()}
        sizes={sizes}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-${objectFit} transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : shouldUseProgressive ? 'opacity-0' : 'opacity-100'
        }`}
        style={style}
        {...props}
      />

      {/* Loading skeleton or blur effect */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse">
          {shouldUseProgressive && isLQIPLoaded && (
            <div className="absolute inset-0 bg-black bg-opacity-10 backdrop-blur-sm" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for hero images with multiple breakpoints
interface HeroImageProps extends Omit<ResponsiveImageProps, 'sizes'> {
  mobileSrc?: string
  tabletSrc?: string
  desktopSrc?: string
}

export function HeroImage({
  src,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  alt,
  className = '',
  ...props
}: HeroImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
  }

  // Use picture element for art direction
  if (mobileSrc || tabletSrc || desktopSrc) {
    return (
      <div className={`relative ${className}`}>
        <picture>
          {desktopSrc && (
            <source media="(min-width: 1024px)" srcSet={desktopSrc} />
          )}
          {tabletSrc && (
            <source media="(min-width: 768px)" srcSet={tabletSrc} />
          )}
          {mobileSrc && (
            <source media="(max-width: 767px)" srcSet={mobileSrc} />
          )}
          <img
            src={src}
            alt={alt}
            onLoad={handleLoad}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            {...props}
          />
        </picture>

        {/* Loading skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    )
  }

  // Fallback to responsive image
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      className={className}
      sizes="100vw"
      onLoad={handleLoad}
      {...props}
    />
  )
}

// Utility function to generate responsive image URLs for external services
export function generateResponsiveUrls(baseUrl: string, widths: number[] = [320, 640, 768, 1024, 1280, 1920]) {
  return widths.map(width => ({
    width,
    url: `${baseUrl}?w=${width}&q=75&fm=webp`
  }))
}

// Hook for responsive image loading
export function useResponsiveImage() {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const handleLoad = () => setLoadingState('loaded')
  const handleError = () => setLoadingState('error')
  const startLoading = () => setLoadingState('loading')

  return {
    loadingState,
    handleLoad,
    handleError,
    startLoading,
    isLoading: loadingState === 'loading',
    isLoaded: loadingState === 'loaded',
    hasError: loadingState === 'error'
  }
}
