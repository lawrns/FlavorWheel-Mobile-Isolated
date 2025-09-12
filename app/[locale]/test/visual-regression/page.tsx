'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner, SkeletonLoader, LoadingOverlay } from '@/components/ui/loading-states'
import { EmptyTastings, EmptyFriends, EmptyFlavorWheel } from '@/components/ui/empty-state'
import { ThemeToggle } from '@/components/ui/loading-states'

export default function VisualRegressionTestPage() {
  const [isLoading, setIsLoading] = React.useState(false)

  return (
    <div className="min-h-screen bg-fx-bg p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-fx-text-primary mb-4">
            Visual Regression Test Page
          </h1>
          <p className="text-fx-text-secondary">
            This page is used for automated visual regression testing
          </p>
          <div className="mt-4 flex justify-center">
            <ThemeToggle variant="button" />
          </div>
        </header>

        {/* Button Section */}
        <section data-testid="button-section" className="space-y-6">
          <h2 className="text-2xl font-semibold text-fx-text-primary">Button Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <Button data-testid="button-primary" variant="default" size="sm">
                Primary Small
              </Button>
              <Button data-testid="button-primary" variant="default" size="md">
                Primary Medium
              </Button>
              <Button data-testid="button-primary" variant="default" size="lg">
                Primary Large
              </Button>
            </div>

            <div className="space-y-3">
              <Button variant="secondary" size="sm">
                Secondary Small
              </Button>
              <Button variant="secondary" size="md">
                Secondary Medium
              </Button>
              <Button variant="secondary" size="lg">
                Secondary Large
              </Button>
            </div>

            <div className="space-y-3">
              <Button variant="outline" size="sm">
                Outline Small
              </Button>
              <Button variant="outline" size="md">
                Outline Medium
              </Button>
              <Button variant="outline" size="lg">
                Outline Large
              </Button>
            </div>

            <div className="space-y-3">
              <Button variant="ghost" size="sm">
                Ghost Small
              </Button>
              <Button variant="ghost" size="md">
                Ghost Medium
              </Button>
              <Button variant="ghost" size="lg">
                Ghost Large
              </Button>
            </div>

            <div className="space-y-3">
              <Button variant="destructive" size="sm">
                Destructive Small
              </Button>
              <Button variant="destructive" size="md">
                Destructive Medium
              </Button>
              <Button variant="destructive" size="lg">
                Destructive Large
              </Button>
            </div>

            <div className="space-y-3">
              <Button variant="success" size="sm">
                Success Small
              </Button>
              <Button variant="success" size="md">
                Success Medium
              </Button>
              <Button variant="success" size="lg">
                Success Large
              </Button>
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section data-testid="input-section" className="space-y-6">
          <h2 className="text-2xl font-semibold text-fx-text-primary">Input Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input
                data-testid="input-field"
                placeholder="Default input"
                type="text"
              />
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  placeholder="Input with label"
                  type="email"
                />
              </div>
              <Input
                placeholder="Disabled input"
                type="text"
                disabled
              />
              <div>
                <Input
                  placeholder="Input with error"
                  type="text"
                  className="border-red-500"
                />
                <p className="text-sm text-red-500 mt-1">This field is required</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Password input"
                type="password"
              />
              <Input
                placeholder="Number input"
                type="number"
              />
              <Input
                placeholder="Search input"
                type="search"
              />
              <div>
                <Input
                  placeholder="Input with helper text"
                  type="text"
                />
                <p className="text-sm text-muted-foreground mt-1">This is some helpful information</p>
              </div>
            </div>
          </div>
        </section>

        {/* Loading States Section */}
        <section data-testid="loading-section" className="space-y-6">
          <h2 className="text-2xl font-semibold text-fx-text-primary">Loading States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-fx-border-default rounded-lg">
              <h3 className="text-lg font-medium mb-4">Spinner</h3>
              <LoadingSpinner size="md" />
            </div>

            <div className="p-6 border border-fx-border-default rounded-lg">
              <h3 className="text-lg font-medium mb-4">Skeleton Loader</h3>
              <SkeletonLoader lines={4} />
            </div>

            <div className="p-6 border border-fx-border-default rounded-lg">
              <h3 className="text-lg font-medium mb-4">Loading Overlay</h3>
              <div className="relative h-32 bg-fx-bg-subtle rounded-lg flex items-center justify-center">
                <LoadingOverlay isVisible={isLoading} message="Loading..." />
                <Button onClick={() => setIsLoading(!isLoading)}>
                  {isLoading ? 'Hide' : 'Show'} Loading Overlay
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Empty States Section */}
        <section data-testid="empty-section" className="space-y-6">
          <h2 className="text-2xl font-semibold text-fx-text-primary">Empty States</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-fx-border-default rounded-lg">
              <h3 className="text-lg font-medium mb-4">Empty Tastings</h3>
              <EmptyTastings />
            </div>

            <div className="p-6 border border-fx-border-default rounded-lg">
              <h3 className="text-lg font-medium mb-4">Empty Friends</h3>
              <EmptyFriends />
            </div>

            <div className="p-6 border border-fx-border-default rounded-lg">
              <h3 className="text-lg font-medium mb-4">Empty Flavor Wheel</h3>
              <EmptyFlavorWheel />
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section data-testid="typography-section" className="space-y-6">
          <h2 className="text-2xl font-semibold text-fx-text-primary">Typography Scale</h2>
          <div className="space-y-4">
            <h1 className="fx-text-h1">Heading 1 - The quick brown fox</h1>
            <h2 className="fx-text-h2">Heading 2 - The quick brown fox</h2>
            <h3 className="fx-text-h3">Heading 3 - The quick brown fox</h3>
            <h4 className="fx-text-h4">Heading 4 - The quick brown fox</h4>
            <h5 className="fx-text-h5">Heading 5 - The quick brown fox</h5>
            <h6 className="fx-text-h6">Heading 6 - The quick brown fox</h6>
            <p className="fx-text-body">Body text - The quick brown fox jumps over the lazy dog. This is a sample paragraph to test the body text styling and readability.</p>
            <p className="fx-text-body-sm">Small body text - The quick brown fox jumps over the lazy dog. This is smaller body text for secondary information.</p>
          </div>
        </section>

        {/* Color Palette Section */}
        <section data-testid="colors-section" className="space-y-6">
          <h2 className="text-2xl font-semibold text-fx-text-primary">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-fx-primary rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Primary</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-fx-secondary rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Secondary</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-fx-accent rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Accent</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-fx-flavor-fruity rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Fruity</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-fx-flavor-vegetal rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Vegetal</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-fx-flavor-sweet rounded-lg mx-auto mb-2"></div>
              <p className="text-sm font-medium">Sweet</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
