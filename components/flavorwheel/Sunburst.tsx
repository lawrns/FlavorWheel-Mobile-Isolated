'use client'

import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react'
import * as d3 from 'd3'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'

// ENHANCED SUNBURST WITH DEDUPLICATION AND FALLBACK HANDLING

// Define the WheelNode interface - supports both API formats and intensity data
interface WheelNode {
  id?: string
  name: string
  weight?: number
  value?: number  // API uses 'value' instead of 'weight'
  intensity?: number  // New: intensity score from NLP analysis
  confidence?: number
  color?: string
  children?: WheelNode[]
  meta?: {
    path: string[]
    hiddenChildren?: WheelNode[]
  }
  // Enhanced metadata from NLP extraction
  matchType?: 'exact' | 'fuzzy' | 'jaro-winkler' | 'levenshtein' | 'semantic'
  similarity?: number
  modifiers?: Array<{
    modifier: string
    intensity_value: number
    modifier_type: 'intensifier' | 'hedge' | 'negation'
  }>
}

// Helper to normalize weight/value with intensity consideration
function getNodeWeight(node: WheelNode): number {
  // Prioritize intensity if available, then weight/value
  if (node.intensity !== undefined && node.intensity > 0) {
    return node.intensity
  }
  const baseWeight = node.weight ?? node.value ?? 0
  // Ensure minimum weight for visualization (0.1 minimum)
  return Math.max(baseWeight, 0.1)
}

// Helper to get intensity-based opacity
function getNodeOpacity(node: WheelNode): number {
  const intensity = node.intensity ?? 3.0 // Default neutral intensity
  // Map intensity (0-5) to opacity (0.3-1.0)
  return Math.max(0.3, Math.min(1.0, 0.3 + (intensity / 5.0) * 0.7))
}

// Helper to generate ID if missing
function getNodeId(node: WheelNode, index: number = 0): string {
  return node.id ?? `node_${node.name.toLowerCase().replace(/\s+/g, '_')}_${index}`
}

interface SunburstProps {
  data: WheelNode
  width?: number
  height?: number
  innerRadius?: number
  outerRadius?: number
  onNodeClick?: (node: WheelNode) => void
  onNodeHover?: (node: WheelNode | null) => void
  focusNode?: WheelNode
  className?: string
  enableZoom?: boolean
  responsive?: boolean
  fullDetailMode?: boolean
}

/**
 * Preprocess wheel data to eliminate duplicates and handle fallbacks
 */
function preprocessWheelData(data: WheelNode): WheelNode {
  if (!data.children || data.children.length === 0) {
    return data
  }

  // Deduplicate children by name (case-insensitive)
  const childMap = new Map<string, WheelNode>()

  for (const child of data.children) {
    const key = child.name.toLowerCase().trim()

    if (childMap.has(key)) {
      // Merge duplicate children
      const existing = childMap.get(key)!
      existing.weight = (existing.weight || 0) + (child.weight || 0)
      existing.value = (existing.value || 0) + (child.value || 0)
      existing.intensity = Math.max(existing.intensity || 0, child.intensity || 0)

      // Merge children recursively
      if (child.children && existing.children) {
        existing.children = [...existing.children, ...child.children]
      } else if (child.children && !existing.children) {
        existing.children = child.children
      }
    } else {
      childMap.set(key, { ...child })
    }
  }

  // Process children recursively and filter out empty/invalid nodes
  const processedChildren = Array.from(childMap.values())
    .map(child => preprocessWheelData(child))
    .filter(child => {
      // More lenient filtering - only filter out truly empty nodes
      const hasWeight = (child.weight || 0) > 0 || (child.value || 0) > 0
      const hasChildren = child.children && child.children.length > 0
      const isNotEmpty = child.name.trim().length > 0

      // Special handling for "general" subcategories:
      // - If it has children (descriptors), promote the children up instead of filtering out
      // - Only filter out "general" if it's truly empty
      const isGeneral = child.name.toLowerCase() === 'general'

      if (isGeneral && hasChildren) {
        // Don't filter out "general" if it has children - we'll handle this specially
        console.log(`🔄 SUNBURST: Keeping "general" subcategory with ${child.children?.length || 0} children`)
        return true
      }

      // Keep nodes with any weight/value or children, and filter out empty nodes
      return (hasWeight || hasChildren) && isNotEmpty
    })
    .sort((a, b) => (b.weight || b.value || 0) - (a.weight || a.value || 0))

  // Handle "general" subcategories by promoting their children up
  const finalChildren = []
  for (const child of processedChildren) {
    if (child.name.toLowerCase() === 'general' && child.children && child.children.length > 0) {
      console.log(`🔄 SUNBURST: Promoting ${child.children.length} children from "general" subcategory`)
      // Promote the children of "general" to the parent level
      finalChildren.push(...child.children)
    } else {
      finalChildren.push(child)
    }
  }

  // Handle fallback for low extraction scenarios
  if (finalChildren.length < 3 && data.name === 'Flavor Profile') {
    console.log('🔄 SUNBURST: Low extraction detected, adding guidance nodes')

    const guidanceNodes: any[] = [
      { id: 'guide-fruity', name: 'Fruity', weight: 0.5, intensity: 2.5, isGuidance: true },
      { id: 'guide-floral', name: 'Floral', weight: 0.3, intensity: 2.0, isGuidance: true },
      { id: 'guide-spicy', name: 'Spicy', weight: 0.4, intensity: 2.2, isGuidance: true },
      { id: 'guide-sweet', name: 'Sweet', weight: 0.6, intensity: 3.0, isGuidance: true }
    ]

    // Only add guidance nodes that don't conflict with existing data
    const existingNames = new Set(finalChildren.map(c => c.name.toLowerCase()))
    const nonConflictingGuidance = guidanceNodes.filter(g =>
      !existingNames.has(g.name.toLowerCase())
    )

    finalChildren.push(...nonConflictingGuidance.slice(0, 4 - finalChildren.length))
  }

  return {
    ...data,
    children: finalChildren
  }
}

// Enhanced Professional Color Palette - supports multilingual categories
const PALETTE = {
  // Core English categories
  'fruity': '#E5413A',
  'fruit': '#E5413A',
  'floral': '#E85A9E',
  'sweet': '#F2853D',
  'spices': '#8F4E39',
  'spice': '#8F4E39',
  'green': '#5BA66F',
  'vegetative': '#5BA66F',
  'roasted': '#B07C4A',
  'chemical': '#6AA9B7',
  'other': '#3FA1C9',
  'earthy': '#8B4513',
  'woody': '#D2691E',
  'smoky': '#696969',
  'herbal': '#228B22',
  'savory': '#CD853F',
  'umami': '#CD853F',
  'sour': '#FFD700',
  'bitter': '#8B4513',
  'salty': '#B0C4DE',

  // Spanish flavor mappings (from enhanced NLP)
  'dulce': '#F2853D',      // Sweet - orange
  'chocolate': '#8F4E39',   // Cocoa - brown
  'ahumado': '#B07C4A',    // Smoky/Roasted - brown
  'humo': '#B07C4A',       // Smoke - brown
  'malta': '#D2691E',      // Malt - darker orange
  'vainilla': '#F4A460',   // Vanilla - light orange
  'especias': '#8F4E39',   // Spices - brown
  'frutal': '#E5413A',     // Fruity - red
  'fruta': '#E5413A',      // Fruit - red
  'verde': '#5BA66F',      // Green - green
  'nuez': '#8F4E39',       // Nuts - brown
  'tostado': '#B07C4A',    // Toasted - brown
  'cacao': '#8F4E39',      // Cacao - brown
  'azucar': '#F2853D',     // Sugar - orange
  'tierra': '#8B4513',     // Earth - brown
  'cuero': '#A0522D',      // Leather - saddle brown
  'madera': '#D2691E',     // Wood - chocolate
  'mineral': '#708090',    // Mineral - slate gray
  'especiado': '#8F4E39',  // Spiced - brown
  'amargo': '#8B4513',     // Bitter - dark brown
  'acido': '#FFD700',      // Acidic - gold
  'salado': '#B0C4DE',     // Salty - light steel blue

  // Wine-specific categories
  'red_fruit': '#DC143C',   // Crimson
  'dark_fruit': '#8B0000',  // Dark red
  'stone_fruit': '#FF6347', // Tomato
  'citrus': '#FFA500',      // Orange
  'tropical': '#FF8C00',    // Dark orange
  'dried_fruit': '#B22222', // Fire brick

  // Coffee/spirits categories
  'nutty': '#D2691E',       // Chocolate
  'caramel': '#D2691E',     // Chocolate
  'vanilla': '#F4A460',     // Sandy brown
  'spicy': '#B22222',       // Fire brick
  'tobacco': '#A0522D',     // Sienna
  'leather': '#8B4513',     // Saddle brown
  'oak': '#D2691E',         // Chocolate
  'cedar': '#DEB887'        // Burlywood
}

function getNodeColor(node: WheelNode, depth: number = 1): string {
  if (node.color) return node.color

  // Find category name from path or node name
  const categoryName = node.meta?.path?.[1] || node.name

  // Get base color with enhanced matching
  let baseColor = PALETTE.other
  const lowerCategoryName = categoryName.toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters for better matching

  // First try exact matches (case-insensitive, normalized)
  for (const [key, color] of Object.entries(PALETTE)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (lowerCategoryName === normalizedKey) {
      baseColor = color
      break
    }
  }

  // Then try partial matches if no exact match found
  if (baseColor === PALETTE.other) {
    for (const [key, color] of Object.entries(PALETTE)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (lowerCategoryName.includes(normalizedKey) ||
          normalizedKey.includes(lowerCategoryName)) {
        baseColor = color
        break
      }
    }
  }

  // Special handling for compound terms
  if (baseColor === PALETTE.other) {
    const words = categoryName.toLowerCase().split(/[\s_-]+/)
    for (const word of words) {
      const normalizedWord = word.replace(/[^a-z0-9]/g, '')
      for (const [key, color] of Object.entries(PALETTE)) {
        const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '')
        if (normalizedWord === normalizedKey ||
            normalizedWord.includes(normalizedKey) ||
            normalizedKey.includes(normalizedWord)) {
          baseColor = color
          break
        }
      }
      if (baseColor !== PALETTE.other) break
    }
  }

  // Create lighter shades for deeper levels using simple hex manipulation
  if (depth > 1) {
    const lightenFactor = Math.min((depth - 1) * 0.3, 0.6) // Max 60% lighter
    const hex = baseColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const newR = Math.round(r + (255 - r) * lightenFactor)
    const newG = Math.round(g + (255 - g) * lightenFactor)
    const newB = Math.round(b + (255 - b) * lightenFactor)

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
  }

  return baseColor
}

export function Sunburst({
  data,
  width = 320,
  height = 320,
  innerRadius = 32,
  outerRadius = 150,
  onNodeClick,
  onNodeHover,
  focusNode,
  className = '',
  enableZoom = true,
  responsive = true,
  fullDetailMode = false
}: SunburstProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredNode, setHoveredNode] = useState<WheelNode | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })
  const [zoomLevel, setZoomLevel] = useState(1)
  const [tooltip, setTooltip] = useState<{ content: string; x: number; y: number } | null>(null)

  // Dynamic sizing based on container WIDTH only (square). Using height caused shrink flicker.
  useEffect(() => {
    if (!responsive || !containerRef.current) return

    const updateDimensions = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // Prefer width; height can be 0 during first pass and causes shrinking
      let widthPx = Math.max(0, rect.width || containerRef.current.clientWidth || 0)
      if (widthPx === 0 && containerRef.current.parentElement) {
        widthPx = containerRef.current.parentElement.clientWidth || 0
      }
      // Fallback to previous or default if still 0
      const size = widthPx > 0 ? Math.round(widthPx) : Math.max(240, dimensions.width)
      setDimensions(prev => (prev.width === size && prev.height === size) ? prev : { width: size, height: size })
    }

    // Initial sizing
    updateDimensions()

    // Resize observer for responsive behavior
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [responsive])

  // First measure synchronously after paint to avoid initial 0 size
  useLayoutEffect(() => {
    if (!responsive || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    if ((rect.width || 0) > 0) {
      const size = Math.round(rect.width)
      setDimensions(prev => (prev.width === size && prev.height === size) ? prev : { width: size, height: size })
    }
  }, [responsive])

  // Calculate responsive radii based on square dimensions (width-based)
  const baseSize = responsive ? dimensions.width : Math.min(width, height)
  const responsiveInnerRadius = responsive ? baseSize * 0.1 : innerRadius
  const responsiveOuterRadius = responsive ? baseSize * 0.45 : outerRadius

  // Helper function for text truncation
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }

  // Helper function to estimate text width
  const estimateTextWidth = (text: string, fontSize: number): number => {
    return text.length * fontSize * 0.6 // Rough estimation
  }

  // FORCE CONSOLE LOG TO SHOW COMPONENT IS LOADING
  console.log('🚀🚀🚀 SUNBURST COMPONENT LOADED! 🚀🚀🚀')
  console.log('Data received:', JSON.stringify(data, null, 2))
  console.log('Data structure check:')
  console.log('- Root name:', data.name)
  console.log('- Root weight/value:', getNodeWeight(data))
  console.log('- Children count:', data.children?.length || 0)
  if (data.children) {
    data.children.forEach((child, i) => {
      console.log(`  Child ${i}: ${child.name} (weight: ${getNodeWeight(child)}, children: ${child.children?.length || 0})`)
      if (child.children) {
        child.children.forEach((grandchild, j) => {
          console.log(`    Grandchild ${j}: ${grandchild.name} (weight: ${getNodeWeight(grandchild)})`)
        })
      }
    })
  }

  // Create the hierarchical layout using D3's partition with enhanced deduplication
  const { root, arcs } = useMemo(() => {
    console.log('🚀 SUNBURST: Building from data:', data.name, 'children:', data.children?.length)

    // Pre-process data to eliminate duplicates and handle fallbacks
    const processedData = preprocessWheelData(data)

    // Build hierarchy and compute values
    const hierarchy = d3.hierarchy<WheelNode>(processedData, d => d.children)
      .sum(d => getNodeWeight(d))
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    console.log('🚀 SUNBURST: Hierarchy built:', {
      height: hierarchy.height,
      descendants: hierarchy.descendants().length,
      leaves: hierarchy.leaves().length,
      processed: processedData !== data ? 'YES' : 'NO'
    })

    // Create partition layout with normalized size [2π, 1]
    // Ensure proper spacing for 3-level hierarchy
    const partition = d3.partition<WheelNode>()
      .size([2 * Math.PI, 1])
      .padding(0.002) // Small padding between levels for better visibility

    const rootNode = partition(hierarchy)

    // Create scales for current focus (moved before usage)
    const focus = focusNode ?
      rootNode.descendants().find(d => d.data.id === focusNode.id) || rootNode :
      rootNode

    // Shared scales - this is key for alignment!
    const xScale = d3.scaleLinear()
      .domain([focus.x0 || 0, focus.x1 || 2 * Math.PI])
      .range([0, 2 * Math.PI])

    const yScale = d3.scaleLinear()
      .domain([focus.y0 || 0, 1])
      .range([responsiveInnerRadius, responsiveOuterRadius])

    console.log('🚀 SUNBURST: Partition applied with', rootNode.descendants().length, 'total nodes')

    // Arc generator with controlled gutters and minimum thickness for outer rings
    const arc = d3.arc<d3.HierarchyRectangularNode<WheelNode>>()
      .startAngle(d => xScale(d.x0 || 0))
      .endAngle(d => xScale(d.x1 || 0))
      .innerRadius(d => yScale(d.y0 || 0))
      .outerRadius(d => {
        const baseRadius = yScale(d.y1 || 0)
        const innerRadius = yScale(d.y0 || 0)
        const thickness = baseRadius - innerRadius
        const minThickness = 15 // Minimum 15px thickness for visibility

        // Ensure minimum thickness for outer rings (depth 2 and 3)
        if (d.depth >= 2 && thickness < minThickness) {
          return innerRadius + minThickness
        }
        return baseRadius
      })
      .padAngle(0.003) // Slightly smaller padding for better visibility
      .padRadius(responsiveOuterRadius)

    // Get ALL visible nodes (not just leaves!) - this was the bug
    const visibleNodes = rootNode.descendants().filter(d =>
      d.depth > 0 // Skip root - show ALL other levels
    )

    console.log('🚀 SUNBURST: Visible nodes by depth:')
    const nodesByDepth = visibleNodes.reduce((acc, node) => {
      acc[node.depth] = (acc[node.depth] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    console.log(nodesByDepth)

    // Debug: Show sample nodes at each depth
    console.log('🚀 SUNBURST: Sample nodes by depth:')
    Object.keys(nodesByDepth).forEach(depth => {
      const depthNum = parseInt(depth)
      const nodesAtDepth = visibleNodes.filter(n => n.depth === depthNum)
      const sampleNodes = nodesAtDepth.slice(0, 3).map(n => n.data.name)
      console.log(`  Depth ${depth}: ${(nodesByDepth as any)[depth]} nodes (e.g., ${sampleNodes.join(', ')})`)
    })

    console.log(`🚀 SUNBURST: Rendering ${visibleNodes.length} nodes across ${Math.max(...visibleNodes.map(d => d.depth))} levels`)

    const arcData = visibleNodes.map(d => {
      // Defensive programming: ensure d exists and has required properties
      if (!d || !d.data) {
        console.warn('🚨 SUNBURST: Invalid node data detected, skipping:', d)
        return null
      }

      const path = arc(d) || ''
      if (!path) {
        console.warn('🚨 SUNBURST: Arc generation failed for node:', d.data.name)
        return null
      }

      const color = getNodeColor(d.data, d.depth)
      const opacity = getNodeOpacity(d.data)
      const intensity = d.data.intensity ?? getNodeWeight(d.data)

      // Enhanced visual distinction for guidance nodes
      const isGuidance = (d.data as any).isGuidance || false
      const finalOpacity = isGuidance ? opacity * 0.6 : opacity // Dimmer for guidance

      console.log(`🎨 Arc: ${d.data.name} (depth ${d.depth}) -> color: ${color}, opacity: ${finalOpacity.toFixed(2)}, intensity: ${intensity.toFixed(1)}, guidance: ${isGuidance}`)
      return {
        node: d,
        path,
        color,
        opacity: finalOpacity,
        intensity,
        isGuidance
      }
    }).filter(d => d && d.path) // Filter out null entries and empty paths

    console.log('🚀 SUNBURST: Arc data generated:', arcData.length, 'arcs ready to render')

    // Debug: Show arc distribution by depth
    const arcsByDepth = arcData.reduce((acc, arc) => {
      acc[arc.node.depth] = (acc[arc.node.depth] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    console.log('🚀 SUNBURST: Arcs by depth:', arcsByDepth)

    return { root: rootNode, arcs: arcData }
  }, [data, focusNode, responsiveInnerRadius, responsiveOuterRadius, dimensions, fullDetailMode, zoomLevel])

  // Handle interactions
  const handleNodeClick = (node: WheelNode) => {
    onNodeClick?.(node)
  }

  const handleNodeHover = (node: WheelNode | null) => {
    setHoveredNode(node)
    onNodeHover?.(node)
  }

  const handleNodeTouch = (node: WheelNode, event: React.TouchEvent) => {
    event.preventDefault()
    const touch = event.touches[0]
    if (touch) {
      const content = `${node.name}${node.confidence ? ` (${Math.round(node.confidence * 100)}% confidence)` : ''}${node.intensity ? ` - Intensity: ${node.intensity.toFixed(1)}` : ''}`

      // Calculate position with viewport boundary checking
      const position = calculateTooltipPosition(touch.clientX, touch.clientY)

      setTooltip({
        content,
        x: position.x,
        y: position.y
      })

      // Hide tooltip after 3 seconds
      setTimeout(() => setTooltip(null), 3000)
    }
  }

  // Helper function to calculate tooltip position with viewport bounds
  const calculateTooltipPosition = (touchX: number, touchY: number) => {
    const tooltipHeight = 60 // Approximate height of tooltip
    const tooltipWidth = 200 // Max width from style
    const offset = 10

    let x = touchX
    let y = touchY - tooltipHeight - offset

    // Adjust for viewport boundaries
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Horizontal bounds
    if (x + tooltipWidth / 2 > viewportWidth) {
      x = viewportWidth - tooltipWidth / 2 - 8
    } else if (x - tooltipWidth / 2 < 0) {
      x = tooltipWidth / 2 + 8
    }

    // Vertical bounds - if tooltip would go above screen, show below touch point
    if (y < 0) {
      y = touchY + offset
    }

    // Final vertical bounds check
    if (y + tooltipHeight > viewportHeight) {
      y = viewportHeight - tooltipHeight - 8
    }

    return { x, y }
  }

  const currentWidth = responsive ? dimensions.width : width
  const currentHeight = responsive ? dimensions.width : height

  const sunburstContent = (
    <svg
      ref={svgRef}
      width={currentWidth}
      height={currentHeight}
      viewBox={`0 0 ${currentWidth} ${currentHeight}`}
      role="img"
      aria-label="Flavor wheel sunburst chart"
      className="w-full h-auto max-w-full"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
        <title>Flavor Wheel</title>
        <desc>Interactive sunburst chart showing flavor distribution</desc>

        {/* Main group centered */}
        <g transform={`translate(${currentWidth / 2}, ${currentHeight / 2})`}>

          {/* Render all arcs with enhanced intensity-based styling and guidance distinction */}
          {arcs.map((arc, i) => {
            const isHovered = hoveredNode?.id === arc.node.data.id
            const baseOpacity = arc.opacity || 0.9
            const finalOpacity = isHovered ? Math.min(1.0, baseOpacity + 0.2) : baseOpacity

            // Enhanced styling for guidance nodes and confidence
            const strokeColor = arc.isGuidance ? "#e0e0e0" : "#ffffff"
            const strokeWidth = isHovered ? 2 : (arc.isGuidance ? 0.5 : 1)
            const strokeDashArray = arc.isGuidance ? "2,2" : undefined

            // Variable font weight based on confidence
            const confidence = arc.node.data.confidence || 0.5
            const fontWeight = confidence > 0.7 ? 'bold' : confidence > 0.4 ? 'normal' : 'lighter'

            return (
              <path
                key={`${arc.node.data.id || arc.node.data.name}-${i}`}
                d={arc.path}
                fill={arc.color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDashArray}
                opacity={finalOpacity}
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease, stroke-width 0.2s ease',
                  fontVariationSettings: `'wght' ${confidence > 0.7 ? 700 : confidence > 0.4 ? 400 : 300}`
                }}
                onClick={() => handleNodeClick(arc.node.data)}
                onMouseEnter={() => {}} // Disabled hover tooltips - all info shown in click popup
                onMouseLeave={() => {}} // Disabled hover tooltips - all info shown in click popup
                onTouchStart={(e) => handleNodeTouch(arc.node.data, e)}
              >
                <title suppressHydrationWarning>
                  {`${arc.node.data.name}${arc.intensity !== undefined ? ` (Intensity: ${arc.intensity.toFixed(1)}/5.0)` : ''}${arc.node.data.matchType ? ` [${arc.node.data.matchType}]` : ''}${arc.node.data.similarity ? ` (${(arc.node.data.similarity * 100).toFixed(0)}% match)` : ''}`}
                </title>
              </path>
            )
          })}

          {/* Center circle */}
          <circle
            r={responsiveInnerRadius}
            fill="#f8f9fa"
            stroke="#dee2e6"
            strokeWidth={2}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              // Removed: Don't trigger onNodeClick from center circle
              // This prevents unwanted focus changes when clicking the center
              console.log('🎯 Center circle clicked - no action taken')
            }}
          />

          {/* Center text */}
          <text
            textAnchor="middle"
            dy="0.35em"
            fontSize={`${currentWidth >= 400 ? 16 : currentWidth >= 320 ? 14 : 12}px`}
            fontWeight="bold"
            fill="#495057"
          >
            {focusNode?.name || data.name}
          </text>

          {/* Debug info */}
          <text
            textAnchor="middle"
            dy="1.8em"
            fontSize={`${currentWidth >= 320 ? 10 : 9}px`}
            fill="#666"
          >
            {arcs.length} arcs rendered
          </text>

          {/* Radial labels positioned outside arcs */}

          {arcs
            .filter(arc => {
              const node = arc.node
              const nodeWeight = getNodeWeight(node.data)

              // Skip root
              if (node.depth === 0) return false

              // In Full Detail Mode, show all nodes (including zero weight for debugging)
              if (fullDetailMode) {
                return true // Show everything in full detail mode
              }

              // Always show nodes with weight >= 1% (0.01) - more lenient than before
              if (nodeWeight >= 0.01) return true

              // Also show nodes with any positive value (even very small ones)
              if (nodeWeight > 0) return true

              // For smaller nodes, apply size-based filtering
              const arcLength = (node.x1 || 0) - (node.x0 || 0)
              const meanRadius = ((node.y1 || 0) + (node.y0 || 0)) / 2 * (responsiveOuterRadius - responsiveInnerRadius) + responsiveInnerRadius
              const arcPixelLength = arcLength * meanRadius

              // Enhanced label filtering with better text measurement
              const baseFontSize = currentWidth >= 400 ? 12 : currentWidth >= 320 ? 11 : 10
              const fontSize = node.depth === 1 ? baseFontSize + 2 : baseFontSize
              const estimatedTextWidth = estimateTextWidth(node.data.name, fontSize)

              // More lenient filtering for zoom levels > 1.5x and descriptor nodes (depth 3)
              const isDescriptorLevel = node.depth === 3
              const minArcLength = isDescriptorLevel ?
                // Much more lenient for descriptors - they're the most important!
                (zoomLevel > 1.2 ? 20 : currentWidth >= 400 ? 25 : 35) :
                // Standard filtering for categories and subcategories
                (zoomLevel > 1.5 ?
                  (currentWidth >= 400 ? 30 : currentWidth >= 320 ? 40 : 50) :
                  (currentWidth >= 400 ? 50 : currentWidth >= 320 ? 70 : 90))

              // Always show descriptor level (depth 3) - this is what users want to see!
              const maxDepthForLabels = 4 // Always allow up to depth 4

              // Special handling for descriptor nodes - they should almost always show
              const shouldShow = isDescriptorLevel ?
                // For descriptors: very lenient requirements
                (arcPixelLength >= Math.max(minArcLength, estimatedTextWidth * 0.3)) :
                // For categories/subcategories: standard requirements
                (arcPixelLength >= Math.max(minArcLength, estimatedTextWidth * 0.6) &&
                 node.depth <= maxDepthForLabels)

              // Debug descriptor-level labels (depth 3) when they're not showing
              if (node.depth === 3 && !shouldShow && !fullDetailMode) {
                console.log(`🏷️ DESCRIPTOR HIDDEN: "${node.data.name}":`, {
                  arcPixelLength: arcPixelLength.toFixed(1),
                  minArcLength,
                  estimatedTextWidth: estimatedTextWidth.toFixed(1),
                  nodeWeight: nodeWeight.toFixed(3)
                })
              }

              // Debug: Log if high-weight labels are being hidden
              if (nodeWeight >= 0.05 && !shouldShow && !fullDetailMode) {
                console.log(`⚠️ High-weight label hidden: "${node.data.name}" (${(nodeWeight*100).toFixed(1)}%) - try "Show All Labels"`)
              }

              return shouldShow
            })
            .map((arc, i) => {
              const node = arc.node
              const midAngle = ((node.x0 || 0) + (node.x1 || 0)) / 2
              const meanRadius = ((node.y1 || 0) + (node.y0 || 0)) / 2 * (responsiveOuterRadius - responsiveInnerRadius) + responsiveInnerRadius

              // Calculate position for radial text (outside the arc) with better spacing
              const baseOffset = node.depth === 1 ? 15 : node.depth === 2 ? 10 : 8
              const textRadius = meanRadius + (fullDetailMode ? baseOffset + 3 : baseOffset)
              const x = Math.cos(midAngle - Math.PI / 2) * textRadius
              const y = Math.sin(midAngle - Math.PI / 2) * textRadius

              // Enhanced responsive font sizing with confidence-based weight
              const baseFontSize = currentWidth >= 400 ? 12 : currentWidth >= 320 ? 11 : 10
              const fontSize = node.depth === 1 ? baseFontSize + 2 : baseFontSize
              const confidence = node.data.confidence || 0.5
              const fontWeight = confidence > 0.7 ? "700" : confidence > 0.4 ? "500" : "400"

              // Smart text truncation
              const arcLength = (node.x1 || 0) - (node.x0 || 0)
              const availableWidth = arcLength * meanRadius
              const maxChars = Math.floor(availableWidth / (fontSize * 0.6))
              const displayText = truncateText(node.data.name, Math.max(3, maxChars))

              // Determine text rotation to keep readable
              let rotation = (midAngle * 180) / Math.PI - 90
              if (rotation > 90) rotation -= 180
              if (rotation < -90) rotation += 180

              return (
                <text
                  key={`label-${arc.node.data.id}-${i}`}
                  x={x}
                  y={y}
                  fontSize={`${fontSize}px`}
                  fontWeight={fontWeight}
                  fill="#333"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${rotation}, ${x}, ${y})`}
                  style={{
                    pointerEvents: 'none',
                    textShadow: '0 0 3px rgba(255,255,255,0.9)',
                    fontVariationSettings: `'wght' ${confidence > 0.7 ? 700 : confidence > 0.4 ? 500 : 400}`
                  }}
                >
                  {displayText}
                </text>
              )
            })}
        </g>

        {/* Hover tooltips disabled - all information handled in click popup for cleaner UX */}
        {false && hoveredNode && (
          <g>
            <rect
              x={10}
              y={10}
              width={280}
              height={hoveredNode?.intensity !== undefined ? 100 : 60}
              fill="rgba(0,0,0,0.9)"
              rx={6}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
            <text x={20} y={30} fill="white" fontSize="14px" fontWeight="bold">
              {hoveredNode?.name}
            </text>

            {/* Intensity Information */}
            {hoveredNode?.intensity !== undefined && (
              <text x={20} y={48} fill="#FFD700" fontSize="11px">
                Intensity: {hoveredNode?.intensity?.toFixed(1) || '0.0'}/5.0
              </text>
            )}

            {/* Match Type and Similarity */}
            {hoveredNode?.matchType && (
              <text x={20} y={hoveredNode?.intensity !== undefined ? 63 : 48} fill="#87CEEB" fontSize="10px">
                Match: {hoveredNode?.matchType}
                {hoveredNode?.similarity && ` (${((hoveredNode?.similarity || 0) * 100).toFixed(0)}%)`}
              </text>
            )}

            {/* Weight/Value */}
            <text x={20} y={hoveredNode?.intensity !== undefined ? 78 : 63} fill="white" fontSize="10px">
              Weight: {hoveredNode ? getNodeWeight(hoveredNode as WheelNode).toFixed(2) : '0.00'}
            </text>

            {/* Confidence */}
            {hoveredNode?.confidence && (
              <text x={20} y={hoveredNode?.intensity !== undefined ? 93 : 78} fill="#90EE90" fontSize="10px">
                Confidence: {((hoveredNode?.confidence || 0) * 100).toFixed(0)}%
              </text>
            )}
          </g>
        )}
      </svg>
    )

  return (
    <div ref={containerRef} className={`flavor-sunburst ${className} relative`} style={{ width: '100%' }}>
      {enableZoom ? (
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={3}
          centerOnInit
          onZoom={(ref) => {
            setZoomLevel(ref.state.scale)
          }}
        >
          <TransformComponent>
            {sunburstContent}
          </TransformComponent>
        </TransformWrapper>
      ) : (
        sunburstContent
      )}

      {/* Touch Tooltip */}
      {tooltip && (
        <div
          className="absolute bg-black text-white px-3 py-2 rounded-lg text-sm shadow-lg z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, 0)', // Center horizontally, no vertical offset since we handle positioning in calculateTooltipPosition
            maxWidth: '200px',
            whiteSpace: 'nowrap'
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  )
}

export default Sunburst
