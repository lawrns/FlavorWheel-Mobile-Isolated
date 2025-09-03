import { faker } from '@faker-js/faker'
import type { MexicanBeverageType } from '@/types/mexican-types'

// Base factory utilities
export const createId = () => faker.string.uuid()
export const createTimestamp = () => faker.date.recent().toISOString()
export const createEmail = () => faker.internet.email()
export const createName = () => faker.person.fullName()
export const createDescription = () => faker.lorem.sentences(2)

// User factories
export const createUser = (overrides = {}) => ({
  id: createId(),
  email: createEmail(),
  name: createName(),
  avatar: faker.image.avatar(),
  role: faker.helpers.arrayElement(['user', 'expert', 'admin']),
  experienceLevel: faker.helpers.arrayElement(['beginner', 'intermediate', 'expert', 'professional']),
  preferences: {
    language: faker.helpers.arrayElement(['en', 'es', 'nah']),
    notifications: faker.datatype.boolean(),
    theme: faker.helpers.arrayElement(['light', 'dark', 'system']),
  },
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
  ...overrides,
})

export const createUserProfile = (overrides = {}) => ({
  ...createUser(),
  bio: faker.lorem.paragraph(),
  location: faker.location.city(),
  tastingCount: faker.number.int({ min: 0, max: 1000 }),
  favoriteBeverages: faker.helpers.arrayElements(
    ['tequila', 'mezcal', 'pulque', 'beer', 'wine'],
    { min: 1, max: 3 }
  ),
  achievements: faker.helpers.arrayElements(
    ['first-tasting', 'flavor-expert', 'social-butterfly', 'quality-control'],
    { min: 0, max: 4 }
  ),
  ...overrides,
})

// Beverage factories
const mexicanBeverages: MexicanBeverageType[] = [
  'tequila', 'mezcal', 'pulque', 'beer', 'wine', 'coffee', 'chocolate'
]

const regions = [
  'Jalisco', 'Oaxaca', 'Veracruz', 'Chiapas', 'Guanajuato', 'Tamaulipas',
  'Michoacán', 'Puebla', 'Hidalgo', 'Tlaxcala'
]

const agaveVarieties = [
  'Blue Weber', 'Espadín', 'Tobalá', 'Cuishe', 'Tepeztate', 'Barril',
  'Cenizo', 'Maguey', 'Papalote', 'Sierra Negra'
]

export const createBeverage = (overrides = {}) => ({
  id: createId(),
  name: faker.helpers.arrayElement([
    'Clase Azul Tequila',
    'Del Maguey Mezcal',
    'Pulque Traditional',
    'Modelo Beer',
    'Casa Madero Wine',
    'Chiapas Coffee',
    'Xocolatl Chocolate'
  ]),
  type: faker.helpers.arrayElement(mexicanBeverages),
  region: faker.helpers.arrayElement(regions),
  agaveVariety: faker.helpers.arrayElement(agaveVarieties),
  alcoholContent: faker.number.float({ min: 0, max: 60, precision: 0.1 }),
  producer: faker.company.name(),
  description: createDescription(),
  price: faker.number.float({ min: 20, max: 500, precision: 0.01 }),
  rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
  imageUrl: faker.image.url(),
  createdAt: createTimestamp(),
  ...overrides,
})

// Tasting factories
export const createTasting = (overrides = {}) => ({
  id: createId(),
  name: faker.helpers.arrayElement([
    'Premium Tequila Tasting',
    'Artisanal Mezcal Experience',
    'Traditional Pulque Session',
    'Mexican Beer Flight',
    'Wine Tasting Journey',
    'Coffee Cupping Session',
    'Chocolate Tasting Workshop'
  ]),
  description: createDescription(),
  type: faker.helpers.arrayElement(['guided', 'free-form', 'blind', 'comparative']),
  status: faker.helpers.arrayElement(['draft', 'active', 'completed', 'archived']),
  visibility: faker.helpers.arrayElement(['private', 'public', 'shared']),
  userId: createId(),
  beverageId: createId(),
  participants: faker.helpers.arrayElements(
    [createId(), createId(), createId()],
    { min: 1, max: 5 }
  ),
  scheduledAt: faker.date.future(),
  completedAt: faker.datatype.boolean() ? createTimestamp() : null,
  createdAt: createTimestamp(),
  updatedAt: createTimestamp(),
  ...overrides,
})

export const createTastingSession = (overrides = {}) => ({
  ...createTasting(),
  notes: {
    aroma: faker.lorem.sentences(3),
    flavor: faker.lorem.sentences(3),
    finish: faker.lorem.sentences(2),
    overall: faker.lorem.sentences(4),
  },
  ratings: {
    aroma: faker.number.int({ min: 1, max: 10 }),
    flavor: faker.number.int({ min: 1, max: 10 }),
    finish: faker.number.int({ min: 1, max: 10 }),
    overall: faker.number.int({ min: 1, max: 10 }),
  },
  duration: faker.number.int({ min: 15, max: 120 }), // minutes
  ...overrides,
})

// Flavor analysis factories
const flavorCategories = [
  'Sweet', 'Sour', 'Salty', 'Bitter', 'Umami', 'Spicy', 'Herbal', 'Floral',
  'Fruity', 'Citrus', 'Woody', 'Earthy', 'Nutty', 'Creamy', 'Smoky', 'Vanilla'
]

const flavorDescriptors = {
  Sweet: ['honey', 'sugar', 'caramel', 'vanilla', 'chocolate', 'fruit'],
  Sour: ['citrus', 'vinegar', 'yogurt', 'green apple', 'lemon', 'lime'],
  Bitter: ['coffee', 'dark chocolate', 'grapefruit', 'kale', ' hops'],
  Herbal: ['mint', 'basil', 'rosemary', 'sage', 'thyme', 'oregano'],
  Floral: ['rose', 'lavender', 'jasmine', 'hibiscus', 'orange blossom'],
  Fruity: ['apple', 'pear', 'berry', 'tropical', 'citrus', 'stone fruit'],
  Woody: ['oak', 'cedar', 'pine', 'smoke', 'toast', 'charcoal'],
  Earthy: ['soil', 'mushroom', 'beet', 'mineral', 'wet stone'],
  Spicy: ['pepper', 'cinnamon', 'ginger', 'clove', 'nutmeg', 'chili'],
  Nutty: ['almond', 'peanut', 'hazelnut', 'walnut', 'cashew'],
  Creamy: ['butter', 'cream', 'milk', 'yogurt', 'cheese'],
  Smoky: ['smoke', 'ash', 'charcoal', 'bacon', 'campfire']
}

export const createFlavorDescriptor = (overrides = {}) => {
  const category = faker.helpers.arrayElement(flavorCategories)
  const descriptors = flavorDescriptors[category as keyof typeof flavorDescriptors] || []

  return {
    id: createId(),
    category,
    descriptor: faker.helpers.arrayElement(descriptors),
    intensity: faker.number.int({ min: 1, max: 10 }),
    frequency: faker.number.int({ min: 1, max: 100 }),
    confidence: faker.number.float({ min: 0.1, max: 1.0, precision: 0.01 }),
    beverageTypes: faker.helpers.arrayElements(mexicanBeverages, { min: 1, max: 3 }),
    regions: faker.helpers.arrayElements(regions, { min: 1, max: 2 }),
    userCount: faker.number.int({ min: 1, max: 1000 }),
    lastDetected: createTimestamp(),
    ...overrides,
  }
}

export const createFlavorWheel = (overrides = {}) => {
  const descriptors = Array.from({ length: faker.number.int({ min: 5, max: 15 }) },
    () => createFlavorDescriptor()
  )

  return {
    id: createId(),
    name: faker.helpers.arrayElement([
      'Premium Tequila Profile',
      'Artisanal Mezcal Wheel',
      'Traditional Pulque Analysis',
      'Craft Beer Flavor Map',
      'Fine Wine Tasting Wheel'
    ]),
    tastingId: createId(),
    userId: createId(),
    data: descriptors.reduce((acc, desc) => {
      const category = desc.category
      if (!acc[category]) {
        acc[category] = {
          name: category,
          color: faker.internet.color(),
          percentage: 0,
          intensity: 0,
          count: 0,
          descriptors: []
        }
      }
      acc[category].percentage += desc.frequency
      acc[category].intensity = Math.max(acc[category].intensity, desc.intensity)
      acc[category].count += 1
      acc[category].descriptors.push({
        name: desc.descriptor,
        percentage: desc.frequency,
        intensity: desc.intensity,
        regions: desc.regions,
        beverageTypes: desc.beverageTypes
      })
      return acc
    }, {} as any),
    totalDescriptors: descriptors.length,
    createdAt: createTimestamp(),
    updatedAt: createTimestamp(),
    ...overrides,
  }
}

// Social features factories
export const createReview = (overrides = {}) => ({
  id: createId(),
  tastingId: createId(),
  userId: createId(),
  rating: faker.number.int({ min: 1, max: 5 }),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraphs(2),
  pros: faker.helpers.arrayElements(
    ['excellent flavor', 'great value', 'authentic', 'well-balanced', 'unique'],
    { min: 1, max: 3 }
  ),
  cons: faker.helpers.arrayElements(
    ['too strong', 'pricey', 'not authentic', 'unbalanced'],
    { min: 0, max: 2 }
  ),
  isPublic: faker.datatype.boolean(),
  helpful: faker.number.int({ min: 0, max: 100 }),
  createdAt: createTimestamp(),
  ...overrides,
})

export const createComment = (overrides = {}) => ({
  id: createId(),
  reviewId: createId(),
  userId: createId(),
  content: faker.lorem.sentences(2),
  likes: faker.number.int({ min: 0, max: 50 }),
  replies: faker.helpers.arrayElements(
    [{
      id: createId(),
      userId: createId(),
      content: faker.lorem.sentence(),
      createdAt: createTimestamp()
    }],
    { min: 0, max: 3 }
  ),
  createdAt: createTimestamp(),
  ...overrides,
})

// Analytics factories
export const createAnalyticsEvent = (overrides = {}) => ({
  id: createId(),
  userId: createId(),
  eventType: faker.helpers.arrayElement([
    'tasting_started', 'tasting_completed', 'flavor_wheel_generated',
    'review_submitted', 'social_share', 'photo_uploaded'
  ]),
  eventData: {
    tastingId: createId(),
    duration: faker.number.int({ min: 60, max: 3600 }),
    deviceType: faker.helpers.arrayElement(['mobile', 'tablet', 'desktop']),
    browser: faker.helpers.arrayElement(['chrome', 'firefox', 'safari', 'edge'])
  },
  timestamp: createTimestamp(),
  sessionId: createId(),
  ...overrides,
})

export const createPerformanceMetric = (overrides = {}) => ({
  id: createId(),
  endpoint: faker.helpers.arrayElement([
    '/api/tastings', '/api/flavor-analysis', '/api/reviews', '/api/users'
  ]),
  method: faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
  responseTime: faker.number.int({ min: 50, max: 5000 }),
  statusCode: faker.helpers.arrayElement([200, 201, 400, 401, 404, 500]),
  userAgent: faker.internet.userAgent(),
  timestamp: createTimestamp(),
  ...overrides,
})

// Photo and media factories
export const createPhoto = (overrides = {}) => ({
  id: createId(),
  url: faker.image.url(),
  thumbnailUrl: faker.image.url(),
  originalUrl: faker.image.url(),
  filename: faker.system.fileName(),
  size: faker.number.int({ min: 100000, max: 5000000 }),
  mimeType: faker.helpers.arrayElement(['image/jpeg', 'image/png', 'image/webp']),
  width: faker.number.int({ min: 800, max: 4000 }),
  height: faker.number.int({ min: 600, max: 3000 }),
  uploadedBy: createId(),
  tastingId: createId(),
  analysis: {
    beverageDetected: faker.datatype.boolean(),
    confidence: faker.number.float({ min: 0.1, max: 1.0, precision: 0.01 }),
    beverageType: faker.helpers.arrayElement(mexicanBeverages),
    quality: faker.helpers.arrayElement(['excellent', 'good', 'fair', 'poor'])
  },
  createdAt: createTimestamp(),
  ...overrides,
})

// Collection factories for bulk data
export const createUsers = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createUser(overrides))

export const createBeverages = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createBeverage(overrides))

export const createTastings = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createTasting(overrides))

export const createFlavorWheels = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createFlavorWheel(overrides))

export const createReviews = (count: number, overrides = {}) =>
  Array.from({ length: count }, () => createReview(overrides))

// Preset scenarios for common testing patterns
export const createBeginnerUser = () => createUser({
  experienceLevel: 'beginner',
  tastingCount: faker.number.int({ min: 0, max: 10 })
})

export const createExpertUser = () => createUser({
  experienceLevel: 'expert',
  tastingCount: faker.number.int({ min: 50, max: 500 })
})

export const createCompletedTasting = () => createTasting({
  status: 'completed',
  completedAt: createTimestamp()
})

export const createPublicTasting = () => createTasting({
  visibility: 'public',
  participants: createUsers(faker.number.int({ min: 5, max: 20 })).map(u => u.id)
})

export const createHighRatedBeverage = () => createBeverage({
  rating: faker.number.float({ min: 4.0, max: 5.0, precision: 0.1 })
})
