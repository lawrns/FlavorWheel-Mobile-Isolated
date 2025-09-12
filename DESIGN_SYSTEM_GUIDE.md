# FlavorWheel Design System Guide

A comprehensive guide to the FlavorWheel design system, built with accessibility, performance, and consistency in mind.

## 🎯 Core Principles

### Accessibility First
- **WCAG 2.1 AA** compliance across all components
- **Keyboard navigation** support for all interactive elements
- **Screen reader** compatibility with proper ARIA attributes
- **Touch targets** minimum 44px for mobile accessibility

### Performance Optimized
- **Core Web Vitals** excellence (< 2.5s LCP, < 100ms FID, < 0.1 CLS)
- **Optimized animations** using transform/opacity only
- **Efficient font loading** with display swap
- **CSS containment** for better rendering performance

### Consistent Experience
- **Unified design language** across all platforms
- **Semantic color tokens** with fx-* naming convention
- **Fluid typography** that scales beautifully
- **Component library** with consistent APIs

## 🎨 Color System

### Semantic Tokens
All colors use semantic naming for better maintainability:

```css
/* Primary Brand Colors */
--fx-primary: #2E7D32;        /* Green - WCAG AA compliant */
--fx-secondary: #D4AF37;      /* Gold */
--fx-accent: #8B4513;         /* Brown */

/* Surface System */
--fx-bg: #FEFCF8;             /* Main background */
--fx-bg-subtle: #F7F3EA;      /* Subtle background */
--fx-card: #FAF7F2;           /* Card background */

/* Text Hierarchy */
--fx-text-primary: #2C1810;   /* High contrast text */
--fx-text-secondary: #8B4513; /* Secondary text */
--fx-text-muted: #6B5B95;     /* Muted text */
```

### Usage Guidelines

```tsx
// ✅ Correct: Use semantic tokens
<div className="bg-fx-bg text-fx-text-primary border-fx-border-default">
  Content
</div>

// ❌ Incorrect: Hardcoded colors
<div style={{ backgroundColor: '#FEFCF8', color: '#2C1810' }}>
  Content
</div>

// ❌ Incorrect: Non-semantic Tailwind classes
<div className="bg-white text-black border-gray-200">
  Content
</div>
```

## 📝 Typography

### Font Families
```css
--fx-font-body: 'Inter', system-ui, -apple-system, sans-serif;
--fx-font-heading: 'Crimson Text', serif;
```

### Fluid Typography Scale
```css
--fx-text-h1: clamp(28px, 4.5vw, 40px);
--fx-text-h2: clamp(22px, 3.6vw, 32px);
--fx-text-h3: clamp(18px, 2.8vw, 24px);
--fx-text-h4: clamp(16px, 2.8vw, 20px);
--fx-text-h5: clamp(14px, 2.4vw, 18px);
--fx-text-h6: clamp(12px, 2.0vw, 16px);
--fx-text-body: clamp(14px, 2.2vw, 16px);
```

### Usage
```tsx
// Headings
<h1 className="fx-text-h1 font-bold text-fx-text-primary">Page Title</h1>
<h2 className="fx-text-h2 font-semibold text-fx-text-primary">Section Title</h2>

// Body text
<p className="fx-text-body text-fx-text-secondary">Body content</p>
```

## 📏 Spacing & Layout

### Spacing Scale (Base-4)
```css
--fx-spacing-0: 0px;
--fx-spacing-1: 4px;   /* 0.25rem */
--fx-spacing-2: 8px;   /* 0.5rem */
--fx-spacing-3: 12px;  /* 0.75rem */
--fx-spacing-4: 16px;  /* 1rem */
--fx-spacing-5: 20px;  /* 1.25rem */
--fx-spacing-6: 24px;  /* 1.5rem */
--fx-spacing-7: 32px;  /* 2rem */
--fx-spacing-8: 40px;  /* 2.5rem */
```

### Usage
```tsx
// Consistent spacing
<div className="space-y-4">  {/* 16px vertical spacing */}
  <div className="p-4">     {/* 16px padding */}
    Content
  </div>
</div>
```

## 🧩 Components

### Button Variants
```tsx
// Primary actions
<Button variant="default">Create Account</Button>

// Secondary actions
<Button variant="secondary">Cancel</Button>

// Tertiary actions
<Button variant="ghost">Edit</Button>

// Destructive actions
<Button variant="destructive">Delete</Button>
```

### Form Components
```tsx
// Input with validation
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
  helperText="We'll never share your email"
/>

// Select dropdown
<Select
  label="Country"
  options={countries}
  value={selectedCountry}
  onChange={setSelectedCountry}
/>
```

### Loading States
```tsx
// Page loading
<LoadingOverlay message="Loading your data..." />

// Component loading
<SkeletonLoader variant="card" />

// Inline loading
<Button disabled={loading}>
  {loading && <LoadingSpinner size="sm" className="mr-2" />}
  Save Changes
</Button>
```

### Empty States
```tsx
// Contextual empty states
<EmptyTastings />
<EmptyFriends />
<EmptyFlavorWheel />
```

## ♿ Accessibility Guidelines

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should be logical and intuitive
- Focus indicators must be visible (2px solid, 2px offset)
- Skip links for screen reader users

### ARIA Attributes
```tsx
// Form labels
<label htmlFor="email">Email Address</label>
<input id="email" type="email" aria-describedby="email-help" />

// Error states
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : "help-text"}
/>

// Live regions
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### Touch Accessibility
- Minimum touch target size: 44px × 44px
- Adequate spacing between touch targets
- Touch feedback for all interactive elements

## ⚡ Performance Guidelines

### Animation Best Practices
```css
/* ✅ Good: Performant animations */
.animate-performant {
  will-change: transform, opacity;
  contain: layout style paint;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* ❌ Bad: Layout-thrashing animations */
.transition-all {
  transition: all 0.3s ease; /* Animates everything */
}
```

### Image Optimization
```tsx
// Next.js automatic optimization
<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For LCP optimization
  placeholder="blur"
/>
```

### Bundle Optimization
- Use dynamic imports for large components
- Tree-shake unused dependencies
- Optimize font loading (only load used weights)

## 🔧 Development Workflow

### ESLint Rules
The project enforces design system compliance:

```javascript
// Prevents hardcoded colors
"no-restricted-syntax": [
  "error",
  {
    "selector": "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
    "message": "Use fx-* semantic tokens instead"
  }
]
```

### Testing Requirements
- **Visual Regression**: All UI changes tested
- **Accessibility**: WCAG 2.1 AA compliance verified
- **Performance**: Core Web Vitals within targets
- **Cross-browser**: Chrome, Firefox, Safari, Edge

### Component Documentation
```tsx
interface ComponentProps {
  /** Required prop description */
  requiredProp: string
  /** Optional prop description */
  optionalProp?: number
  /** Event handler */
  onAction?: () => void
}

/**
 * Component description and usage examples.
 *
 * @example
 * ```tsx
 * <Component requiredProp="value" onAction={handleAction} />
 * ```
 */
export function Component({ ... }: ComponentProps) {
  // Implementation
}
```

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] `npm run lint` - No ESLint errors
- [ ] `npm run test:visual` - No visual regressions
- [ ] `npm run test:a11y` - WCAG 2.1 AA compliance
- [ ] `npm run build` - Successful production build
- [ ] Lighthouse audit - Core Web Vitals scores

### Performance Budgets
- [ ] Bundle size < 200KB (gzipped)
- [ ] LCP < 2.5s (75th percentile)
- [ ] FID < 100ms (75th percentile)
- [ ] CLS < 0.1 (75th percentile)

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review test results and fix regressions
- **Monthly**: Update performance budgets and baselines
- **Quarterly**: Audit component usage and remove deprecated patterns

### Version Control
- Use semantic versioning for design system updates
- Document breaking changes in release notes
- Maintain backwards compatibility where possible

This guide ensures consistent, accessible, and performant development across the FlavorWheel application.
