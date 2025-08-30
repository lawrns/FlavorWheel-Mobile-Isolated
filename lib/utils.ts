import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock data for isolated build
export const mockTastingData = {
  categories: [
    {
      id: 'aroma',
      name: 'Aroma',
      parameterType: 'subjective_input' as const,
      options: [],
      minValue: undefined,
      maxValue: undefined,
      containsText: undefined,
      rankOption: false
    },
    {
      id: 'flavor',
      name: 'Flavor',
      parameterType: 'subjective_input' as const,
      options: [],
      minValue: undefined,
      maxValue: undefined,
      containsText: undefined,
      rankOption: false
    },
    {
      id: 'sweetness',
      name: 'Sweetness',
      parameterType: 'sliding_scale' as const,
      options: [],
      minValue: 1,
      maxValue: 10,
      containsText: undefined,
      rankOption: false
    },
    {
      id: 'acidity',
      name: 'Acidity',
      parameterType: 'multiple_choice' as const,
      options: ['Low', 'Medium', 'High'],
      minValue: undefined,
      maxValue: undefined,
      containsText: undefined,
      rankOption: false
    }
  ],
  items: [
    {
      id: 'item-1',
      name: 'Sample Wine',
      image: undefined,
      category: undefined
    }
  ]
}

// Mock flavor wheel data for sunburst
export const mockFlavorWheelData = {
  name: 'Flavors',
  children: [
    {
      name: 'Citrus',
      children: [
        { name: 'Orange', value: 5, intensity: 7, color: '#FFA500' },
        { name: 'Lemon', value: 3, intensity: 6, color: '#FFD700' },
        { name: 'Grapefruit', value: 2, intensity: 5, color: '#FF6347' }
      ],
      color: '#FFA500'
    },
    {
      name: 'Berry',
      children: [
        { name: 'Strawberry', value: 4, intensity: 8, color: '#DC143C' },
        { name: 'Raspberry', value: 3, intensity: 7, color: '#8B0000' },
        { name: 'Blueberry', value: 2, intensity: 6, color: '#00008B' }
      ],
      color: '#8B0000'
    },
    {
      name: 'Floral',
      children: [
        { name: 'Rose', value: 3, intensity: 6, color: '#FF69B4' },
        { name: 'Lavender', value: 2, intensity: 5, color: '#9370DB' },
        { name: 'Jasmine', value: 1, intensity: 4, color: '#DDA0DD' }
      ],
      color: '#FF69B4'
    }
  ]
}
