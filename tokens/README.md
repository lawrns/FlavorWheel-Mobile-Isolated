# FlavorWheel Design Tokens Directory

This directory contains the complete design token system for FlavorWheel, serving as the single source of truth for all visual design decisions.

## Directory Structure

```
tokens/
├── global/           # Core design tokens used across all components
│   ├── colors.json   # Brand, surface, semantic, and accessibility colors
│   ├── typography.json # Fonts, scales, weights, fluid typography rules
│   ├── spacing.json  # Base 8px system, padding, margins, layout scales
│   ├── motion.json   # Global motion primitives, durations, easings
│   ├── haptics.json  # Haptic feedback definitions for mobile
│   ├── shadows.json  # Elevation levels and overlay scrims
│   └── breakpoints.json # Mobile-first breakpoints
├── components/       # Component-specific design tokens
│   ├── button.json   # All button variants, states, tokens
│   ├── card.json     # Card variants, spacing, typography, states
│   ├── form.json     # Form inputs, validation, accessibility
│   ├── navigation.json # Bottom nav, top bar, gestures
│   └── wheel.json    # Flavor wheel visualization tokens
├── themes/          # Theme-specific overrides
│   ├── light.json   # Light mode theme overrides
│   ├── dark.json    # Dark mode theme overrides
│   └── high_contrast.json # Accessibility theme overrides
└── cultural/        # Cultural and regional adaptations
    ├── mexico.json  # Mexican beverage cultural tokens
    └── i18n.json    # Internationalization tokens
```

## Governance Rules

### Authoritative Source
- **This directory is the single source of truth** for all design tokens
- All components must consume tokens from this directory
- No hard-coded values in components or CSS

### Implementation
- Tokens are consumed via Tailwind CSS custom properties
- CSS variables are defined in `globals.css`
- Components use semantic token classes (e.g., `bg-primary`, `text-card-text-primary`)

### Maintenance
- **Design Team** owns semantic token values
- **Dev Team** owns technical implementation and CI enforcement
- **AI Agents** consume tokens for auto-generation

### Enforcement
- ESLint rules prevent hard-coded colors/values
- CI/CD fails builds with token violations
- Automated tests validate token usage

## Usage Examples

### Colors
```tsx
// ✅ Correct - Use semantic tokens
<div className="bg-primary text-white">
  Primary button
</div>

// ❌ Incorrect - Hard-coded values
<div style={{ backgroundColor: '#2E7D32', color: '#FFFFFF' }}>
  Primary button
</div>
```

### Spacing
```tsx
// ✅ Correct - Use spacing tokens
<div className="p-card m-card-gap">
  Card content
</div>

// ❌ Incorrect - Hard-coded values
<div className="p-4 m-3">
  Card content
</div>
```

### Typography
```tsx
// ✅ Correct - Use typography tokens
<h1 className="font-[var(--fw-typography-card-title-family)] text-[var(--fw-typography-card-title-size)]">
  Title
</h1>

// ❌ Incorrect - Hard-coded styles
<h1 className="font-serif text-xl font-semibold">
  Title
</h1>
```

## Migration Status

| Component | Status | Migration Notes |
|-----------|--------|-----------------|
| Button | ✅ Complete | Unified system with haptics |
| Card | ✅ Complete | Mobile-first with cultural tokens |
| Form | ⏳ In Progress | Input components being updated |
| Navigation | ⏳ In Progress | Bottom nav system implementation |
| Flavor Wheel | ⏳ In Progress | Interactive wheel component |
| Typography | ✅ Complete | Fluid scales with Mexican fonts |
| Colors | ✅ Complete | WCAG AA compliant palette |
| Spacing | ✅ Complete | 8px base system optimized |
| Motion | ✅ Complete | Cultural timing with performance |

## Success Metrics

- **0 duplicate values** across codebase
- **100% components** pulling tokens from this directory
- **CI/CD passes** enforce compliance on every commit
- **All updates** happen here and propagate automatically

## Contributing

1. **Design Changes**: Update appropriate JSON files in this directory
2. **Technical Changes**: Update Tailwind config and CSS variables
3. **Component Changes**: Use semantic token classes in components
4. **Testing**: Run linting and visual regression tests

## Emergency Overrides

In rare cases where a token needs immediate override:

1. Document the override reason in the component
2. Use Tailwind's `!important` modifier sparingly
3. Plan to resolve by updating the token system
4. Add TODO comment for future token system update

---

**Last Updated**: 2025-09-14
**Version**: 1.0.0
**Status**: Active Development


