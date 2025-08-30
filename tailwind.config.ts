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
        // Design Token Colors
        'primary-green': '#4A704A',
        'background-cream': '#FAF7F2',
        'text-black': '#000000',
        'text-gray': '#6B7280',
        'card-white': '#FFFFFF',
        'card-beige': '#F5F1E8',
        'border-light': '#E5E7EB',
        'button-black': '#000000',
        'button-green': '#4A704A',

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
        // Design Token Border Radius
        'border-radius-card': '8px',
        'border-radius-button': '9999px',

        // Legacy border radius
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card: '16px',
        pill: '9999px',
        xl: '1rem',
      },
      fontFamily: {
        sans: ["'Inter', sans-serif"],
        heading: ['var(--font-heading)', 'Playfair Display', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        accent: ['var(--font-accent)', 'Crimson Text', 'serif'],
        display: ['var(--font-display)', 'Playfair Display', 'serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        // Design Token Spacing
        'padding-card': '16px',
        'padding-section': '24px',
        'gap-items': '16px',
        'gap-small': '8px',
        'icon-size': '24px',

        // Legacy spacing
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        'fw-xs': '0.5rem',
        'fw-sm': '1rem',
        'fw-md': '1.5rem',
        'fw-lg': '2rem',
        'fw-xl': '3rem',
      },
      fontSize: {
        // Design Token Typography
        'h1': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'p': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.4', fontWeight: '400' }],

        // Legacy font sizes
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
      boxShadow: {
        subtle: '0 1px 3px rgba(0,0,0,0.05)',
        soft: '0 2px 6px rgba(0,0,0,0.05)',
        medium: '0 4px 12px rgba(0,0,0,0.08)',
        large: '0 8px 24px rgba(0,0,0,0.12)',
        floating: '0 6px 16px rgba(0,0,0,0.1)',
        brand: '0 4px 12px rgba(15, 91, 60, 0.15)',
        accent: '0 4px 12px rgba(196, 107, 30, 0.15)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-marigold': 'pulse-marigold 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-marigold': {
          '0%, 100%': { backgroundColor: '#E6A533' },
          '50%': { backgroundColor: '#D4942D' },
        },
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
  ],
} satisfies Config

export default config
