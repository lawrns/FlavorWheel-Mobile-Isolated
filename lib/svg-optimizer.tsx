// SVG optimization and caching utilities for better performance

interface SVGOptimizationOptions {
  removeDoctype?: boolean
  removeXMLProcInst?: boolean
  removeComments?: boolean
  removeMetadata?: boolean
  removeEditorsNSData?: boolean
  cleanupAttrs?: boolean
  mergeStyles?: boolean
  inlineStyles?: boolean
  minifyStyles?: boolean
  convertStyleToAttrs?: boolean
  cleanupIDs?: boolean
  removeUselessStrokeAndFill?: boolean
  removeEmptyAttrs?: boolean
  removeEmptyText?: boolean
  removeEmptyContainers?: boolean
  cleanupNumericValues?: boolean
  convertColors?: boolean
  convertPathData?: boolean
  convertTransform?: boolean
  removeUnknownsAndDefaults?: boolean
  removeNonInheritableGroupAttrs?: boolean
  removeUnusedNS?: boolean
  cleanupEnableBackground?: boolean
  removeHiddenElems?: boolean
  mergePaths?: boolean
  convertShapeToPath?: boolean
  removeViewBox?: boolean
}

class SVGOptimizer {
  private static cache = new Map<string, string>()
  private static readonly defaultOptions: SVGOptimizationOptions = {
    removeDoctype: true,
    removeXMLProcInst: true,
    removeComments: true,
    removeMetadata: true,
    removeEditorsNSData: true,
    cleanupAttrs: true,
    mergeStyles: true,
    inlineStyles: false,
    minifyStyles: true,
    convertStyleToAttrs: true,
    cleanupIDs: true,
    removeUselessStrokeAndFill: true,
    removeEmptyAttrs: true,
    removeEmptyText: true,
    removeEmptyContainers: true,
    cleanupNumericValues: true,
    convertColors: true,
    convertPathData: true,
    convertTransform: true,
    removeUnknownsAndDefaults: true,
    removeNonInheritableGroupAttrs: true,
    removeUnusedNS: true,
    cleanupEnableBackground: true,
    removeHiddenElems: true,
    mergePaths: true,
    convertShapeToPath: true,
  }

  /**
   * Optimize SVG content
   */
  static optimize(svgContent: string, options: Partial<SVGOptimizationOptions> = {}): string {
    const cacheKey = this.generateCacheKey(svgContent, options)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const opts = { ...this.defaultOptions, ...options }
    let optimized = svgContent

    // Remove XML declaration
    if (opts.removeXMLProcInst) {
      optimized = optimized.replace(/<\?xml.*?\?>/g, '')
    }

    // Remove DOCTYPE
    if (opts.removeDoctype) {
      optimized = optimized.replace(/<!DOCTYPE.*?>/g, '')
    }

    // Remove comments
    if (opts.removeComments) {
      optimized = optimized.replace(/<!--.*?-->/g, '')
    }

    // Remove metadata
    if (opts.removeMetadata) {
      optimized = optimized.replace(/<metadata.*?>.*?<\/metadata>/g, '')
    }

    // Remove editor namespaces
    if (opts.removeEditorsNSData) {
      optimized = optimized.replace(/xmlns:(inkscape|sodipodi|adobe).*?=".*?"/g, '')
    }

    // Clean up attributes
    if (opts.cleanupAttrs) {
      optimized = this.cleanupAttributes(optimized)
    }

    // Remove empty attributes
    if (opts.removeEmptyAttrs) {
      optimized = optimized.replace(/\s+[a-zA-Z-]+=""/g, '')
    }

    // Remove empty text nodes
    if (opts.removeEmptyText) {
      optimized = optimized.replace(/>\s+</g, '><')
    }

    // Remove empty containers
    if (opts.removeEmptyContainers) {
      optimized = this.removeEmptyContainers(optimized)
    }

    // Clean up numeric values
    if (opts.cleanupNumericValues) {
      optimized = this.cleanupNumericValues(optimized)
    }

    // Convert colors
    if (opts.convertColors) {
      optimized = this.convertColors(optimized)
    }

    // Convert path data
    if (opts.convertPathData) {
      optimized = this.convertPathData(optimized)
    }

    // Convert transforms
    if (opts.convertTransform) {
      optimized = this.convertTransforms(optimized)
    }

    // Minify styles if present
    if (opts.minifyStyles) {
      optimized = this.minifyStyles(optimized)
    }

    // Cache the result
    this.cache.set(cacheKey, optimized)
    return optimized
  }

  /**
   * Generate cache key for SVG content
   */
  private static generateCacheKey(svgContent: string, options: Partial<SVGOptimizationOptions>): string {
    return `${svgContent.length}_${JSON.stringify(options)}`
  }

  /**
   * Clean up attributes (remove defaults, etc.)
   */
  private static cleanupAttributes(svg: string): string {
    // Remove default values
    return svg
      .replace(/\s+fill="black"/g, '')
      .replace(/\s+stroke="none"/g, '')
      .replace(/\s+stroke-width="1"/g, '')
      .replace(/\s+fill-opacity="1"/g, '')
      .replace(/\s+stroke-opacity="1"/g, '')
      .replace(/\s+opacity="1"/g, '')
  }

  /**
   * Remove empty containers
   */
  private static removeEmptyContainers(svg: string): string {
    return svg.replace(/<g[^>]*>\s*<\/g>/g, '')
  }

  /**
   * Clean up numeric values
   */
  private static cleanupNumericValues(svg: string): string {
    return svg
      .replace(/(\d+)\.0+(?=\D|$)/g, '$1') // Remove unnecessary .0
      .replace(/0\.(\d+)/g, '.$1') // Remove leading 0
      .replace(/(\d+)\s+/g, '$1 ') // Normalize spacing
  }

  /**
   * Convert colors to shorter formats
   */
  private static convertColors(svg: string): string {
    return svg
      .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/g, '#$1$2$3') // Convert 6-digit to 3-digit
      .replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g, (match, r, g, b) => {
        // Convert rgb() to hex if shorter
        const hex = `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`
        return hex.length <= match.length ? hex : match
      })
  }

  /**
   * Convert path data to more efficient format
   */
  private static convertPathData(svg: string): string {
    // Convert absolute to relative commands where beneficial
    return svg.replace(/([MLHVCSQTAZ])/g, (match) => match.toLowerCase())
  }

  /**
   * Convert transforms to more efficient format
   */
  private static convertTransforms(svg: string): string {
    // Convert matrix transforms to simpler forms when possible
    return svg.replace(/transform="matrix\(([^)]+)\)"/g, (match, matrix) => {
      const [a, b, c, d, e, f] = matrix.split(/\s*,\s*/).map(parseFloat)

      // Identity matrix
      if (a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0) {
        return ''
      }

      // Simple translate
      if (a === 1 && b === 0 && c === 0 && d === 1 && (e !== 0 || f !== 0)) {
        return `transform="translate(${e},${f})"`
      }

      // Simple scale
      if (b === 0 && c === 0 && e === 0 && f === 0 && a === d) {
        return `transform="scale(${a})"`
      }

      // Simple rotate (matrix for rotation)
      if (b === -c && a === d && e === 0 && f === 0) {
        const angle = Math.round(Math.acos(a) * 180 / Math.PI)
        return `transform="rotate(${angle})"`
      }

      return match
    })
  }

  /**
   * Minify styles
   */
  private static minifyStyles(svg: string): string {
    return svg
      .replace(/\s*{\s*/g, '{')
      .replace(/\s*}\s*/g, '}')
      .replace(/\s*;\s*/g, ';')
      .replace(/;\s*}/g, '}')
      .replace(/,\s*/g, ',')
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { entries: number; size: string } {
    const entries = this.cache.size
    let totalSize = 0
    for (const [, value] of this.cache) {
      totalSize += value.length * 2 // Rough estimate
    }

    const size = totalSize < 1024 ? `${totalSize} B` :
                 totalSize < 1024 * 1024 ? `${(totalSize / 1024).toFixed(1)} KB` :
                 `${(totalSize / (1024 * 1024)).toFixed(1)} MB`

    return { entries, size }
  }

  /**
   * Clear SVG optimization cache
   */
  static clearCache(): void {
    this.cache.clear()
  }
}

// SVG Icon component with optimization and caching
interface OptimizedIconProps {
  svg: string
  className?: string
  size?: number | string
  color?: string
  title?: string
  optimize?: boolean
  cache?: boolean
}

export function OptimizedIcon({
  svg,
  className = '',
  size = 24,
  color,
  title,
  optimize = true,
  cache = true
}: OptimizedIconProps) {
  // Optimize SVG if requested
  const optimizedSvg = optimize ? SVGOptimizer.optimize(svg) : svg

  // Apply color if specified
  const coloredSvg = color ? optimizedSvg.replace(/fill="[^"]*"/g, `fill="${color}"`) : optimizedSvg

  // Create SVG element
  const svgElement = (
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
      dangerouslySetInnerHTML={{ __html: coloredSvg }}
      role="img"
      aria-hidden={!title}
      aria-labelledby={title ? 'icon-title' : undefined}
    >
      {title && <title id="icon-title">{title}</title>}
    </svg>
  )

  return svgElement
}

// Utility functions for SVG handling
export const svgUtils = {
  /**
   * Load and optimize SVG from URL
   */
  async loadOptimizedSvg(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      const svg = await response.text()
      return SVGOptimizer.optimize(svg)
    } catch (error) {
      console.error('Failed to load SVG:', error)
      throw error
    }
  },

  /**
   * Inline SVG as data URL
   */
  svgToDataUrl(svg: string): string {
    const optimized = SVGOptimizer.optimize(svg)
    return `data:image/svg+xml;base64,${btoa(optimized)}`
  },

  /**
   * Generate SVG sprite from multiple SVGs
   */
  generateSprite(svgs: Record<string, string>): string {
    const symbols = Object.entries(svgs)
      .map(([id, svg]) => {
        const optimized = SVGOptimizer.optimize(svg)
        return `<symbol id="${id}" viewBox="0 0 24 24">${optimized}</symbol>`
      })
      .join('')

    return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">${symbols}</svg>`
  },

  /**
   * Get SVG dimensions from viewBox
   */
  getSvgDimensions(svg: string): { width: number; height: number } | null {
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
    if (!viewBoxMatch) return null

    const [, viewBox] = viewBoxMatch
    const [, , width, height] = viewBox.split(' ').map(Number)

    return { width, height }
  }
}

export { SVGOptimizer }
export type { SVGOptimizationOptions }
