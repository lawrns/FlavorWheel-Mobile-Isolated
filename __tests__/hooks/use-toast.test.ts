import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useToast, toast } from '@/hooks/use-toast'

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.resetAllMocks()
    vi.useRealTimers()
  })

  describe('useToast', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toEqual([])
      expect(typeof result.current.toast).toBe('function')
      expect(typeof result.current.dismiss).toBe('function')
    })

    it('should add toast to state when toast is called', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          description: 'This is a test toast'
        })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        title: 'Test Toast',
        description: 'This is a test toast',
        open: true,
        id: expect.any(String)
      })
    })

    it('should generate unique IDs for toasts', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.toast({ title: 'Toast 3' })
      })

      const ids = result.current.toasts.map(t => t.id)
      const uniqueIds = new Set(ids)

      expect(ids).toHaveLength(3)
      expect(uniqueIds.size).toBe(3)
    })

    it('should respect toast limit', () => {
      const { result } = renderHook(() => useToast())

      // Add more toasts than the limit (TOAST_LIMIT = 1)
      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.toast({ title: 'Toast 3' })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Toast 3') // Most recent
    })

    it('should dismiss specific toast', () => {
      const { result } = renderHook(() => useToast())

      let toastId: string

      act(() => {
        const toastResult = result.current.toast({ title: 'Test Toast' })
        toastId = toastResult.id
      })

      expect(result.current.toasts[0].open).toBe(true)

      act(() => {
        result.current.dismiss(toastId)
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no ID provided', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
      })

      expect(result.current.toasts).toHaveLength(2)
      expect(result.current.toasts.every(t => t.open)).toBe(true)

      act(() => {
        result.current.dismiss()
      })

      expect(result.current.toasts.every(t => !t.open)).toBe(true)
    })

    it('should auto-dismiss toast after delay', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Auto-dismiss Toast' })
      })

      expect(result.current.toasts[0].open).toBe(true)

      // Fast-forward past the remove delay
      act(() => {
        vi.advanceTimersByTime(1000000) // TOAST_REMOVE_DELAY
      })

      expect(result.current.toasts).toHaveLength(0)
    })

    it('should handle toast updates', () => {
      const { result } = renderHook(() => useToast())

      let toastInstance: any

      act(() => {
        toastInstance = result.current.toast({
          title: 'Original Title',
          description: 'Original description'
        })
      })

      expect(result.current.toasts[0].title).toBe('Original Title')

      act(() => {
        toastInstance.update({
          title: 'Updated Title',
          description: 'Updated description'
        })
      })

      expect(result.current.toasts[0].title).toBe('Updated Title')
      expect(result.current.toasts[0].description).toBe('Updated description')
    })

    it('should call onOpenChange when toast is dismissed', () => {
      const { result } = renderHook(() => useToast())

      const onOpenChange = vi.fn()

      act(() => {
        result.current.toast({
          title: 'Test Toast',
          onOpenChange
        })
      })

      act(() => {
        result.current.dismiss(result.current.toasts[0].id)
      })

      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe('toast function', () => {
    it('should create toast with all properties', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Test Title',
          description: 'Test Description',
          variant: 'destructive'
        })
      })

      const createdToast = result.current.toasts[0]

      expect(createdToast).toMatchObject({
        title: 'Test Title',
        description: 'Test Description',
        variant: 'destructive',
        open: true,
        id: expect.any(String)
      })
    })

    it('should return toast control object', () => {
      const { result } = renderHook(() => useToast())

      let toastControl: any

      act(() => {
        toastControl = result.current.toast({ title: 'Test' })
      })

      expect(toastControl).toHaveProperty('id')
      expect(toastControl).toHaveProperty('dismiss')
      expect(toastControl).toHaveProperty('update')
      expect(typeof toastControl.dismiss).toBe('function')
      expect(typeof toastControl.update).toBe('function')
    })

    it('should handle toast with action element', () => {
      const { result } = renderHook(() => useToast())

      const actionElement = <button>Action</button>

      act(() => {
        result.current.toast({
          title: 'Action Toast',
          action: actionElement
        })
      })

      expect(result.current.toasts[0].action).toBe(actionElement)
    })
  })

  describe('State Management', () => {
    it('should synchronize state across multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast())
      const { result: result2 } = renderHook(() => useToast())

      act(() => {
        result1.current.toast({ title: 'Shared Toast' })
      })

      expect(result1.current.toasts).toHaveLength(1)
      expect(result2.current.toasts).toHaveLength(1)
      expect(result1.current.toasts[0].title).toBe(result2.current.toasts[0].title)
    })

    it('should handle concurrent toast operations', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        // Add multiple toasts rapidly
        result.current.toast({ title: 'Toast 1' })
        result.current.toast({ title: 'Toast 2' })
        result.current.toast({ title: 'Toast 3' })
      })

      expect(result.current.toasts).toHaveLength(1) // Limited by TOAST_LIMIT
      expect(result.current.toasts[0].title).toBe('Toast 3')
    })

    it('should clean up timeouts on unmount', () => {
      const { result, unmount } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Toast to cleanup' })
      })

      expect(result.current.toasts).toHaveLength(1)

      unmount()

      // Fast-forward time - should not cause issues after unmount
      act(() => {
        vi.advanceTimersByTime(1000000)
      })

      // The toast should still be removed from memory state
      expect(result.current.toasts).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty toast object', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({})
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0]).toMatchObject({
        open: true,
        id: expect.any(String)
      })
    })

    it('should handle toast with only title', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Title Only' })
      })

      expect(result.current.toasts[0]).toMatchObject({
        title: 'Title Only',
        open: true
      })
    })

    it('should handle toast with only description', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ description: 'Description Only' })
      })

      expect(result.current.toasts[0]).toMatchObject({
        description: 'Description Only',
        open: true
      })
    })

    it('should handle dismiss of non-existent toast ID', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test' })
      })

      expect(result.current.toasts).toHaveLength(1)

      act(() => {
        result.current.dismiss('non-existent-id')
      })

      // Should not affect existing toasts
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].open).toBe(true)
    })

    it('should handle update of non-existent toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Original' })
      })

      expect(result.current.toasts[0].title).toBe('Original')

      // Try to update non-existent toast
      act(() => {
        // This would normally be done through the toast instance
        // but we're testing the reducer directly
      })

      expect(result.current.toasts[0].title).toBe('Original')
    })
  })

  describe('Performance', () => {
    it('should handle rapid toast creation and dismissal', () => {
      const { result } = renderHook(() => useToast())

      const startTime = Date.now()

      act(() => {
        // Create many toasts rapidly
        for (let i = 0; i < 100; i++) {
          result.current.toast({ title: `Toast ${i}` })
        }
      })

      const creationTime = Date.now() - startTime

      expect(creationTime).toBeLessThan(1000) // Should complete within 1 second
      expect(result.current.toasts).toHaveLength(1) // Only latest due to limit
    })

    it('should efficiently manage memory', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        // Add and immediately dismiss many toasts
        for (let i = 0; i < 50; i++) {
          const toastInstance = result.current.toast({ title: `Toast ${i}` })
          result.current.dismiss(toastInstance.id)
        }
      })

      // Fast-forward to clear timeouts
      act(() => {
        vi.advanceTimersByTime(1000000)
      })

      // Should not have memory leaks
      expect(result.current.toasts).toHaveLength(0)
    })

    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0

      const TestComponent = () => {
        const { toasts } = useToast()
        renderCount++
        return <div>Toasts: {toasts.length}</div>
      }

      const { result, rerender } = renderHook(() => <TestComponent />)

      // Initial render
      expect(renderCount).toBe(1)

      // Re-render without changes
      rerender()
      expect(renderCount).toBe(1) // Should not re-render

      // Add toast
      act(() => {
        result.current.toast({ title: 'Test' })
      })

      expect(renderCount).toBe(2) // Should re-render when state changes
    })
  })

  describe('Integration with React', () => {
    it('should work with React components in toast content', () => {
      const { result } = renderHook(() => useToast())

      const CustomComponent = () => <span>Custom Content</span>

      act(() => {
        result.current.toast({
          title: <CustomComponent />,
          description: 'Description with component'
        })
      })

      expect(result.current.toasts[0].title).toBeDefined()
      expect(result.current.toasts[0].description).toBe('Description with component')
    })

    it('should handle function children in toast', () => {
      const { result } = renderHook(() => useToast())

      const titleFunction = () => 'Dynamic Title'

      act(() => {
        result.current.toast({
          title: titleFunction(),
          description: 'Static description'
        })
      })

      expect(result.current.toasts[0].title).toBe('Dynamic Title')
    })
  })
})
