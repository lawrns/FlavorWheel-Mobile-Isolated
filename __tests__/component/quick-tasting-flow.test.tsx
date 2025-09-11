/**
 * Integration tests for Quick Tasting Flow
 * Tests the complete user journey from start to finish
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SimplifiedTastingFlow } from '../../components/ui/simplified-tasting-flow'
import { createQuickTasting } from '../../services/quick-tasting-service'
import { useAuth } from '../../components/auth-provider'
import { useToast } from '../../hooks/use-toast'

// Mock the hooks and services
jest.mock('../../components/auth-provider')
jest.mock('../../hooks/use-toast')
jest.mock('../../services/quick-tasting-service')
jest.mock('../../lib/smart-defaults')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}))

// Mock data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
}

const mockTastingData = {
  productType: 'wine',
  productName: 'Test Cabernet Sauvignon',
  selectedFlavors: ['Berry', 'Oak', 'Vanilla'],
  overallRating: 8,
  notes: 'Excellent balance with good aging potential'
}

describe('Quick Tasting Flow Integration', () => {
  const mockToast = jest.fn()
  const mockRouterPush = jest.fn()
  const mockCreateQuickTasting = jest.fn()

  beforeEach(() => {
    // Setup mocks
    ;(useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    })

    ;(useToast as jest.Mock).mockReturnValue({
      toast: mockToast
    })

    ;(createQuickTasting as jest.Mock).mockResolvedValue({
      success: true,
      tastingId: 'tasting-123'
    })

    // Mock smart defaults
    jest.mock('../../lib/smart-defaults', () => ({
      useSmartDefaults: () => ({
        getRecommendedBeverageType: () => 'wine',
        getRatingSuggestion: () => 7,
        getFlavorSuggestions: () => ['Berry', 'Oak'],
        getNoteSuggestions: () => ['Well balanced', 'Good structure'],
        saveTasting: jest.fn()
      })
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete User Journey', () => {
    it('should complete a full quick tasting successfully', async () => {
      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Step 1: Product Selection
      expect(screen.getByText('What are you tasting?')).toBeInTheDocument()

      // Select product type
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      // Enter product name
      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, mockTastingData.productName)

      // Proceed to next step
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Step 2: Flavor Selection
      expect(screen.getByText('What flavors do you detect?')).toBeInTheDocument()

      // Select flavors
      const berryFlavor = screen.getByText('Berry')
      const oakFlavor = screen.getByText('Oak')
      const vanillaFlavor = screen.getByText('Vanilla')

      await user.click(berryFlavor)
      await user.click(oakFlavor)
      await user.click(vanillaFlavor)

      // Proceed to next step
      await user.click(nextButton)

      // Step 3: Rating & Notes
      expect(screen.getByText('Your overall impression')).toBeInTheDocument()

      // Adjust rating slider
      const ratingSlider = screen.getByRole('slider')
      fireEvent.change(ratingSlider, { target: { value: '8' } })

      // Add notes
      const notesTextarea = screen.getByPlaceholderText(/Any specific observations/)
      await user.type(notesTextarea, mockTastingData.notes)

      // Submit the tasting
      const submitButton = screen.getByText('Complete Tasting')
      await user.click(submitButton)

      // Verify API call
      await waitFor(() => {
        expect(mockCreateQuickTasting).toHaveBeenCalledWith(
          expect.objectContaining({
            productType: mockTastingData.productType,
            productName: mockTastingData.productName,
            selectedFlavors: mockTastingData.selectedFlavors,
            overallRating: mockTastingData.overallRating,
            notes: mockTastingData.notes
          })
        )
      })

      // Verify success toast
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tasting Saved Successfully! 🎉',
          variant: 'default'
        })
      )
    })

    it('should handle validation errors', async () => {
      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Try to proceed without selecting product type
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Should still be on first step
      expect(screen.getByText('What are you tasting?')).toBeInTheDocument()

      // Try to proceed with product type but no name
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      await user.click(nextButton)

      // Should still be on first step
      expect(screen.getByText('What are you tasting?')).toBeInTheDocument()
    })

    it('should handle flavor selection validation', async () => {
      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Complete step 1
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, 'Test Wine')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Step 2: Try to proceed without selecting flavors
      await user.click(nextButton)

      // Should still be on flavor step
      expect(screen.getByText('What flavors do you detect?')).toBeInTheDocument()
    })

    it('should handle API errors gracefully', async () => {
      ;(createQuickTasting as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to save tasting'
      })

      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Complete all steps quickly
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, 'Test Wine')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Select a flavor
      const berryFlavor = screen.getByText('Berry')
      await user.click(berryFlavor)

      await user.click(nextButton)

      // Submit
      const submitButton = screen.getByText('Complete Tasting')
      await user.click(submitButton)

      // Verify error handling
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Failed to Save Tasting',
            variant: 'destructive'
          })
        )
      })
    })

    it('should handle authentication errors', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        user: null
      })

      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Complete steps
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, 'Test Wine')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      const berryFlavor = screen.getByText('Berry')
      await user.click(berryFlavor)

      await user.click(nextButton)

      // Submit
      const submitButton = screen.getByText('Complete Tasting')
      await user.click(submitButton)

      // Should show authentication error
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Authentication Required',
          variant: 'destructive'
        })
      )
    })

    it('should show loading state during submission', async () => {
      ;(createQuickTasting as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          tastingId: 'tasting-123'
        }), 1000))
      )

      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Complete steps quickly
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, 'Test Wine')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      const berryFlavor = screen.getByText('Berry')
      await user.click(berryFlavor)

      await user.click(nextButton)

      // Submit
      const submitButton = screen.getByText('Complete Tasting')
      await user.click(submitButton)

      // Should show loading state
      expect(screen.getByText('Saving...')).toBeInTheDocument()

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Smart Defaults Integration', () => {
    it('should show smart recommendations', async () => {
      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Check for smart recommendation hint
      expect(screen.getByText(/Based on your history/)).toBeInTheDocument()
      expect(screen.getByText(/Recommended/)).toBeInTheDocument()
    })

    it('should show flavor suggestions', async () => {
      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Complete step 1
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, 'Test Wine')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Should show smart flavor suggestions
      expect(screen.getByText(/Smart suggestions/)).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should allow going back to previous steps', async () => {
      const user = userEvent.setup()

      render(<SimplifiedTastingFlow />)

      // Complete step 1
      const productTypeSelect = screen.getByRole('combobox')
      await user.click(productTypeSelect)
      await user.click(screen.getByText('Wine'))

      const productNameInput = screen.getByPlaceholderText(/e.g., "Premium Cabernet Sauvignon"/)
      await user.type(productNameInput, 'Test Wine')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Go back
      const prevButton = screen.getByText('Previous')
      await user.click(prevButton)

      // Should be back on step 1
      expect(screen.getByText('What are you tasting?')).toBeInTheDocument()
    })

    it('should show progress indicator', () => {
      render(<SimplifiedTastingFlow />)

      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
      expect(screen.getByText(/0% complete/)).toBeInTheDocument()
    })
  })
})
