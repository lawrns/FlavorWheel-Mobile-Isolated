#!/usr/bin/env node

/**
 * Design Token Analysis Script
 * Analyzes usage of fx- design tokens across the codebase
 * Part of Phase 4: Design System Cleanup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DesignTokenAnalyzer {
  constructor() {
    this.tokenUsage = new Map();
    this.allTokens = new Set();
    this.unusedTokens = new Set();
    this.legacyTokens = new Set();
  }

  /**
   * Extract all fx- design tokens from Tailwind config
   */
  extractAllTokens() {
    const tailwindConfigPath = path.join(process.cwd(), 'tailwind.config.ts');
    if (!fs.existsSync(tailwindConfigPath)) {
      console.log('⚠️  tailwind.config.ts not found');
      return;
    }

    const configContent = fs.readFileSync(tailwindConfigPath, 'utf8');

    // Extract fx- tokens from the config
    const fxTokenRegex = /fx-[\w-]+/g;
    const matches = configContent.match(fxTokenRegex) || [];

    matches.forEach(token => {
      this.allTokens.add(token);
    });

    console.log(`📝 Found ${this.allTokens.size} fx- design tokens in config`);
  }

  /**
   * Find all component files
   */
  findComponentFiles() {
    const componentsDir = path.join(process.cwd(), 'components');
    const appDir = path.join(process.cwd(), 'app');

    const files = [];

    // Find all .tsx and .ts files in components
    this.findFilesRecursive(componentsDir, files, ['.tsx', '.ts']);

    // Find all .tsx and .ts files in app
    this.findFilesRecursive(appDir, files, ['.tsx', '.ts']);

    return files;
  }

  /**
   * Recursively find files with specific extensions
   */
  findFilesRecursive(dir, files, extensions) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        this.findFilesRecursive(fullPath, files, extensions);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    });
  }

  /**
   * Analyze token usage in a file
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');

    // Find all fx- tokens used in the file
    const fxTokenRegex = /fx-[\w-]+/g;
    const matches = content.match(fxTokenRegex) || [];

    matches.forEach(token => {
      if (!this.tokenUsage.has(token)) {
        this.tokenUsage.set(token, []);
      }
      this.tokenUsage.get(token).push(filePath);
    });

    // Check for legacy fw- tokens
    const fwTokenRegex = /fw-[\w-]+/g;
    const fwMatches = content.match(fwTokenRegex) || [];

    fwMatches.forEach(token => {
      this.legacyTokens.add(token);
    });
  }

  /**
   * Calculate unused tokens
   */
  calculateUnusedTokens() {
    this.allTokens.forEach(token => {
      if (!this.tokenUsage.has(token)) {
        this.unusedTokens.add(token);
      }
    });
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('\n📊 Design Token Analysis Report');
    console.log('====================================');

    console.log(`\n🎨 Total fx- tokens defined: ${this.allTokens.size}`);
    console.log(`✅ Tokens used: ${this.tokenUsage.size}`);
    console.log(`❌ Tokens unused: ${this.unusedTokens.size}`);
    console.log(`⚠️  Legacy fw- tokens found: ${this.legacyTokens.size}`);

    if (this.unusedTokens.size > 0) {
      console.log('\n🔧 Unused Tokens (can be removed):');
      Array.from(this.unusedTokens).sort().forEach(token => {
        console.log(`  - ${token}`);
      });
    }

    if (this.legacyTokens.size > 0) {
      console.log('\n🚨 Legacy fw- Tokens Found (need migration):');
      Array.from(this.legacyTokens).forEach(token => {
        console.log(`  - ${token}`);
      });
    }

    // Most used tokens
    const sortedTokens = Array.from(this.tokenUsage.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10);

    console.log('\n🏆 Most Used Tokens:');
    sortedTokens.forEach(([token, files]) => {
      console.log(`  ${token}: used in ${files.length} files`);
    });

    // Token usage distribution
    const usageCounts = new Map();
    this.tokenUsage.forEach((files, token) => {
      const count = files.length;
      if (!usageCounts.has(count)) {
        usageCounts.set(count, 0);
      }
      usageCounts.set(count, usageCounts.get(count) + 1);
    });

    console.log('\n📈 Usage Distribution:');
    Array.from(usageCounts.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([count, numTokens]) => {
        console.log(`  ${count} file${count === 1 ? '' : 's'}: ${numTokens} token${numTokens === 1 ? '' : 's'}`);
      });

    return {
      totalTokens: this.allTokens.size,
      usedTokens: this.tokenUsage.size,
      unusedTokens: this.unusedTokens.size,
      legacyTokens: this.legacyTokens.size,
      unusedTokenList: Array.from(this.unusedTokens),
      legacyTokenList: Array.from(this.legacyTokens)
    };
  }

  /**
   * Create design system documentation
   */
  createDesignSystemDoc(stats) {
    const docContent = `# FlavorWheel Design System Documentation

## Overview

This document outlines the FlavorWheel design system, including design tokens, usage patterns, and guidelines.

## Design Tokens

### Token Usage Statistics
- **Total fx- tokens defined**: ${stats.totalTokens}
- **Tokens actively used**: ${stats.usedTokens}
- **Unused tokens**: ${stats.unusedTokens}
- **Legacy fw- tokens**: ${stats.legacyTokens}

### Token Categories

#### Colors
- \`fx-primary\`: Primary brand color (#8B4513 - Saddle Brown)
- \`fx-primary-hover\`: Primary hover state
- \`fx-accent\`: Secondary accent color
- \`fx-text-primary\`: Primary text color
- \`fx-text-secondary\`: Secondary text color
- \`fx-text-muted\`: Muted text color
- \`fx-bg-subtle\`: Subtle background
- \`fx-card\`: Card background
- \`fx-border-default\`: Default border color

#### Spacing
- \`fx-spacing-xs\`: 0.5rem (8px)
- \`fx-spacing-sm\`: 0.75rem (12px)
- \`fx-spacing-md\`: 1rem (16px)
- \`fx-spacing-lg\`: 1.5rem (24px)
- \`fx-spacing-xl\`: 2rem (32px)
- \`fx-spacing-2xl\`: 3rem (48px)

#### Typography
- \`fx-text-xs\`: 0.75rem
- \`fx-text-sm\`: 0.875rem
- \`fx-text-base\`: 1rem
- \`fx-text-lg\`: 1.125rem
- \`fx-text-xl\`: 1.25rem
- \`fx-text-2xl\`: 1.5rem
- \`fx-text-3xl\`: 1.875rem
- \`fx-text-4xl\`: 2.25rem

#### Shadows
- \`fx-shadow-sm\`: Small shadow
- \`fx-shadow-md\`: Medium shadow
- \`fx-shadow-lg\`: Large shadow
- \`fx-shadow-xl\`: Extra large shadow

#### Borders
- \`fx-border-radius-sm\`: Small border radius (0.25rem)
- \`fx-border-radius-md\`: Medium border radius (0.375rem)
- \`fx-border-radius-lg\`: Large border radius (0.5rem)
- \`fx-border-radius-xl\`: Extra large border radius (0.75rem)

## Usage Guidelines

### Colors
- Use \`fx-primary\` for primary actions and brand elements
- Use \`fx-accent\` for secondary actions and highlights
- Use semantic text colors (\`fx-text-primary\`, \`fx-text-secondary\`, \`fx-text-muted\`) for consistency

### Spacing
- Use the standardized spacing scale for consistent layouts
- Prefer spacing tokens over arbitrary values

### Components
- All interactive elements must meet 44px minimum touch target size
- Use the Button component variants for consistent styling
- Use Card component variants for consistent card layouts

### Layout
- Use container classes: \`container-mobile\`, \`container-tablet\`, \`container-desktop\`, \`container-wide\`
- Use UnifiedAppShell with appropriate variants for different page types

## Migration Notes

### Legacy Tokens
${stats.legacyTokens > 0 ? stats.legacyTokenList.map(token => `- \`${token}\` - Replace with fx- equivalent`).join('\n') : 'No legacy tokens found'}

### Unused Tokens
${stats.unusedTokens > 0 ? stats.unusedTokenList.map(token => `- \`${token}\` - Can be safely removed`).join('\n') : 'All tokens are in use'}

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
1. Add token to \`tailwind.config.ts\`
2. Document usage in this file
3. Update component implementations
4. Add to automated tests if needed

### Removing Tokens
1. Analyze usage with this script
2. Ensure no components depend on the token
3. Remove from \`tailwind.config.ts\`
4. Update this documentation

### Updating Token Values
1. Update value in \`tailwind.config.ts\`
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
`;

    const docPath = path.join(process.cwd(), 'DESIGN_SYSTEM.md');
    fs.writeFileSync(docPath, docContent);

    console.log(`\n📝 Design system documentation created: ${docPath}`);
  }

  /**
   * Run analysis
   */
  async run() {
    console.log('🚀 Starting Design Token Analysis...\n');

    // Extract all tokens
    this.extractAllTokens();

    // Find component files
    const files = this.findComponentFiles();
    console.log(`📁 Analyzing ${files.length} component files\n`);

    // Analyze each file
    files.forEach(file => this.analyzeFile(file));

    // Calculate unused tokens
    this.calculateUnusedTokens();

    // Generate report
    const stats = this.generateReport();

    // Create documentation
    this.createDesignSystemDoc(stats);

    return stats;
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new DesignTokenAnalyzer();
  analyzer.run().then(stats => {
    console.log('\n✅ Analysis complete!');
    process.exit(stats.unusedTokens === 0 && stats.legacyTokens === 0 ? 0 : 1);
  });
}

module.exports = DesignTokenAnalyzer;
