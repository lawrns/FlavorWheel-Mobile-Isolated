'use client'

import React from 'react'
import { HelpTooltip } from './help-tooltip'
import { ProgressiveDisclosure } from './progressive-disclosure'
import { FeatureDiscovery } from './progressive-disclosure'
import { Wine, Camera, Users, Star, TrendingUp, BookOpen } from 'lucide-react'

interface ContextualHelpProps {
  page?: string
  section?: string
  className?: string
}

export function ContextualHelp({ page, section, className = '' }: ContextualHelpProps) {
  const getHelpContent = () => {
    switch (page) {
      case 'landing':
        return (
          <div className="space-y-4">
            <HelpTooltip
              title="Welcome to FlavorWheel"
              content="FlavorWheel is your gateway to discovering the rich world of Mexican spirits. Start by exploring our tasting features or connecting with the community."
            />

            <FeatureDiscovery
              feature="Photo-Enhanced Reviews"
              description="Take photos of your tastings and get AI-powered flavor analysis to enhance your reviews."
              icon={<Camera className="h-5 w-5 text-accent" />}
              onDiscover={() => console.log('Photo feature discovered')}
            />
          </div>
        )

      case 'quick-tasting':
        return (
          <div className="space-y-4">
            <ProgressiveDisclosure title="Tasting Tips">
              <div className="space-y-3 text-sm">
                <p>• <strong>Observe:</strong> Take time to observe the liquid&apos;s appearance and viscosity</p>
                <p>• <strong>Smell:</strong> Identify aromas by category (fruity, floral, spicy, etc.)</p>
                <p>• <strong>Taste:</strong> Note the flavors on different parts of your tongue</p>
                <p>• <strong>Finish:</strong> Pay attention to the aftertaste and how long it lasts</p>
              </div>
            </ProgressiveDisclosure>

            <HelpTooltip
              title="Flavor Intensity Scale"
              content="Rate each aspect on a 1-10 scale where 1 is barely perceptible and 10 is overwhelmingly intense."
            />
          </div>
        )

      case 'social':
        return (
          <div className="space-y-4">
            <ProgressiveDisclosure title="Building Your Network">
              <div className="space-y-3 text-sm">
                <p>• <strong>Connect:</strong> Send friend requests to fellow enthusiasts</p>
                <p>• <strong>Share:</strong> Post about your tasting experiences</p>
                <p>• <strong>Learn:</strong> Read reviews from experienced tasters</p>
                <p>• <strong>Discover:</strong> Find new spirits through community recommendations</p>
              </div>
            </ProgressiveDisclosure>

            <FeatureDiscovery
              feature="Expert Insights"
              description="Get personalized recommendations based on your tasting history and preferences."
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              onDiscover={() => console.log('Expert insights discovered')}
            />
          </div>
        )

      case 'review':
        return (
          <div className="space-y-4">
            <HelpTooltip
              title="Writing Great Reviews"
              content="Include specific observations about aroma, flavor, finish, and overall balance. Mention production methods, aging, and comparisons to similar spirits."
            />

            <ProgressiveDisclosure title="Review Best Practices">
              <div className="space-y-3 text-sm">
                <p>• <strong>Be Specific:</strong> Use descriptive language rather than generic terms</p>
                <p>• <strong>Context Matters:</strong> Note the occasion, food pairings, and serving method</p>
                <p>• <strong>Balance:</strong> Discuss both strengths and areas for improvement</p>
                <p>• <strong>Photos:</strong> Visual documentation helps others understand your experience</p>
              </div>
            </ProgressiveDisclosure>
          </div>
        )

      default:
        return (
          <HelpTooltip
            title="Need Help?"
            content="Explore FlavorWheel's features to discover the art of spirit tasting. Start with a quick tasting or browse the community reviews."
          />
        )
    }
  }

  return (
    <div className={`contextual-help ${className}`}>
      {getHelpContent()}
    </div>
  )
}

// Inline help component for specific UI elements
interface InlineHelpProps {
  text: string
  className?: string
}

export function InlineHelp({ text, className = '' }: InlineHelpProps) {
  return (
    <HelpTooltip
      title="Quick Help"
      content={text}
      trigger={
        <button className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-muted text-xs font-medium ${className}`}>
          ?
        </button>
      }
    />
  )
}

// Floating help button for pages
export function FloatingHelp({ page }: { page?: string }) {
  return (
    <div className="fixed bottom-20 right-4 z-40">
      <HelpTooltip
        title="Help & Tips"
        content="Get contextual help and discover new features throughout FlavorWheel."
        position="left"
        trigger={
          <button className="w-12 h-12 bg-primary hover:bg-primary-hover text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
            <BookOpen className="h-5 w-5" />
          </button>
        }
      />
    </div>
  )
}
