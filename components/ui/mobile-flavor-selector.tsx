'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Flavor {
  id: string
  name: string
  category: string
  color: string
}

interface MobileFlavorSelectorProps {
  flavors: Flavor[]
  selectedFlavors: string[]
  onFlavorToggle: (flavorId: string) => void
  maxSelection?: number
  title?: string
  subtitle?: string
}

const FLAVOR_CATEGORIES = {
  fruits: ['Berry', 'Citrus', 'Apple', 'Pear', 'Stone Fruit', 'Tropical'],
  herbs: ['Herbal', 'Minty', 'Pine', 'Rosemary', 'Thyme'],
  spices: ['Spice', 'Vanilla', 'Cinnamon', 'Clove', 'Nutmeg', 'Pepper'],
  earth: ['Earthy', 'Mushroom', 'Truffle', 'Leather', 'Tobacco'],
  floral: ['Floral', 'Rose', 'Violet', 'Jasmine', 'Lavender'],
  wood: ['Oak', 'Cedar', 'Smoke', 'Toast', 'Caramel'],
  other: ['Sweet', 'Sour', 'Bitter', 'Salty', 'Umami', 'Creamy']
}

export function MobileFlavorSelector({
  flavors,
  selectedFlavors,
  onFlavorToggle,
  maxSelection = 8,
  title = "What flavors do you detect?",
  subtitle = "Select all flavors you can identify (tap to select/deselect)"
}: MobileFlavorSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Group flavors by category for better organization
  const groupedFlavors = flavors.reduce((acc, flavor) => {
    const category = getFlavorCategory(flavor.name)
    if (!acc[category]) acc[category] = []
    acc[category].push(flavor)
    return acc
  }, {} as Record<string, Flavor[]>)

  const filteredFlavors = selectedCategory === 'all'
    ? flavors
    : groupedFlavors[selectedCategory] || []

  const searchedFlavors = searchQuery
    ? filteredFlavors.filter(flavor =>
        flavor.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredFlavors

  function getFlavorCategory(flavorName: string): string {
    for (const [category, flavorList] of Object.entries(FLAVOR_CATEGORIES)) {
      if (flavorList.some(f => flavorName.toLowerCase().includes(f.toLowerCase()))) {
        return category
      }
    }
    return 'other'
  }

  function getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      fruits: '🍎',
      herbs: '🌿',
      spices: '🌶️',
      earth: '🌱',
      floral: '🌸',
      wood: '🌳',
      other: '✨'
    }
    return emojis[category] || '✨'
  }

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      fruits: 'from-red-400 to-pink-500',
      herbs: 'from-green-400 to-emerald-500',
      spices: 'from-orange-400 to-red-500',
      earth: 'from-amber-400 to-yellow-500',
      floral: 'from-purple-400 to-pink-500',
      wood: 'from-amber-600 to-orange-600',
      other: 'from-gray-400 to-gray-500'
    }
    return colors[category] || 'from-gray-400 to-gray-500'
  }

  const isMaxSelected = selectedFlavors.length >= maxSelection

  return (
    <Card variant="elevated" className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-card-text-primary">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-sm text-card-text-secondary mt-1">
            {subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search flavors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 px-4 pr-10 text-base border border-fx-border-default rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fx-accent focus-visible:border-transparent"
          />
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-fx-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="whitespace-nowrap min-h-[44px] px-4"
          >
            All Flavors
          </Button>
          {Object.keys(groupedFlavors).map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap min-h-[44px] px-4"
            >
              {getCategoryEmoji(category)} {category}
            </Button>
          ))}
        </div>

        {/* Selected Flavors Summary */}
        {selectedFlavors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-fx-accent/5 p-4 rounded-lg border border-fx-accent/20"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-fx-text-primary">
                Selected Flavors ({selectedFlavors.length}/{maxSelection})
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedFlavors.forEach(id => onFlavorToggle(id))}
                className="text-xs h-8 px-3"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedFlavors.map(flavorId => {
                const flavor = flavors.find(f => f.id === flavorId)
                return flavor ? (
                  <Badge
                    key={flavorId}
                    variant="secondary"
                    className="text-xs px-3 py-1 cursor-pointer hover:bg-fx-accent/20"
                    onClick={() => onFlavorToggle(flavorId)}
                  >
                    {flavor.name} ✕
                  </Badge>
                ) : null
              })}
            </div>
          </motion.div>
        )}

        {/* Flavor Grid */}
        <div className="grid grid-cols-2 gap-2">
          <AnimatePresence>
            {searchedFlavors.map((flavor, index) => {
              const isSelected = selectedFlavors.includes(flavor.id)
              const category = getFlavorCategory(flavor.name)
              const canSelect = !isMaxSelected || isSelected

              return (
                <motion.button
                  key={flavor.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => canSelect && onFlavorToggle(flavor.id)}
                  disabled={!canSelect}
                  className={`
                    min-h-[44px] w-full px-3 py-2.5 rounded-lg border text-left transition-colors duration-200
                    touch-manipulation active:scale-95
                    ${isSelected
                      ? 'bg-fx-accent text-white border-fx-accent shadow-md'
                      : canSelect
                        ? 'bg-white text-fx-text-primary border-fx-border-default hover:border-fx-accent hover:shadow-sm'
                        : 'bg-fx-bg-subtle text-fx-text-muted border-fx-border-subtle cursor-not-allowed'
                    }
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-base truncate">{flavor.name}</span>
                      <span className={`${isSelected ? 'text-white/90' : 'text-fx-text-secondary'} text-sm`}>{getCategoryEmoji(category)}</span>
                    </div>
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>

        {/* No Results */}
        {searchedFlavors.length === 0 && (
          <div className="text-center py-8 text-fx-text-secondary">
            <svg className="w-12 h-12 mx-auto mb-4 text-fx-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p>No flavors found matching &ldquo;{searchQuery}&rdquo;</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Selection Limit Warning */}
        {isMaxSelected && selectedFlavors.length >= maxSelection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-fx-ai-confidence-med/10 p-4 rounded-lg border border-fx-ai-confidence-med/20"
          >
            <div className="flex items-center gap-2 text-fx-ai-confidence-med">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
              <span className="text-sm font-medium">
                Maximum {maxSelection} flavors selected
              </span>
            </div>
            <p className="text-xs text-fx-ai-confidence-med mt-1">
              Deselect some flavors to choose others, or proceed with your current selection.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

// Touch-optimized flavor button for inline usage
interface TouchFlavorButtonProps {
  flavor: Flavor
  isSelected: boolean
  onToggle: () => void
  disabled?: boolean
}

export function TouchFlavorButton({
  flavor,
  isSelected,
  onToggle,
  disabled = false
}: TouchFlavorButtonProps) {
  return (
    <motion.button
      onClick={onToggle}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className={`
        min-h-[48px] min-w-[48px] p-3 rounded-lg border-2 transition-colors duration-200
        touch-manipulation
        ${isSelected
          ? 'bg-fx-accent text-white border-fx-accent shadow-md'
          : disabled
            ? 'bg-fx-bg-subtle text-fx-text-muted border-fx-border-subtle cursor-not-allowed'
            : 'bg-white text-fx-text-primary border-fx-border-default hover:border-fx-accent hover:shadow-sm'
        }
      `}
    >
      <div className="text-center">
        <div className="text-sm font-medium leading-tight">
          {flavor.name}
        </div>
      </div>
    </motion.button>
  )
}
