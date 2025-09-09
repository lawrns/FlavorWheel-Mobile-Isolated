import { useAuth } from '@/components/auth-provider'

// Smart defaults configuration
export interface BeverageDefaults {
  productType: string
  commonFlavors: string[]
  typicalRatingRange: [number, number]
  suggestedNotes: string[]
  preparationMethods: string[]
  commonBrands: string[]
}

export interface UserPreferences {
  favoriteBeverageTypes: string[]
  commonRatingRange: [number, number]
  preferredFlavors: string[]
  tastingFrequency: 'daily' | 'weekly' | 'monthly' | 'occasional'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
}

// Beverage-specific smart defaults
export const BEVERAGE_DEFAULTS: Record<string, BeverageDefaults> = {
  wine: {
    productType: 'wine',
    commonFlavors: ['Berry', 'Citrus', 'Oak', 'Vanilla', 'Spice', 'Mineral', 'Floral'],
    typicalRatingRange: [7, 9],
    suggestedNotes: [
      'Well-balanced with good structure',
      'Shows good aging potential',
      'Excellent value for money',
      'Classic varietal characteristics',
      'Smooth tannins with bright acidity'
    ],
    preparationMethods: ['Room temperature (16-18°C)', 'Decanted 30 minutes', 'Cork vs Screw cap'],
    commonBrands: ['Josh Cellars', 'Apothic', 'Kim Crawford', 'Yellow Tail', 'Barefoot']
  },

  beer: {
    productType: 'beer',
    commonFlavors: ['Hoppy', 'Malty', 'Citrus', 'Roasted', 'Fruity', 'Spice'],
    typicalRatingRange: [6, 8],
    suggestedNotes: [
      'Clean, crisp finish',
      'Good head retention',
      'Balanced malt-hop profile',
      'Refreshing carbonation',
      'Distinctive yeast character'
    ],
    preparationMethods: ['Chilled (4-6°C)', 'Poured with proper head', 'Glassware matters'],
    commonBrands: ['Sierra Nevada', 'Lagunitas', 'Stone Brewing', 'New Belgium', 'Bell\'s']
  },

  spirits: {
    productType: 'spirits',
    commonFlavors: ['Oak', 'Smoke', 'Vanilla', 'Herbal', 'Citrus', 'Caramel'],
    typicalRatingRange: [7, 9],
    suggestedNotes: [
      'Excellent proof and balance',
      'Complex layered flavors',
      'Smooth finish with good length',
      'Premium distillation quality',
      'Unique character and personality'
    ],
    preparationMethods: ['Neat or on rocks', 'Proper glassware', 'Room temperature'],
    commonBrands: ['Jameson', 'Patrón', 'Jack Daniel\'s', 'Tito\'s', 'Hendrick\'s']
  },

  coffee: {
    productType: 'coffee',
    commonFlavors: ['Chocolate', 'Nutty', 'Citrus', 'Floral', 'Caramel', 'Spice'],
    typicalRatingRange: [6, 9],
    suggestedNotes: [
      'Bright, lively acidity',
      'Smooth body with good balance',
      'Complex flavor profile',
      'Excellent aftertaste',
      'Premium quality beans'
    ],
    preparationMethods: ['Fresh ground', 'Optimal water temperature', 'Proper extraction time'],
    commonBrands: ['Blue Bottle', 'Stumptown', 'Intelligentsia', 'Counter Culture', 'Heart']
  },

  tea: {
    productType: 'tea',
    commonFlavors: ['Herbal', 'Floral', 'Citrus', 'Sweet', 'Bitter', 'Nutty'],
    typicalRatingRange: [6, 8],
    suggestedNotes: [
      'Bright, refreshing character',
      'Complex layered flavors',
      'Smooth texture',
      'Excellent balance',
      'Premium leaf quality'
    ],
    preparationMethods: ['Proper water temperature', 'Steeping time matters', 'Single estate'],
    commonBrands: ['VAHDAM', 'Art of Tea', 'Rare Tea Company', 'Artem-issa', 'Jade Leaf']
  }
}

// User behavior patterns for smart suggestions
export const USER_PATTERNS = {
  beginner: {
    maxFlavors: 3,
    simpleLanguage: true,
    basicNotes: true,
    guidedExperience: true
  },

  intermediate: {
    maxFlavors: 5,
    simpleLanguage: false,
    basicNotes: false,
    guidedExperience: false
  },

  advanced: {
    maxFlavors: 8,
    simpleLanguage: false,
    basicNotes: false,
    guidedExperience: false
  },

  expert: {
    maxFlavors: 10,
    simpleLanguage: false,
    basicNotes: false,
    guidedExperience: false
  }
}

// Smart defaults service class
export class SmartDefaultsService {
  private userPreferences: UserPreferences | null = null
  private tastingHistory: any[] = []

  constructor() {
    this.loadUserPreferences()
    this.loadTastingHistory()
  }

  private loadUserPreferences() {
    // Load from localStorage or user profile
    const saved = localStorage.getItem('user-preferences')
    if (saved) {
      try {
        this.userPreferences = JSON.parse(saved)
      } catch (error) {
        console.warn('Failed to parse user preferences:', error)
      }
    }

    // Set defaults if no preferences exist
    if (!this.userPreferences) {
      this.userPreferences = {
        favoriteBeverageTypes: ['wine', 'beer'],
        commonRatingRange: [6, 8],
        preferredFlavors: ['Fruity', 'Balanced', 'Smooth'],
        tastingFrequency: 'weekly',
        experienceLevel: 'intermediate'
      }
    }
  }

  private loadTastingHistory() {
    // Load recent tasting history for pattern analysis
    const saved = localStorage.getItem('tasting-history')
    if (saved) {
      try {
        this.tastingHistory = JSON.parse(saved).slice(-10) // Last 10 tastings
      } catch (error) {
        console.warn('Failed to parse tasting history:', error)
      }
    }
  }

  // Get smart defaults for a beverage type
  getBeverageDefaults(productType: string): BeverageDefaults {
    const defaults = BEVERAGE_DEFAULTS[productType]
    if (!defaults) {
      // Fallback to generic defaults
      return {
        productType,
        commonFlavors: ['Sweet', 'Sour', 'Bitter', 'Salty', 'Umami'],
        typicalRatingRange: [5, 8],
        suggestedNotes: ['Good balance', 'Pleasant experience', 'Worth trying again'],
        preparationMethods: ['Standard preparation'],
        commonBrands: []
      }
    }

    // Personalize based on user preferences
    if (this.userPreferences) {
      const userLevel = USER_PATTERNS[this.userPreferences.experienceLevel]

      return {
        ...defaults,
        commonFlavors: defaults.commonFlavors.slice(0, userLevel.maxFlavors),
        typicalRatingRange: this.userPreferences.commonRatingRange,
        suggestedNotes: userLevel.basicNotes
          ? defaults.suggestedNotes.slice(0, 2)
          : defaults.suggestedNotes
      }
    }

    return defaults
  }

  // Get recommended beverage type based on user patterns
  getRecommendedBeverageType(): string {
    if (!this.userPreferences || this.tastingHistory.length === 0) {
      return 'wine' // Default recommendation
    }

    // Analyze tasting history for patterns
    const typeCounts = this.tastingHistory.reduce((acc, tasting) => {
      const type = tasting.productType || tasting.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Return most frequent type, or fallback to user preference
    const mostFrequent = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    return mostFrequent || this.userPreferences.favoriteBeverageTypes[0] || 'wine'
  }

  // Get smart flavor suggestions based on context
  getFlavorSuggestions(productType: string, selectedFlavors: string[] = []): string[] {
    const defaults = this.getBeverageDefaults(productType)
    const userPrefs = this.userPreferences

    // Start with beverage-specific flavors
    let suggestions = [...defaults.commonFlavors]

    // Add user preferences if available
    if (userPrefs?.preferredFlavors) {
      suggestions = [...new Set([...suggestions, ...userPrefs.preferredFlavors])]
    }

    // Analyze recent tasting history for patterns
    if (this.tastingHistory.length > 0) {
      const recentFlavors = this.tastingHistory
        .filter(t => t.productType === productType)
        .flatMap(t => t.selectedFlavors || [])
        .slice(-5) // Last 5 flavor selections

      if (recentFlavors.length > 0) {
        suggestions = [...new Set([...suggestions, ...recentFlavors])]
      }
    }

    // Remove already selected flavors
    suggestions = suggestions.filter(flavor => !selectedFlavors.includes(flavor))

    // Limit based on user experience level
    if (userPrefs) {
      const userLevel = USER_PATTERNS[userPrefs.experienceLevel]
      suggestions = suggestions.slice(0, userLevel.maxFlavors)
    }

    return suggestions
  }

  // Get smart rating suggestions
  getRatingSuggestion(productType: string): number {
    const defaults = this.getBeverageDefaults(productType)
    const userPrefs = this.userPreferences

    // Use user preference if available
    if (userPrefs?.commonRatingRange) {
      const [min, max] = userPrefs.commonRatingRange
      return Math.round((min + max) / 2)
    }

    // Use beverage default
    const [min, max] = defaults.typicalRatingRange
    return Math.round((min + max) / 2)
  }

  // Get smart note suggestions
  getNoteSuggestions(productType: string, selectedFlavors: string[] = []): string[] {
    const defaults = this.getBeverageDefaults(productType)
    const userPrefs = this.userPreferences

    let suggestions = [...defaults.suggestedNotes]

    // Personalize based on selected flavors
    if (selectedFlavors.length > 0) {
      const flavorBasedNotes = generateFlavorBasedNotes(selectedFlavors)
      suggestions = [...suggestions, ...flavorBasedNotes]
    }

    // Limit based on user experience
    if (userPrefs) {
      const userLevel = USER_PATTERNS[userPrefs.experienceLevel]
      if (userLevel.simpleLanguage) {
        suggestions = suggestions.slice(0, 3)
      }
    }

    return suggestions
  }

  // Update user preferences based on their behavior
  updatePreferences(newTasting: any) {
    if (!this.userPreferences) return

    // Update favorite beverage types
    const currentTypes = this.userPreferences.favoriteBeverageTypes
    const newType = newTasting.productType

    if (!currentTypes.includes(newType)) {
      this.userPreferences.favoriteBeverageTypes = [newType, ...currentTypes].slice(0, 3)
    }

    // Update preferred flavors
    const selectedFlavors = newTasting.selectedFlavors || []
    const currentPrefs = this.userPreferences.preferredFlavors
    const newPrefs = [...new Set([...currentPrefs, ...selectedFlavors])].slice(0, 5)
    this.userPreferences.preferredFlavors = newPrefs

    // Update rating range based on new rating
    if (newTasting.overallRating) {
      const currentRange = this.userPreferences.commonRatingRange
      const newRating = newTasting.overallRating
      const avgRating = (currentRange[0] + currentRange[1]) / 2

      // Adjust range if rating is significantly different
      if (Math.abs(newRating - avgRating) > 1) {
        this.userPreferences.commonRatingRange = [
          Math.max(1, Math.min(currentRange[0], newRating - 1)),
          Math.min(10, Math.max(currentRange[1], newRating + 1))
        ]
      }
    }

    // Save updated preferences
    localStorage.setItem('user-preferences', JSON.stringify(this.userPreferences))
  }

  // Save tasting to history for pattern analysis
  saveTasting(tasting: any) {
    this.tastingHistory.push({
      ...tasting,
      timestamp: new Date().toISOString()
    })

    // Keep only last 20 tastings
    this.tastingHistory = this.tastingHistory.slice(-20)
    localStorage.setItem('tasting-history', JSON.stringify(this.tastingHistory))

    // Update preferences based on new tasting
    this.updatePreferences(tasting)
  }
}

// Utility function to generate flavor-based notes
function generateFlavorBasedNotes(selectedFlavors: string[]): string[] {
  const notes: string[] = []

  if (selectedFlavors.includes('Berry')) {
    notes.push('Juicy berry flavors dominate')
    notes.push('Bright, fruit-forward profile')
  }

  if (selectedFlavors.includes('Oak')) {
    notes.push('Well-integrated oak influence')
    notes.push('Subtle vanilla and spice from oak aging')
  }

  if (selectedFlavors.includes('Citrus')) {
    notes.push('Refreshing citrus notes')
    notes.push('Bright, zesty acidity')
  }

  if (selectedFlavors.includes('Chocolate')) {
    notes.push('Rich chocolate undertones')
    notes.push('Cocoa depth with balanced sweetness')
  }

  if (selectedFlavors.includes('Spice')) {
    notes.push('Complex spice profile')
    notes.push('Warm, aromatic finish')
  }

  // Generic positive notes if no specific matches
  if (notes.length === 0) {
    notes.push('Well-balanced flavor profile')
    notes.push('Pleasant tasting experience')
    notes.push('Good overall harmony')
  }

  return notes.slice(0, 3) // Limit to 3 suggestions
}

// React hook for using smart defaults
export function useSmartDefaults() {
  const { user } = useAuth()
  const [service] = React.useState(() => new SmartDefaultsService())

  React.useEffect(() => {
    // Reload preferences when user changes
    if (user) {
      service.loadUserPreferences()
      service.loadTastingHistory()
    }
  }, [user, service])

  return {
    getBeverageDefaults: (productType: string) => service.getBeverageDefaults(productType),
    getRecommendedBeverageType: () => service.getRecommendedBeverageType(),
    getFlavorSuggestions: (productType: string, selected: string[] = []) =>
      service.getFlavorSuggestions(productType, selected),
    getRatingSuggestion: (productType: string) => service.getRatingSuggestion(productType),
    getNoteSuggestions: (productType: string, selectedFlavors: string[] = []) =>
      service.getNoteSuggestions(productType, selectedFlavors),
    saveTasting: (tasting: any) => service.saveTasting(tasting)
  }
}

// Export singleton instance for non-React usage
export const smartDefaults = new SmartDefaultsService()
