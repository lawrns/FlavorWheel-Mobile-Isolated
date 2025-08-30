import { useState } from 'react'
import { Share2, Copy, Mail, MessageSquare } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface TastingSharingProps {
  tastingId: string
  tastingName: string
  onClose?: () => void
}

export function TastingSharing({ tastingId, tastingName, onClose }: TastingSharingProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/en/tastings/${tastingId}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${tastingName}`,
          text: `Check out this tasting: ${tastingName}`,
          url: shareUrl,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      handleCopyLink()
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Join ${tastingName}`)
    const body = encodeURIComponent(`Check out this tasting: ${shareUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Check out this tasting: ${tastingName}\n${shareUrl}`)
    window.open(`https://wa.me/?text=${text}`)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Tasting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">{tastingName}</h3>
          <p className="text-sm text-gray-600 mb-3">
            Share this tasting with others to collaborate and compare notes.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleShare}
            className="w-full"
            variant="default"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>

          <Button
            onClick={handleCopyLink}
            className="w-full"
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleEmailShare}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>

            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 text-center">
            Sharing link: {shareUrl}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
