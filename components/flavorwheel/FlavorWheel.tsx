'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import type { FlavorNode } from '@/lib/flavorwheel/types'

// Dynamically import the heavy D3 visualization component
const FlavorWheelVisualization = dynamic(
  () => import('./FlavorWheelVisualization').then(mod => ({ default: mod.FlavorWheelVisualization })),
  {
    loading: () => (
      <div className="flavor-wheel-loading flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flavor wheel...</p>
        </div>
      </div>
    ),
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
