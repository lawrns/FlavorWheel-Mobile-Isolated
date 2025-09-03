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
    'fw-bg-overlay',
    'fw-gradient-cream-gold',
    'fw-text-shadow',
    'fw-rot-word',
    'font-poetic',
    'fw-gold-glow',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // fx Design Tokens - Complete System
        fx: {
          // Surface & Background
          bg: 'var(--fx-bg)',
          'bg-subtle': 'var(--fx-bg-subtle)',

          // Cards & Containers
          card: 'var(--fx-card)',
          elevated: 'var(--fx-elevated)',
          'tasting-card': 'var(--fx-tasting-card)',

          // Text Hierarchy
          'text-primary': 'var(--fx-text-primary)',
          'text-secondary': 'var(--fx-text-secondary)',
          'text-inverse': 'var(--fx-text-inverse)',
          'text-muted': 'var(--fx-text-muted)',

          // Brand Colors
          primary: 'var(--fx-primary)',
          'primary-hover': 'var(--fx-primary-hover)',
          accent: 'var(--fx-accent)',
          'accent-hover': 'var(--fx-accent-hover)',

          // AI Confidence Indicators
          'ai-confidence-low': 'var(--fx-ai-confidence-low)',
          'ai-confidence-med': 'var(--fx-ai-confidence-med)',
          'ai-confidence-high': 'var(--fx-ai-confidence-high)',
          'ai-badge-bg': 'var(--fx-ai-badge-bg)',
          'ai-confidence-ring': 'var(--fx-ai-confidence-ring)',

          // Borders
          'border-subtle': 'var(--fx-border-subtle)',
          'border-default': 'var(--fx-border-default)',
          'border-strong': 'var(--fx-border-strong)',

          // State Colors
          'focus-ring': 'var(--fx-focus-ring-color)',
        },

        // FlavorWheel Data Viz Colors - CVD-Safe
        fw: {
          // Category Hues
          fruity: 'var(--fw-fruity)',
          floral: 'var(--fw-floral)',
          vegetal: 'var(--fw-vegetal)',
          smoky: 'var(--fw-smoky)',
          sweet: 'var(--fw-sweet)',
          spicy: 'var(--fw-spicy)',
          bitter: 'var(--fw-bitter)',
          sour: 'var(--fw-sour)',
          roasted: 'var(--fw-roasted)',
          nutty: 'var(--fw-nutty)',
          mineral: 'var(--fw-mineral)',
          earthy: 'var(--fw-earthy)',
          molecule: 'var(--fw-molecule)',

          // Metaphor Categories
          'mood-emotion': 'var(--fw-mood-emotion)',
          'setting-place': 'var(--fw-setting-place)',
          'texture-material': 'var(--fw-texture-material)',
          'color-light': 'var(--fw-color-light)',
          'movement-shape': 'var(--fw-movement-shape)',
          'character-persona': 'var(--fw-character-persona)',
          'temporal-time': 'var(--fw-temporal-time)',
        },

        // Legacy colors (keeping for compatibility)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        // fx Design Token Border Radius
        'xs': 'var(--fx-radius-xs)',
        'sm': 'var(--fx-radius-sm)',
        'md': 'var(--fx-radius-md)',
        'lg': 'var(--fx-radius-lg)',
        'xl': 'var(--fx-radius-xl)',
        'pill': 'var(--fx-radius-pill)',

        // Legacy border radius (keeping for compatibility)
        card: '16px',
      },
      fontFamily: {
        // fx Design Token Typography
        heading: ['var(--fx-font-heading)'],
        body: ['var(--fx-font-body)'],
        sans: ['var(--fx-font-body)'],
        mono: ['JetBrains Mono', 'monospace'],

        // Legacy (keeping for compatibility)
        display: ['var(--fx-font-heading)'],
        accent: ['Crimson Text', 'serif'],
      },
      fontSize: {
        // fx Design Token Fluid Typography
        'h1': ['var(--fx-text-h1)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-bold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        'h2': ['var(--fx-text-h2)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        'h3': ['var(--fx-text-h3)', {
          lineHeight: 'var(--fx-line-height-snug)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        'body': ['var(--fx-text-body)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-regular)',
          fontFamily: 'var(--fx-font-body)'
        }],
        'label': ['var(--fx-text-label)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)',
          fontFamily: 'var(--fx-font-body)'
        }],
        'caption': ['var(--fx-text-caption)', {
          lineHeight: 'var(--fx-line-height-snug)',
          fontWeight: 'var(--fx-weight-regular)',
          fontFamily: 'var(--fx-font-body)'
        }],
        'wheel-label': ['var(--fx-text-wheel-label)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-medium)',
          fontFamily: 'var(--fx-font-body)'
        }],

        // Legacy font sizes (keeping for compatibility)
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
        // fx Design Token Spacing
        '0': 'var(--fx-spacing-0)',
        '1': 'var(--fx-spacing-1)',
        '2': 'var(--fx-spacing-2)',
        '3': 'var(--fx-spacing-3)',
        '4': 'var(--fx-spacing-4)',
        '5': 'var(--fx-spacing-5)',
        '6': 'var(--fx-spacing-6)',
        '7': 'var(--fx-spacing-7)',
        '8': 'var(--fx-spacing-8)',
        '9': 'var(--fx-spacing-9)',
        '10': 'var(--fx-spacing-10)',

        // Legacy spacing (keeping for compatibility)
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
      },
      boxShadow: {
        // fx Design Token Shadows
        'xs': 'var(--fx-shadow-xs)',
        'sm': 'var(--fx-shadow-sm)',
        'md': 'var(--fx-shadow-md)',
        'lg': 'var(--fx-shadow-lg)',

        // Legacy shadows (keeping for compatibility)
        fx: '0 1px 3px rgba(0,0,0,0.05)',
        subtle: '0 1px 3px rgba(0,0,0,0.05)',
        soft: '0 2px 6px rgba(0,0,0,0.05)',
        medium: '0 4px 12px rgba(0,0,0,0.08)',
        large: '0 8px 24px rgba(0,0,0,0.12)',
        floating: '0 6px 16px rgba(0,0,0,0.1)',
        brand: '0 4px 12px rgba(15, 91, 60, 0.15)',
        accent: '0 4px 12px rgba(196, 107, 30, 0.15)',
      },
      transitionTimingFunction: {
        // fx Design Token Easings
        'standard': 'var(--fx-easing-standard)',
        'emphasized': 'var(--fx-easing-emphasized)',
        'entrance': 'var(--fx-easing-entrance)',
        'exit': 'var(--fx-easing-exit)',

        // Legacy (keeping for compatibility)
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        // fx Design Token Animation Keyframes
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(var(--fx-spacing-5))' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(calc(-1 * var(--fx-spacing-5)))' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(var(--fx-spacing-5))' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },

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
