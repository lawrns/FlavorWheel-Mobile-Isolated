import { UnifiedAppShell } from '@/components/app-shell'
import { SimplifiedTastingFlow } from '@/components/ui/simplified-tasting-flow'
import { TestUserButton } from '@/components/ui/test-user-button'
import { PageErrorBoundary } from '@/components/error-boundary'

export default function QuickTastingPage() {
  return (
    <UnifiedAppShell variant="dashboard">
      <PageErrorBoundary>
        <SimplifiedTastingFlow />
        <TestUserButton />
      </PageErrorBoundary>
    </UnifiedAppShell>
  )
}