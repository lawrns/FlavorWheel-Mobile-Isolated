'use client'

import React from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectViewport, SelectItem, SelectGroup, SelectScrollUpButton, SelectScrollDownButton } from '@/components/ui/select'

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
        className="h-12 w-full rounded-md border border-[#e5e7eb] px-3 text-sm"
        data-testid={dataTestId}
        aria-label="Product Type"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={8}
        avoidCollisions={true}
        className="z-[1000] w-[calc(100vw-2rem)] max-w-[28rem] max-h-[60vh] rounded-lg border bg-white/98 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out"
      >
        <SelectScrollUpButton className="py-2 text-muted-foreground" />
        <SelectViewport className="p-1">
          {groups.map(g => (
            <SelectGroup key={g.label}>
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {g.label}
              </div>
              {g.items.map(opt => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="min-h-[44px] w-full cursor-pointer rounded-md px-3 py-3 text-base leading-6 data-[highlighted]:bg-muted/70 data-[state=checked]:bg-accent/10 select-mobile-text"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectViewport>
        <SelectScrollDownButton className="py-2 text-muted-foreground" />
      </SelectContent>
    </Select>
  )
}

export default ProductTypeSelect
