'use client'

import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectScrollUpButton, SelectScrollDownButton } from '@/components/ui/select'

interface ProductTypeSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'data-testid'?: string
}

const PRODUCT_TYPE_GROUPS = {
  wine: ['Red Wine', 'White Wine', 'Rosé Wine', 'Sparkling Wine', 'Dessert Wine'],
  coffee: ['Espresso', 'Pour Over', 'French Press', 'Cold Brew', 'Turkish Coffee'],
  beer: ['Lager', 'Ale', 'Stout', 'IPA', 'Pilsner'],
  spirits: ['Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila'],
  other: ['Tea', 'Juice', 'Soft Drink', 'Other']
}

const ProductTypeSelect: React.FC<ProductTypeSelectProps> = ({
  value,
  onChange,
  placeholder = "Select a product type",
  'data-testid': dataTestId
}) => {
  const groups = Object.entries(PRODUCT_TYPE_GROUPS).map(([groupKey, items]) => ({
    label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
    items: items.map(item => ({
      label: item,
      value: item.toLowerCase().replace(/\s+/g, '_')
    }))
  }))

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger
        className="h-12 w-full rounded-md border border-fx-border bg-white px-3 text-sm text-fx-text focus:border-fx-primary focus:ring-2 focus:ring-fx-primary/20"
        data-testid={dataTestId}
        aria-label="Product Type"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        avoidCollisions={true}
        className="z-[1000] w-[calc(100vw-2rem)] max-w-[28rem] max-h-[60vh] rounded-lg border bg-white shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out"
      >
        <SelectScrollUpButton className="py-2 text-muted-foreground" />
        {groups.map(g => (
          <SelectGroup key={g.label}>
            <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {g.label}
            </div>
            {g.items.map(opt => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="min-h-[44px] w-full cursor-pointer rounded-md px-3 py-3 text-base leading-6 text-fx-text data-[highlighted]:bg-fx-primary/10 data-[highlighted]:text-fx-text data-[state=checked]:bg-fx-primary/20 select-mobile-text hover:bg-fx-bg"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
        <SelectScrollDownButton className="py-2 text-muted-foreground" />
      </SelectContent>
    </Select>
  )
}

export default ProductTypeSelect
