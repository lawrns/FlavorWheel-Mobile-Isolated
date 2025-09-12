import { UnifiedAppShell } from '@/components/app-shell'
import { SimplifiedTastingFlow } from '@/components/ui/simplified-tasting-flow'
import { TestUserButton } from '@/components/ui/test-user-button'

export default function QuickTastingPage() {
  return (
    <UnifiedAppShell variant="dashboard">
      <SimplifiedTastingFlow />
      <TestUserButton />
    </UnifiedAppShell>
  )
}