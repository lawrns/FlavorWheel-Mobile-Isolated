// Mexican Beverage Types
export type MexicanBeverageType =
  | 'mezcal'
  | 'tequila'
  | 'sotol'
  | 'pulque'
  | 'raicilla'
  | 'bacanora'
  | 'mexican_wine'

export type ProductionMethod = 'ancestral' | 'artisanal' | 'industrial'

export type AgingCategory = 'joven' | 'blanco' | 'reposado' | 'añejo' | 'extra_añejo'

// Agave and Plant Types
export interface AgaveVariety {
  id: string
  name: string
  scientificName: string
  commonNames: string[]
  region: string[]
  characteristics: string[]
  maturationYears: number
  sugarContent: number
  isWild: boolean
  conservationStatus: 'abundant' | 'common' | 'rare' | 'endangered'
  translations: {
    'es-MX': string
    en: string
  }
}

export interface PlantVariety {
  id: string
  name: string
  scientificName: string
  type: 'agave' | 'dasylirion' | 'other'
  region: string[]
  characteristics: string[]
  translations: {
    'es-MX': string
    en: string
  }
}

// Certification Types
export type CertificationType =
  | 'CRT'
  | 'CRM'
  | 'Organic'
  | 'Biodynamic'
  | 'Fair_Trade'
  | 'Sotol_Certification'

export interface Certification {
  type: CertificationType
  number: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'suspended' | 'pending'
  issuingBody: string
  verificationUrl?: string
}

// Sustainability Metrics
export interface SustainabilityMetrics {
  organicCertified: boolean
  fairTrade: boolean
  biodynamic: boolean
  waterUsage: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  carbonFootprint: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  wasteManagement: 'excellent' | 'good' | 'fair' | 'poor'
  biodiversityImpact: 'positive' | 'neutral' | 'negative'
  socialImpact: 'positive' | 'neutral' | 'negative'
  score: number // 0-10 scale
  lastAssessment: string
  certifications: string[]
}

// Geographic and Terroir Types
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface SoilType {
  type: 'volcanic' | 'limestone' | 'clay' | 'sandy' | 'alluvial' | 'desert'
  percentage: number
  characteristics: string[]
}

export interface Climate {
  type: 'tropical' | 'temperate' | 'semi-arid' | 'desert'
  averageTemperature: string
  rainfallMm: number
  humidity: string
  seasons: {
    dry: string
    wet: string
  }
}

export interface Terroir {
  region: string
  state: string
  municipality?: string
  climate: Climate
  geography: {
    elevation: {
      min: number
      max: number
      unit: 'meters' | 'feet'
    }
    soilTypes: SoilType[]
    topography: string
  }
  flavorCharacteristics: string[]
  coordinates?: Coordinates
}

// Producer and Facility Types
export interface Facility {
  address: string
  coordinates: Coordinates
  capacity: string
  established: number
  certifications: string[]
  productionMethods: ProductionMethod[]
  equipment: string[]
}

export interface Producer {
  id: string
  nomNumber: string
  name: string
  type: MexicanBeverageType[]
  region: string
  municipality: string
  state: string
  certifications: Certification[]
  facility: Facility
  brands: string[]
  agaveVarieties?: string[]
  plantVarieties?: string[]
  sustainability: SustainabilityMetrics
  contact: {
    website?: string
    email?: string
    phone?: string
    socialMedia?: {
      facebook?: string
      instagram?: string
      twitter?: string
    }
  }
  foundedYear: number
  ownershipType: 'family' | 'corporate' | 'cooperative' | 'government'
  productionVolume: {
    annual: number
    unit: 'liters' | 'bottles'
  }
  distributionMarkets: string[]
  awards: string[]
  masterDistiller?: string
}

// Mexican Beverage Product Types
export interface MexicanBeverage {
  id: string
  name: string
  type: MexicanBeverageType
  producer: Producer
  nomNumber: string
  region: string
  agaveVariety?: AgaveVariety
  plantVariety?: PlantVariety
  productionMethod: ProductionMethod
  aging?: {
    category: AgingCategory
    duration: string
    container: 'oak' | 'steel' | 'clay' | 'glass' | 'other'
  }
  abv: number
  batch?: string
  bottlingDate?: string
  terroir: Terroir
  flavorProfile: {
    dominant: string[]
    secondary: string[]
    finish: string[]
    intensity: number // 1-10 scale
  }
  culturalContext: {
    traditionalUse: string[]
    ceremonies: string[]
    pairings: string[]
    significance: string
  }
  sustainability: SustainabilityMetrics
  certifications: Certification[]
  price?: {
    amount: number
    currency: 'MXN' | 'USD'
    size: string
  }
  availability: {
    markets: string[]
    distributors: string[]
    onlineStores: string[]
  }
  images: {
    bottle?: string
    label?: string
    producer?: string
    facility?: string
  }
  qrCode?: string
  barcode?: string
  metadata: {
    createdAt: string
    updatedAt: string
    verifiedAt?: string
    source: string
  }
}

// Professional Certification Types
export type ProfessionalCertificationType =
  | 'CRT_Certified'
  | 'CRM_Certified'
  | 'Sommelier'
  | 'Mezcalier'
  | 'Tequilier'
  | 'Educator'
  | 'Producer_Certified'

export interface ProfessionalCertification {
  type: ProfessionalCertificationType
  level: 'basic' | 'intermediate' | 'advanced' | 'master'
  number: string
  issueDate: string
  expiryDate?: string
  issuingBody: string
  status: 'active' | 'expired' | 'suspended' | 'pending'
  verificationUrl?: string
  continuingEducation: {
    required: boolean
    hoursRequired?: number
    deadline?: string
  }
}

// User and Professional Types
export type UserRole =
  | 'consumer'
  | 'professional'
  | 'producer'
  | 'educator'
  | 'distributor'
  | 'sommelier'

export interface MexicanUser {
  id: string
  email: string
  name: string
  role: UserRole
  preferredLanguage: 'en' | 'es-MX'
  region: string
  state: string
  professionalCertifications: ProfessionalCertification[]
  culturalBackground: {
    indigenous?: string
    region: string
    familyTradition: boolean
  }
  preferences: {
    beverageTypes: MexicanBeverageType[]
    regions: string[]
    sustainabilityFocus: boolean
    culturalContext: boolean
    professionalMode: boolean
  }
  tastingExperience: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    totalTastings: number
    favoriteRegions: string[]
    specializations: string[]
  }
  privacy: {
    dataProcessingConsent: boolean
    marketingConsent: boolean
    lfpdpppCompliant: boolean // Mexican data privacy law
    consentDate: string
  }
  metadata: {
    createdAt: string
    lastLogin: string
    verifiedAt?: string
  }
}

// Tasting and Session Types
export interface MexicanTastingSession {
  id: string
  name: string
  description: string
  type: 'blind' | 'guided' | 'comparative' | 'educational' | 'professional'
  beverages: MexicanBeverage[]
  participants: MexicanUser[]
  host: MexicanUser
  language: 'en' | 'es-MX' | 'bilingual'
  culturalContext: boolean
  sustainabilityFocus: boolean
  professionalMode: boolean
  terroir: {
    focus: boolean
    regions: string[]
    comparison: boolean
  }
  collaboration: {
    realTime: boolean
    sessionId: string
    maxParticipants: number
    inviteCode: string
  }
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  schedule: {
    startTime: string
    endTime?: string
    timezone: string
  }
  results: {
    individual: Record<string, any>
    aggregate: Record<string, any>
    consensus: Record<string, any>
  }
  metadata: {
    createdAt: string
    updatedAt: string
    completedAt?: string
  }
}

// Regional and Cultural Types
export interface MexicanRegion {
  id: string
  name: string
  state: string
  beverageTypes: MexicanBeverageType[]
  terroir: Terroir
  culturalSignificance: string
  traditionalMethods: string[]
  indigenousCommunities: string[]
  producers: string[]
  touristRoutes: string[]
  festivals: {
    name: string
    date: string
    description: string
  }[]
  translations: {
    'es-MX': {
      name: string
      description: string
    }
    en: {
      name: string
      description: string
    }
  }
}

// Export utility types
export type MexicanBeverageCategory = MexicanBeverageType
export type CertificationStatus = Certification['status']
export type SustainabilityLevel = SustainabilityMetrics['waterUsage']
export type ProductionMethodType = ProductionMethod
export type ProfessionalLevel = ProfessionalCertification['level']
