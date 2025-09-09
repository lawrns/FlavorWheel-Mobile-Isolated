'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import type { FlavorNode } from '@/lib/flavorwheel/types'
import { FlavorWheelSkeleton } from '@/components/ui/skeleton-loader'

// Dynamically import the heavy D3 visualization component
const FlavorWheelVisualization = dynamic(
  () => import('./FlavorWheelVisualization').then(mod => ({ default: mod.FlavorWheelVisualization })),
  {
    loading: () => <FlavorWheelSkeleton />,
    ssr: false // Disable SSR for D3 components
  }
)

type Props = {
  data: FlavorNode
  title?: string
  reduceMotion?: boolean
}

interface TooltipState {
  visible: boolean
  x: number
  y: number
  content: {
    breadcrumb: string
    value: number
    percentage: number
  }
}

export default function FlavorWheel({ data, title = 'Flavor Wheel', reduceMotion = false }: Props) {
  return (
    <div className="flavor-wheel-wrapper">
      <FlavorWheelVisualization data={data} title={title} reduceMotion={reduceMotion} />
    </div>
  )
}
