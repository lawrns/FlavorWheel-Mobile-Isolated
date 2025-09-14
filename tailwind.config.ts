import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './stories/**/*.{ts,tsx,mdx}',
  ],
  safelist: [
    // Removed unused fw- classes to reduce bundle size
  ],
  prefix: '',

  theme: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
        screens: {
          '2xl': '1400px',
        },
      },
    extend: {
      colors: {
        // ===== FLAVORWHEEL UNIFIED DESIGN SYSTEM =====
        // Mexican-inspired brand colors with consolidated tokens

        // Mexican Brand Colors (Core identity)
        primary: 'var(--fw-color-agave-verde)',
        'primary-hover': 'var(--fw-color-agave-verde-hover)',
        secondary: 'var(--fw-color-oro-mexicano)',
        'secondary-hover': 'var(--fw-color-oro-mexicano-hover)',
        'secondary-foreground': 'var(--fw-color-text-on-secondary)',

        // Card System Colors
        'card-surface': 'var(--fw-color-papel-artesanal)',
        'card-secondary': 'var(--fw-color-surface-secondary)',
        'card-dark': 'var(--fw-color-dark-surface)',
        'card-border': 'var(--fw-color-border)',
        'card-shadow': 'var(--fw-color-shadow)',
        'card-text-primary': 'var(--fw-color-card-text-primary)',
        'card-text-secondary': 'var(--fw-color-card-text-secondary)',

        // Form System Colors
        'input-bg': 'var(--fw-color-input-bg)',
        'input-border': 'var(--fw-color-input-border)',
        'input-focus-border': 'var(--fw-color-input-focus-border)',
        'input-text': 'var(--fw-color-input-text)',
        'input-placeholder': 'var(--fw-color-input-placeholder)',
        'input-disabled-bg': 'var(--fw-color-input-disabled-bg)',
        'input-disabled-text': 'var(--fw-color-input-disabled-text)',
        'label-text': 'var(--fw-color-label-text)',
        'form-error': 'var(--fw-color-form-error)',
        'form-success': 'var(--fw-color-form-success)',

        // Navigation System Colors
        'nav-bg': 'var(--fw-color-nav-bg)',
        'nav-bg-dark': 'var(--fw-color-nav-bg-dark)',
        'nav-icon-active': 'var(--fw-color-nav-icon-active)',
        'nav-icon-inactive': 'var(--fw-color-nav-icon-inactive)',
        'nav-text-active': 'var(--fw-color-nav-text-active)',
        'nav-text-inactive': 'var(--fw-color-nav-text-inactive)',
        'nav-border': 'var(--fw-color-nav-border)',

        // Wheel System Colors
        'wheel-bg': 'var(--fw-color-wheel-background)',
        'wheel-border': 'var(--fw-color-wheel-border)',
        'wheel-active': 'var(--fw-color-wheel-active-highlight)',
        'wheel-inactive': 'var(--fw-color-wheel-inactive-opacity)',

        // Dark Theme Colors
        'dark-bg-app': 'var(--fw-dark-color-bg-app)',
        'dark-bg-surface': 'var(--fw-dark-color-bg-surface-primary)',
        'dark-bg-surface-secondary': 'var(--fw-dark-color-bg-surface-secondary)',
        'dark-text-primary': 'var(--fw-dark-color-text-primary)',
        'dark-text-secondary': 'var(--fw-dark-color-text-secondary)',
        'dark-text-tertiary': 'var(--fw-dark-color-text-tertiary)',
        'dark-border': 'var(--fw-dark-color-border-default)',
        'dark-border-subtle': 'var(--fw-dark-color-border-subtle)',
        'dark-focus-ring': 'var(--fw-dark-color-focus-ring)',
        'dark-primary': 'var(--fw-dark-color-primary)',
        'dark-secondary': 'var(--fw-dark-color-secondary)',
        'dark-accent': 'var(--fw-dark-color-accent)',

        // High Contrast Theme Colors
        'hc-bg-app': 'var(--fw-hc-color-bg-app)',
        'hc-bg-surface': 'var(--fw-hc-color-bg-surface-primary)',
        'hc-bg-surface-secondary': 'var(--fw-hc-color-bg-surface-secondary)',
        'hc-text-primary': 'var(--fw-hc-color-text-primary)',
        'hc-text-secondary': 'var(--fw-hc-color-text-secondary)',
        'hc-text-tertiary': 'var(--fw-hc-color-text-tertiary)',
        'hc-border': 'var(--fw-hc-color-border-default)',
        'hc-border-subtle': 'var(--fw-hc-color-border-subtle)',
        'hc-focus-ring': 'var(--fw-hc-color-focus-ring)',
        'hc-primary': 'var(--fw-hc-color-primary)',
        'hc-secondary': 'var(--fw-hc-color-secondary)',
        'hc-accent': 'var(--fw-hc-color-accent)',
        accent: 'var(--fw-color-tierra-mexicana)',
        'accent-hover': 'var(--fw-color-tierra-mexicana-hover)',

        // Surface System - Warm Cream Palette
        background: 'var(--fx-bg)',
        'background-subtle': 'var(--fx-bg-subtle)',
        'background-muted': 'var(--fx-bg-muted)',
        foreground: 'var(--fx-text-primary)',
        surface: 'var(--fx-card)',

        // Text Hierarchy
        text: {
          primary: 'var(--fx-text-primary)',
          secondary: 'var(--fx-text-secondary)',
          muted: 'var(--fx-text-muted)',
          inverse: 'var(--fx-text-inverse)',
        },

        // Border System
        border: {
          subtle: 'var(--fx-border-subtle)',
          default: 'var(--fx-border-default)',
          strong: 'var(--fx-border-strong)',
        },

        // State & Feedback (removed unused AI confidence tokens)
        error: 'var(--fx-ai-confidence-low)',
        info: 'var(--fx-accent)',

        // Focus & Interaction (removed unused focus ring token)

        // ===== FX DESIGN TOKENS =====
        // Direct access to fx- design system
        'fx-primary': 'var(--fx-primary)',
        'fx-primary-hover': 'var(--fx-primary-hover)',
        'fx-secondary': 'var(--fx-secondary)',
        'fx-secondary-hover': 'var(--fx-secondary-hover)',
        'fx-accent': 'var(--fx-accent)',
        'fx-accent-hover': 'var(--fx-accent-hover)',

        // fx Surface colors
        'fx-bg': 'var(--fx-bg)',
        'fx-bg-subtle': 'var(--fx-bg-subtle)',
        'fx-card': 'var(--fx-card)',
        'fx-elevated': 'var(--fx-elevated)',

        // fx Text colors
        'fx-text-primary': 'var(--fx-text-primary)',
        'fx-text-secondary': 'var(--fx-text-secondary)',
        'fx-text-muted': 'var(--fx-text-muted)',
        'fx-text-inverse': 'var(--fx-text-inverse)',

        // fx Border colors
        'fx-border-subtle': 'var(--fx-border-subtle)',
        'fx-border-default': 'var(--fx-border-default)',

        // fx Brand primitives (removed unused tokens - keeping only essentials)

        // fx Flavor visualization colors (migrated from fw- tokens)
        'fx-flavor-fruity': 'var(--fx-flavor-fruity)',
        'fx-flavor-floral': 'var(--fx-flavor-floral)',
        'fx-flavor-vegetal': 'var(--fx-flavor-vegetal)',
        'fx-flavor-smoky': 'var(--fx-flavor-smoky)',
        'fx-flavor-sweet': 'var(--fx-flavor-sweet)',
        'fx-flavor-spicy': 'var(--fx-flavor-spicy)',
        'fx-flavor-bitter': 'var(--fx-flavor-bitter)',
        'fx-flavor-sour': 'var(--fx-flavor-sour)',
        'fx-flavor-roasted': 'var(--fx-flavor-roasted)',
        'fx-flavor-nutty': 'var(--fx-flavor-nutty)',
        'fx-flavor-mineral': 'var(--fx-flavor-mineral)',
        'fx-flavor-earthy': 'var(--fx-flavor-earthy)',
        'fx-flavor-molecule': 'var(--fx-flavor-molecule)',

        // fx Flavor metaphor categories
        'fx-flavor-mood-emotion': 'var(--fx-flavor-mood-emotion)',
        'fx-flavor-setting-place': 'var(--fx-flavor-setting-place)',
        'fx-flavor-texture-material': 'var(--fx-flavor-texture-material)',
        'fx-flavor-color-light': 'var(--fx-flavor-color-light)',
        'fx-flavor-movement-shape': 'var(--fx-flavor-movement-shape)',
        'fx-flavor-character-persona': 'var(--fx-flavor-character-persona)',
        'fx-flavor-temporal-time': 'var(--fx-flavor-temporal-time)',

        // ===== LEGACY SUPPORT =====
        // DEPRECATED: fw- tokens are legacy and should be replaced with fx-* tokens
        // These will be removed in a future major version
        fw: {
          fruity: 'var(--fx-flavor-fruity)',
          floral: 'var(--fx-flavor-floral)',
          vegetal: 'var(--fx-flavor-vegetal)',
          // Map legacy fw- tokens to fx- equivalents for backward compatibility
        },

        // ===== DEPRECATED: Shadcn/ui compatibility =====
        // These tokens are deprecated and should be replaced with fx-* semantic tokens
        // They will be removed in a future major version
        'border-legacy': 'hsl(var(--border))',
        'input-legacy': 'hsl(var(--input))',
        'ring-legacy': 'hsl(var(--ring))',
        'destructive-legacy': 'hsl(var(--destructive))',
        'popover-legacy': 'hsl(var(--popover))',
        'card-legacy': 'hsl(var(--card))',
      },
      borderRadius: {
        // Unified Border Radius from Design Tokens
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',

        // Button System Border Radius
        'button': 'var(--fw-spacing-button-border-radius)',

        // Card System Border Radius
        'card': 'var(--fw-spacing-card-radius)',

        // Form System Border Radius
        'input': 'var(--fw-spacing-input-border-radius)',

        // fx Design Token Border Radius (removed unused border radius tokens)

        // Legacy border radius (keeping for compatibility)
        'legacy-card': '16px',
      },
      fontFamily: {
        // Unified Typography System
        heading: ['var(--fx-font-heading)'],
        body: ['var(--fx-font-body)'],
        sans: ['var(--fx-font-body)'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['var(--fx-font-heading)'],
      },
      fontSize: {
        // Unified Typography Scale using CSS custom properties
        // Unified typography scale (removed unused display token)
        h1: ['var(--fx-text-h1)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-bold)'
        }],
        h2: ['var(--fx-text-h2)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-semibold)'
        }],
        h3: ['var(--fx-text-h3)', {
          lineHeight: 'var(--fx-line-height-snug)',
          fontWeight: 'var(--fx-weight-semibold)'
        }],
        h4: ['var(--fx-text-h4)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-semibold)'
        }],
        h5: ['var(--fx-text-h5)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)'
        }],
        h6: ['var(--fx-text-h6)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)'
        }],
        body: ['var(--fx-text-body)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-regular)'
        }],

        // Legacy support (deprecated)
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.875rem', { lineHeight: '1.3rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.7rem' }],
        xl: ['1.25rem', { lineHeight: '1.9rem' }],
        '2xl': ['1.5rem', { lineHeight: '2.1rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      spacing: {
        // Unified Spacing Scale from Design Tokens
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
        'section-y': '6rem',
        'container-max': '1200px',

        // Button System Spacing
        'button-y': 'var(--fw-spacing-button-padding-y)',
        'button-x': 'var(--fw-spacing-button-padding-x)',

        // Card System Spacing
        'card': 'var(--fw-spacing-card-padding)',
        'card-margin': 'var(--fw-spacing-card-margin)',
        'card-gap': 'var(--fw-spacing-card-gap)',

        // Form System Spacing
        'input-y': 'var(--fw-spacing-input-padding-y)',
        'input-x': 'var(--fw-spacing-input-padding-x)',
        'input-gap': 'var(--fw-spacing-input-gap)',
        'field-margin': 'var(--fw-spacing-field-margin)',

        // Navigation System Spacing
        'nav-height': 'var(--fw-spacing-nav-height)',
        'nav-padding': 'var(--fw-spacing-nav-padding)',
        'nav-safe-area': 'var(--fw-spacing-nav-safe-area)',

        // Wheel System Spacing
        'wheel-padding': 'var(--fw-layout-wheel-padding)',
        'wheel-safe-area': 'var(--fw-layout-wheel-safe-area)',

        // ===== STANDARDIZED CONTAINER CLASSES =====
        // Unified container pattern for consistent layouts
        'container-mobile': 'calc(100vw - 2rem)',
        'container-tablet': 'calc(100vw - 4rem)',
        'container-desktop': 'min(1200px, calc(100vw - 8rem))',
        'container-wide': 'min(1400px, calc(100vw - 10rem))',

        // fx Design Token Spacing (removed unused individual spacing tokens)

        // Legacy spacing (keeping for compatibility)
        'legacy-xs': '0.25rem',
        'legacy-sm': '0.5rem',
        'legacy-md': '1rem',
        'legacy-lg': '1.5rem',
        'legacy-xl': '2rem',
        'legacy-2xl': '3rem',
      },
      boxShadow: {
        // Unified Shadow System from Design Tokens
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.1)',
        'md': '0 4px 6px rgba(0,0,0,0.1)',
        'lg': '0 10px 15px rgba(0,0,0,0.15)',
        'xl': '0 20px 25px rgba(0,0,0,0.2)',
        '2xl': '0 25px 50px rgba(0,0,0,0.25)',

        // fx Design Token Shadows (removed unused shadow tokens)

        // fx Premium shadows (removed unused shadow tokens)

        // Legacy shadows (keeping for compatibility)
        'legacy-fx': '0 1px 3px rgba(0,0,0,0.05)',
        'legacy-subtle': '0 1px 3px rgba(0,0,0,0.05)',
        'legacy-soft': '0 2px 6px rgba(0,0,0,0.05)',
        'legacy-medium': '0 4px 12px rgba(0,0,0,0.08)',
        'legacy-large': '0 8px 24px rgba(0,0,0,0.12)',
        'legacy-floating': '0 6px 16px rgba(0,0,0,0.1)',
        'legacy-brand': '0 4px 12px rgba(15, 91, 60, 0.15)',
        'legacy-accent': '0 4px 12px rgba(196, 107, 30, 0.15)',
      },
      transitionTimingFunction: {
        // Unified Motion Easings from Design Tokens
        'standard': 'ease-in-out',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',

        // fx Design Token Easings (removed unused easing tokens)

        // Legacy (keeping for compatibility)
        'legacy-spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        // Unified Motion Durations from Design Tokens
        'fast': '150ms',
        'normal': '300ms',
        'slow': '500ms',

        // Button System Duration
        'button': 'var(--fw-motion-transition-duration)',
      },
      keyframes: {
        // Unified Motion Keyframes from Design Tokens
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' }
        },

        // fx Design Token Animation Keyframes (removed unused animation tokens)

        // Legacy keyframes (keeping for compatibility)
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'pulse-marigold': {
          '0%, 100%': { backgroundColor: '#E6A533' },
          '50%': { backgroundColor: '#D4942D' }
        }
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
  ],
} satisfies Config

export default config
