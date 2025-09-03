'use client'

import * as React from 'react'
import * as d3 from 'd3'
import { MEXICAN_FLAVOR_CATEGORIES } from '@/services/flavor-analysis-service'
import type { FlavorNode } from '@/lib/flavorwheel/types'
import { Button } from '@/components/ui/button'
import { Download, FileJson, Image } from 'lucide-react'

type Props = {
  data: FlavorNode
  title?: string
  reduceMotion?: boolean
}

// Spanish category color mapping
const SPANISH_CATEGORY_COLORS: Record<string, string> = {
  'malta': '#8B4513',      // Brown for malt
  'lúpulo': '#228B22',     // Green for hops
  'dulce': '#FFD700',      // Gold for sweet
  'floral': '#FF69B4',     // Pink for floral
  'especiado': '#FF4500',  // Orange for spicy
  'frutal': '#FF6347',     // Red for fruit
  'mineral': '#708090',    // Gray for mineral
  'ahumado': '#2F4F4F',    // Dark gray for smoky
  'herbal': '#32CD32',     // Lime green for herbal
  'cítrico': '#FFA500',    // Orange for citrus
  'spicy': '#FF4500',      // Orange for English spicy
  'fruit': '#FF6347',      // Red for English fruit
  'citrus': '#FFA500',     // Orange for English citrus
  'smoky': '#2F4F4F',      // Dark gray for English smoky
  'sweet': '#FFD700',      // Gold for English sweet
  'earthy': '#8B7355',     // Earth brown
  'woody': '#8B4513',      // Wood brown
  'nutty': '#DEB887'       // Burlywood for nutty
}

function colorForNode(node: d3.HierarchyRectangularNode<FlavorNode>) {
  // Get the top-level category (first child of root)
  const ancestors = node.ancestors().reverse()
  const topCategory = ancestors[1]?.data.name || node.data.name

  // Try Spanish colors first, then Mexican categories, then default
  const base = SPANISH_CATEGORY_COLORS[topCategory] ||
               (MEXICAN_FLAVOR_CATEGORIES as Record<string, { color: string }>)[topCategory]?.color ||
               '#95a5a6'

  const hsl = d3.color(base) as d3.HSLColor
  const depth = node.depth
  const baseL = typeof (hsl as d3.HSLColor).l === 'number' ? (hsl as d3.HSLColor).l : 0.55

  // TASK 5: Enhanced color mapping with brighter child colors
  if (depth === 1) {
    // Category level - use base color
    return base
  } else if (depth === 2) {
    // Keyword level - use brighter version of parent color
    const brightened = d3.color(base)?.brighter(0.3)
    return brightened?.formatHex() || base
  } else {
    // Deeper levels - use even brighter
    const brightened = d3.color(base)?.brighter(0.6)
    return brightened?.formatHex() || base
  }
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
  const containerRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)

  // TASK 2: Increase radius for better visibility of all levels
  const [radius, setRadius] = React.useState(400)
  const [tooltip, setTooltip] = React.useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: { breadcrumb: '', value: 0, percentage: 0 },
  })
  const [isAnimating, setIsAnimating] = React.useState(false)
  const root = React.useMemo(() => {
    // Build hierarchy from data and compute layout in normalized depth units
    console.log('🔍 FlavorWheel input data:', data)

    const h = d3
      .hierarchy<FlavorNode>(data)
      .sum(d => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

    console.log('📊 Hierarchy created:', {
      height: h.height,
      descendants: h.descendants().length,
      leaves: h.leaves().length
    })

    // CRITICAL FIX: Partition layout sized for proper hierarchy distribution
    // Second dimension represents depth levels - keep reasonable for visibility
    const layout = d3.partition<FlavorNode>().size([2 * Math.PI, h.height + 1])
    const result = layout(h)

    console.log('🎯 Partition result:', {
      root: result,
      descendants: result.descendants().map(d => ({
        name: d.data.name,
        depth: d.depth,
        value: d.value,
        x0: d.x0, x1: d.x1,
        y0: d.y0, y1: d.y1
      }))
    })

    return result
  }, [data])

  // TASK 1: Disable zoom functionality - always show full hierarchy
  const [focus, setFocus] = React.useState(root)
  React.useEffect(() => setFocus(root), [root])
  // const focus = root // Always use root as focus for full view

  React.useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width
        // Better mobile scaling: smaller minimum radius for mobile, larger for desktop
        const isMobile = w < 768
        const minRadius = isMobile ? 120 : 180
        const maxRadius = isMobile ? 300 : 420
        setRadius(Math.max(minRadius, Math.min(maxRadius, Math.floor(w / 2.2))))
      }
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Smooth focus transition with animation
  const animateToFocus = React.useCallback(
    (newFocus: typeof focus) => {
      if (isAnimating || newFocus === focus) return

      // Skip animation if reduceMotion is enabled or user prefers reduced motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion || prefersReducedMotion) {
        setFocus(newFocus)
        return
      }

      setIsAnimating(true)
      const startTime = Date.now()
      const duration = 300

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          setFocus(newFocus)
        }
      }

      requestAnimationFrame(animate)
    },
    [focus, isAnimating, reduceMotion]
  )

  // Handle tooltip display
  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent, node: typeof focus) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const breadcrumb = node
        .ancestors()
        .reverse()
        .map(d => d.data.name)
        .join(' › ')
      const totalValue = root.value || 1
      const nodeValue = node.value || 0
      const percentage = Math.round((nodeValue / totalValue) * 100)

      setTooltip({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        content: {
          breadcrumb,
          value: nodeValue,
          percentage,
        },
      })
    },
    [root.value]
  )

  const handleMouseLeave = React.useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  // Angle scale maps the current focus to [0, 2π]
  const x = d3
    .scaleLinear()
    .domain([focus.x0, focus.x1])
    .range([0, 2 * Math.PI])
  // EMERGENCY FIX: Use fixed, visible ranges instead of complex scaling
  const y = d3
    .scaleSqrt()
    .domain([0, root.y1])
    .range([60, 200]) // Fixed range: 60px to 200px from center (ALWAYS VISIBLE)

  const nodes = root.descendants().filter(d => d.depth > 0) // More explicit filtering

  console.log('🎨 CRITICAL DEBUG - Rendering nodes:', {
    totalNodes: root.descendants().length,
    filteredNodes: nodes.length,
    focus: focus.data.name,
    focusDepth: focus.depth,
    yDomain: [0, root.y1],
    yRange: [40, radius * 0.8],
    radius: radius,
    maxRadius: radius * 0.8,
    nodes: nodes.map(d => ({
      name: d.data.name,
      depth: d.depth,
      y0: d.y0,
      y1: d.y1,
      innerRadius: y(d.y0),
      outerRadius: y(d.y1),
      startAngle: x(d.x0),
      endAngle: x(d.x1),
      arcVisible: y(d.y1) <= radius
    }))
  })
  // TASK 2: Responsive SVG size with mobile optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const side = isMobile ? radius * 2 + 80 : radius * 2 + 120 // Less padding on mobile for better fit

  const onExportSvg = () => {
    if (!svgRef.current) return
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svgRef.current)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flavorwheel-${new Date().toISOString().split('T')[0]}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onExportPng = async () => {
    if (!svgRef.current) return

    try {
      // Create canvas and draw SVG
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const svgData = new XMLSerializer().serializeToString(svgRef.current)
      const img = document.createElement('img')

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        canvas.toBlob((blob) => {
          if (!blob) return
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `flavorwheel-${new Date().toISOString().split('T')[0]}.png`
          a.click()
          URL.revokeObjectURL(url)
        })
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch (error) {
      console.error('Error exporting PNG:', error)
    }
  }

  const onExportJson = () => {
    const jsonData = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flavorwheel-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }



  return (
    <div
      ref={containerRef}
      data-testid="flavor-wheel-container"
      className="flex w-full flex-col items-center gap-4 rounded-xl border border-border bg-card p-4 text-foreground"
    >
      <div className="flex w-full items-center justify-center">
        <h2 className="text-xl font-semibold md:text-2xl">{title}</h2>
      </div>

      <div className="w-full text-sm text-muted-foreground">
        <div data-testid="flavor-wheel-breadcrumb" className="flex flex-wrap items-center gap-1">
          {focus
            .ancestors()
            .reverse()
            .map((d, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <button
                  data-testid={`breadcrumb-${d.data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="underline-offset-4 hover:text-foreground/90 hover:underline"
                  // TASK 1: Removed onClick for breadcrumb zoom
                >
                  {d.data.name}
                </button>
                {i < arr.length - 1 && <span className="opacity-60">›</span>}
              </span>
            ))}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          data-testid="flavor-wheel-svg"
          width={side}
          height={side}
          role="img"
          aria-labelledby="flavorwheel-title flavorwheel-desc"
        >
          <title id="flavorwheel-title">Flavor wheel</title>
          <desc id="flavorwheel-desc">Zoomable sunburst of tasting notes.</desc>
          <g transform={`translate(${radius + 30}, ${radius + 30})`}>
            {nodes.map((d, i) => {
              // EMERGENCY FIX: Simple arc generation with guaranteed visibility
              const arc = d3
                .arc<d3.HierarchyRectangularNode<FlavorNode>>()
                .startAngle(n => x(n.x0))
                .endAngle(n => x(n.x1))
                .innerRadius(n => y(n.y0))  // Use y-scale directly (60-200px range)
                .outerRadius(n => y(n.y1))  // Use y-scale directly (60-200px range)

              const fill = colorForNode(d)
              const angle = (x(d.x0) + x(d.x1)) / 2
              const rotate = (angle * 180) / Math.PI - 90
              // EMERGENCY FIX: Position labels in center of segments (60-200px range)
              const labelRadius = (y(d.y0) + y(d.y1)) / 2

              const breadcrumb = d
                .ancestors()
                .reverse()
                .map(n => n.data.name)
                .join(' › ')
              const segmentId = d.data.name.toLowerCase().replace(/[^a-z0-9]/g, '-')

              return (
                <g key={i} tabIndex={0}>
                  <path
                    data-testid={`wheel-segment-${segmentId}`}
                    d={arc(d) ?? undefined}
                    fill={fill}
                    fillOpacity={
                      typeof d.data.intensity === 'number'
                        ? Math.max(0.35, Math.min(1, (d.data.intensity as number) / 10))
                        : d.children
                          ? 0.9
                          : 1
                    }
                    stroke="var(--border)"
                    strokeWidth={1}
                    role="graphics-symbol"
                    aria-label={breadcrumb}
                    className="transition-all duration-200 hover:opacity-80 hover:stroke-2"
                    // TASK 1: Removed onClick for zoom - showing full view always
                    // TASK 6: Removed tooltips, added subtle hover highlight
                    onMouseEnter={() => {
                      // Subtle highlight on hover
                    }}
                    onMouseLeave={() => {
                      // Reset highlight
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        animateToFocus(d)
                      }
                    }}
                  >
                    <title>
                      {d
                        .ancestors()
                        .reverse()
                        .map(n => n.data.name)
                        .join(' › ')}
                    </title>
                  </path>

                  {(() => {
                    // TASK 3 & 4: Show all labels with responsive font sizing for mobile
                    const arcLength = (x(d.x1) - x(d.x0)) * labelRadius
                    const minArc = isMobile ? 0.015 : 0.01 // Slightly higher threshold on mobile to reduce clutter

                    return x(d.x1) - x(d.x0) > minArc && d.depth > 0
                  })() && (
                    <text
                      transform={`rotate(${rotate}) translate(${labelRadius},0) rotate(${rotate > 90 ? 180 : 0})`}
                      dy="0.32em"
                      fontSize={(() => {
                        const arcLength = (x(d.x1) - x(d.x0)) * labelRadius
                        return isMobile ? Math.max(6, Math.min(10, arcLength / d.data.name.length * 1.2)) : Math.max(8, Math.min(14, arcLength / d.data.name.length * 1.5))
                      })()}
                      textAnchor={rotate > 90 ? 'end' : 'start'}
                      className="pointer-events-none fill-foreground font-medium"
                      style={{
                        textShadow: isMobile ? '0 0 2px rgba(255,255,255,0.9)' : '0 0 3px rgba(255,255,255,0.8)',
                        fontFamily: isMobile ? 'system-ui, -apple-system, sans-serif' : undefined
                      }}
                    >
                      {d.data.name}
                    </text>
                  )}
                </g>
              )
            })}

            <circle
              data-testid="wheel-center-circle"
              r={40}
              role="button"
              aria-label={focus.parent ? `Go back to ${focus.parent.data.name}` : 'Go to root'}
              className="cursor-pointer fill-card stroke-border transition-all duration-200 hover:stroke-2"
              strokeWidth={2}
              // TASK 1: Removed center circle click for zoom
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  animateToFocus(focus.parent || root)
                }
              }}
              tabIndex={0}
            />
            <text
              textAnchor="middle"
              dy="0.35em"
              className="pointer-events-none select-none fill-foreground text-sm"
            >
              {focus.data.name}
            </text>
          </g>
        </svg>

        {/* TASK 6: Removed tooltip display - all info visible on wheel */}
      </div>

      {/* Export Controls */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {/* TASK 1: Removed Reset View button - always in full view */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExportSvg}
          className="flex items-center gap-1"
        >
          <Download className="h-3 w-3" />
          SVG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPng}
          className="flex items-center gap-1"
        >
          <Image className="h-3 w-3" />
          PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportJson}
          className="flex items-center gap-1"
        >
          <FileJson className="h-3 w-3" />
          JSON
        </Button>
      </div>
    </div>
  )
}
