'use client'

import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard'
import { UnifiedAppShell } from '@/components/app-shell'

/**
 * Home Dashboard Page
 * Main dashboard for authenticated users with full navigation
 * This is the primary landing spot after login
 */
export default function HomePage() {
  return (
    <UnifiedAppShell variant="dashboard">
      <UnifiedDashboard />
    </UnifiedAppShell>
  )
}
