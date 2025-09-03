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
  'fruity': 'var(--fw-fruity)',
  'floral': 'var(--fw-floral)',
  'vegetal': 'var(--fw-vegetal)',
  'smoky': 'var(--fw-smoky)',
  'sweet': 'var(--fw-sweet)',
  'spicy': 'var(--fw-spicy)',
  'bitter': 'var(--fw-bitter)',
  'sour': 'var(--fw-sour)',
  'roasted': 'var(--fw-roasted)',
  'nutty': 'var(--fw-nutty)',
  'mineral': 'var(--fw-mineral)',
  'earthy': 'var(--fw-earthy)',
  'molecule': 'var(--fw-molecule)',

  // Metaphor Categories
  'mood-emotion': 'var(--fw-mood-emotion)',
  'setting-place': 'var(--fw-setting-place)',
  'texture-material': 'var(--fw-texture-material)',
  'color-light': 'var(--fw-color-light)',
  'movement-shape': 'var(--fw-movement-shape)',
  'character-persona': 'var(--fw-character-persona)',
  'temporal-time': 'var(--fw-temporal-time)',

  // Legacy Spanish/English mappings (keeping for backward compatibility)
  'malta': 'var(--fw-roasted)',      // Malt -> Roasted
  'lúpulo': 'var(--fw-vegetal)',     // Hops -> Vegetal
  'dulce': 'var(--fw-sweet)',        // Sweet
  'especiado': 'var(--fw-spicy)',    // Spicy
  'frutal': 'var(--fw-fruity)',      // Fruit
  'ahumado': 'var(--fw-smoky)',      // Smoky
  'herbal': 'var(--fw-vegetal)',     // Herbal -> Vegetal
  'cítrico': 'var(--fw-sour)',       // Citrus -> Sour
  'fruit': 'var(--fw-fruity)',       // English fruit
  'citrus': 'var(--fw-sour)',        // English citrus -> Sour
  'woody': 'var(--fw-roasted)'       // Woody -> Roasted
}

function colorForNode(node: d3.HierarchyRectangularNode<FlavorNode>) {
  // Get the top-level category (first child of root)
  const ancestors = node.ancestors().reverse()
  const topCategory = ancestors[1]?.data.name || node.data.name

  // Use new CVD-safe color palette with fallback chain
  const base = FLAVORWHEEL_COLORS[topCategory] ||
               (MEXICAN_FLAVOR_CATEGORIES as Record<string, { color: string }>)[topCategory]?.color ||
               'var(--fw-mineral)' // Default to mineral gray

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
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 800 })

  // Responsive dimensions
  React.useEffect(() => {
    const updateDimensions = () => {
      const container = svgRef.current?.parentElement
      if (container) {
        const size = Math.min(container.clientWidth, 800)
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
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')

    // Add hover effects
    slices
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(reduceMotion ? 0 : 200)
          .attr('stroke-width', 3)
          .attr('stroke', '#333')
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(reduceMotion ? 0 : 200)
          .attr('stroke-width', 1)
          .attr('stroke', '#fff')
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
        // Use contrasting color for text
        const backgroundColor = d3.color(colorForNode(d))
        return backgroundColor ? (backgroundColor.l > 0.5 ? '#000' : '#fff') : '#000'
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
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  )
}
