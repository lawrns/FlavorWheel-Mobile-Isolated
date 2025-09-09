'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Users, MapPin, Calendar, Filter, X } from 'lucide-react'

interface DemographicFilters {
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  ageRange?: '18-24' | '25-34' | '35-44' | '45-54' | '55-64' | '65+'
  location?: string
  geographicRadius?: number
}

interface FlavorWheelConfig {
  wheelType: 'aroma' | 'flavor' | 'combined' | 'metaphor'
  scope: 'personal' | 'universal'
  userId?: string
  beverageType?: string
  region?: string
  timeRange?: {
    start: string
    end: string
  }
  useMultilingualExtraction?: boolean
  demographicFilters?: DemographicFilters
}

interface FilterPanelProps {
  config: FlavorWheelConfig
  onConfigChange: (config: FlavorWheelConfig) => void
}

const AGE_RANGES = [
  { value: '18-24', label: '18-24 years' },
  { value: '25-34', label: '25-34 years' },
  { value: '35-44', label: '35-44 years' },
  { value: '45-54', label: '45-54 years' },
  { value: '55-64', label: '55-64 years' },
  { value: '65+', label: '65+ years' }
]

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
]

export function FilterPanel({ config, onConfigChange }: FilterPanelProps) {
  const updateDemographicFilters = (updates: Partial<DemographicFilters>) => {
    const newFilters = {
      ...config.demographicFilters,
      ...updates
    }

    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key as keyof DemographicFilters] === undefined) {
        delete newFilters[key as keyof DemographicFilters]
      }
    })

    onConfigChange({
      ...config,
      demographicFilters: Object.keys(newFilters).length > 0 ? newFilters : undefined
    })
  }

  const clearFilter = (filterKey: keyof DemographicFilters) => {
    if (config.demographicFilters) {
      const newFilters = { ...config.demographicFilters }
      delete newFilters[filterKey]

      onConfigChange({
        ...config,
        demographicFilters: Object.keys(newFilters).length > 0 ? newFilters : undefined
      })
    }
  }

  const clearAllFilters = () => {
    onConfigChange({
      ...config,
      demographicFilters: undefined
    })
  }

  const hasActiveFilters = config.demographicFilters &&
    Object.values(config.demographicFilters).some(value => value !== undefined)

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Demographic Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Filter your flavor wheel by user demographics for personalized insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {config.demographicFilters?.gender && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {GENDERS.find(g => g.value === config.demographicFilters?.gender)?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => clearFilter('gender')}
                />
              </Badge>
            )}
            {config.demographicFilters?.ageRange && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {AGE_RANGES.find(a => a.value === config.demographicFilters?.ageRange)?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => clearFilter('ageRange')}
                />
              </Badge>
            )}
            {config.demographicFilters?.location && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {config.demographicFilters.location}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => clearFilter('location')}
                />
              </Badge>
            )}
            {config.demographicFilters?.geographicRadius && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {config.demographicFilters.geographicRadius}km radius
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => clearFilter('geographicRadius')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gender Filter */}
          <div className="space-y-2">
            <Label htmlFor="gender-filter" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Gender
            </Label>
            <Select
              value={config.demographicFilters?.gender || ''}
              onValueChange={(value) => updateDemographicFilters({
                gender: value as DemographicFilters['gender'] || undefined
              })}
            >
              <SelectTrigger id="gender-filter">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {GENDERS.map(gender => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Range Filter */}
          <div className="space-y-2">
            <Label htmlFor="age-filter" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Age Range
            </Label>
            <Select
              value={config.demographicFilters?.ageRange || ''}
              onValueChange={(value) => updateDemographicFilters({
                ageRange: value as DemographicFilters['ageRange'] || undefined
              })}
            >
              <SelectTrigger id="age-filter">
                <SelectValue placeholder="Select age range" />
              </SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location-filter" className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </Label>
            <Input
              id="location-filter"
              placeholder="Enter city or region"
              value={config.demographicFilters?.location || ''}
              onChange={(e) => updateDemographicFilters({
                location: e.target.value || undefined
              })}
            />
          </div>

          {/* Geographic Radius Filter */}
          {config.demographicFilters?.location && (
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Geographic Radius: {config.demographicFilters?.geographicRadius || 50}km
              </Label>
              <Slider
                value={[config.demographicFilters?.geographicRadius || 50]}
                onValueChange={(value) => updateDemographicFilters({
                  geographicRadius: value[0]
                })}
                min={10}
                max={500}
                step={10}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10km</span>
                <span>500km</span>
              </div>
            </div>
          )}
        </div>

        {/* Filter Stats */}
        {hasActiveFilters && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Active filters will refine your flavor wheel results
              </span>
              <span className="font-medium">
                {Object.keys(config.demographicFilters || {}).length} filter(s) active
              </span>
            </div>
          </div>
        )}

        {/* No Filters Message */}
        {!hasActiveFilters && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Set demographic filters to personalize your flavor wheel experience
            </p>
            <p className="text-xs mt-1">
              Filters help you discover how different user groups perceive flavors
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
