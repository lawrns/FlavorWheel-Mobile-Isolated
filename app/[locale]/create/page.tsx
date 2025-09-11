'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ProgressiveDisclosure, ProgressiveForm, ContextualHelp } from '@/components/ui/progressive-disclosure'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Users, Settings, Zap, Star, HelpCircle } from 'lucide-react'
import { UnifiedAppShell } from '@/components/app-shell'

export default function CreatePage() {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const handleQuickStart = () => {
    // Navigate to quick tasting
    window.location.href = `/${locale}/quick-tasting`
  }

  const handleAdvancedSetup = () => {
    // Navigate to advanced creation flow
    window.location.href = `/${locale}/create/advanced`
  }

  return (
    <UnifiedAppShell variant="dashboard" activeNavItemOverride="create" backgroundStyle="fx-bg">
      <div className="min-h-screen bg-gradient-to-br from-fx-bg to-fx-bg-subtle">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href={`/${locale}/landing`}
            className="inline-flex items-center gap-2 text-fx-text-secondary hover:text-fx-text-primary mb-6 transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-fx-text-primary mb-6 font-heading">
            Create Your Tasting Experience
          </h1>
          <p className="text-xl text-fx-text-secondary max-w-3xl mx-auto">
            Choose how you&apos;d like to explore flavors. Start simple or dive deep with our AI-powered tools.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Quick Start */}
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-fx-accent">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-fx-accent to-fx-accent-hover rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-fx-text-primary mb-2">
                Quick Tasting
              </CardTitle>
              <p className="text-fx-text-secondary">
                Get started in under 2 minutes with our streamlined tasting experience
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-fx-text-secondary">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  3 simple steps
                </div>
                <div className="flex items-center gap-2 text-sm text-fx-text-secondary">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  AI flavor suggestions
                </div>
                <div className="flex items-center gap-2 text-sm text-fx-text-secondary">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Instant results
                </div>
              </div>
              <Button
                onClick={handleQuickStart}
                className="w-full bg-fx-accent hover:bg-fx-accent-hover text-white font-semibold py-3"
                size="lg"
              >
                Start Quick Tasting
              </Button>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-fx-secondary">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-fx-secondary to-fx-secondary-hover rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-fx-text-primary mb-2">
                Advanced Options
              </CardTitle>
              <p className="text-fx-text-secondary">
                Full control with professional tools and detailed customization
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-fx-text-secondary">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Study mode for learning
                </div>
                <div className="flex items-center gap-2 text-sm text-fx-text-secondary">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Competition challenges
                </div>
                <div className="flex items-center gap-2 text-sm text-fx-text-secondary">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Custom templates
                </div>
              </div>
              <Button
                onClick={handleAdvancedSetup}
                variant="outline"
                className="w-full border-fx-secondary text-fx-secondary hover:bg-fx-secondary hover:text-white font-semibold py-3"
                size="lg"
              >
                Explore Advanced Options
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progressive Disclosure Sections */}
        <div className="space-y-6">
          {/* Learning Resources */}
          <ProgressiveDisclosure
            title="New to Tasting? Start Here"
            description="Learn the basics and get comfortable with flavor evaluation"
            level="primary"
            variant="accordion"
            icon={<Star className="w-5 h-5 text-yellow-500" />}
            badge="Beginner"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Flavor Basics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fx-text-secondary mb-4">
                    Learn about the fundamental taste categories and how to identify them in beverages.
                  </p>
                  <Link href={`/${locale}/learn/basics`}>
                    <Button variant="outline" className="w-full">
                      Start Learning
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Guided Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fx-text-secondary mb-4">
                    Follow step-by-step guidance through your first tasting experience.
                  </p>
                  <Link href={`/${locale}/create/study`}>
                    <Button variant="outline" className="w-full">
                      Begin Guided Session
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </ProgressiveDisclosure>

          {/* Advanced Features */}
          <ProgressiveDisclosure
            title="Advanced Tasting Features"
            description="Professional tools for experienced tasters and competitions"
            level="secondary"
            variant="accordion"
            icon={<Settings className="w-5 h-5 text-purple-500" />}
            badge="Pro"
          >
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">Study Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-fx-text-secondary mb-4">
                      Systematic learning with detailed analysis
                    </p>
                    <Link href={`/${locale}/create/study`}>
                      <Button size="sm" className="w-full">
                        Start Study
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">Competition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-fx-text-secondary mb-4">
                      Challenge yourself in blind tastings
                    </p>
                    <Link href={`/${locale}/create/competition`}>
                      <Button size="sm" className="w-full">
                        Join Competition
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-fx-text-secondary mb-4">
                      Create personalized tasting workflows
                    </p>
                    <Link href={`/${locale}/create/templates`}>
                      <Button size="sm" variant="outline" className="w-full">
                        Browse Templates
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ProgressiveDisclosure>

          {/* Community & Social */}
          <ProgressiveDisclosure
            title="Connect with the Community"
            description="Share experiences and learn from fellow tasters"
            level="secondary"
            variant="accordion"
            icon={<Users className="w-5 h-5 text-green-500" />}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Community Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        MS
                      </div>
                      <div>
                        <p className="text-sm font-medium">Maria shared a tasting of Premium Mezcal</p>
                        <p className="text-xs text-fx-text-secondary">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        JD
                      </div>
                      <div>
                        <p className="text-sm font-medium">John completed his first blind tasting</p>
                        <p className="text-xs text-fx-text-secondary">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/${locale}/social`} className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      View Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-fx-accent" />
                      <div>
                        <p className="text-sm font-medium">Mexican Spirits Masterclass</p>
                        <p className="text-xs text-fx-text-secondary">Tomorrow at 7 PM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-fx-secondary" />
                      <div>
                        <p className="text-sm font-medium">Weekly Blind Tasting</p>
                        <p className="text-xs text-fx-text-secondary">Friday at 8 PM</p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/${locale}/events`} className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      View All Events
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </ProgressiveDisclosure>
        </div>

        {/* Help Section */}
        <div className="text-center mt-12 p-6 bg-fx-bg-subtle rounded-2xl">
          <h3 className="text-xl font-semibold text-fx-text-primary mb-4">
            Need Help Getting Started?
          </h3>
          <p className="text-fx-text-secondary mb-6 max-w-2xl mx-auto">
            Our AI assistant can guide you through your first tasting or answer any questions about flavor evaluation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <HelpTooltip
              title="Quick Start Guide"
              content="Getting started is easy: 1. Choose Quick Tasting for immediate results, 2. Select your beverage type, 3. Pick the flavors you detect, 4. Rate your overall impression"
              trigger={
                <Button variant="outline" size="sm">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Quick Help
                </Button>
              }
            />

            <Link href={`/${locale}/dashboard`}>
              <Button variant="ghost">
                View My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </UnifiedAppShell>
  )
}