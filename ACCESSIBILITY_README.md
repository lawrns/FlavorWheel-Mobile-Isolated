# Accessibility Testing Suite - WCAG 2.1 AA

This project includes a comprehensive accessibility testing suite that ensures WCAG 2.1 AA compliance across all pages and components. The suite uses Playwright with Axe Core for automated accessibility audits.

## Overview

The accessibility testing suite validates compliance with WCAG 2.1 AA standards through automated tests covering:

- **Automated Accessibility Audits**: Axe Core powered comprehensive page scans
- **Color Contrast Compliance**: Text and UI element contrast ratio validation
- **Keyboard Navigation**: Tab order, focus management, and keyboard accessibility
- **ARIA and Semantic HTML**: Proper labeling, heading structure, and semantic markup
- **Touch and Mobile Accessibility**: Touch target sizes and mobile interactions
- **Error States and Validation**: Form validation and error announcements
- **Theme and High Contrast Support**: Accessibility across all themes

## WCAG 2.1 AA Standards Covered

### Perceivable (Guideline 1.1 - 1.4)
- ✅ **Text Alternatives**: All images have appropriate alt text
- ✅ **Time-based Media**: No time-based media requiring alternatives
- ✅ **Adaptable**: Content can be presented in different ways
- ✅ **Distinguishable**: Color contrast, text resizing, audio control

### Operable (Guideline 2.1 - 2.5)
- ✅ **Keyboard Accessible**: All functionality available via keyboard
- ✅ **Enough Time**: No time limits that would fail the guideline
- ✅ **Seizures and Physical Reactions**: No content causes seizures
- ✅ **Navigable**: Clear focus indicators and logical tab order
- ✅ **Input Modalities**: Beyond keyboard (touch, voice)

### Understandable (Guideline 3.1 - 3.3)
- ✅ **Readable**: Language identification, unusual words, abbreviations
- ✅ **Predictable**: Consistent navigation and behavior
- ✅ **Input Assistance**: Error identification and suggestions

### Robust (Guideline 4.1)
- ✅ **Compatible**: Markup parsing, name/role/value for custom components

## Running Tests

### Local Development

```bash
# Run all accessibility tests
npm run test:a11y

# Run specific test files
npx playwright test __tests__/accessibility.spec.ts --headed

# Run tests in debug mode
npx playwright test __tests__/accessibility.spec.ts --debug

# Run only specific test categories
npx playwright test __tests__/accessibility.spec.ts --grep "Keyboard Navigation"
```

### CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests that modify UI-related files
- Files: `app/**`, `components/**`, `tailwind.config.ts`, `app/globals.css`

## Test Categories

### 1. Automated Accessibility Audits
Uses Axe Core to scan pages for WCAG violations:
- Color contrast issues
- Missing alt text
- Missing form labels
- Keyboard navigation problems
- ARIA attribute issues
- Semantic HTML problems

### 2. Color Contrast Compliance
Validates contrast ratios for:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum
- Focus indicators: 3:1 minimum
- All themes (light, dark, high contrast)

### 3. Keyboard Navigation
Tests keyboard accessibility:
- All interactive elements focusable
- Logical tab order
- Skip links functionality
- Modal focus trapping
- Custom keyboard interactions

### 4. ARIA and Semantic HTML
Validates semantic markup:
- Proper heading hierarchy (H1→H2→H3, no skipping)
- Form labels and associations
- ARIA attributes usage
- Image alt text requirements
- Color-independent information conveyance

### 5. Touch and Mobile Accessibility
Mobile-specific accessibility:
- Touch targets: 44px minimum
- Swipe gestures support
- Touch interaction feedback
- Mobile viewport considerations

### 6. Error States and Validation
Form accessibility:
- Error message announcements
- Form validation feedback
- Loading state announcements
- Progress indication

### 7. Theme and High Contrast Support
Cross-theme accessibility:
- Consistent accessibility in all themes
- High contrast mode support
- Focus indicators in all themes
- Theme switching accessibility

## Test Page

The accessibility tests use the visual regression test page at `/en/test/visual-regression` which includes:
- All UI components with proper test IDs
- Form elements with various states
- Interactive elements for keyboard testing
- Images for alt text validation
- Theme toggle for cross-theme testing

## Configuration

### Axe Core Configuration

The automated audits use these Axe Core rules:
- **WCAG 2.0 A & AA**: `wcag2a`, `wcag2aa`
- **WCAG 2.1 A & AA**: `wcag21a`, `wcag21aa`
- **Best Practices**: Additional accessibility best practices

### Playwright Configuration

Located in `playwright.config.ts`:
- Multiple viewport sizes (mobile, tablet, desktop)
- Cross-browser testing (Chromium, Firefox, WebKit)
- Screenshot capture on failures
- Accessibility violation reporting

## Fixing Accessibility Issues

### Common Issues and Solutions

1. **Color Contrast Failures**
   ```css
   /* ❌ Bad - low contrast */
   .text-muted { color: #999; }

   /* ✅ Good - meets WCAG AA */
   .text-muted { color: var(--fx-text-muted); }
   ```

2. **Missing Alt Text**
   ```jsx
   {/* ❌ Bad - no alt text */}
   <img src="logo.png" />

   {/* ✅ Good - descriptive alt text */}
   <img src="logo.png" alt="FlavorWheel logo" />
   ```

3. **Missing Form Labels**
   ```jsx
   {/* ❌ Bad - no label */}
   <input type="email" />

   {/* ✅ Good - explicit label */}
   <label htmlFor="email">Email Address</label>
   <input id="email" type="email" />
   ```

4. **Touch Target Size**
   ```css
   /* ❌ Bad - too small */}
   .button { min-width: 32px; min-height: 32px; }

   {/* ✅ Good - meets minimum */}
   .button { min-width: 44px; min-height: 44px; }
   ```

5. **Focus Indicators**
   ```css
   /* ❌ Bad - invisible focus */}
   .button:focus { outline: none; }

   {/* ✅ Good - visible focus */}
   .button:focus-visible {
     outline: 2px solid var(--fx-focus-ring-color);
     outline-offset: 2px;
   }
   ```

## Integration with Design System

The accessibility tests ensure:
- ✅ Design system component accessibility
- ✅ Theme accessibility compliance
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Mobile accessibility standards
- ✅ Cross-browser accessibility

## Performance Considerations

- Tests use a 15-minute timeout for comprehensive scanning
- Parallel test execution for faster CI runs
- Selective test running based on file changes
- Screenshot capture for visual debugging

## Best Practices

### Writing Accessible Components
1. Always include proper ARIA attributes
2. Ensure sufficient color contrast ratios
3. Make all interactive elements keyboard accessible
4. Provide text alternatives for non-text content
5. Test with screen readers and keyboard navigation
6. Include focus management in complex interactions

### Maintaining Accessibility
1. Run accessibility tests on every PR
2. Include accessibility in code reviews
3. Test with real assistive technologies
4. Keep accessibility documentation current
5. Monitor for accessibility regressions

### CI/CD Integration
1. Tests run on relevant file changes only
2. Results uploaded as artifacts for review
3. PR comments notify developers of issues
4. Accessibility score tracking over time

This comprehensive accessibility testing suite ensures the FlavorWheel application maintains WCAG 2.1 AA compliance and provides an inclusive user experience for all users, including those with disabilities.
