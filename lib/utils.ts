import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Basic localization hook
export function useTranslations(locale: string = 'en') {
  const translations = {
    en: {
      // Navigation
      home: 'Home',
      create: 'Create',
      social: 'Social',
      review: 'Review',
      flavorWheels: 'Flavor Wheels',

      // Common actions
      save: 'Save',
      cancel: 'Cancel',
      share: 'Share',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      start: 'Start',

      // Tasting types
      study: 'Study',
      competition: 'Competition',
      quick: 'Quick',

      // Form labels
      name: 'Name',
      description: 'Description',
      productType: 'Product Type',
      categories: 'Categories',
      items: 'Items',

      // Messages
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',

      // Flavor wheel
      flavorAnalysis: 'Flavor Analysis',
      generateProfile: 'Generate Profile',
      processing: 'Processing...',

      // Sharing
      shareTasting: 'Share Tasting',
      copyLink: 'Copy Link',
      shareViaEmail: 'Share via Email',
      shareViaWhatsApp: 'Share via WhatsApp'
    },
    es: {
      // Navigation
      home: 'Inicio',
      create: 'Crear',
      social: 'Social',
      review: 'Reseñas',
      flavorWheels: 'Ruedas de Sabor',

      // Common actions
      save: 'Guardar',
      cancel: 'Cancelar',
      share: 'Compartir',
      edit: 'Editar',
      delete: 'Eliminar',
      back: 'Atrás',
      next: 'Siguiente',
      finish: 'Finalizar',
      start: 'Comenzar',

      // Tasting types
      study: 'Estudio',
      competition: 'Competencia',
      quick: 'Rápido',

      // Form labels
      name: 'Nombre',
      description: 'Descripción',
      productType: 'Tipo de Producto',
      categories: 'Categorías',
      items: 'Elementos',

      // Messages
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      confirm: 'Confirmar',

      // Flavor wheel
      flavorAnalysis: 'Análisis de Sabor',
      generateProfile: 'Generar Perfil',
      processing: 'Procesando...',

      // Sharing
      shareTasting: 'Compartir Cata',
      copyLink: 'Copiar Enlace',
      shareViaEmail: 'Compartir por Email',
      shareViaWhatsApp: 'Compartir por WhatsApp'
    }
  }

  const t = (key: string): string => {
    const translation = translations[locale as keyof typeof translations]?.[key as keyof typeof translations.en]
    return typeof translation === 'string' ? translation : key
  }

  return { t }
}

export function transformFlavorDataToNode(data: { name?: string; children?: Array<{ name: string; children?: unknown[]; color?: string }> } | null) {
  // Transform flavor data for sunburst visualization
  if (!data || !data.children) {
    return { name: 'No Data', children: [] }
  }

  return {
    name: data.name || 'Flavors',
          children: data.children.map((category) => ({
      name: category.name,
      children: (category.children as unknown[]) || [],
      color: category.color
    }))
  }
}

// Mock data for isolated build
export const mockTastingData = {
  categories: [
    {
      id: 'aroma',
      name: 'Aroma',
      parameterType: 'subjective_input' as const,
      options: [],
      minValue: 0,
      maxValue: 10,
      containsText: '',
      rankOption: false
    },
    {
      id: 'flavor',
      name: 'Flavor',
      parameterType: 'subjective_input' as const,
      options: [],
      minValue: 0,
      maxValue: 10,
      containsText: '',
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
      minValue: 0,
      maxValue: 10,
      containsText: '',
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
