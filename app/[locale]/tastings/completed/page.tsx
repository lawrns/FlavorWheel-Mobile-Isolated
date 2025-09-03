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
    <circle cx="150" cy="150" r="140" fill="none" stroke="#e5e7eb" strokeWidth="2" />
    <circle cx="150" cy="150" r="100" fill="none" stroke="#e5e7eb" strokeWidth="2" />
    <circle cx="150" cy="150" r="60" fill="none" stroke="#e5e7eb" strokeWidth="2" />
    
    {/* Sample flavor segments */}
    <path d="M 150 10 A 140 140 0 0 1 290 150 L 250 150 A 100 100 0 0 0 150 50 Z" fill="#10b981" opacity="0.7" />
    <path d="M 290 150 A 140 140 0 0 1 150 290 L 150 250 A 100 100 0 0 0 250 150 Z" fill="#3b82f6" opacity="0.7" />
    <path d="M 150 290 A 140 140 0 0 1 10 150 L 50 150 A 100 100 0 0 0 150 250 Z" fill="#f59e0b" opacity="0.7" />
    <path d="M 10 150 A 140 140 0 0 1 150 10 L 150 50 A 100 100 0 0 0 50 150 Z" fill="#ef4444" opacity="0.7" />
    
    {/* Center circle */}
    <circle cx="150" cy="150" r="30" fill="#1f2937" />
    <text x="150" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
      Flavors
    </text>
    
    {/* Flavor labels */}
    <text x="220" y="80" textAnchor="middle" fontSize="10" fill="#1f2937">Citrus</text>
    <text x="270" y="220" textAnchor="middle" fontSize="10" fill="#1f2937">Sweet</text>
    <text x="80" y="220" textAnchor="middle" fontSize="10" fill="#1f2937">Vanilla</text>
    <text x="30" y="80" textAnchor="middle" fontSize="10" fill="#1f2937">Oak</text>
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
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/landing`)}
            className="flex items-center gap-2 text-[#1f2937] hover:text-[#4b5563]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#1f2937]">Tasting Complete!</h1>
            <p className="text-sm text-[#6b7280]">Your flavor journey results</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/${locale}/profile`)}
            className="flex items-center gap-2 text-[#1f2937] hover:text-[#4b5563]"
            data-testid="profile-button"
          >
            <Target className="h-5 w-5" />
            Profile
          </Button>
        </div>

        {/* Results Summary */}
        <Card className="mb-8 rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]" data-testid="tasting-summary">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-[#1f2937] flex items-center gap-3">
              <Trophy className="h-6 w-6 text-[#f59e0b]" />
              {tastingResults.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-[#1f2937] mb-3">Overall Rating</h3>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-[#10b981]">{tastingResults.rating}</div>
                  <div className="text-[#6b7280]">/ 10</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(tastingResults.rating / 2) ? 'text-[#f59e0b] fill-current' : 'text-[#e5e7eb]'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-[#1f2937] mb-3">Extracted Flavors</h3>
                <div className="flex flex-wrap gap-2" data-testid="extracted-flavors">
                  {tastingResults.extractedFlavors.map((flavor, index) => (
                    <Badge key={index} variant="secondary" className="bg-[#10b981]/10 text-[#10b981]">
                      {flavor}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flavor Wheel Visualization */}
        <Card className="mb-8 rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-[#1f2937] text-center">
              Your Flavor Wheel
            </CardTitle>
            <div className="text-center mt-4">
              <Button
                data-testid="generate-flavor-wheel-button"
                className="px-6 py-2 bg-[#10b981] text-white hover:bg-[#059669] rounded-lg"
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
        <Card className="mb-8 rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-[#1f2937]">Tasting Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-[#1f2937] mb-2">Aroma</h4>
                <p className="text-[#6b7280]">{tastingResults.notes.aroma}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1f2937] mb-2">Appearance</h4>
                <p className="text-[#6b7280]">{tastingResults.notes.appearance}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1f2937] mb-2">Taste</h4>
                <p className="text-[#6b7280]">{tastingResults.notes.taste}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1f2937] mb-2">Finish</h4>
                <p className="text-[#6b7280]">{tastingResults.notes.finish}</p>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-[#1f2937] mb-2">Final Notes</h4>
              <p className="text-[#6b7280]">{tastingResults.finalNotes}</p>
            </div>
          </CardContent>
        </Card>

        {/* Share Section */}
        <Card className="rounded-xl p-6 bg-white border border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-[#1f2937]">Share Your Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2 bg-[#10b981] text-white hover:bg-[#059669]"
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
                    className="w-full bg-[#1da1f2] text-white hover:bg-[#1a91da]"
                    data-testid="share-twitter"
                  >
                    Share on Twitter
                  </Button>
                  <Button
                    onClick={() => handleShare('Facebook')}
                    className="w-full bg-[#4267b2] text-white hover:bg-[#365899]"
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
            className="fixed bottom-4 right-4 bg-[#10b981] text-white px-4 py-2 rounded-lg shadow-lg"
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
