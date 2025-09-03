'use client'

import React from 'react'
import { Wine, Users, Star, Camera, Award, TrendingUp } from 'lucide-react'
import { Button } from './button'
import { useOnboarding } from '@/components/providers/onboarding-provider'

interface WelcomeModalProps {
  onClose: () => void
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const { startTour } = useOnboarding()

  const handleStartTour = () => {
    onClose()
    startTour()
  }

  const handleExploreAlone = () => {
    onClose()
  }

  const features = [
    { icon: Wine, text: 'Expert Tasting Sessions' },
    { icon: Users, text: 'Connect with Community' },
    { icon: Star, text: 'Write Detailed Reviews' },
    { icon: Camera, text: 'Capture & Share Photos' },
    { icon: Award, text: 'Earn Achievement Badges' },
    { icon: TrendingUp, text: 'Track Your Progress' }
  ]

  return (
    <div className="welcome-modal">
      <div className="welcome-content">
        <div className="welcome-title">
          Welcome to FlavorWheel! 🌵
        </div>

        <div className="welcome-subtitle">
          Discover the rich world of Mexican spirits through expert-guided tasting experiences.
          Join a community of enthusiasts sharing their passion for tequila, mezcal, and beyond.
        </div>

        <div className="welcome-features">
          {features.map((feature, index) => (
            <div key={index} className="welcome-feature">
              <feature.icon className="welcome-feature-icon flex-shrink-0" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleStartTour}
            className="w-full btn-primary-beautiful text-body font-semibold py-3"
          >
            Take a Quick Tour
          </Button>

          <Button
            onClick={handleExploreAlone}
            variant="outline"
            className="w-full btn-secondary-beautiful text-body font-medium py-3"
          >
            Explore on My Own
          </Button>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          You can always access the tour later from your profile settings
        </div>
      </div>
    </div>
  )
}
