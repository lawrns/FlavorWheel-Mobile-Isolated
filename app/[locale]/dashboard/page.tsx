'use client'

import { UnifiedAppShell } from '@/components/app-shell'
import { UnifiedDashboard } from '@/components/dashboard/UnifiedDashboard'

export default function DashboardPage() {
  return (
    <UnifiedAppShell variant="dashboard">
      <UnifiedDashboard />
    </UnifiedAppShell>
  )
}

