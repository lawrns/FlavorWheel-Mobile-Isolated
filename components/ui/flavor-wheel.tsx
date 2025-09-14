import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHaptic } from '@/lib/haptic'

export interface FlavorSegment {
  id: string
  name: string
  color: string
  angle: number
  intensity?: number
}

export interface FlavorWheelProps {
  segments: FlavorSegment[]
  selectedSegment?: string
  onSegmentSelect?: (segmentId: string) => void
  size?: number
  interactive?: boolean
  className?: string
}

const FlavorWheel = React.forwardRef<HTMLDivElement, FlavorWheelProps>(
  ({
    segments,
    selectedSegment,
    onSegmentSelect,
    size = 320,
    interactive = true,
    className,
    ...props
  }, ref) => {
    const { trigger } = useHaptic()
    const [rotation, setRotation] = React.useState(0)
    const [isDragging, setIsDragging] = React.useState(false)

    const handleSegmentClick = React.useCallback((segment: FlavorSegment) => {
      if (!interactive) return

      // Trigger haptic feedback
      trigger('light')

      // Call selection handler
      onSegmentSelect?.(segment.id)

      // Rotate to center the selected segment
      const angle = segment.angle - 90 // Adjust to center the segment
      setRotation(angle)
    }, [interactive, onSegmentSelect, trigger])

    const handleDragStart = React.useCallback(() => {
      setIsDragging(true)
      trigger('selection')
    }, [trigger])

    const handleDragEnd = React.useCallback(() => {
      setIsDragging(false)
    }, [])

    const handleDrag = React.useCallback((event: any, info: any) => {
      if (!interactive) return

      // Calculate rotation based on drag
      const centerX = size / 2
      const centerY = size / 2
      const deltaX = info.point.x - centerX
      const deltaY = info.point.y - centerY
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI)
      setRotation(angle)
    }, [interactive, size])

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-center justify-center',
          'min-w-[var(--fw-layout-wheel-min-size)] max-w-[var(--fw-layout-wheel-max-size)]',
          'p-wheel-padding',
          className
        )}
        style={{
          width: size,
          height: size,
          ...props.style
        }}
        {...props}
      >
        {/* Flavor Wheel Container */}
        <motion.div
          className={cn(
            'relative rounded-full border-2',
            'bg-wheel-bg border-wheel-border',
            interactive && 'cursor-pointer select-none'
          )}
          style={{
            width: '100%',
            height: '100%',
          }}
          animate={{ rotate: rotation }}
          drag={interactive}
          dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrag={handleDrag}
          whileTap={{ scale: 0.98 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 17,
            duration: 0.15
          }}
        >
          {/* Flavor Segments */}
          {segments.map((segment, index) => {
            const angle = segment.angle
            const isSelected = selectedSegment === segment.id
            const segmentSize = 360 / segments.length

            return (
              <motion.div
                key={segment.id}
                className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'cursor-pointer transition-all duration-fast ease-standard'
                )}
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: 'center',
                }}
                onClick={() => handleSegmentClick(segment)}
                whileHover={interactive ? { scale: 1.05 } : {}}
                whileTap={interactive ? { scale: 0.95 } : {}}
              >
                {/* Segment Arc */}
                <motion.div
                  className={cn(
                    'absolute rounded-full border',
                    'flex items-center justify-center',
                    'transition-all duration-fast ease-standard'
                  )}
                  style={{
                    width: '80%',
                    height: '80%',
                    borderColor: segment.color,
                    backgroundColor: isSelected ? `${segment.color}20` : 'transparent',
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 45 * Math.cos(segmentSize * Math.PI / 180)}% ${50 - 45 * Math.sin(segmentSize * Math.PI / 180)}%)`,
                  }}
                >
                  {/* Segment Label */}
                  <div
                    className={cn(
                      'absolute text-center transform -translate-x-1/2 -translate-y-1/2',
                      'font-[var(--fw-typography-wheel-segment-family)] font-[var(--fw-typography-wheel-segment-weight)]',
                      'text-[var(--fw-typography-wheel-segment-size)] leading-[var(--fw-typography-wheel-segment-line-height)]',
                      'text-wheel-text-primary select-none pointer-events-none'
                    )}
                    style={{
                      top: '30%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                      writingMode: angle > 90 && angle < 270 ? 'vertical-rl' : 'horizontal-tb',
                    }}
                  >
                    {segment.name}
                  </div>

                  {/* Intensity Indicator */}
                  {segment.intensity && segment.intensity > 0 && (
                    <div
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: segment.color,
                        opacity: segment.intensity / 100
                      }}
                    />
                  )}

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2"
                      style={{
                        borderColor: segment.color,
                        width: '90%',
                        height: '90%',
                        margin: '5%'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 17
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            )
          })}

          {/* Center Circle */}
          <div
            className={cn(
              'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
              'rounded-full border-2 bg-wheel-bg border-wheel-border',
              'flex items-center justify-center'
            )}
            style={{
              width: '60%',
              height: '60%'
            }}
          >
            <div
              className={cn(
                'text-center',
                'font-[var(--fw-typography-wheel-center-family)] font-[var(--fw-typography-wheel-center-weight)]',
                'text-[var(--fw-typography-wheel-center-size)] leading-[var(--fw-typography-wheel-center-line-height)]',
                'text-wheel-text-primary'
              )}
            >
              {selectedSegment ? segments.find(s => s.id === selectedSegment)?.name : 'FlavorWheel'}
            </div>
          </div>
        </motion.div>

        {/* Drag Hint */}
        {interactive && !isDragging && (
          <motion.div
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-wheel-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Tap or drag to select
          </motion.div>
        )}
      </div>
    )
  }
)

FlavorWheel.displayName = 'FlavorWheel'

export { FlavorWheel }


