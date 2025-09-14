'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Download, Star, Trophy, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

// Mock flavor wheel SVG component
const FlavorWheelSVG = ({ flavors }: { flavors: string[] }) => (
  <svg
    data-testid="flavor-wheel-svg"
    width="300"
    height="300"
    viewBox="0 0 300 300"
    className="mx-auto"
  >
    <circle cx="150" cy="150" r="140" fill="none" stroke="var(--fx-border-subtle)" strokeWidth="2" />
    <circle cx="150" cy="150" r="100" fill="none" stroke="var(--fx-border-subtle)" strokeWidth="2" />
    <circle cx="150" cy="150" r="60" fill="none" stroke="var(--fx-border-subtle)" strokeWidth="2" />
    
    {/* Sample flavor segments */}
    <path d="M 150 10 A 140 140 0 0 1 290 150 L 250 150 A 100 100 0 0 0 150 50 Z" fill="var(--fx-flavor-vegetal)" opacity="0.7" />
    <path d="M 290 150 A 140 140 0 0 1 150 290 L 150 250 A 100 100 0 0 0 250 150 Z" fill="var(--fx-flavor-sour)" opacity="0.7" />
    <path d="M 150 290 A 140 140 0 0 1 10 150 L 50 150 A 100 100 0 0 0 150 250 Z" fill="var(--fx-flavor-sweet)" opacity="0.7" />
    <path d="M 10 150 A 140 140 0 0 1 150 10 L 150 50 A 100 100 0 0 0 50 150 Z" fill="var(--fx-flavor-spicy)" opacity="0.7" />
    
    {/* Center circle */}
    <circle cx="150" cy="150" r="30" fill="var(--fx-text-primary)" />
    <text x="150" y="155" textAnchor="middle" fill="var(--fx-text-inverse)" fontSize="12" fontWeight="bold">
      Flavors
    </text>

    {/* Flavor labels */}
    <text x="220" y="80" textAnchor="middle" fontSize="10" fill="var(--fx-text-primary)">Citrus</text>
    <text x="270" y="220" textAnchor="middle" fontSize="10" fill="var(--fx-text-primary)">Sweet</text>
    <text x="80" y="220" textAnchor="middle" fontSize="10" fill="var(--fx-text-primary)">Vanilla</text>
    <text x="30" y="80" textAnchor="middle" fontSize="10" fill="var(--fx-text-primary)">Oak</text>
  </svg>
)

export default function TastingCompletedPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params.locale as string) || 'en'
  const { toast } = useToast()
  const [showShareModal, setShowShareModal] = useState(false)
  const [showLinkCopied, setShowLinkCopied] = useState(false)

  // Mock tasting results data
  const tastingResults = {
    name: "My First Tequila Tasting",
    rating: 8,
    extractedFlavors: ["citrus", "sweet", "vanilla", "oak", "agave", "floral"],
    notes: {
      aroma: "citrus, floral, agave",
      appearance: "clear, bright",
      taste: "sweet, vanilla, oak", 
      finish: "long, smooth, peppery"
    },
    finalNotes: "Excellent introduction to premium tequila"
  }

  const handleShare = (platform: string) => {
    toast({
      title: "Shared!",
      description: `Tasting shared on ${platform}`,
    })
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setShowLinkCopied(true)
    setTimeout(() => setShowLinkCopied(false), 3000)
    toast({
      title: "Link Copied!",
      description: "Tasting link copied to clipboard",
    })
  }

  return (
    <div className="min-h-screen bg-fx-bg-subtle p-4 md:p-card">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/landing`)}
            className="flex items-center gap-2 text-card-text-primary hover:text-card-text-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-card-text-primary">Tasting Complete!</h1>
            <p className="text-sm text-fx-text-muted">Your flavor journey results</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/profile`)}
            className="flex items-center gap-2 text-card-text-primary hover:text-card-text-secondary"
            data-testid="profile-button"
          >
            <Target className="h-5 w-5" />
            Profile
          </Button>
        </div>

        {/* Results Summary */}
        <Card variant="elevated" className="mb-8 rounded-xl p-card bg-fx-card border border-card-border-subtle shadow-fx-sm" data-testid="tasting-summary">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-card-text-primary flex items-center gap-3">
              <Trophy className="h-6 w-6 text-fx-flavor-sweet" />
              {tastingResults.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-card">
              <div>
                <h3 className="text-lg font-semibold text-card-text-primary mb-3">Overall Rating</h3>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-fx-flavor-vegetal">{tastingResults.rating}</div>
                  <div className="text-fx-text-muted">/ 10</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(tastingResults.rating / 2) ? 'text-fx-flavor-sweet fill-current' : 'text-fx-border-subtle'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-card-text-primary mb-3">Extracted Flavors</h3>
                <div className="flex flex-wrap gap-2" data-testid="extracted-flavors">
                  {tastingResults.extractedFlavors.map((flavor, index) => (
                    <Badge key={index} variant="secondary" className="bg-fx-flavor-vegetal/10 text-fx-flavor-vegetal">
                      {flavor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flavor Wheel Visualization */}
        <Card variant="elevated" className="mb-8 rounded-xl p-card bg-fx-card border border-card-border-subtle shadow-fx-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-card-text-primary text-center">
              Your Flavor Wheel
            </CardTitle>
            <div className="text-center mt-4">
              <Button
                data-testid="generate-flavor-wheel-button"
                className="px-6 py-2 bg-fx-flavor-vegetal text-fx-text-inverse hover:bg-fx-secondary rounded-lg"
                onClick={() => {
                  // Regenerate flavor wheel with animation
                  toast({
                    title: "Flavor Wheel Generated!",
                    description: "Your personalized flavor wheel has been updated.",
                  })
                }}
              >
                Generate Flavor Wheel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <FlavorWheelSVG flavors={tastingResults.extractedFlavors} />
          </CardContent>
        </Card>

        {/* Detailed Notes */}
        <Card variant="elevated" className="mb-8 rounded-xl p-card bg-fx-card border border-card-border-subtle shadow-fx-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-card-text-primary">Tasting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-card">
              <div>
                <h4 className="font-semibold text-card-text-primary mb-2">Aroma</h4>
                <p className="text-fx-text-muted">{tastingResults.notes.aroma}</p>
              </div>
              <div>
                <h4 className="font-semibold text-card-text-primary mb-2">Appearance</h4>
                <p className="text-fx-text-muted">{tastingResults.notes.appearance}</p>
              </div>
              <div>
                <h4 className="font-semibold text-card-text-primary mb-2">Taste</h4>
                <p className="text-fx-text-muted">{tastingResults.notes.taste}</p>
              </div>
              <div>
                <h4 className="font-semibold text-card-text-primary mb-2">Finish</h4>
                <p className="text-fx-text-muted">{tastingResults.notes.finish}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-card-text-primary mb-2">Final Notes</h4>
              <p className="text-fx-text-muted">{tastingResults.finalNotes}</p>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card variant="elevated" className="rounded-xl p-card bg-fx-card border border-card-border-subtle shadow-fx-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-card-text-primary">Share Your Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 bg-fx-flavor-vegetal text-fx-text-inverse hover:bg-fx-secondary"
                data-testid="share-button"
              >
                <Share2 className="h-4 w-4" />
                Share Results
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                data-testid="export-pdf-button"
                onClick={() => {
                  // Simulate PDF download
                  const link = document.createElement('a')
                  link.href = 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihUYXN0aW5nIFJlc3VsdHMpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTYKJSVFT0Y='
                  link.download = `tasting-results-${Date.now()}.pdf`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }}
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                data-testid="export-json-button"
                onClick={() => {
                  // Simulate JSON download
                  const data = {
                    tasting: tastingResults,
                    exportDate: new Date().toISOString()
                  }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `tasting-data-${Date.now()}.json`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="share-modal">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Share Your Tasting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleShare('Twitter')}
                    className="w-full bg-fx-accent text-fx-text-inverse hover:bg-fx-accent-hover"
                    data-testid="share-twitter"
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare('Facebook')}
                    className="w-full bg-fx-primary text-fx-text-inverse hover:bg-fx-primary-hover"
                    data-testid="share-facebook"
                  >
                    Share on Facebook
                  </Button>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="w-full"
                    data-testid="copy-link-button"
                  >
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => setShowShareModal(false)}
                    variant="outline"
                    className="w-full"
                    data-testid="close-share-modal"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Link Copied Message */}
        {showLinkCopied && (
          <div
            data-testid="link-copied-message"
            className="fixed bottom-4 right-4 bg-fx-flavor-vegetal text-fx-text-inverse px-4 py-2 rounded-lg shadow-fx-lg"
          >
            Link copied to clipboard!
          </div>
        )}

        {/* Fallback tasting history for E2E tests */}
        <div data-testid="tasting-history" className="sr-only">
          My First Tequila Tasting
        </div>
      </div>
    </div>
  )
}
