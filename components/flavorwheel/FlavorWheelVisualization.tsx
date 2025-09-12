'use client'

import * as React from 'react'
import * as d3 from 'd3'
import { MEXICAN_FLAVOR_CATEGORIES } from '@/services/flavor-analysis-service'
import type { FlavorNode } from '@/lib/flavorwheel/types'

type Props = {
  data: FlavorNode
  title?: string
  reduceMotion?: boolean
}

// ===== FLAVORWHEEL CVD-SAFE COLOR PALETTE =====
// Complete category mapping with CVD-safe colors and metaphor support
const FLAVORWHEEL_COLORS: Record<string, string> = {
  // Primary Categories - CVD-Safe
  'fruity': 'var(--fx-flavor-fruity)',
  'floral': 'var(--fx-flavor-floral)',
  'vegetal': 'var(--fx-flavor-vegetal)',
  'smoky': 'var(--fx-flavor-smoky)',
  'sweet': 'var(--fx-flavor-sweet)',
  'spicy': 'var(--fx-flavor-spicy)',
  'bitter': 'var(--fx-flavor-bitter)',
  'sour': 'var(--fx-flavor-sour)',
  'roasted': 'var(--fx-flavor-roasted)',
  'nutty': 'var(--fx-flavor-nutty)',
  'mineral': 'var(--fx-flavor-mineral)',
  'earthy': 'var(--fx-flavor-earthy)',
  'molecule': 'var(--fx-flavor-molecule)',

  // Metaphor Categories
  'mood-emotion': 'var(--fx-flavor-mood-emotion)',
  'setting-place': 'var(--fx-flavor-setting-place)',
  'texture-material': 'var(--fx-flavor-texture-material)',
  'color-light': 'var(--fx-flavor-color-light)',
  'movement-shape': 'var(--fx-flavor-movement-shape)',
  'character-persona': 'var(--fx-flavor-character-persona)',
  'temporal-time': 'var(--fx-flavor-temporal-time)',

  // Legacy Spanish/English mappings (keeping for backward compatibility)
  'malta': 'var(--fx-flavor-roasted)',      // Malt -> Roasted
  'lúpulo': 'var(--fx-flavor-vegetal)',     // Hops -> Vegetal
  'dulce': 'var(--fx-flavor-sweet)',        // Sweet
  'especiado': 'var(--fx-flavor-spicy)',    // Spicy
  'frutal': 'var(--fx-flavor-fruity)',      // Fruit
  'ahumado': 'var(--fx-flavor-smoky)',      // Smoky
  'herbal': 'var(--fx-flavor-vegetal)',     // Herbal -> Vegetal
  'cítrico': 'var(--fx-flavor-sour)',       // Citrus -> Sour
  'fruit': 'var(--fx-flavor-fruity)',       // English fruit
  'citrus': 'var(--fx-flavor-sour)',        // English citrus -> Sour
  'woody': 'var(--fx-flavor-roasted)'       // Woody -> Roasted
}

function colorForNode(node: d3.HierarchyRectangularNode<FlavorNode>) {
  // Get the top-level category (first child of root)
  const ancestors = node.ancestors().reverse()
  const topCategory = ancestors[1]?.data.name || node.data.name

  // Use new CVD-safe color palette with fallback chain
  const base = FLAVORWHEEL_COLORS[topCategory] ||
               (MEXICAN_FLAVOR_CATEGORIES as Record<string, { color: string }>)[topCategory]?.color ||
               'var(--fx-flavor-mineral)' // Default to mineral gray

  // For CSS custom properties, return as-is for depth 0 and 1
  const depth = node.depth
  if (depth === 0 || depth === 1) {
    return base // Root and top-level category - use design token
  }

  // For deeper levels, compute variations while preserving CVD-safety
  const hsl = d3.color(base) as d3.HSLColor
  const baseL = typeof (hsl as d3.HSLColor).l === 'number' ? (hsl as d3.HSLColor).l : 0.55

  if (depth === 2) {
    // Family level - slight variation for hierarchy
    return d3.hsl(hsl.h, hsl.s, Math.min(baseL + 0.15, 0.9)).toString()
  } else {
    // Descriptor/Molecule level - more variation but still accessible
    const lightness = Math.min(baseL + (depth - 2) * 0.08 + 0.15, 0.95)
    return d3.hsl(hsl.h, hsl.s * 0.8, lightness).toString()
  }
}

export function FlavorWheelVisualization({ data, title, reduceMotion }: Props) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 280, height: 280 })

  // Responsive dimensions with mobile-first approach
  React.useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        const containerWidth = container.clientWidth
        const containerHeight = container.clientHeight

        // Mobile-first responsive sizing
        let size: number
        if (containerWidth <= 375) { // iPhone SE and smaller
          size = Math.min(containerWidth - 16, 280) // Account for padding, max 280px
        } else if (containerWidth <= 640) { // Mobile landscape/small tablets
          size = Math.min(containerWidth - 32, 320) // Account for padding
        } else if (containerWidth <= 768) { // Tablets
          size = Math.min(containerWidth - 48, 400) // Account for padding
        } else if (containerWidth <= 1024) { // Small desktops
          size = Math.min(containerWidth - 64, 500) // Account for padding
        } else { // Large screens
          size = Math.min(containerWidth - 80, 600) // Account for padding, reasonable max
        }

        // Ensure square dimensions and minimum size
        size = Math.max(size, 200) // Minimum 200px for usability
        setDimensions({ width: size, height: size })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  React.useEffect(() => {
    if (!svgRef.current || !data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render

    const { width, height } = dimensions
    const radius = Math.min(width, height) / 2 - 60

    // Create hierarchical data structure
    const root = d3.hierarchy(data)
      .sum(d => d.weight || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    // Create treemap layout
    const treemap = d3.treemap<FlavorNode>()
      .size([2 * Math.PI, radius * radius])
      .round(true)

    // Apply treemap to root
    const nodes = treemap(root).leaves()

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Create arc generator
    const arc = d3.arc<d3.HierarchyRectangularNode<FlavorNode>>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => Math.sqrt(d.y0))
      .outerRadius(d => Math.sqrt(d.y1))

    // Create slices
    const slices = g.selectAll('path')
      .data(nodes)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', colorForNode)
      .attr('stroke', 'var(--fx-text-inverse)')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')

    // Add hover effects
    slices
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(reduceMotion ? 0 : 200)
          .attr('stroke-width', 3)
          .attr('stroke', 'var(--fx-text-primary)')
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(reduceMotion ? 0 : 200)
          .attr('stroke-width', 1)
          .attr('stroke', 'var(--fx-text-inverse)')
      })

    // Add labels
    const labels = g.selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('transform', d => {
        const angle = (d.x0 + d.x1) / 2
        const radius = Math.sqrt((d.y0 + d.y1) / 2)
        return `translate(${Math.cos(angle - Math.PI / 2) * radius},${Math.sin(angle - Math.PI / 2) * radius})`
      })
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', d => {
        const angle = d.x1 - d.x0
        const radius = Math.sqrt(d.y1 - d.y0)
        const area = angle * radius
        return Math.min(Math.max(Math.sqrt(area) * 0.15, 8), 16) + 'px'
      })
      .attr('fill', d => {
        // Use contrasting color for text with semantic tokens
        const backgroundColor = d3.color(colorForNode(d))
        if (!backgroundColor) return 'var(--fx-text-primary)'
        if ('l' in backgroundColor && typeof (backgroundColor as any).l === 'number') {
          return (backgroundColor as any).l > 0.5 ? 'var(--fx-text-primary)' : 'var(--fx-text-inverse)'
        }
        const rgb = d3.rgb(backgroundColor as any)
        const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
        return yiq >= 128 ? 'var(--fx-text-primary)' : 'var(--fx-text-inverse)'
      })
      .attr('pointer-events', 'none')
      .text(d => d.data.name)

    // Add title
    if (title) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('fill', 'var(--fx-text-primary)')
        .text(title)
    }

  }, [data, dimensions, title, reduceMotion])

  return (
    <div className="flavor-wheel-container">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="flavor-wheel-svg"
        data-testid="flavor-wheel-svg"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}
