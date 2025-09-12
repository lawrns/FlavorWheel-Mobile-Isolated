"use client"

import { getQuickTastingById } from '@/services/quick-tasting-service'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { SimplifiedTastingFlow } from '@/components/ui/simplified-tasting-flow'
import { LoadingState } from '@/components/ui/loading-states'
import { DashboardAppShell } from '@/components/app-shell'
import { useAuth } from '@/components/auth-provider'
import { useToast } from '@/hooks/use-toast'

export default function QuickTastingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const tastingId = (params.id as string)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // For now, redirect to the main quick tasting page
    // In the future, this could be enhanced to load and edit existing tastings
    if (tastingId && tastingId !== 'new') {
      toast({
        title: "Viewing Existing Tastings",
        description: "This feature is coming soon. Redirecting to create a new tasting.",
        variant: "default"
      })
    }

    // Redirect to the main quick tasting page after a short delay
    const timer = setTimeout(() => {
      router.push(`/${params.locale}/quick-tasting`)
    }, 2000)

    return () => clearTimeout(timer)
  }, [tastingId, router, params.locale, toast])

  // Show loading state while redirecting
  return (
    <DashboardAppShell activeNavItem="quick-tasting">
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <LoadingState loading={true} error={null} className="text-center">
          <p className="mt-4 text-muted-foreground">
            Redirecting to Quick Tasting...
          </p>
        </LoadingState>
      </div>
    </DashboardAppShell>
  )
}

