import { DashboardAppShell } from '@/components/app-shell'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Target, Star } from 'lucide-react'

type CreateTastingPageClientProps = {
  onModeSelect?: (mode: 'study' | 'competition' | 'quick') => void
}

export default function CreateTastingPageClient({ onModeSelect }: CreateTastingPageClientProps) {
  const handleCompetitionClick = () => {
    if (onModeSelect) {
      onModeSelect('competition')
    } else {
      window.location.href = '/en/create/competition'
    }
  }

  const handleStudyClick = () => {
    if (onModeSelect) {
      onModeSelect('study')
    } else {
      window.location.href = '/en/create/study'
    }
  }

  const handleQuickClick = () => {
    if (onModeSelect) {
      onModeSelect('quick')
    } else {
      window.location.href = '/en/quick-tasting'
    }
  }

  return (
    <DashboardAppShell activeNavItem="create" maxWidth="full">
      <div className="container mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-6 min-h-[calc(100vh-8rem)] flex items-center justify-center overflow-hidden">
        <div className="w-full">
          {/* Type Selection */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-xl">What would you like to create?</CardTitle>
              <CardDescription>Choose the type of experience you want to share</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full overflow-hidden">
                {/* Competition Mode Button */}
                <button
                  onClick={handleCompetitionClick}
                  className="p-4 sm:p-6 rounded-xl border-2 transition-all text-center border-gray-200 hover:border-gray-300 hover:shadow-md min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center w-full"
                >
                  <Target className="h-10 w-10 mx-auto mb-3 flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="font-semibold text-lg mb-2 leading-tight">Competition Mode</h3>
                    <p className="text-sm text-gray-600 leading-relaxed break-words hyphens-auto">Structured competition with scoring and ranking</p>
                  </div>
                </button>

                {/* Study Mode Button */}
                <button
                  onClick={handleStudyClick}
                  className="p-4 sm:p-6 rounded-xl border-2 transition-all text-center border-gray-200 hover:border-gray-300 hover:shadow-md min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center w-full"
                >
                  <BookOpen className="h-10 w-10 mx-auto mb-3 flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="font-semibold text-lg mb-2 leading-tight">Study Mode</h3>
                    <p className="text-sm text-gray-600 leading-relaxed break-words hyphens-auto">Flexible tasting for learning with prose input and flavor wheel generation</p>
                  </div>
                </button>

                {/* Quick Tasting Button */}
                <button
                  onClick={handleQuickClick}
                  className="p-4 sm:p-6 rounded-xl border-2 transition-all text-center border-gray-200 hover:border-gray-300 hover:shadow-md min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center w-full"
                >
                  <Star className="h-10 w-10 mx-auto mb-3 flex-shrink-0" />
                  <div className="flex flex-col flex-1 min-h-0">
                    <h3 className="font-semibold text-lg mb-2 leading-tight">Quick Tasting</h3>
                    <p className="text-sm text-gray-600 leading-relaxed break-words hyphens-auto">Simple 4-category evaluation</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardAppShell>
  )
}