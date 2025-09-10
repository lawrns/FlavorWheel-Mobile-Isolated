#!/usr/bin/env node

/**
 * Touch Target Validation Script
 * Validates all interactive elements meet 44px minimum touch target size
 * Part of Phase 3: Responsive Design Audit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TouchTargetValidator {
  constructor() {
    this.issues = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Validate touch targets in a file
   */
  validateFile(filePath) {
    console.log(`🔍 Validating touch targets in: ${path.relative(process.cwd(), filePath)}`);

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // Check for interactive elements without proper sizing
    const interactiveElements = [
      // Buttons and links
      /<button[^>]*className="[^"]*"/g,
      /<a[^>]*href="[^"]*"[^>]*className="[^"]*"/g,
      // Input elements
      /<input[^>]*className="[^"]*"/g,
      /<textarea[^>]*className="[^"]*"/g,
      /<select[^>]*className="[^"]*"/g,
      // Custom interactive elements
      /\brole="button"[^>]*className="[^"]*"/g,
      /\brole="tab"[^>]*className="[^"]*"/g,
      /\brole="menuitem"[^>]*className="[^"]*"/g,
    ];

    lines.forEach((line, index) => {
      interactiveElements.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          this.validateInteractiveElement(line, index + 1, filePath);
        }
      });
    });
  }

  /**
   * Validate a single interactive element
   */
  validateInteractiveElement(line, lineNumber, filePath) {
    const classNameMatch = line.match(/className="([^"]*)"/);

    if (classNameMatch) {
      const classes = classNameMatch[1];

      // Check for minimum touch target classes
      const hasMinTouchTarget = this.hasMinTouchTarget(classes);
      const hasProperSizing = this.hasProperSizing(classes);

      if (!hasMinTouchTarget && !hasProperSizing) {
        this.failed++;
        this.issues.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNumber,
          element: line.trim(),
          issue: 'Missing minimum touch target (44px) or proper sizing class',
          suggestion: 'Add min-h-[44px] min-w-[44px] or use touch-friendly components'
        });
      } else {
        this.passed++;
      }
    }
  }

  /**
   * Check if classes include minimum touch target
   */
  hasMinTouchTarget(classes) {
    return classes.includes('min-h-[44px]') ||
           classes.includes('min-w-[44px]') ||
           classes.includes('touch-manipulation') ||
           classes.includes('min-h-11'); // 44px in Tailwind
  }

  /**
   * Check if classes include proper sizing
   */
  hasProperSizing(classes) {
    // Check for button variants that include touch targets
    return classes.includes('variant="primary"') ||
           classes.includes('variant="secondary"') ||
           classes.includes('size="lg"') ||
           classes.includes('size="md"') ||
           classes.includes('h-11') || // 44px
           classes.includes('h-12') || // 48px
           classes.includes('w-11') || // 44px
           classes.includes('w-12');   // 48px
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
   * Run validation
   */
  async run() {
    console.log('🚀 Starting Touch Target Validation...\n');

    const files = this.findComponentFiles();
    console.log(`📁 Found ${files.length} component files to validate\n`);

    files.forEach(file => this.validateFile(file));

    this.printReport();
  }

  /**
   * Print validation report
   */
  printReport() {
    console.log('\n📊 Touch Target Validation Report');
    console.log('=====================================');

    if (this.issues.length === 0) {
      console.log('✅ All touch targets are properly sized!');
      console.log(`   ✓ ${this.passed} elements passed validation`);
    } else {
      console.log(`❌ Found ${this.issues.length} touch target issues`);
      console.log(`   ✓ ${this.passed} elements passed validation`);
      console.log(`   ✗ ${this.failed} elements failed validation`);

      console.log('\n🔧 Issues to fix:');
      this.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.file}:${issue.line}`);
        console.log(`   Element: ${issue.element.substring(0, 60)}${issue.element.length > 60 ? '...' : ''}`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Suggestion: ${issue.suggestion}`);
      });

      console.log('\n💡 Quick fixes:');
      console.log('   - Add min-h-[44px] min-w-[44px] to interactive elements');
      console.log('   - Use <Button> components which include touch targets');
      console.log('   - Add touch-manipulation class for better touch response');
    }

    console.log('\n📏 Touch Target Standards:');
    console.log('   - Minimum size: 44px x 44px (Apple Human Interface Guidelines)');
    console.log('   - WCAG AA compliant: 44px minimum for touch targets');
    console.log('   - Finger-friendly: 48px recommended for comfort');

    return this.issues.length === 0;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new TouchTargetValidator();
  validator.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = TouchTargetValidator;
