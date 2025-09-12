import type React from 'react'
import { PageErrorBoundary } from '@/components/error-boundary'
import { PerformanceMonitor } from '@/components/ui/performance-monitor'

export default function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="locale-layout">
      <PageErrorBoundary>
        {children}
      </PageErrorBoundary>
      <PerformanceMonitor showMetrics={true} />
    </div>
  )
}