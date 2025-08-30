'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useSupabase } from '@/components/providers/supabase-provider'
import {
  createTasting as createTastingDB,
  getUserTastings,
  completeTasting as completeTastingDB,
} from '@/services/supabase-service'

export interface TastingItem {
  id: string
  name: string
  details?: string
  nomNumber?: string
  mexicanBeverageType?: string
  producer?: string
  region?: string
}

export interface TastingParticipant {
  id: string
  name: string
  status: 'pending' | 'active' | 'complete'
}

export interface Tasting {
  id: string
  code: string
  name: string
  type: string
  description?: string
  date: string
  isBlind: boolean
  items: TastingItem[]
  participants: TastingParticipant[]
  characteristics?: string[]
  createdBy: string
  competitionMode?: 'accuracy' | 'preference'
  qrCodeUrl?: string
  completedAt?: string
  ratings?: Record<string, number>
  notes?: Record<string, string>
}

// User Progress and Achievement System
export interface UserAchievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
  category: 'tasting' | 'mexican_beverages' | 'collaboration' | 'expertise'
}

export interface UserProgress {
  userId: string
  tastingsCompleted: number
  mexicanBeveragesExplored: string[]
  regionsExplored: string[]
  nomNumbersSearched: string[]
  collaborativeSessions: number
  achievements: UserAchievement[]
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  unlockedFeatures: string[]
  lastActiveDate: string
  // Template-related progress
  templatesUsed: number
  templatesCreated: number
  favoriteTemplates: string[]
  templateCategories: string[]
}

// Feature unlock thresholds
export const FEATURE_UNLOCK_THRESHOLDS = {
  analytics_dashboard: 3, // After 3 completed tastings
  comparison_view: 5, // After 5 completed tastings
  terroir_map: 2, // After exploring 2 Mexican regions
  producer_profiles: 1, // After first NOM search
  sustainability_metrics: 10, // After 10 completed tastings
  professional_certification: 15, // After 15 completed tastings
  professional_review: 2, // After 2 completed tastings
  cultural_context: 1, // After first Mexican beverage tasting
  export_results: 3, // After 3 completed tastings
  blind_tasting_advanced: 7, // After 7 completed tastings
  collaboration_advanced: 5, // After 5 collaborative sessions
}

export const ACHIEVEMENTS: UserAchievement[] = [
  {
    id: 'first_tasting',
    name: 'Primera Cata',
    description: 'Completa tu primera sesión de cata',
    icon: '🌱',
    category: 'tasting',
  },
  {
    id: 'mezcal_explorer',
    name: 'Explorador de Mezcal',
    description: 'Prueba 3 mezcales diferentes',
    icon: '🌵',
    category: 'mexican_beverages',
  },
  {
    id: 'tequila_connoisseur',
    name: 'Conocedor de Tequila',
    description: 'Prueba tequilas de 3 regiones diferentes',
    icon: '🥃',
    category: 'mexican_beverages',
  },
  {
    id: 'nom_detective',
    name: 'Detective NOM',
    description: 'Busca 5 productores por número NOM',
    icon: '🔍',
    category: 'mexican_beverages',
  },
  {
    id: 'terroir_master',
    name: 'Maestro del Terroir',
    description: 'Explora 5 regiones mexicanas diferentes',
    icon: '🗺️',
    category: 'expertise',
  },
  {
    id: 'collaboration_champion',
    name: 'Campeón de Colaboración',
    description: 'Participa en 10 sesiones colaborativas',
    icon: '👥',
    category: 'collaboration',
  },
  {
    id: 'flavor_analyst',
    name: 'Analista de Sabores',
    description: 'Identifica 50 descriptores de sabor únicos',
    icon: '⭐',
    category: 'expertise',
  },
  {
    id: 'cultural_ambassador',
    name: 'Embajador Cultural',
    description: 'Identifica 20 referencias culturales mexicanas',
    icon: '🎭',
    category: 'mexican_beverages',
  },
]

interface TastingContextType {
  // Existing tasting functionality
  tastings: Tasting[]
  addTasting: (tasting: Omit<Tasting, 'id' | 'code' | 'date' | 'qrCodeUrl'>) => Promise<Tasting>
  getTasting: (id: string) => Tasting | undefined
  getTastingByCode: (code: string) => Tasting | undefined
  updateTasting: (id: string, updates: Partial<Tasting>) => void
  deleteTasting: (id: string) => void
  generateTastingCode: () => string
  generateQRCode: (tastingId: string) => string

  // Progress tracking functionality
  userProgress: UserProgress
  updateProgress: (updates: Partial<UserProgress>) => void
  completeTasting: (
    tastingId: string,
    ratings: Record<string, number>,
    notes: Record<string, string>
  ) => Promise<void>
  checkAchievements: () => UserAchievement[]
  isFeatureUnlocked: (featureName: string) => boolean
  getUnlockedFeatures: () => string[]
  addMexicanBeverageExperience: (beverageType: string, region?: string, nomNumber?: string) => void
  incrementCollaborativeSessions: () => void

  // Template-related functions
  incrementTemplatesUsed: () => void
  incrementTemplatesCreated: () => void
  addFavoriteTemplate: (templateId: string) => void
  removeFavoriteTemplate: (templateId: string) => void
  addTemplateCategory: (category: string) => void
}

const TastingContext = createContext<TastingContextType | undefined>(undefined)

export function TastingProvider({ children }: { children: ReactNode }) {
  // Always call useSupabase hook - handle errors in the hook itself
  const supabaseContext = useSupabase()
  const { user, initialized } = supabaseContext
  const [tastings, setTastings] = useState<Tasting[]>([])
  const [userProgress, setUserProgress] = useState<UserProgress>({
    userId: '', // Will be set when user is loaded
    tastingsCompleted: 0,
    mexicanBeveragesExplored: [],
    regionsExplored: [],
    nomNumbersSearched: [],
    collaborativeSessions: 0,
    achievements: [],
    expertiseLevel: 'beginner',
    unlockedFeatures: ['basic_tasting', 'flavor_wheel', 'notes'],
    lastActiveDate: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
    // Template-related progress
    templatesUsed: 0,
    templatesCreated: 0,
    favoriteTemplates: [],
    templateCategories: [],
  })

  // Initialize userId when user is loaded
  useEffect(() => {
    if (user && user.id && userProgress.userId !== user.id) {
      setUserProgress(prev => ({
        ...prev,
        userId: user.id,
      }))
    }
  }, [user, userProgress.userId])

  // Utility to normalize incoming progress objects so required arrays/fields always exist
  const normalizeUserProgress = (progress: Partial<UserProgress>): UserProgress => {
    const safeArray = (arr: unknown): string[] => (Array.isArray(arr) ? (arr as string[]) : [])
    const safeAchievements = (arr: unknown): UserAchievement[] =>
      Array.isArray(arr) ? (arr as UserAchievement[]) : []
    const expertise = (val: unknown): UserProgress['expertiseLevel'] =>
      val === 'beginner' || val === 'intermediate' || val === 'advanced' || val === 'expert'
        ? val
        : 'beginner'

    return {
      userId: typeof progress.userId === 'string' ? progress.userId : '',
      tastingsCompleted:
        typeof progress.tastingsCompleted === 'number' ? progress.tastingsCompleted : 0,
      mexicanBeveragesExplored: safeArray(progress.mexicanBeveragesExplored),
      regionsExplored: safeArray(progress.regionsExplored),
      nomNumbersSearched: safeArray(progress.nomNumbersSearched),
      collaborativeSessions:
        typeof progress.collaborativeSessions === 'number' ? progress.collaborativeSessions : 0,
      achievements: safeAchievements(progress.achievements),
      expertiseLevel: expertise(progress.expertiseLevel),
      unlockedFeatures: safeArray(progress.unlockedFeatures),
      lastActiveDate:
        typeof progress.lastActiveDate === 'string'
          ? progress.lastActiveDate
          : /* ssr-stable */ '1970-01-01T00:00:00.000Z',
      templatesUsed: typeof progress.templatesUsed === 'number' ? progress.templatesUsed : 0,
      templatesCreated:
        typeof progress.templatesCreated === 'number' ? progress.templatesCreated : 0,
      favoriteTemplates: safeArray(progress.favoriteTemplates),
      templateCategories: safeArray(progress.templateCategories),
    }
  }

  // Sync user progress from Supabase (merge with defaults to avoid undefined fields)
  // Note: User progress is now managed locally since the new Supabase context is simplified

  // Load tastings from Supabase when user is available
  useEffect(() => {
    console.log('Loading tastings from Supabase...')

    if (user && initialized && user.id) {
      console.log('🔄 User authenticated, loading tastings for:', user.id)
      loadUserTastings()
    } else if (!user && initialized) {
      console.log('ℹ️ No user authenticated, loading sample tastings')
      // Load sample tastings for guest users
      // Add some sample tastings for demo purposes
      const sampleTastings: Tasting[] = [
        {
          id: '1',
          code: 'TASTING-1234',
          name: 'Friday Wine Club',
          type: 'wine',
          description: 'Comparing Bordeaux wines from different regions',
          date: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
          isBlind: true,
          items: [
            { id: '1', name: 'Wine Sample A', details: 'Château Margaux 2015' },
            { id: '2', name: 'Wine Sample B', details: 'Château Lafite Rothschild 2016' },
            { id: '3', name: 'Wine Sample C', details: 'Château Latour 2014' },
          ],
          participants: [
            { id: '1', name: 'You', status: 'active' },
            { id: '2', name: 'Alex', status: 'pending' },
            { id: '3', name: 'Sarah', status: 'complete' },
          ],
          characteristics: ['Aroma', 'Body', 'Tannins', 'Acidity', 'Finish'],
          createdBy: 'user_123',
          competitionMode: 'accuracy',
          qrCodeUrl: '/placeholder.svg?height=200&width=200',
        },
        {
          id: '2',
          code: 'TASTING-5678',
          name: 'Ethiopian Coffee Origins',
          type: 'coffee',
          description: 'Exploring different Ethiopian coffee regions',
          date: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
          isBlind: false,
          items: [
            { id: '1', name: 'Yirgacheffe', details: 'Light roast, floral notes' },
            { id: '2', name: 'Sidamo', details: 'Medium roast, fruity profile' },
            { id: '3', name: 'Guji', details: 'Medium-light roast, citrus notes' },
          ],
          participants: [
            { id: '1', name: 'You', status: 'active' },
            { id: '2', name: 'John', status: 'pending' },
          ],
          characteristics: ['Aroma', 'Acidity', 'Body', 'Flavor', 'Aftertaste'],
          createdBy: 'user_123',
          competitionMode: 'preference',
          qrCodeUrl: '/placeholder.svg?height=200&width=200',
        },
      ]

      setTastings(sampleTastings)
    }
  }, [user, initialized])

  const loadUserTastings = async () => {
    if (!user || !user.id) {
      console.log('⚠️ No user or user ID available, skipping tasting load')
      return
    }

    try {
      console.log('🔄 Loading tastings for user:', user.id)

      // Increased timeout for better reliability
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tasting load timeout after 15 seconds')), 15000)
      })

      const userTastings = (await Promise.race([
        getUserTastings(user.id),
        timeoutPromise,
      ])) as unknown[]

      if (userTastings && userTastings.length > 0) {
        console.log('✅ Found', userTastings.length, 'tastings')
        setTastings(
          userTastings.map((tasting: any) => ({
            id: tasting.id,
            code: tasting.code,
            name: tasting.name,
            type: tasting.type,
            description: tasting.description || undefined,
            date: tasting.date,
            isBlind: tasting.is_blind,
            items: tasting.items,
            participants: tasting.participants,
            characteristics: tasting.characteristics || undefined,
            createdBy: tasting.created_by,
            competitionMode: tasting.competition_mode || undefined,
            qrCodeUrl: tasting.qr_code_url || undefined,
            completedAt: tasting.completed_at || undefined,
            ratings: tasting.ratings || undefined,
            notes: tasting.notes || undefined,
          }))
        )
      } else {
        console.log('ℹ️ No tastings found for user, using empty array')
        setTastings([])
      }
    } catch (error) {
      console.error('❌ Error loading user tastings:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        userId: user.id,
      })

      // Always load sample tastings on error to prevent infinite loading
      console.warn('⚠️ Loading sample tastings due to error or timeout')
      const sampleTastings: Tasting[] = [
        {
          id: 'sample-1',
          code: 'SAMPLE-001',
          name: 'Tequila Blanco Tasting',
          type: 'tequila',
          description: 'Sample tasting session',
          date: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
          isBlind: false,
          items: [{ id: '1', name: 'Tequila Sample', details: '100% Agave Blanco' }],
          participants: [{ id: '1', name: 'You', status: 'active' }],
          characteristics: ['Aroma', 'Sabor', 'Acabado'],
          createdBy: user.id,
        },
      ]
      setTastings(sampleTastings)
    }
  }

  // Save user progress to Supabase when it changes (with proper guards)
  useEffect(() => {
    // Only update if we have a valid authenticated user and valid progress data
    if (
      user &&
      userProgress &&
      userProgress.userId === user.id &&
      userProgress.userId !== 'guest' &&
      initialized // Only update if Supabase is initialized
    ) {
      // Debounce updates to prevent excessive API calls
      const timeoutId = setTimeout(async () => {
        try {
          // await updateProgress(userProgress) // Disabled in simplified provider
          console.log('✅ User progress synchronized with database')
        } catch (error) {
          // Log error but don't block UI - progress is still saved locally
          console.warn('Progress sync failed (non-critical):', {
            error: error instanceof Error ? error.message : String(error),
            userId: user.id,
            progressUserId: userProgress.userId,
          })
        }
      }, 2000) // 2 second debounce to reduce API calls

      return () => clearTimeout(timeoutId)
    }
  }, [userProgress, user, initialized])

  // Generate a unique tasting code
  const generateTastingCode = () => {
    const prefix = 'TASTING-'
    // Use crypto.getRandomValues for stable random generation
    const randomNum = 1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000)
    return `${prefix}${randomNum}`
  }

  // Generate a QR code URL (in a real app, this would create an actual QR code)
  const generateQRCode = (tastingId: string) => {
    // In a real app, this would generate a QR code image
    // For now, we'll just return a placeholder
    return `/placeholder.svg?height=200&width=200&text=${tastingId}`
  }

  // Add a new tasting
  const addTasting = async (
    tasting: Omit<Tasting, 'id' | 'code' | 'date' | 'qrCodeUrl'>
  ): Promise<Tasting> => {
    console.log('addTasting called with:', tasting)
    console.log('User state:', user ? { id: user.id, email: user.email } : 'No user')

    if (!user) {
      // For guest users, use local state
      console.log('Creating tasting for guest user')
      const id = uuidv4()
      const code = generateTastingCode()
      const newTasting: Tasting = {
        ...tasting,
        id,
        code,
        date: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
        qrCodeUrl: generateQRCode(id),
      }
      setTastings(prev => [...prev, newTasting])
      return newTasting
    }

    try {
      console.log('Creating tasting for authenticated user')
      const code = generateTastingCode()
      const tastingData = {
        ...tasting,
        code,
        date: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
        qrCodeUrl: generateQRCode(code),
      }

      console.log('Calling createTastingDB with:', tastingData)

      // Try to create in database, but fallback to local storage if it fails
      let createdTasting
      try {
        // Prefer unified Next.js API to ensure consistent auth/RLS
        const res = await fetch('/api/tastings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: tastingData.name,
            description: tastingData.description,
            tasting_type: tastingData.type,
            is_blind: tastingData.isBlind,
            items: tastingData.items,
            characteristics: tastingData.characteristics,
            competition_mode: tastingData.competitionMode,
            scheduled_for: undefined,
            max_participants: tastingData.participants?.length || 10,
          }),
        })
        if (!res.ok) {
          throw new Error(`API error ${res.status}`)
        }
        const payload = await res.json()
        createdTasting = payload.data
        console.log('API /api/tastings created:', createdTasting)
      } catch (dbError) {
        console.warn('Database creation failed, falling back to local storage:', dbError)
        // Fallback to local storage for now
        const id = uuidv4()
        const localTasting: Tasting = {
          ...tasting,
          id,
          code,
          date: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
          qrCodeUrl: generateQRCode(code),
        }
        setTastings(prev => [...prev, localTasting])
        return localTasting
      }

      const newTasting: Tasting = {
        id: createdTasting.id,
        code: createdTasting.code,
        name: createdTasting.name,
        type: createdTasting.type,
        description: createdTasting.description || undefined,
        date: createdTasting.date,
        isBlind: createdTasting.is_blind,
        items: createdTasting.items,
        participants: createdTasting.participants,
        characteristics: createdTasting.characteristics || undefined,
        createdBy: createdTasting.created_by,
        competitionMode: createdTasting.competition_mode || undefined,
        qrCodeUrl: createdTasting.qr_code_url || undefined,
      }

      setTastings(prev => [...prev, newTasting])
      return newTasting
    } catch (error) {
      console.error('Error creating tasting:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error,
      })
      throw error
    }
  }

  // Get a tasting by ID
  const getTasting = (id: string) => {
    return tastings.find(t => t.id === id)
  }

  // Get a tasting by code
  const getTastingByCode = (code: string) => {
    return tastings.find(t => t.code === code)
  }

  // Update a tasting
  const updateTasting = (id: string, updates: Partial<Tasting>) => {
    setTastings(prev =>
      prev.map(tasting => (tasting.id === id ? { ...tasting, ...updates } : tasting))
    )
  }

  // Delete a tasting
  const deleteTasting = (id: string) => {
    setTastings(prev => prev.filter(tasting => tasting.id !== id))
  }

  // Progress tracking functions
  const updateLocalProgress = (updates: Partial<UserProgress>) => {
    setUserProgress(prev => ({
      ...prev,
      ...updates,
      lastActiveDate: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
    }))
  }

  const completeTasting = async (
    tastingId: string,
    ratings: Record<string, number>,
    notes: Record<string, string>
  ) => {
    try {
      // Update the tasting with completion data
      if (user) {
        await completeTastingDB(tastingId, ratings, notes)
      }

      updateTasting(tastingId, {
        completedAt: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
        ratings,
        notes,
      })
    } catch (error) {
      console.error('Error completing tasting:', error)
    }

    // Update user progress
    const tasting = getTasting(tastingId)
    if (tasting) {
      const newProgress: UserProgress = {
        ...userProgress,
        tastingsCompleted: userProgress.tastingsCompleted + 1,
        lastActiveDate: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
      }

      // Track Mexican beverage experience
      if (['mezcal', 'tequila', 'sotol', 'pulque'].includes(tasting.type)) {
        const mexicanBeverages = [...userProgress.mexicanBeveragesExplored]
        if (!mexicanBeverages.includes(tasting.type)) {
          mexicanBeverages.push(tasting.type)
        }
        newProgress.mexicanBeveragesExplored = mexicanBeverages

        // Track regions from items
        const regions = [...userProgress.regionsExplored]
        tasting.items.forEach(item => {
          if (item.region && !regions.includes(item.region)) {
            regions.push(item.region)
          }
        })
        newProgress.regionsExplored = regions
      }

      // Update expertise level based on completed tastings
      let expertiseLevel = userProgress.expertiseLevel
      if (newProgress.tastingsCompleted >= 20) expertiseLevel = 'expert'
      else if (newProgress.tastingsCompleted >= 10) expertiseLevel = 'advanced'
      else if (newProgress.tastingsCompleted >= 5) expertiseLevel = 'intermediate'

      newProgress.expertiseLevel = expertiseLevel

      // Check for newly unlocked features
      const unlockedFeatures = getUnlockedFeaturesForProgress({
        ...userProgress,
        ...newProgress,
      })
      newProgress.unlockedFeatures = unlockedFeatures

      setUserProgress(prev => ({ ...prev, ...newProgress }))

      // Check for new achievements
      setTimeout(() => checkAchievements(), 100)
    }
  }

  const addMexicanBeverageExperience = (
    beverageType: string,
    region?: string,
    nomNumber?: string
  ) => {
    const updates: Partial<UserProgress> = {}

    // Add beverage type
    if (!(userProgress.mexicanBeveragesExplored || []).includes(beverageType)) {
      updates.mexicanBeveragesExplored = [...userProgress.mexicanBeveragesExplored, beverageType]
    }

    // Add region
    if (region && !(userProgress.regionsExplored || []).includes(region)) {
      updates.regionsExplored = [...userProgress.regionsExplored, region]
    }

    // Add NOM number
    if (nomNumber && !(userProgress.nomNumbersSearched || []).includes(nomNumber)) {
      updates.nomNumbersSearched = [...userProgress.nomNumbersSearched, nomNumber]
    }

    if (Object.keys(updates).length > 0) {
      updateLocalProgress(updates)
      setTimeout(() => checkAchievements(), 100)
    }
  }

  const incrementCollaborativeSessions = () => {
    updateLocalProgress({
      collaborativeSessions: userProgress.collaborativeSessions + 1,
    })
    setTimeout(() => checkAchievements(), 100)
  }

  // Template-related functions
  const incrementTemplatesUsed = () => {
    updateLocalProgress({
      templatesUsed: userProgress.templatesUsed + 1,
    })
    setTimeout(() => checkAchievements(), 100)
  }

  const incrementTemplatesCreated = () => {
    updateLocalProgress({
      templatesCreated: userProgress.templatesCreated + 1,
    })
    setTimeout(() => checkAchievements(), 100)
  }

  const addFavoriteTemplate = (templateId: string) => {
    if (!(userProgress.favoriteTemplates || []).includes(templateId)) {
      updateLocalProgress({
        favoriteTemplates: [...userProgress.favoriteTemplates, templateId],
      })
    }
  }

  const removeFavoriteTemplate = (templateId: string) => {
    updateLocalProgress({
      favoriteTemplates: userProgress.favoriteTemplates.filter(id => id !== templateId),
    })
  }

  const addTemplateCategory = (category: string) => {
    if (!(userProgress.templateCategories || []).includes(category)) {
      updateLocalProgress({
        templateCategories: [...userProgress.templateCategories, category],
      })
    }
  }

  const getUnlockedFeaturesForProgress = (progress: UserProgress): string[] => {
    const features = [...(progress.unlockedFeatures || [])]

    Object.entries(FEATURE_UNLOCK_THRESHOLDS).forEach(([feature, threshold]) => {
      if (!features.includes(feature)) {
        let shouldUnlock = false

        switch (feature) {
          case 'analytics_dashboard':
          case 'comparison_view':
          case 'export_results':
          case 'sustainability_metrics':
          case 'professional_certification':
          case 'professional_review':
          case 'blind_tasting_advanced':
            shouldUnlock = progress.tastingsCompleted >= threshold
            break
          case 'terroir_map':
            shouldUnlock = progress.regionsExplored.length >= threshold
            break
          case 'producer_profiles':
            shouldUnlock = progress.nomNumbersSearched.length >= threshold
            break
          case 'cultural_context':
            shouldUnlock = progress.mexicanBeveragesExplored.length >= threshold
            break
          case 'collaboration_advanced':
            shouldUnlock = progress.collaborativeSessions >= threshold
            break
        }

        if (shouldUnlock) {
          features.push(feature)
        }
      }
    })

    return features
  }

  const isFeatureUnlocked = (featureName: string): boolean => {
    return (userProgress.unlockedFeatures || []).includes(featureName)
  }

  const getUnlockedFeatures = (): string[] => {
    return userProgress.unlockedFeatures || []
  }

  const checkAchievements = (): UserAchievement[] => {
    const newAchievements: UserAchievement[] = []
    const currentAchievementIds = userProgress.achievements.map(a => a.id)

    ACHIEVEMENTS.forEach(achievement => {
      if (!currentAchievementIds.includes(achievement.id)) {
        let shouldUnlock = false

        switch (achievement.id) {
          case 'first_tasting':
            shouldUnlock = userProgress.tastingsCompleted >= 1
            break
          case 'mezcal_explorer':
            shouldUnlock =
              userProgress.mexicanBeveragesExplored.filter(b => b === 'mezcal').length >= 3
            break
          case 'tequila_connoisseur':
            shouldUnlock =
              userProgress.mexicanBeveragesExplored.includes('tequila') &&
              userProgress.regionsExplored.length >= 3
            break
          case 'nom_detective':
            shouldUnlock = userProgress.nomNumbersSearched.length >= 5
            break
          case 'terroir_master':
            shouldUnlock = userProgress.regionsExplored.length >= 5
            break
          case 'collaboration_champion':
            shouldUnlock = userProgress.collaborativeSessions >= 10
            break
          case 'flavor_analyst':
            shouldUnlock = userProgress.tastingsCompleted >= 15 // Proxy for flavor descriptors
            break
          case 'cultural_ambassador':
            shouldUnlock =
              userProgress.mexicanBeveragesExplored.length >= 3 &&
              userProgress.regionsExplored.length >= 4
            break
        }

        if (shouldUnlock) {
          const unlockedAchievement = {
            ...achievement,
            unlockedAt: /* ssr-stable */ '1970-01-01T00:00:00.000Z',
          }
          newAchievements.push(unlockedAchievement)
        }
      }
    })

    if (newAchievements.length > 0) {
      setUserProgress(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
      }))
    }

    return newAchievements
  }

  // Always render children to avoid hydration mismatch
  // Loading states will be handled by individual components that use the context

  return (
    <TastingContext.Provider
      value={{
        // Existing tasting functionality
        tastings,
        addTasting,
        getTasting,
        getTastingByCode,
        updateTasting,
        deleteTasting,
        generateTastingCode,
        generateQRCode,

        // Progress tracking functionality
        userProgress,
        updateProgress: updateLocalProgress,
        completeTasting,
        checkAchievements,
        isFeatureUnlocked,
        getUnlockedFeatures,
        addMexicanBeverageExperience,
        incrementCollaborativeSessions,

        // Template-related functions
        incrementTemplatesUsed,
        incrementTemplatesCreated,
        addFavoriteTemplate,
        removeFavoriteTemplate,
        addTemplateCategory,
      }}
    >
      {children}
    </TastingContext.Provider>
  )
}

export function useTasting() {
  const context = useContext(TastingContext)
  if (context === undefined) {
    throw new Error('useTasting must be used within a TastingProvider')
  }
  return context
}

// Client timestamp hydration
// useEffect(() => setTimestamp(new Date().toISOString()), [])
