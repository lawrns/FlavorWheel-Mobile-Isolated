# Visual Regression Testing

This project uses Playwright for automated visual regression testing to ensure UI consistency across different themes, breakpoints, and component states.

## Overview

The visual regression test suite captures screenshots of key UI components and pages to detect any unintended visual changes. Tests run automatically on CI/CD and can be run locally for development.

## Test Coverage

### Design System Components
- **Buttons**: All variants (primary, secondary, outline, ghost, destructive, success) and sizes (sm, md, lg)
- **Inputs**: Various states (default, disabled, error, with labels/helpers)
- **Loading States**: Spinners, skeletons, and overlays
- **Empty States**: Contextual empty states for different scenarios
- **Typography**: Complete scale from H1 to body text

### Page Layouts
- **Landing Page**: Desktop and mobile layouts
- **Flavor Wheels**: Interactive visualization component
- **Navigation**: Desktop and mobile navigation bars

### Theme Consistency
- **Light Mode**: Complete light theme validation
- **Dark Mode**: Complete dark theme validation
- **High Contrast**: Accessibility-focused high contrast mode

### Interactive States
- **Hover States**: Button and link hover effects
- **Focus States**: Input and button focus indicators
- **Active States**: Interactive element active states

### Responsive Breakpoints
- **Mobile**: 375x667 (iPhone SE)
- **Tablet**: 768x1024 (iPad)
- **Desktop**: 1280x720 (standard desktop)
- **Desktop XL**: 1920x1080 (large displays)

## Running Tests

### Local Development

```bash
# Run all visual regression tests
npm run test:visual

# Update baseline screenshots (when intentional changes are made)
npm run test:visual:update

# Run specific test files
npx playwright test __tests__/visual-regression.spec.ts --headed

# Run tests in debug mode
npx playwright test __tests__/visual-regression.spec.ts --debug
```

### CI/CD

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests that modify UI-related files
- Files: `app/**`, `components/**`, `tailwind.config.ts`, `app/globals.css`

## Test Page

The visual regression tests use a dedicated test page at `/en/test/visual-regression` that displays all components in a consistent layout for screenshot comparison.

### Accessing the Test Page

1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3010/en/test/visual-regression`
3. Use the theme toggle to test different themes
4. Interact with components to test various states

## Baseline Screenshots

Screenshots are stored in `__tests__/__screenshots__/` and organized by:
- Test file path
- Component/page name
- Theme and breakpoint variations

### Updating Baselines

When making intentional visual changes:

1. Make your UI changes
2. Run the visual regression tests: `npm run test:visual`
3. Review the differences in the test results
4. If changes are correct, update baselines: `npm run test:visual:update`
5. Commit the updated baseline screenshots

## Configuration

### Playwright Configuration

Located in `playwright.config.ts`:
- Screenshot threshold: 0.05-0.1 (5-10% difference allowed)
- Snapshot path template: `{testDir}/__screenshots__/{testFilePath}/{arg}{ext}`
- Multiple browser and viewport configurations

### ESLint Integration

ESLint rules prevent common design system violations:
- Hardcoded colors (hex, RGB, HSL)
- Non-semantic Tailwind classes
- Legacy `fw-` classes
- Performance issues (`transition-all`)

## Troubleshooting

### Common Issues

1. **Test Flakiness**
   - Ensure components have stable data-testid attributes
   - Wait for network requests to complete
   - Use consistent viewport sizes

2. **Theme Switching**
   - Tests automatically handle theme switching
   - Wait for `[data-theme]` attribute changes
   - Ensure theme toggle has `data-testid="theme-toggle"`

3. **Screenshot Differences**
   - Review actual vs expected screenshots
   - Check for anti-aliasing differences
   - Verify component loading states

### Debug Mode

Run tests in headed mode to see what's happening:

```bash
npx playwright test __tests__/visual-regression.spec.ts --headed --debug
```

## Best Practices

### Writing Visual Tests
1. Use descriptive test names that indicate what's being tested
2. Wait for elements to be fully loaded before screenshots
3. Test both light and dark themes
4. Include multiple viewport sizes for responsive design
5. Use consistent data-testid attributes for reliable element selection

### Maintaining Baselines
1. Only update baselines for intentional changes
2. Review all changes before updating baselines
3. Keep baseline screenshots in version control
4. Run tests on multiple environments before updating

### CI/CD Integration
1. Tests run on relevant file changes only
2. Results are uploaded as artifacts
3. PR comments notify of visual changes
4. Failures block merges until resolved

## Performance Considerations

- Tests use a 10-minute timeout
- Screenshots are optimized for size vs quality balance
- Parallel test execution for faster CI runs
- Selective test running based on file changes

## Integration with Design System

The visual regression tests ensure:
- ✅ Design system token consistency
- ✅ Theme implementation accuracy
- ✅ Responsive design integrity
- ✅ Component state consistency
- ✅ Accessibility compliance (focus indicators, contrast)

This creates a robust quality gate that prevents visual regressions and maintains the high design standards of the FlavorWheel application.
