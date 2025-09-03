import React from 'react'
import { describe, it, expect } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Simple Button Test', () => {
  it('should render a button', () => {
    render(<Button>Click me</Button>)

    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })
})
