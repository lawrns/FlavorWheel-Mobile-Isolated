'use client'

import { useEffect, useState } from 'react'
import { performanceMonitor, CoreWebVitals, PerformanceMetrics } from '@/lib/performance-monitoring'
import { Card } from './card'
import { Badge } from './badge'
import { Button } from './button'
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'

interface PerformanceDashboardProps {
  showDetailedMetrics?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function PerformanceDashboard({
  showDetailedMetrics = false,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: PerformanceDashboardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [coreWebVitals, setCoreWebVitals] = useState<Partial<CoreWebVitals>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshMetrics = async () => {
    setIsRefreshing(true)
    try {
      const newMetrics = performanceMonitor.getMetrics()
      const newVitals = performanceMonitor.getCoreWebVitals()

      setMetrics(newMetrics)
      setCoreWebVitals(newVitals)
    } catch (error) {
      console.error('Failed to refresh metrics:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    // Initial load
    refreshMetrics()

    // Auto refresh
    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getVitalsStatus = (value: number | undefined, thresholds: { good: number; poor: number }) => {
    if (value === undefined) return { status: 'unknown', color: 'gray' }
    if (value <= thresholds.good) return { status: 'good', color: 'green' }
    if (value <= thresholds.poor) return { status: 'needs-improvement', color: 'yellow' }
    return { status: 'poor', color: 'red' }
  }

  const formatMetric = (value: number | undefined, unit: string = 'ms'): string => {
    if (value === undefined) return 'N/A'
    return `${value.toFixed(2)}${unit}`
  }

  const vitalsConfig = {
    lcp: { name: 'Largest Contentful Paint', thresholds: { good: 2500, poor: 4000 } },
    fid: { name: 'First Input Delay', thresholds: { good: 100, poor: 300 } },
    cls: { name: 'Cumulative Layout Shift', thresholds: { good: 0.1, poor: 0.25 } },
    fcp: { name: 'First Contentful Paint', thresholds: { good: 1800, poor: 3000 } },
    ttfb: { name: 'Time to First Byte', thresholds: { good: 800, poor: 1800 } },
  }

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Performance Dashboard
            </h2>
            <p className="text-muted-foreground mt-1">
              Real-time Core Web Vitals and performance metrics
            </p>
          </div>
          <Button
            onClick={refreshMetrics}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(vitalsConfig).map(([key, config]) => {
          const value = coreWebVitals[key as keyof CoreWebVitals]
          const status = getVitalsStatus(value, config.thresholds)

          return (
            <Card key={key} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{config.name}</h3>
                  <p className="text-3xl font-bold mt-2">
                    {formatMetric(value)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {status.status === 'good' && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {status.status === 'needs-improvement' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                  {status.status === 'poor' && <AlertTriangle className="h-6 w-6 text-red-500" />}
                  <Badge variant={status.color as any}>
                    {status.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Navigation Timing */}
      {showDetailedMetrics && metrics.navigationTiming && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Navigation Timing</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">DOM Interactive</p>
              <p className="text-lg font-semibold">{formatMetric(metrics.navigationTiming.domInteractive)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">DOM Content Loaded</p>
              <p className="text-lg font-semibold">{formatMetric(metrics.navigationTiming.domContentLoaded)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">DOM Complete</p>
              <p className="text-lg font-semibold">{formatMetric(metrics.navigationTiming.domComplete)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Load Event</p>
              <p className="text-lg font-semibold">{formatMetric(metrics.navigationTiming.loadEventEnd)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Resource Timing Summary */}
      {showDetailedMetrics && metrics.resourceTiming.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Resource Loading</h3>
          <div className="space-y-2">
            {metrics.resourceTiming
              .filter(resource => resource.duration > 100) // Only show slow resources
              .sort((a, b) => b.duration - a.duration)
              .slice(0, 10)
              .map((resource, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium truncate max-w-xs">
                      {resource.name.split('/').pop()}
                    </p>
                    <p className="text-xs text-muted-foreground">{resource.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatMetric(resource.duration)}</p>
                    {resource.size > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {(resource.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Custom Metrics */}
      {showDetailedMetrics && Object.keys(metrics.customMetrics).length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Custom Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(metrics.customMetrics).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-muted-foreground capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-lg font-semibold">{formatMetric(value)}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Tips */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Optimization Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Core Web Vitals Targets:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• LCP: &lt; 2.5s (Good), &lt; 4.0s (Needs improvement)</li>
              <li>• FID: &lt; 100ms (Good), &lt; 300ms (Needs improvement)</li>
              <li>• CLS: &lt; 0.1 (Good), &lt; 0.25 (Needs improvement)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Optimization Strategies:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Use dynamic imports for heavy components</li>
              <li>• Implement proper caching strategies</li>
              <li>• Optimize images with responsive loading</li>
              <li>• Minimize bundle sizes with code splitting</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}

// Mini performance indicator for headers/toolbars
export function PerformanceIndicator() {
  const [coreWebVitals, setCoreWebVitals] = useState<Partial<CoreWebVitals>>({})
  const [overallScore, setOverallScore] = useState<'good' | 'needs-improvement' | 'poor'>('needs-improvement')

  useEffect(() => {
    const updateVitals = () => {
      const vitals = performanceMonitor.getCoreWebVitals()
      setCoreWebVitals(vitals)

      // Calculate overall score
      const scores = []
      if (vitals.lcp !== undefined) scores.push(vitals.lcp <= 2500 ? 'good' : vitals.lcp <= 4000 ? 'needs-improvement' : 'poor')
      if (vitals.fid !== undefined) scores.push(vitals.fid <= 100 ? 'good' : vitals.fid <= 300 ? 'needs-improvement' : 'poor')
      if (vitals.cls !== undefined) scores.push(vitals.cls <= 0.1 ? 'good' : vitals.cls <= 0.25 ? 'needs-improvement' : 'poor')

      if (scores.length === 0) {
        setOverallScore('needs-improvement')
      } else {
        const goodCount = scores.filter(s => s === 'good').length
        const poorCount = scores.filter(s => s === 'poor').length

        if (poorCount > 0) setOverallScore('poor')
        else if (goodCount === scores.length) setOverallScore('good')
        else setOverallScore('needs-improvement')
      }
    }

    updateVitals()
    const interval = setInterval(updateVitals, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (overallScore) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'poor': return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (overallScore) {
      case 'good': return 'text-green-600'
      case 'needs-improvement': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
    }
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
      {getStatusIcon()}
      <span className={`text-xs font-medium ${getStatusColor()}`}>
        Performance: {overallScore.replace('-', ' ')}
      </span>
      {coreWebVitals.lcp && (
        <span className="text-xs text-muted-foreground">
          LCP: {(coreWebVitals.lcp / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  )
}
