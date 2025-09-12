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
        // ===== FLAVORWHEEL DESIGN SYSTEM =====
        // Complete integration with fx- design tokens

        // Brand Colors (Core identity)
        primary: 'var(--fx-primary)',
        'primary-hover': 'var(--fx-primary-hover)',
        secondary: 'var(--fx-secondary)',
        'secondary-hover': 'var(--fx-secondary-hover)',
        accent: 'var(--fx-accent)',
        'accent-hover': 'var(--fx-accent-hover)',

        // Surface System (removed unused elevated variant)
        background: 'var(--fx-bg)',
        'background-subtle': 'var(--fx-bg-subtle)',
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
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        destructive: 'hsl(var(--destructive))',
        popover: 'hsl(var(--popover))',
        card: 'hsl(var(--card))',
      },
      borderRadius: {
        // Unified Border Radius from Design Tokens
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',

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
          fontWeight: 'var(--fx-weight-bold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        h2: ['var(--fx-text-h2)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        h3: ['var(--fx-text-h3)', {
          lineHeight: 'var(--fx-line-height-snug)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        h4: ['var(--fx-text-h4)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        h5: ['var(--fx-text-h5)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        h6: ['var(--fx-text-h6)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        body: ['var(--fx-text-body)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-regular)',
          fontFamily: 'var(--fx-font-body)'
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
