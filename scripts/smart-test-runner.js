#!/usr/bin/env node

/**
 * Smart Test Runner v2.0 - Intelligent E2E Testing Infrastructure
 *
 * Features:
 * - Stops after configurable error threshold (default: 5)
 * - Analyzes error patterns and suggests fixes
 * - Auto-fixes common issues
 * - Provides interactive guidance for complex problems
 * - Generates comprehensive testing reports
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

class SmartTestRunner {
  constructor() {
    this.errorThreshold = parseInt(process.argv[2]) || 5
    this.errors = []
    this.errorPatterns = new Map()
    this.autoFixedCount = 0
    this.startTime = Date.now()
  }

  async run() {
    console.log('🚀 Smart Test Runner v2.0 Starting...')
    console.log(`📊 Error threshold: ${this.errorThreshold}`)
    console.log('=' .repeat(60))

    try {
      await this.runFullTestSuite()
      this.generateReport()
    } catch (error) {
      console.error('❌ Smart Test Runner failed:', error.message)
      process.exit(1)
    }
  }

  async runFullTestSuite() {
    const testSuites = [
      { name: 'Unit Tests', command: 'npm run test:unit', type: 'unit' },
      { name: 'Component Tests', command: 'npm run test:component', type: 'component' },
      { name: 'Service Integration', command: 'npm run test:services', type: 'integration' },
      { name: 'Hooks Tests', command: 'npm run test:hooks', type: 'hooks' },
      { name: 'E2E Tests', command: 'npm run test:e2e', type: 'e2e' },
      { name: 'Accessibility', command: 'npx playwright test __tests__/e2e/a11y-axe.spec.ts', type: 'accessibility' }
    ]

    for (const suite of testSuites) {
      if (this.errors.length >= this.errorThreshold) {
        console.log(`🚨 Error threshold (${this.errorThreshold}) reached. Stopping execution.`)
        break
      }

      console.log(`\n🎯 Running ${suite.name}...`)
      await this.runTestSuite(suite)
    }

    console.log(`\n📈 Test Summary:`)
    console.log(`   Total errors found: ${this.errors.length}`)
    console.log(`   Auto-fixed: ${this.autoFixedCount}`)
    console.log(`   Error threshold: ${this.errorThreshold}`)
  }

  async runTestSuite(suite) {
    return new Promise((resolve) => {
      const [command, ...args] = suite.command.split(' ')
      const child = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      })

      let output = ''
      let errorOutput = ''

      child.stdout.on('data', (data) => {
        output += data.toString()
        process.stdout.write(data)
      })

      child.stderr.on('data', (data) => {
        errorOutput += data.toString()
        process.stderr.write(data)
      })

      child.on('close', (code) => {
        if (code !== 0) {
          const errors = this.parseErrors(errorOutput + output, suite.type)
          this.errors.push(...errors)

          if (this.errors.length >= this.errorThreshold) {
            console.log(`🚨 Too many errors (${this.errors.length}). Will analyze and suggest fixes.`)
          }
        }
        resolve()
      })
    })
  }

  parseErrors(output, type) {
    const errors = []

    // Pattern matching for different test types
    const patterns = {
      unit: [
        /Error: (.+?)(\n|$)/g,
        /FAIL (.+?)(\n|$)/g,
        /Expected (.+?) but received (.+?)(\n|$)/g
      ],
      component: [
        /Warning: (.+?)(\n|$)/g,
        /Error: (.+?)(\n|$)/g,
        /FAIL (.+?)(\n|$)/g
      ],
      e2e: [
        /Error: (.+?)(\n|$)/g,
        /FAIL (.+?)(\n|$)/g,
        /expect\(.+?\)\.toBeVisible\(\) failed/g
      ],
      accessibility: [
        /Error: (.+?)(\n|$)/g,
        /VIOLATION (.+?)(\n|$)/g
      ]
    }

    const typePatterns = patterns[type] || patterns.unit

    for (const pattern of typePatterns) {
      let match
      while ((match = pattern.exec(output)) !== null) {
        errors.push({
          type,
          message: match[1] || match[0],
          pattern: pattern.source,
          timestamp: new Date().toISOString()
        })
      }
    }

    return errors
  }

  analyzeErrorPatterns() {
    console.log('\n🔍 Error Pattern Analysis:')

    // Group errors by pattern
    this.errors.forEach(error => {
      const key = this.getErrorKey(error)
      if (!this.errorPatterns.has(key)) {
        this.errorPatterns.set(key, [])
      }
      this.errorPatterns.get(key).push(error)
    })

    // Analyze each pattern
    for (const [pattern, errors] of this.errorPatterns) {
      console.log(`\n📋 Pattern: ${pattern} (${errors.length} occurrences)`)

      // Suggest fixes based on pattern
      const suggestion = this.getFixSuggestion(pattern, errors[0])
      if (suggestion) {
        console.log(`💡 Suggested Fix: ${suggestion}`)

        // Attempt auto-fix for known patterns
        if (this.canAutoFix(pattern)) {
          const fixed = this.attemptAutoFix(pattern, errors)
          if (fixed) {
            console.log(`✅ Auto-fixed ${fixed} instances`)
            this.autoFixedCount += fixed
          }
        }
      }
    }
  }

  getErrorKey(error) {
    // Create a normalized key for pattern matching
    const message = error.message.toLowerCase()
    if (message.includes('navigation') && message.includes('not found')) {
      return 'navigation_missing'
    }
    if (message.includes('axe-core') && message.includes('cannot find')) {
      return 'missing_dependency'
    }
    if (message.includes('expect') && message.includes('tobevisible')) {
      return 'visibility_assertion_failed'
    }
    if (message.includes('timeout') && message.includes('waiting')) {
      return 'timeout_error'
    }
    return error.type + '_' + message.substring(0, 50).replace(/\W/g, '_')
  }

  getFixSuggestion(pattern, error) {
    const suggestions = {
      navigation_missing: 'Check if page uses AppShell. Landing page intentionally has no navigation.',
      missing_dependency: 'Run: npm install -D @axe-core/playwright',
      visibility_assertion_failed: 'Element may not be rendered. Check AppShell usage and component mounting.',
      timeout_error: 'Increase timeout or check if element is conditionally rendered.'
    }

    return suggestions[pattern] || 'Manual investigation required. Check test logs for details.'
  }

  canAutoFix(pattern) {
    const autoFixable = ['missing_dependency']
    return autoFixable.includes(pattern)
  }

  attemptAutoFix(pattern, errors) {
    if (pattern === 'missing_dependency') {
      try {
        console.log('🔧 Attempting to install missing dependency...')
        execSync('npm install -D @axe-core/playwright', { stdio: 'inherit' })
        return errors.length
      } catch (error) {
        console.log('❌ Auto-fix failed:', error.message)
        return 0
      }
    }
    return 0
  }

  generateReport() {
    const duration = Date.now() - this.startTime
    const report = {
      timestamp: new Date().toISOString(),
      duration: `${Math.round(duration / 1000)}s`,
      errorThreshold: this.errorThreshold,
      totalErrors: this.errors.length,
      autoFixed: this.autoFixedCount,
      remainingErrors: this.errors.length - this.autoFixedCount,
      errorPatterns: Array.from(this.errorPatterns.entries()).map(([pattern, errors]) => ({
        pattern,
        count: errors.length,
        sample: errors[0].message,
        suggestion: this.getFixSuggestion(pattern, errors[0])
      })),
      errors: this.errors.slice(0, 10), // First 10 errors for detail
      recommendations: this.generateRecommendations()
    }

    const reportPath = path.join(process.cwd(), 'test-results', 'smart-test-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    console.log('\n📄 Report generated:', reportPath)
    console.log('🎯 Summary:')
    console.log(`   Duration: ${report.duration}`)
    console.log(`   Errors Found: ${report.totalErrors}`)
    console.log(`   Auto-Fixed: ${report.autoFixed}`)
    console.log(`   Remaining: ${report.remainingErrors}`)

    if (report.recommendations.length > 0) {
      console.log('\n📋 Next Steps:')
      report.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`)
      })
    }
  }

  generateRecommendations() {
    const recommendations = []

    if (this.errors.length >= this.errorThreshold) {
      recommendations.push('Consider reducing error threshold or fixing critical issues first')
    }

    if (this.autoFixedCount > 0) {
      recommendations.push('Re-run tests to verify auto-fixes were successful')
    }

    if (this.errorPatterns.has('navigation_missing')) {
      recommendations.push('Review AppShell usage across pages - ensure consistent navigation')
    }

    if (this.errorPatterns.has('visibility_assertion_failed')) {
      recommendations.push('Check component mounting and conditional rendering in test pages')
    }

    if (this.errors.length === 0) {
      recommendations.push('🎉 All tests passed! Consider adding more test coverage.')
    }

    return recommendations
  }
}

// Run the smart test runner
if (require.main === module) {
  const runner = new SmartTestRunner()
  runner.run().catch(console.error)
}

module.exports = SmartTestRunner
