#!/usr/bin/env node

/**
 * FlavorWheel Audit v2.0 - Report Generator
 *
 * Generates comprehensive audit reports from Playwright test results
 * focusing on the critical issues identified in the styling and error analysis.
 */

const fs = require('fs')
const path = require('path')

function generateAuditReport() {
  const args = process.argv.slice(2)
  const resultsPath = getArgValue(args, '--results')
  const outputPath = getArgValue(args, '--output') || 'audit-report.json'

  if (!resultsPath) {
    console.error('❌ --results path is required')
    process.exit(1)
  }

  try {
    // Read Playwright results
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))

    // Analyze results for critical issues
    const analysis = analyzeCriticalIssues(results)

    // Generate comprehensive report
    const report = {
      auditVersion: '2.0',
      generatedAt: new Date().toISOString(),
      summary: {
        totalTests: results.stats.expected,
        passedTests: results.stats.passes,
        failedTests: results.stats.failures,
        passRate: Math.round((results.stats.passes / results.stats.expected) * 100)
      },
      criticalIssuesAnalysis: analysis,
      userFlowsStatus: analyzeUserFlows(results),
      recommendations: generateRecommendations(analysis),
      metadata: {
        playwrightVersion: results.config?.version,
        testEnvironment: process.env.NODE_ENV || 'test',
        browser: results.config?.projects?.[0]?.name
      }
    }

    // Write report
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`✅ Audit report generated: ${outputPath}`)
    console.log(`📊 Pass Rate: ${report.summary.passRate}%`)
    console.log(`🎯 Critical Issues Resolved: ${analysis.resolvedCount}/${analysis.totalCount}`)

  } catch (error) {
    console.error('❌ Failed to generate audit report:', error.message)
    process.exit(1)
  }
}

function analyzeCriticalIssues(results) {
  const criticalIssues = {
    mobileNavLogo: { status: false, tests: [] },
    flavorWheelOverflow: { status: false, tests: [] },
    buttonContrast: { status: false, tests: [] },
    errorHandling: { status: false, tests: [] },
    accessibility: { status: false, tests: [] },
    performance: { status: false, tests: [] }
  }

  // Analyze each test result
  results.suites?.forEach(suite => {
    suite.tests?.forEach(test => {
      const testTitle = test.title.toLowerCase()

      // Map tests to critical issues
      if (testTitle.includes('mobile navigation logo')) {
        criticalIssues.mobileNavLogo.tests.push(test)
        if (test.state === 'passed') criticalIssues.mobileNavLogo.status = true
      }

      if (testTitle.includes('flavor wheel') && testTitle.includes('overflow')) {
        criticalIssues.flavorWheelOverflow.tests.push(test)
        if (test.state === 'passed') criticalIssues.flavorWheelOverflow.status = true
      }

      if (testTitle.includes('button contrast') || testTitle.includes('wcag')) {
        criticalIssues.buttonContrast.tests.push(test)
        if (test.state === 'passed') criticalIssues.buttonContrast.status = true
      }

      if (testTitle.includes('error') && (testTitle.includes('500') || testTitle.includes('boundary'))) {
        criticalIssues.errorHandling.tests.push(test)
        if (test.state === 'passed') criticalIssues.errorHandling.status = true
      }

      if (testTitle.includes('accessibility') || testTitle.includes('keyboard')) {
        criticalIssues.accessibility.tests.push(test)
        if (test.state === 'passed') criticalIssues.accessibility.status = true
      }

      if (testTitle.includes('performance') || testTitle.includes('css bundle') || testTitle.includes('60fps')) {
        criticalIssues.performance.tests.push(test)
        if (test.state === 'passed') criticalIssues.performance.status = true
      }
    })
  })

  const resolvedCount = Object.values(criticalIssues).filter(issue => issue.status).length
  const totalCount = Object.keys(criticalIssues).length

  return {
    issues: criticalIssues,
    resolvedCount,
    totalCount,
    resolutionRate: Math.round((resolvedCount / totalCount) * 100)
  }
}

function analyzeUserFlows(results) {
  const userFlows = [
    { id: 'UF-001', name: 'Registration → Tasting → Flavor Wheel', status: false },
    { id: 'UF-002', name: 'Error Handling & Boundaries', status: false },
    { id: 'UF-003', name: 'Mobile Responsiveness', status: false },
    { id: 'UF-004', name: 'Accessibility & Navigation', status: false },
    { id: 'UF-005', name: 'Performance', status: false }
  ]

  results.suites?.forEach(suite => {
    suite.tests?.forEach(test => {
      const testTitle = test.title.toLowerCase()

      userFlows.forEach(flow => {
        if (testTitle.includes(flow.name.toLowerCase().split(' ')[0])) {
          if (test.state === 'passed') flow.status = true
        }
      })
    })
  })

  return userFlows
}

function generateRecommendations(analysis) {
  const recommendations = []

  if (!analysis.issues.mobileNavLogo.status) {
    recommendations.push('Fix mobile navigation logo positioning conflicts')
  }

  if (!analysis.issues.flavorWheelOverflow.status) {
    recommendations.push('Implement proper flavor wheel SVG scaling without overflow')
  }

  if (!analysis.issues.buttonContrast.status) {
    recommendations.push('Update button color system for WCAG AA compliance')
  }

  if (!analysis.issues.errorHandling.status) {
    recommendations.push('Add comprehensive error boundaries and user-friendly messages')
  }

  if (!analysis.issues.accessibility.status) {
    recommendations.push('Improve accessibility landmarks and keyboard navigation')
  }

  if (!analysis.issues.performance.status) {
    recommendations.push('Optimize CSS bundle size and font loading performance')
  }

  return recommendations
}

function getArgValue(args, flag) {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

// Run the script
if (require.main === module) {
  generateAuditReport()
}

module.exports = { generateAuditReport }


