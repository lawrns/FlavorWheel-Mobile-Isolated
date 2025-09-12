# Quality Gates Documentation

This document outlines the comprehensive quality gates implemented for the FlavorWheel application, ensuring world-class code quality, accessibility, performance, and user experience.

## Overview

Quality gates are automated checks that run on every push and pull request to prevent regressions and maintain high standards. They cover:

- **Code Quality**: ESLint, TypeScript, build integrity
- **Visual Consistency**: Automated visual regression testing
- **Accessibility**: WCAG 2.1 AA compliance testing
- **Performance**: Core Web Vitals monitoring
- **Bundle Size**: Optimized delivery and loading

## Quality Gate Categories

### 🔍 Code Quality Gates

#### ESLint Rules
Custom ESLint rules enforce design system compliance:

```javascript
// Prevents design system violations
"no-restricted-syntax": [
  "error",
  // Hardcoded colors
  { "selector": "Literal[value=/^#[0-9a-fA-F]{3,8}$/]", "message": "Use fx-* semantic tokens" },
  // Non-semantic Tailwind classes
  { "selector": "JSXAttribute[name.name='className'] Literal[value=/\\b(text|bg|border)-(red|green|blue|yellow|purple|pink|indigo|gray)-(50|100|200|300|400|500|600|700|800|900)\\b/]", "message": "Use fx-* semantic tokens" },
  // Legacy classes
  { "selector": "JSXAttribute[name.name='className'] Literal[value=/\\bfw-[a-zA-Z-]+\\b/]", "message": "Legacy fw- classes deprecated" },
  // Performance issues
  { "selector": "JSXAttribute[name.name='className'] Literal[value=/\\btransition-all\\b/]", "message": "Use specific transitions" }
]
```

#### TypeScript Checks
- Strict type checking enabled
- No TypeScript compilation errors allowed
- Type safety enforced across all components

#### Build Integrity
- Successful production build required
- No build warnings that break deployment
- Bundle analysis and optimization verification

### 👁️ Visual Regression Gates

#### Automated Screenshot Testing
Playwright-based visual regression tests:

```typescript
// Tests design system components across themes
test('Button variants - light mode', async ({ page }) => {
  await expect(page.locator('[data-testid="button-section"]'))
    .toHaveScreenshot('buttons-light.png', { threshold: 0.1 })
})

test('Button variants - dark mode', async ({ page }) => {
  // Switch to dark mode and test
})
```

#### Coverage Areas
- **Component Variants**: All button, input, loading states
- **Theme Consistency**: Light, dark, high contrast modes
- **Responsive Breakpoints**: Mobile, tablet, desktop, desktop-xl
- **Interactive States**: Hover, focus, active states
- **Page Layouts**: Navigation, content areas, footers

#### Baseline Management
```bash
# Update baselines for intentional changes
npm run test:visual:update

# Run visual regression tests
npm run test:visual
```

### ♿ Accessibility Gates

#### WCAG 2.1 AA Compliance Testing
Comprehensive accessibility testing using Axe Core:

```typescript
// Automated accessibility audits
const accessibilityScanResults = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze()

expect(accessibilityScanResults.violations).toEqual([])
```

#### Test Coverage
- **Color Contrast**: 4.5:1 minimum for normal text
- **Keyboard Navigation**: All interactive elements accessible
- **ARIA Attributes**: Proper labeling and relationships
- **Touch Targets**: Minimum 44px touch targets
- **Screen Reader Support**: Semantic HTML and live regions
- **Theme Accessibility**: All themes meet accessibility standards

#### Manual Testing Support
- Accessibility test page at `/en/test/visual-regression`
- Keyboard navigation testing
- Screen reader compatibility verification
- High contrast mode validation

### ⚡ Performance Gates

#### Core Web Vitals Monitoring
Real-time performance monitoring with Lighthouse CI:

```javascript
// Lighthouse configuration
assertions: {
  'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
  'first-input-delay': ['error', { maxNumericValue: 100 }],
  'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
  'first-contentful-paint': ['error', { maxNumericValue: 1800 }]
}
```

#### Performance Budgets
- **LCP**: < 2.5 seconds (75th percentile)
- **FID**: < 100 milliseconds (75th percentile)
- **CLS**: < 0.1 (75th percentile)
- **Bundle Size**: < 2MB (gzipped)

#### Performance Monitoring
- Development-time Web Vitals dashboard
- Production performance monitoring
- Automated regression detection
- Bundle size tracking

### 📦 Bundle Size Gates

#### Size Limits
```bash
# Bundle size validation
BUNDLE_SIZE=$(find .next/static -name "*.js" -exec wc -c {} \; | awk '{sum += $1} END {print sum}')
if (( $(echo "$BUNDLE_SIZE_MB > 200" | bc -l) )); then
  echo "❌ Bundle size exceeds budget"
  exit 1
fi
```

#### Optimization Targets
- **Main Bundle**: < 200KB (gzipped)
- **Vendor Bundle**: < 150KB (gzipped)
- **CSS Bundle**: < 50KB (gzipped)
- **Font Loading**: Only used weights/styles

## CI/CD Integration

### GitHub Actions Workflows

#### Quality Gates Workflow
```yaml
# Runs on push/PR to main/develop
name: Quality Gates
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  quality-checks:
    steps:
      - name: Run ESLint
      - name: TypeScript check
      - name: Build application
      - name: Visual regression tests
      - name: Accessibility tests
      - name: Performance audit
      - name: Bundle size check
```

#### Specialized Workflows
- **Visual Regression**: `.github/workflows/visual-regression.yml`
- **Accessibility**: `.github/workflows/accessibility.yml`
- **Quality Gates**: `.github/workflows/quality-gates.yml`

### Failure Handling

#### PR Comments
Failed quality gates automatically comment on pull requests:

```markdown
## ❌ Quality Gates Failed

One or more quality gates have failed. Please review:

### Failed Checks:
- ESLint errors
- Visual regression test failures
- Accessibility test failures
- Performance budget violations

### Next Steps:
1. Check the uploaded artifacts for detailed error reports
2. Fix all failing checks
3. Re-run the CI pipeline
```

#### Deployment Blocking
- All quality gates must pass before deployment
- Failed gates block merges to main branch
- Detailed failure reports provided for debugging

## Local Development

### Running Quality Checks Locally

```bash
# Code quality
npm run lint              # ESLint
npm run type-check        # TypeScript

# Testing
npm run test:visual       # Visual regression
npm run test:a11y         # Accessibility
npm run test:performance  # Performance

# Build verification
npm run build            # Production build
```

### Development Tools

#### Performance Monitoring
```tsx
// Web Vitals dashboard in development
<PerformanceMonitor showMetrics={true} />

// Hook for programmatic access
const metrics = useWebVitals()
```

#### ESLint Integration
Real-time ESLint feedback in your IDE prevents design system violations before commit.

## Quality Metrics

### Success Criteria

#### Code Quality
- ✅ Zero ESLint errors
- ✅ Zero TypeScript errors
- ✅ Successful production build
- ✅ No console errors in production

#### Visual Consistency
- ✅ All visual regression tests pass
- ✅ Component screenshots match baselines
- ✅ Theme consistency across all variants
- ✅ Responsive design integrity

#### Accessibility
- ✅ WCAG 2.1 AA compliance (90+ score)
- ✅ Zero Axe Core violations
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility

#### Performance
- ✅ Core Web Vitals within targets
- ✅ Bundle size under budget
- ✅ Lighthouse performance score > 80
- ✅ No render-blocking resources

### Quality Score Calculation

```
Quality Score = (Code Quality × 0.2) + (Visual × 0.25) + (Accessibility × 0.25) + (Performance × 0.3)
```

## Maintenance

### Regular Tasks

#### Weekly
- Review quality gate results
- Update performance budgets if needed
- Audit new component accessibility

#### Monthly
- Review and update test baselines
- Performance trend analysis
- Bundle size optimization review

#### Quarterly
- Major dependency updates
- Design system audits
- Performance benchmark updates

### Troubleshooting

#### Common Issues

1. **ESLint Errors**
   - Check for hardcoded colors or legacy classes
   - Update component to use design system tokens
   - Run `npm run lint:fix` for auto-fixable issues

2. **Visual Regression Failures**
   - Review screenshot differences
   - Update baselines if changes are intentional
   - Check for theme or responsive issues

3. **Accessibility Failures**
   - Run accessibility tests locally for debugging
   - Check ARIA attributes and semantic HTML
   - Verify color contrast ratios

4. **Performance Issues**
   - Check bundle size and loading metrics
   - Review Core Web Vitals scores
   - Optimize images and fonts

### Escalation Process

1. **Developer Level**: Fix issues locally
2. **Code Review**: Peer review of fixes
3. **CI/CD**: Automated quality gate validation
4. **Deployment**: Quality gate approval required

## Integration with Design System

The quality gates ensure:
- ✅ Design system token usage
- ✅ Component accessibility compliance
- ✅ Performance optimization
- ✅ Visual consistency
- ✅ Cross-browser compatibility
- ✅ Mobile responsiveness

This comprehensive quality gate system maintains the highest standards for the FlavorWheel application, ensuring an exceptional user experience across all devices and user abilities.
