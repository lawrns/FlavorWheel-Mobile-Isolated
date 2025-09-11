import { UnifiedAppShell } from '@/components/app-shell'
import { SimplifiedTastingFlow } from '@/components/ui/simplified-tasting-flow'

export default function QuickTastingPage() {
  return (
    <UnifiedAppShell variant="dashboard">
      <SimplifiedTastingFlow />
    </UnifiedAppShell>
  )
}