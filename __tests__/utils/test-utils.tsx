import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'

// Custom render function with all providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing-library
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export * from '@testing-library/jest-dom'

// Override render method
export { customRender as render }

// Custom test utilities
export const waitForLoadingToFinish = () =>
  waitFor(() => {
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
  })

export const createMockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn()
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })
  window.IntersectionObserver = mockIntersectionObserver
  return mockIntersectionObserver
}

export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

export const createMockResizeObserver = () => {
  const mockResizeObserver = vi.fn()
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })
  window.ResizeObserver = mockResizeObserver
  return mockResizeObserver
}

// Performance testing utilities
export const measureRenderTime = async (component: ReactElement) => {
  const startTime = performance.now()
  const { container } = render(component)
  await waitFor(() => {
    expect(container.firstChild).toBeInTheDocument()
  })
  const endTime = performance.now()
  return endTime - startTime
}

export const createPerformanceTest = (component: ReactElement, threshold: number) => {
  return async () => {
    const renderTime = await measureRenderTime(component)
    expect(renderTime).toBeLessThan(threshold)
  }
}

// Accessibility testing utilities
export const expectToBeAccessible = (element: HTMLElement) => {
  // Basic accessibility checks
  expect(element).toBeVisible()

  // Check for ARIA attributes
  const hasAriaLabel = element.hasAttribute('aria-label') ||
                      element.hasAttribute('aria-labelledby') ||
                      element.getAttribute('role') === 'button'

  // Check for semantic elements
  const isSemanticElement = ['button', 'a', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())

  expect(hasAriaLabel || isSemanticElement).toBe(true)
}

// Mock utilities for different scenarios
export const createMockUser = (overrides = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  avatar: 'https://example.com/avatar.jpg',
  role: 'user',
  createdAt: new Date().toISOString(),
  ...overrides,
})

export const createMockTasting = (overrides = {}) => ({
  id: 'mock-tasting-id',
  name: 'Test Tasting',
  description: 'A test tasting session',
  type: 'guided',
  status: 'active',
  createdAt: new Date().toISOString(),
  userId: 'mock-user-id',
  ...overrides,
})

export const createMockFlavorWheel = (overrides = {}) => ({
  id: 'mock-wheel-id',
  name: 'Test Flavor Wheel',
  data: {
    name: 'Sweet',
    color: '#FF6B6B',
    percentage: 25,
    intensity: 7,
    count: 15,
  },
  tastingId: 'mock-tasting-id',
  createdAt: new Date().toISOString(),
  ...overrides,
})

// Database mock utilities
export const createMockSupabaseResponse = (data: any = null, error: any = null) => ({
  data,
  error,
})

export const mockSupabaseFrom = (tableName: string) => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue(createMockSupabaseResponse()),
})

// Network utilities
export const mockFetchResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
})

export const mockNetworkError = (message = 'Network error') => {
  throw new Error(message)
}

// File upload utilities
export const createMockFile = (name = 'test.jpg', size = 1024, type = 'image/jpeg') => {
  const file = new File(['mock file content'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

export const createMockImageFile = (name = 'test.jpg') => {
  return createMockFile(name, 1024000, 'image/jpeg')
}

// Timer utilities for testing async operations
export const advanceTimersByTime = (time: number) => {
  vi.advanceTimersByTime(time)
}

export const runOnlyPendingTimers = () => {
  vi.runOnlyPendingTimers()
}

export const runAllTimers = () => {
  vi.runAllTimers()
}

// Local storage utilities
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}

// Session storage utilities
export const mockSessionStorage = () => {
  const store: Record<string, string> = {}

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }
}
