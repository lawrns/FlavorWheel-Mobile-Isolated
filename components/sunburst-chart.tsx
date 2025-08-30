'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { SunburstData, SunburstNode } from '@/services/keyword-extraction-service'

interface SunburstChartProps {
  data: SunburstData
  width?: number
  height?: number
  onSegmentClick?: (node: SunburstNode) => void
  className?: string
}

export function SunburstChart({
  data,
  width = 400,
  height = 400,
  onSegmentClick,
  className = ''
}: SunburstChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<SunburstNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<SunburstNode | null>(null)

  useEffect(() => {
    if (!svgRef.current || !data) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const radius = Math.min(width, height) / 2

    // Create partition layout
    const partition = d3.partition<SunburstNode>()
      .size([2 * Math.PI, radius])

    // Create arc generator
    const arc = d3.arc<SunburstNode>()
      .startAngle(d => d.x0)
      .endAngle(d => d.x1)
      .innerRadius(d => d.y0)
      .outerRadius(d => d.y1)

    // Convert data to hierarchy
    const root = d3.hierarchy(data)
      .sum(d => d.value || 1)
      .sort((a, b) => (b.value || 0) - (a.value || 0))

    // Apply partition
    partition(root)

    // Create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10)

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`)

    // Add paths for each segment
    const path = g.selectAll('path')
      .data(root.descendants().filter(d => d.depth > 0))
      .enter().append('path')
      .attr('d', arc)
      .attr('fill', d => {
        if (d.data.color) return d.data.color
        return color(d.data.name)
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation()
        setSelectedNode(d.data)
        if (onSegmentClick) onSegmentClick(d.data)
      })
      .on('mouseover', function(event, d) {
        setHoveredNode(d.data)
        d3.select(this)
          .attr('stroke-width', 3)
          .attr('stroke', '#333')
      })
      .on('mouseout', function() {
        setHoveredNode(null)
        d3.select(this)
          .attr('stroke-width', 1)
          .attr('stroke', '#fff')
      })

    // Add labels for larger segments
    const label = g.selectAll('text')
      .data(root.descendants().filter(d => d.depth > 0 && (d.y1 - d.y0) > 20))
      .enter().append('text')
      .attr('transform', d => {
        const angle = (d.x0 + d.x1) / 2
        const radius = (d.y0 + d.y1) / 2
        return `rotate(${(angle * 180 / Math.PI - 90)})translate(${radius},0)${angle > Math.PI ? 'rotate(180)' : ''}`
      })
      .attr('text-anchor', d => (d.x0 + d.x1) / 2 > Math.PI ? 'end' : 'start')
      .attr('font-size', d => Math.max(8, Math.min(12, (d.y1 - d.y0) / 4)))
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.data.name.length > 10 ? d.data.name.substring(0, 10) + '...' : d.data.name)

    // Add center circle for navigation
    g.append('circle')
      .attr('r', radius / 8)
      .attr('fill', '#f8f9fa')
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', () => {
        setSelectedNode(null)
        if (onSegmentClick) onSegmentClick(data)
      })

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .attr('fill', '#495057')
      .style('pointer-events', 'none')
      .text('Center')

  }, [data, width, height, onSegmentClick])

  return (
    <div className={`sunburst-chart ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full h-auto"
      />

      {/* Info Panel */}
      {(selectedNode || hoveredNode) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">
            {selectedNode ? 'Selected' : 'Hovered'}: {(selectedNode || hoveredNode)?.name}
          </h4>
          {(selectedNode || hoveredNode)?.value && (
            <p className="text-xs text-gray-600">
              Value: {(selectedNode || hoveredNode)?.value}
            </p>
          )}
          {(selectedNode || hoveredNode)?.intensity && (
            <p className="text-xs text-gray-600">
              Intensity: {(selectedNode || hoveredNode)?.intensity}/10
            </p>
          )}
          {(selectedNode || hoveredNode)?.children && (
            <p className="text-xs text-gray-600">
              Sub-items: {(selectedNode || hoveredNode)?.children?.length || 0}
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Tap segments to explore • Tap center to reset
      </div>
    </div>
  )
}

// Mobile-optimized version
export function MobileSunburstChart(props: SunburstChartProps) {
  return (
    <SunburstChart
      {...props}
      width={Math.min(props.width || 400, 350)}
      height={Math.min(props.height || 400, 350)}
      className="mobile-sunburst"
    />
  )
}

// Hook for responsive sizing
export function useResponsiveSunburst() {
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 })

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768
      const size = isMobile ? Math.min(window.innerWidth - 40, 350) : 400

      setDimensions({
        width: size,
        height: size
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return dimensions
}
