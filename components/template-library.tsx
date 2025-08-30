'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search as HiMagnifyingGlass,
  SlidersHorizontal as HiAdjustmentsHorizontal,
  Star as HiStar,
  Clock as HiClock,
  Users as HiUsers,
  Sparkles as HiSparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Template {
  id: string
  name: string
  description: string
  difficulty_level: 'beginner' | 'intermediate' | 'professional'
  duration: number
  category: string
  num_samples: number
  evaluation_criteria: Array<{
    name: string
    type: 'scale' | 'text' | 'multipleChoice'
    options?: string[]
  }>
  scoring_methods: {
    method: string
    formula?: string
  }
  nom_classifications: string[]
  terroir_regions: string[]
  production_methods: string[]
  cultural_context: string[]
  educational_content: Array<{
    title: string
    content: string
  }>
  is_featured: boolean
  is_public: boolean
  usage_count: number
  average_rating: number
  rating_count: number
  created_at: string
  profiles?: {
    name: string
    avatar_url?: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
  count: number
}

interface TemplateLibraryProps {
  onSelectTemplate?: (template: Template) => void
  showCreateButton?: boolean
  className?: string
}

export function TemplateLibrary({
  onSelectTemplate,
  showCreateButton = true,
  className,
}: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<string>('desc')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Fetch templates and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesResponse = await fetch('/api/templates/categories')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData.data || [])

        // Build query parameters
        const params = new URLSearchParams()
        if (selectedCategory !== 'all') params.append('category', selectedCategory)
        if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty)
        if (searchQuery) params.append('search', searchQuery)
        params.append('sortBy', sortBy)
        params.append('sortOrder', sortOrder)
        params.append('limit', '20')

        // Fetch templates
        const templatesResponse = await fetch(`/api/templates?${params.toString()}`)
        const templatesData = await templatesResponse.json()
        setTemplates(templatesData.data || [])
      } catch (error) {
        console.error('Error fetching templates:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedCategory, selectedDifficulty, searchQuery, sortBy, sortOrder])

  const getDifficultyConfig = (difficulty: string) => {
    const configs = {
      beginner: {
        color: 'text-mexican-green',
        bgColor: 'bg-mexican-green/10',
        borderColor: 'border-mexican-green/20',
        label: 'Principiante',
      },
      intermediate: {
        color: 'text-mexican-amber',
        bgColor: 'bg-mexican-amber/10',
        borderColor: 'border-mexican-amber/20',
        label: 'Intermedio',
      },
      professional: {
        color: 'text-mexican-earth',
        bgColor: 'bg-mexican-earth/10',
        borderColor: 'border-mexican-earth/20',
        label: 'Profesional',
      },
    }
    return configs[difficulty as keyof typeof configs] || configs.beginner
  }

  const handleTemplateSelect = (template: Template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template)
    } else {
      setSelectedTemplate(template)
      setShowPreview(true)
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="sm:space-y-(0) flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-mexican-earth">Biblioteca de Plantillas</h2>
          <p className="text-muted-foreground">
            Plantillas prediseñadas para acelerar la creación de catas
          </p>
        </div>
        {showCreateButton && (
          <Button
            className="bg-mexican-green hover:bg-mexican-green/90"
            onClick={() => (window.location.href = '/templates/create')}
            aria-label="Crear nueva plantilla de cata"
          >
            <HiSparkles className="mr-2 h-4 w-4" />
            Crear Plantilla
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="sm:space-y-(0) flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Buscar plantillas..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name} ({category.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Dificultad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las dificultades</SelectItem>
                <SelectItem value="beginner">Principiante</SelectItem>
                <SelectItem value="intermediate">Intermedio</SelectItem>
                <SelectItem value="professional">Profesional</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={value => {
                const [field, order] = value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <HiAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Más recientes</SelectItem>
                <SelectItem value="average_rating-desc">Mejor valoradas</SelectItem>
                <SelectItem value="usage_count-desc">Más populares</SelectItem>
                <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                <SelectItem value="duration-asc">Duración (menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-muted"></div>
                <div className="h-3 w-1/2 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 rounded bg-muted"></div>
                  <div className="h-3 w-2/3 rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => {
              const difficultyConfig = getDifficultyConfig(template.difficulty_level)

              return (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="border-organic cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 text-lg font-semibold text-mexican-earth">
                            {template.name}
                          </CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {template.description}
                          </CardDescription>
                        </div>
                        {template.is_featured && (
                          <Badge
                            variant="secondary"
                            className="ml-2 bg-mexican-amber/10 text-mexican-amber"
                          >
                            <HiSparkles className="mr-1 h-3 w-3" />
                            Destacada
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Difficulty Badge */}
                      <Badge
                        className={cn(
                          'text-xs font-medium',
                          difficultyConfig.bgColor,
                          difficultyConfig.color,
                          difficultyConfig.borderColor
                        )}
                        variant="outline"
                      >
                        {difficultyConfig.label}
                      </Badge>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <HiClock className="h-4 w-4" />
                          <span>{formatDuration(template.duration)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HiUsers className="h-4 w-4" />
                          <span>{template.num_samples} muestras</span>
                        </div>
                      </div>

                      {/* Rating */}
                      {template.rating_count > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <HiStar className="h-4 w-4 fill-current text-mexican-amber" />
                            <span className="text-sm font-medium">
                              {template.average_rating.toFixed(1)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            ({template.rating_count} valoraciones)
                          </span>
                        </div>
                      )}

                      {/* Usage Count */}
                      {template.usage_count > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Usada {template.usage_count} veces
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Empty State */}
      {!loading && templates.length === 0 && (
        <Card className="py-12 text-center">
          <CardContent>
            <div className="text-muted-foreground">
              <HiMagnifyingGlass className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <h3 className="mb-2 text-lg font-medium text-foreground">
                No se encontraron plantillas
              </h3>
              <p className="mb-6">Intenta ajustar los filtros o crear una nueva plantilla.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedDifficulty('all')
                  }}
                  variant="outline"
                  aria-label="Limpiar filtros de búsqueda"
                >
                  Limpiar Filtros
                </Button>
                {showCreateButton && (
                  <Button
                    onClick={() => (window.location.href = '/templates/create')}
                    variant="default"
                    aria-label="Crear nueva plantilla de cata"
                  >
                    <HiSparkles className="mr-2 h-4 w-4" />
                    Crear Plantilla
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={selectedTemplate}
        open={showPreview}
        onOpenChange={setShowPreview}
        onUseTemplate={onSelectTemplate}
      />
    </div>
  )
}

// Template Preview Modal Component
interface TemplatePreviewModalProps {
  template: Template | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUseTemplate?: (template: Template) => void
}

function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  onUseTemplate,
}: TemplatePreviewModalProps) {
  if (!template) return null

  const difficultyConfig = {
    beginner: { label: 'Principiante', color: 'text-mexican-green', bg: 'bg-mexican-green/10' },
    intermediate: { label: 'Intermedio', color: 'text-mexican-amber', bg: 'bg-mexican-amber/10' },
    professional: { label: 'Profesional', color: 'text-mexican-earth', bg: 'bg-mexican-earth/10' },
  }[template.difficulty_level]

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutos`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0
      ? `${hours} hora${hours > 1 ? 's' : ''} ${remainingMinutes} minutos`
      : `${hours} hora${hours > 1 ? 's' : ''}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-mexican-earth">
                {template.name}
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">
                {template.description}
              </DialogDescription>
            </div>
            {template.is_featured && (
              <Badge className="bg-mexican-amber/10 text-mexican-amber">
                <HiSparkles className="mr-1 h-3 w-3" />
                Destacada
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dificultad</label>
                    <Badge
                      className={cn(
                        'mt-1 block w-fit',
                        difficultyConfig?.bg,
                        difficultyConfig?.color
                      )}
                      variant="outline"
                    >
                      {difficultyConfig?.label}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Duración</label>
                    <p className="mt-1 font-medium">{formatDuration(template.duration)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Muestras</label>
                    <p className="mt-1 font-medium">{template.num_samples} bebidas</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Método de Puntuación
                    </label>
                    <p className="mt-1 font-medium capitalize">{template.scoring_methods.method}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluation Criteria */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Criterios de Evaluación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {template.evaluation_criteria.map((criteria, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                    >
                      <div>
                        <p className="font-medium">{criteria.name}</p>
                        <p className="text-sm capitalize text-muted-foreground">{criteria.type}</p>
                      </div>
                      {criteria.options && (
                        <Badge variant="outline" className="text-xs">
                          {criteria.options.join(', ')}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Educational Content */}
            {template.educational_content.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenido Educativo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {template.educational_content.map((content, index) => (
                      <div key={index} className="border-l-4 border-mexican-green pl-4">
                        <h4 className="font-medium text-mexican-earth">{content.title}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">{content.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Mexican Attributes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Atributos Mexicanos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {template.nom_classifications.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Clasificaciones NOM
                    </label>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.nom_classifications.map((nom, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {nom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {template.terroir_regions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Regiones</label>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.terroir_regions.map((region, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-mexican-earth/10 text-xs text-mexican-earth"
                        >
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {template.production_methods.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Métodos de Producción
                    </label>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.production_methods.map((method, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cultural Context */}
            {template.cultural_context.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contexto Cultural</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {template.cultural_context.map((context, index) => (
                      <p key={index} className="text-sm italic text-muted-foreground">
                        "                        &quot;{context}&quot;"
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.rating_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valoración</span>
                    <div className="flex items-center space-x-1">
                      <HiStar className="h-4 w-4 fill-current text-mexican-amber" />
                      <span className="font-medium">{template.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">
                        ({template.rating_count})
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Usos</span>
                  <span className="font-medium">{template.usage_count}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Creada</span>
                  <span className="text-xs font-medium">
                    {new Date(template.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            {onUseTemplate && (
              <Button
                className="w-full bg-mexican-green hover:bg-mexican-green/90"
                onClick={() => {
                  onUseTemplate(template)
                  onOpenChange(false)
                }}
              >
                Usar Esta Plantilla
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
