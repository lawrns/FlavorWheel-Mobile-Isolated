// Template interface for PDF generation
export interface Template {
  id: string
  name: string
  evaluation_criteria: Array<{
    name: string
    type: string
    options?: string[]
  }>
  description?: string
  difficulty_level?: string
  duration?: number
  category?: string
  num_samples?: number
  average_rating?: number
  rating_count?: number
  usage_count?: number
  nom_classifications?: string[]
  terroir_regions?: string[]
  production_methods?: string[]
}

// Placeholder template data
export const defaultTemplate: Template = {
  id: 'default',
  name: 'Default Template',
  evaluation_criteria: [
    {
      name: 'Overall Quality',
      type: 'sliding_scale',
    },
    {
      name: 'Flavor Profile',
      type: 'subjective_input',
    },
    {
      name: 'Appearance',
      type: 'multiple_choice',
      options: ['Clear', 'Cloudy', 'Sediment'],
    },
  ],
}
