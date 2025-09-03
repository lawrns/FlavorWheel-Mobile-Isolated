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
        // Unified Design System Colors
        primary: '#FF6B35',
        'primary-foreground': '#FFFFFF',
        secondary: '#3366FF',
        'secondary-foreground': '#FFFFFF',
        accent: '#22C55E',
        'accent-foreground': '#FFFFFF',
        background: '#FFFFFF',
        foreground: '#1A1A1A',
        muted: '#F5F5F5',
        'muted-foreground': '#737373',
        border: '#E5E7EB',
        surface: '#FAFAFA',

        // Dark mode colors
        'dark-primary': '#FF6B35',
        'dark-primary-foreground': '#1A1A1A',
        'dark-secondary': '#6699FF',
        'dark-secondary-foreground': '#1A1A1A',
        'dark-accent': '#4ADE80',
        'dark-accent-foreground': '#1A1A1A',
        'dark-background': '#0B0B0B',
        'dark-foreground': '#F9FAFB',
        'dark-muted': '#1F2937',
        'dark-muted-foreground': '#9CA3AF',
        'dark-border': '#2D2D2D',
        'dark-surface': '#111111',

        // High contrast colors
        'hc-primary': '#FF0000',
        'hc-secondary': '#0000FF',
        'hc-accent': '#00FF00',
        'hc-background': '#000000',
        'hc-foreground': '#FFFFFF',

        // Dark mode semantic surfaces
        'dark-surface-50': '#16161a',
        'dark-surface-100': '#1e1e22',
        'dark-surface-200': '#2a2a2e',
        'dark-surface-300': '#3a3a3e',
        'dark-surface-400': '#4a4a4e',
        'dark-surface-500': '#5a5a5e',
        'dark-surface-600': '#6a6a6e',
        'dark-surface-700': '#7a7a7e',
        'dark-surface-800': '#8a8a8e',
        'dark-surface-900': '#9a9a9e',

        // fx Design Tokens - Complete System (legacy support)
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
        // Unified Border Radius from Design Tokens
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',

        // fx Design Token Border Radius (legacy support)
        'fx-xs': 'var(--fx-radius-xs)',
        'fx-sm': 'var(--fx-radius-sm)',
        'fx-md': 'var(--fx-radius-md)',
        'fx-lg': 'var(--fx-radius-lg)',
        'fx-xl': 'var(--fx-radius-xl)',
        'fx-pill': 'var(--fx-radius-pill)',

        // Legacy border radius (keeping for compatibility)
        'legacy-card': '16px',
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
        // Unified Typography Scale from Design Tokens
        display: ['4.5rem', { lineHeight: '1.1', fontWeight: '700', fontFamily: 'Inter, sans-serif' }],
        h1: ['3.75rem', { lineHeight: '1.1', fontWeight: '700', fontFamily: 'Inter, sans-serif' }],
        h2: ['3rem', { lineHeight: '1.15', fontWeight: '600', fontFamily: 'Inter, sans-serif' }],
        h3: ['2.25rem', { lineHeight: '1.2', fontWeight: '600', fontFamily: 'Inter, sans-serif' }],
        h4: ['1.875rem', { lineHeight: '1.25', fontWeight: '600', fontFamily: 'Inter, sans-serif' }],
        h5: ['1.5rem', { lineHeight: '1.3', fontWeight: '600', fontFamily: 'Inter, sans-serif' }],
        h6: ['1.25rem', { lineHeight: '1.4', fontWeight: '600', fontFamily: 'Inter, sans-serif' }],
        'body-lg': ['1.125rem', { lineHeight: '1.5', fontWeight: '400', fontFamily: 'Inter, sans-serif' }],
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400', fontFamily: 'Inter, sans-serif' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', fontWeight: '400', fontFamily: 'Inter, sans-serif' }],
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500', fontFamily: 'Inter, sans-serif' }],

        // fx Design Token Fluid Typography (legacy support)
        'fx-h1': ['var(--fx-text-h1)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-bold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        'fx-h2': ['var(--fx-text-h2)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        'fx-h3': ['var(--fx-text-h3)', {
          lineHeight: 'var(--fx-line-height-snug)',
          fontWeight: 'var(--fx-weight-semibold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
        'fx-body': ['var(--fx-text-body)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-regular)',
          fontFamily: 'var(--fx-font-body)'
        }],
        'fx-label': ['var(--fx-text-label)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)',
          fontFamily: 'var(--fx-font-body)'
        }],
        'fx-caption': ['var(--fx-text-caption)', {
          lineHeight: 'var(--fx-line-height-snug)',
          fontWeight: 'var(--fx-weight-regular)',
          fontFamily: 'var(--fx-font-body)'
        }],
        'fx-wheel-label': ['var(--fx-text-wheel-label)', {
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

        // fx Design Token Spacing (legacy support)
        'fx-0': 'var(--fx-spacing-0)',
        'fx-1': 'var(--fx-spacing-1)',
        'fx-2': 'var(--fx-spacing-2)',
        'fx-3': 'var(--fx-spacing-3)',
        'fx-4': 'var(--fx-spacing-4)',
        'fx-5': 'var(--fx-spacing-5)',
        'fx-6': 'var(--fx-spacing-6)',
        'fx-7': 'var(--fx-spacing-7)',
        'fx-8': 'var(--fx-spacing-8)',
        'fx-9': 'var(--fx-spacing-9)',
        'fx-10': 'var(--fx-spacing-10)',

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

        // fx Design Token Shadows (legacy support)
        'fx-xs': 'var(--fx-shadow-xs)',
        'fx-sm': 'var(--fx-shadow-sm)',
        'fx-md': 'var(--fx-shadow-md)',
        'fx-lg': 'var(--fx-shadow-lg)',

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

        // fx Design Token Easings (legacy support)
        'fx-standard': 'var(--fx-easing-standard)',
        'fx-emphasized': 'var(--fx-easing-emphasized)',
        'fx-entrance': 'var(--fx-easing-entrance)',
        'fx-exit': 'var(--fx-easing-exit)',

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

        // fx Design Token Animation Keyframes (legacy support)
        'fx-fadeInUp': {
          from: { opacity: '0', transform: 'translateY(var(--fx-spacing-5))' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'fx-slideInLeft': {
          from: { opacity: '0', transform: 'translateX(calc(-1 * var(--fx-spacing-5)))' },
          to: { opacity: '1', transform: 'translateX(0)' }
        },
        'fx-slideInRight': {
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
