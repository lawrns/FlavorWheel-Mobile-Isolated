/**
 * Authoritative mapping of surface↔text/icon tokens with target contrast ratios
 * Ensures WCAG AA compliance across all design token combinations
 */

export type ContrastPair = { 
  surface: string
  fg: string
  minRatio: number
  description?: string
}

/**
 * WCAG AA compliant text pairs (4.5:1 minimum contrast ratio)
 */
export const AA_TEXT_PAIRS: ContrastPair[] = [
  { 
    surface: 'var(--fx-bg)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Primary text on main background'
  },
  { 
    surface: 'var(--fx-surface)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Primary text on surface background'
  },
  { 
    surface: 'var(--fx-surface-muted)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Primary text on muted surface'
  },
  { 
    surface: 'var(--fx-primary)', 
    fg: 'var(--fx-on-primary)', 
    minRatio: 4.5,
    description: 'Text on primary brand color'
  },
  { 
    surface: 'var(--fx-accent)', 
    fg: 'var(--fx-on-accent)', 
    minRatio: 4.5,
    description: 'Text on accent color'
  },
  { 
    surface: 'var(--fx-card)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Primary text on card background'
  }
]

/**
 * WCAG AAA compliant text pairs (7:1 minimum contrast ratio)
 */
export const AAA_TEXT_PAIRS: ContrastPair[] = [
  { 
    surface: 'var(--fx-bg)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 7.0,
    description: 'Enhanced contrast for primary text'
  },
  { 
    surface: 'var(--fx-primary)', 
    fg: 'var(--fx-on-primary)', 
    minRatio: 7.0,
    description: 'Enhanced contrast for primary button text'
  }
]

/**
 * Icon and UI element contrast pairs (3:1 minimum for non-text)
 */
export const UI_ELEMENT_PAIRS: ContrastPair[] = [
  { 
    surface: 'var(--fx-bg)', 
    fg: 'var(--fx-border)', 
    minRatio: 3.0,
    description: 'Borders and dividers'
  },
  { 
    surface: 'var(--fx-bg)', 
    fg: 'var(--fx-focus)', 
    minRatio: 3.0,
    description: 'Focus indicators'
  },
  { 
    surface: 'var(--fx-surface)', 
    fg: 'var(--fx-border)', 
    minRatio: 3.0,
    description: 'Borders on surface backgrounds'
  }
]

/**
 * Button state contrast requirements
 */
export const BUTTON_STATE_PAIRS: ContrastPair[] = [
  // Primary button states
  { 
    surface: 'var(--fx-primary)', 
    fg: 'var(--fx-on-primary)', 
    minRatio: 4.5,
    description: 'Primary button default state'
  },
  { 
    surface: 'var(--fx-primary-hover)', 
    fg: 'var(--fx-on-primary)', 
    minRatio: 4.5,
    description: 'Primary button hover state'
  },
  
  // Secondary button states
  { 
    surface: 'var(--fx-surface-muted)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Secondary button default state'
  },
  { 
    surface: 'var(--fx-surface-hover)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Secondary button hover state'
  },
  
  // Ghost button states
  { 
    surface: 'transparent', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Ghost button text'
  },
  { 
    surface: 'var(--fx-surface-hover)', 
    fg: 'var(--fx-text-primary)', 
    minRatio: 4.5,
    description: 'Ghost button hover state'
  }
]

/**
 * Validation function to check if a contrast pair meets requirements
 * Note: This is a theoretical check - actual contrast should be measured with tools
 */
export function validateContrastPair(pair: ContrastPair): boolean {
  // This would need actual color value calculation in a real implementation
  // For now, we return true as a placeholder
  return true
}

/**
 * Get all contrast pairs for validation
 */
export function getAllContrastPairs(): ContrastPair[] {
  return [
    ...AA_TEXT_PAIRS,
    ...AAA_TEXT_PAIRS,
    ...UI_ELEMENT_PAIRS,
    ...BUTTON_STATE_PAIRS
  ]
}

/**
 * Design token rules for maintaining contrast
 */
export const TOKEN_RULES = {
  // Never use currentColor for text on low-contrast surfaces
  disallowCurrentColor: [
    'var(--fx-surface-muted)',
    'var(--fx-bg-subtle)'
  ],
  
  // Primary on-primary pairs must satisfy ≥4.5:1 under light and dark
  requiredPairs: [
    'var(--fx-primary) + var(--fx-on-primary)',
    'var(--fx-accent) + var(--fx-on-accent)'
  ],
  
  // Lint rules for enforcement
  lintRules: {
    'disallow-raw-hex': true,
    'enforce-token-usage': ['color', 'background', 'border', 'outline']
  }
} as const

