// Performance monitoring utilities for Core Web Vitals and custom metrics
import React from 'react'

export interface CoreWebVitals {
  cls: number // Cumulative Layout Shift
  fid: number // First Input Delay
  fcp: number // First Contentful Paint
  lcp: number // Largest Contentful Paint
  ttfb: number // Time to First Byte
}

export interface PerformanceMetrics {
  coreWebVitals: Partial<CoreWebVitals>
  navigationTiming: NavigationTiming
  resourceTiming: ResourceTiming[]
  customMetrics: Record<string, number>
  timestamp: number
}

export interface NavigationTiming {
  domContentLoaded: number
  domInteractive: number
  domComplete: number
  loadEventEnd: number
  loadEventStart: number
}

export interface ResourceTiming {
  name: string
  duration: number
  size: number
  type: string
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics
  private observers: PerformanceObserver[] = []
  private isInitialized = false

  constructor() {
    this.metrics = {
      coreWebVitals: {},
      navigationTiming: {
        domContentLoaded: 0,
        domInteractive: 0,
        domComplete: 0,
        loadEventEnd: 0,
        loadEventStart: 0,
      },
      resourceTiming: [],
      customMetrics: {},
      timestamp: Date.now(),
    }
  }

  // Initialize performance monitoring
  initialize(): void {
    if (this.isInitialized || typeof window === 'undefined') return

    this.isInitialized = true

    // Monitor Core Web Vitals
    this.observeCoreWebVitals()

    // Monitor navigation timing
    this.observeNavigationTiming()

    // Monitor resource timing
    this.observeResourceTiming()

    // Monitor custom metrics
    this.observeCustomMetrics()

    console.log('🚀 Performance monitoring initialized')
  }

  // Observe Core Web Vitals
  private observeCoreWebVitals(): void {
    // CLS - Cumulative Layout Shift
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              this.metrics.coreWebVitals.cls =
                (this.metrics.coreWebVitals.cls || 0) + (entry as any).value
            }
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        this.observers.push(clsObserver)
      } catch (e) {
        console.warn('CLS observation not supported')
      }

      // FID - First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.coreWebVitals.fid = (entry as any).processingStart - entry.startTime
          }
        })
        fidObserver.observe({ entryTypes: ['first-input'] })
        this.observers.push(fidObserver)
      } catch (e) {
        console.warn('FID observation not supported')
      }

      // LCP - Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          this.metrics.coreWebVitals.lcp = lastEntry.startTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        this.observers.push(lcpObserver)
      } catch (e) {
        console.warn('LCP observation not supported')
      }
    }

    // FCP - First Contentful Paint (using paint timing)
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.coreWebVitals.fcp = entry.startTime
            }
          }
        })
        fcpObserver.observe({ entryTypes: ['paint'] })
        this.observers.push(fcpObserver)
      } catch (e) {
        console.warn('FCP observation not supported')
      }
    }
  }

  // Observe navigation timing
  private observeNavigationTiming(): void {
    if ('performance' in window && 'timing' in window.performance) {
      const timing = window.performance.timing

      this.metrics.navigationTiming = {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart,
        domComplete: timing.domComplete - timing.navigationStart,
        loadEventEnd: timing.loadEventEnd - timing.navigationStart,
        loadEventStart: timing.loadEventStart - timing.navigationStart,
      }

      this.metrics.coreWebVitals.ttfb = timing.responseStart - timing.requestStart
    }
  }

  // Observe resource timing
  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming
            this.metrics.resourceTiming.push({
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize || 0,
              type: this.getResourceType(resourceEntry.initiatorType),
            })
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)
      } catch (e) {
        console.warn('Resource timing observation not supported')
      }
    }
  }

  // Observe custom metrics
  private observeCustomMetrics(): void {
    // Bundle size tracking
    if ('performance' in window && 'getEntriesByType' in window.performance) {
      // Track bundle load times
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('.js') && entry.entryType === 'resource') {
            this.trackCustomMetric(`bundle_${entry.name.split('/').pop()}`, entry.duration)
          }
        }
      })
      observer.observe({ entryTypes: ['resource'] })
      this.observers.push(observer)
    }
  }

  // Helper function to get resource type
  private getResourceType(initiatorType: string): string {
    const typeMap: Record<string, string> = {
      'script': 'javascript',
      'link': 'stylesheet',
      'img': 'image',
      'xmlhttprequest': 'xhr',
      'fetch': 'fetch',
      'beacon': 'beacon',
      'video': 'video',
      'audio': 'audio',
      'font': 'font',
    }
    return typeMap[initiatorType] || 'other'
  }

  // Track custom metrics
  trackCustomMetric(name: string, value: number): void {
    this.metrics.customMetrics[name] = value
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  // Get Core Web Vitals scores
  getCoreWebVitals(): Partial<CoreWebVitals> {
    return { ...this.metrics.coreWebVitals }
  }

  // Check if metrics meet performance targets
  checkPerformanceTargets(): {
    lcp: 'good' | 'needs-improvement' | 'poor'
    fid: 'good' | 'needs-improvement' | 'poor'
    cls: 'good' | 'needs-improvement' | 'poor'
  } {
    const { lcp, fid, cls } = this.metrics.coreWebVitals

    return {
      lcp: lcp ? (lcp <= 2500 ? 'good' : lcp <= 4000 ? 'needs-improvement' : 'poor') : 'needs-improvement',
      fid: fid ? (fid <= 100 ? 'good' : fid <= 300 ? 'needs-improvement' : 'poor') : 'needs-improvement',
      cls: cls ? (cls <= 0.1 ? 'good' : cls <= 0.25 ? 'needs-improvement' : 'poor') : 'needs-improvement',
    }
  }

  // Send metrics to analytics service
  async sendMetrics(): Promise<void> {
    try {
      const metrics = this.getMetrics()

      // Send to your analytics service
      if (typeof window !== 'undefined' && 'gtag' in window) {
        ;(window as any).gtag('event', 'performance_metrics', {
          custom_map: { metric_value: metrics },
          metric_value: JSON.stringify(metrics),
        })
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance Metrics:', metrics)
        console.log('🎯 Core Web Vitals Status:', this.checkPerformanceTargets())
      }
    } catch (error) {
      console.error('Failed to send performance metrics:', error)
    }
  }

  // Clean up observers
  destroy(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect()
      } catch (e) {
        // Observer might already be disconnected
      }
    })
    this.observers = []
    this.isInitialized = false
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Utility functions for components
export const trackComponentRender = (componentName: string) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const startTime = performance.now()
    return () => {
      const duration = performance.now() - startTime
      performanceMonitor.trackCustomMetric(`render_${componentName}`, duration)
    }
  }
  return () => {} // No-op if performance API not available
}

export const trackUserInteraction = (interactionName: string) => {
  performanceMonitor.trackCustomMetric(`interaction_${interactionName}`, Date.now())
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  React.useEffect(() => {
    performanceMonitor.initialize()

    // Send metrics on page unload
    const handleUnload = () => {
      performanceMonitor.sendMetrics()
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      performanceMonitor.destroy()
    }
  }, [])

  return {
    getMetrics: () => performanceMonitor.getMetrics(),
    getCoreWebVitals: () => performanceMonitor.getCoreWebVitals(),
    checkPerformanceTargets: () => performanceMonitor.checkPerformanceTargets(),
    trackCustomMetric: (name: string, value: number) =>
      performanceMonitor.trackCustomMetric(name, value),
  }
}
