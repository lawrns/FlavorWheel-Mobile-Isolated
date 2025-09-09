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
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
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
        // ===== FLAVORWHEEL DESIGN SYSTEM =====
        // Complete integration with fx- design tokens

        // Brand Colors (Core identity)
        primary: 'var(--fx-primary)',
        'primary-hover': 'var(--fx-primary-hover)',
        secondary: 'var(--fx-secondary)',
        'secondary-hover': 'var(--fx-secondary-hover)',
        accent: 'var(--fx-accent)',
        'accent-hover': 'var(--fx-accent-hover)',

        // Surface System
        background: 'var(--fx-bg)',
        'background-subtle': 'var(--fx-bg-subtle)',
        foreground: 'var(--fx-text-primary)',
        surface: 'var(--fx-card)',
        'surface-elevated': 'var(--fx-elevated)',

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

        // State & Feedback
        success: 'var(--fx-ai-confidence-high)',
        warning: 'var(--fx-ai-confidence-med)',
        error: 'var(--fx-ai-confidence-low)',
        info: 'var(--fx-accent)',

        // Focus & Interaction
        focus: 'var(--fx-focus-ring-color)',
        ring: 'var(--fx-focus-ring-color)',

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
        'fx-border-strong': 'var(--fx-border-strong)',

        // fx Brand primitives
        'fx-brand-brown-500': 'var(--fx-brand-brown-500)',
        'fx-brand-brown-600': 'var(--fx-brand-brown-600)',
        'fx-brand-brown-400': 'var(--fx-brand-brown-400)',
        'fx-brand-gold-500': 'var(--fx-brand-gold-500)',
        'fx-brand-gold-600': 'var(--fx-brand-gold-600)',
        'fx-brand-gold-400': 'var(--fx-brand-gold-400)',
        'fx-brand-green-500': 'var(--fx-brand-green-500)',
        'fx-brand-green-600': 'var(--fx-brand-green-600)',
        'fx-brand-green-400': 'var(--fx-brand-green-400)',

        // fx AI confidence colors
        'fx-ai-confidence-low': 'var(--fx-ai-confidence-low)',
        'fx-ai-confidence-med': 'var(--fx-ai-confidence-med)',
        'fx-ai-confidence-high': 'var(--fx-ai-confidence-high)',

        // ===== LEGACY SUPPORT =====
        // Minimal support for existing fw- tokens (will be removed in future)
        fw: {
          fruity: 'var(--fw-fruity)',
          floral: 'var(--fw-floral)',
          vegetal: 'var(--fw-vegetal)',
          // ... other fw tokens kept for compatibility
        },

        // Shadcn/ui compatibility (deprecated - use semantic tokens above)
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
        // Unified Typography System
        heading: ['var(--fx-font-heading)'],
        body: ['var(--fx-font-body)'],
        sans: ['var(--fx-font-body)'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['var(--fx-font-heading)'],

        // fx Design System fonts
        'fx-heading': ['var(--fx-font-heading)'],
        'fx-subheading': ['var(--fx-font-subheading)'],
        'fx-body': ['var(--fx-font-body)'],
      },
      fontSize: {
        // Unified Typography Scale using CSS custom properties
        display: ['var(--fx-text-display)', {
          lineHeight: 'var(--fx-line-height-tight)',
          fontWeight: 'var(--fx-weight-bold)',
          fontFamily: 'var(--fx-font-heading)'
        }],
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
        label: ['var(--fx-text-label)', {
          lineHeight: 'var(--fx-line-height-normal)',
          fontWeight: 'var(--fx-weight-medium)',
          fontFamily: 'var(--fx-font-body)'
        }],
        caption: ['var(--fx-text-caption)', {
          lineHeight: 'var(--fx-line-height-snug)',
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

        // fx Design Token Shadows
        'fx-xs': 'var(--fx-shadow-xs)',
        'fx-sm': 'var(--fx-shadow-sm)',
        'fx-md': 'var(--fx-shadow-md)',
        'fx-lg': 'var(--fx-shadow-lg)',

        // fx Premium shadows
        'fx-premium': 'var(--fx-shadow-premium)',
        'fx-glow': 'var(--fx-shadow-glow)',

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
