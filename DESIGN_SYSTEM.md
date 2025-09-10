# FlavorWheel Design System Documentation

## Overview

This document outlines the FlavorWheel design system, including design tokens, usage patterns, and guidelines.

## Design Tokens

### Token Usage Statistics
- **Total fx- tokens defined**: 54
- **Tokens actively used**: 55
- **Unused tokens**: 18
- **Legacy fw- tokens**: 0

### Token Categories

#### Colors
- `fx-primary`: Primary brand color (#8B4513 - Saddle Brown)
- `fx-primary-hover`: Primary hover state
- `fx-accent`: Secondary accent color
- `fx-text-primary`: Primary text color
- `fx-text-secondary`: Secondary text color
- `fx-text-muted`: Muted text color
- `fx-bg-subtle`: Subtle background
- `fx-card`: Card background
- `fx-border-default`: Default border color

#### Spacing
- `fx-spacing-xs`: 0.5rem (8px)
- `fx-spacing-sm`: 0.75rem (12px)
- `fx-spacing-md`: 1rem (16px)
- `fx-spacing-lg`: 1.5rem (24px)
- `fx-spacing-xl`: 2rem (32px)
- `fx-spacing-2xl`: 3rem (48px)

#### Typography
- `fx-text-xs`: 0.75rem
- `fx-text-sm`: 0.875rem
- `fx-text-base`: 1rem
- `fx-text-lg`: 1.125rem
- `fx-text-xl`: 1.25rem
- `fx-text-2xl`: 1.5rem
- `fx-text-3xl`: 1.875rem
- `fx-text-4xl`: 2.25rem

#### Shadows
- `fx-shadow-sm`: Small shadow
- `fx-shadow-md`: Medium shadow
- `fx-shadow-lg`: Large shadow
- `fx-shadow-xl`: Extra large shadow

#### Borders
- `fx-border-radius-sm`: Small border radius (0.25rem)
- `fx-border-radius-md`: Medium border radius (0.375rem)
- `fx-border-radius-lg`: Large border radius (0.5rem)
- `fx-border-radius-xl`: Extra large border radius (0.75rem)

## Usage Guidelines

### Colors
- Use `fx-primary` for primary actions and brand elements
- Use `fx-accent` for secondary actions and highlights
- Use semantic text colors (`fx-text-primary`, `fx-text-secondary`, `fx-text-muted`) for consistency

### Spacing
- Use the standardized spacing scale for consistent layouts
- Prefer spacing tokens over arbitrary values

### Components
- All interactive elements must meet 44px minimum touch target size
- Use the Button component variants for consistent styling
- Use Card component variants for consistent card layouts

### Layout
- Use container classes: `container-mobile`, `container-tablet`, `container-desktop`, `container-wide`
- Use UnifiedAppShell with appropriate variants for different page types

## Migration Notes

### Legacy Tokens
No legacy tokens found

### Unused Tokens
- `fx-border-strong` - Can be safely removed
- `fx-elevated` - Can be safely removed
- `fx-font-heading` - Can be safely removed
- `fx-font-body` - Can be safely removed
- `fx-text-h1` - Can be safely removed
- `fx-line-height-tight` - Can be safely removed
- `fx-weight-bold` - Can be safely removed
- `fx-text-h2` - Can be safely removed
- `fx-weight-semibold` - Can be safely removed
- `fx-text-h3` - Can be safely removed
- `fx-line-height-snug` - Can be safely removed
- `fx-text-h4` - Can be safely removed
- `fx-line-height-normal` - Can be safely removed
- `fx-text-h5` - Can be safely removed
- `fx-weight-medium` - Can be safely removed
- `fx-text-h6` - Can be safely removed
- `fx-text-body` - Can be safely removed
- `fx-weight-regular` - Can be safely removed

## Quality Assurance

### Automated Checks
- ESLint rules prevent legacy token usage
- Stylelint ensures CSS consistency
- Playwright tests validate component consistency
- Touch target validation ensures accessibility compliance
- Lighthouse CI monitors performance metrics

### Manual Review Checklist
- [ ] All interactive elements meet 44px touch target minimum
- [ ] Color contrast ratios meet WCAG AA standards
- [ ] Focus indicators are visible and properly styled
- [ ] Layout works across all supported device sizes
- [ ] Typography scales appropriately for different screen sizes
- [ ] Loading states are implemented for all async operations
- [ ] Error boundaries handle failures gracefully

## Maintenance

### Adding New Tokens
1. Add token to `tailwind.config.ts`
2. Document usage in this file
3. Update component implementations
4. Add to automated tests if needed

### Removing Tokens
1. Analyze usage with this script
2. Ensure no components depend on the token
3. Remove from `tailwind.config.ts`
4. Update this documentation

### Updating Token Values
1. Update value in `tailwind.config.ts`
2. Test across all components
3. Run automated tests
4. Update screenshots if needed

## Performance Considerations

- Minimize CSS bundle size by removing unused tokens
- Use CSS custom properties for dynamic theming
- Optimize font loading and typography
- Implement proper image optimization
- Monitor Core Web Vitals regularly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Minimum iOS 12, Android 8
- Progressive enhancement approach

---

*This document is automatically generated and should be updated when the design system changes.*
