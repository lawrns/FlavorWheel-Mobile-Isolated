'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  showMetrics?: boolean
}

export function PerformanceMonitor({
  enabled = process.env.NODE_ENV === 'development',
  showMetrics = false
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    if (!enabled) return

    // Web Vitals tracking
    const reportWebVitals = (metric: any) => {
      const rating = getRating(metric.name, metric.value)

      const newMetric: WebVitalsMetric = {
        name: metric.name,
        value: Math.round(metric.value * 100) / 100,
        rating,
        timestamp: Date.now(),
      }

      setMetrics(prev => {
        const filtered = prev.filter(m => m.name !== metric.name)
        return [...filtered, newMetric].slice(-10) // Keep last 10 metrics
      })

      // Log to console in development
      console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${rating})`)
    }

    // Import web-vitals dynamically
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(reportWebVitals)
      onINP(reportWebVitals)
      onFCP(reportWebVitals)
      onLCP(reportWebVitals)
      onTTFB(reportWebVitals)
    })

    // Performance observer for additional metrics
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          reportWebVitals({
            name: 'LCP',
            value: lastEntry.startTime,
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          })
          reportWebVitals({
            name: 'CLS',
            value: clsValue,
          })
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        return () => {
          lcpObserver.disconnect()
          fidObserver.disconnect()
          clsObserver.disconnect()
        }
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error)
      }
    }
  }, [enabled, pathname])

  const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    switch (name) {
      case 'CLS':
        return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor'
      case 'FID':
        return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor'
      case 'FCP':
        return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor'
      case 'LCP':
        return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
      case 'TTFB':
        return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor'
      default:
        return 'good'
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 dark:text-green-400'
      case 'needs-improvement':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'poor':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return '✅'
      case 'needs-improvement':
        return '⚠️'
      case 'poor':
        return '❌'
      default:
        return '❓'
    }
  }

  if (!enabled || !showMetrics) return null

  return (
    <>
      {/* Performance Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-fx-bg-card border border-fx-border-default rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-fast ease-standard"
        aria-label="Toggle performance metrics"
      >
        📊
      </button>

      {/* Performance Metrics Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 bg-fx-bg-card border border-fx-border-default rounded-lg shadow-xl p-4 max-w-sm w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-fx-text-primary">Web Vitals</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-fx-text-muted hover:text-fx-text-primary"
              aria-label="Close performance metrics"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={`${metric.name}-${index}`} className="flex items-center justify-between">
                <span className="text-sm font-medium text-fx-text-secondary">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${getRatingColor(metric.rating)}`}>
                    {metric.value}
                    {metric.name === 'CLS' ? '' : 'ms'}
                  </span>
                  <span className="text-sm">{getRatingIcon(metric.rating)}</span>
                </div>
              </div>
            ))}

            {metrics.length === 0 && (
              <p className="text-sm text-fx-text-muted text-center py-4">
                Collecting metrics...
              </p>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-fx-border-subtle">
            <div className="flex justify-between text-xs text-fx-text-muted">
              <span>Good: 🟢</span>
              <span>Needs work: 🟡</span>
              <span>Poor: 🔴</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Hook for programmatic access to performance metrics
export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalsMetric[]>([])

  useEffect(() => {
    const reportWebVitals = (metric: any) => {
      const rating = getRating(metric.name, metric.value)

      const newMetric: WebVitalsMetric = {
        name: metric.name,
        value: Math.round(metric.value * 100) / 100,
        rating,
        timestamp: Date.now(),
      }

      setMetrics(prev => {
        const filtered = prev.filter(m => m.name !== metric.name)
        return [...filtered, newMetric].slice(-5) // Keep last 5 metrics
      })
    }

    const getRating = (name: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
      switch (name) {
        case 'CLS':
          return value < 0.1 ? 'good' : value < 0.25 ? 'needs-improvement' : 'poor'
        case 'FID':
          return value < 100 ? 'good' : value < 300 ? 'needs-improvement' : 'poor'
        case 'FCP':
          return value < 1800 ? 'good' : value < 3000 ? 'needs-improvement' : 'poor'
        case 'LCP':
          return value < 2500 ? 'good' : value < 4000 ? 'needs-improvement' : 'poor'
        case 'TTFB':
          return value < 800 ? 'good' : value < 1800 ? 'needs-improvement' : 'poor'
        default:
          return 'good'
      }
    }

    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS(reportWebVitals)
        onINP(reportWebVitals)
        onFCP(reportWebVitals)
        onLCP(reportWebVitals)
        onTTFB(reportWebVitals)
      })
    }
  }, [])

  return metrics
}
