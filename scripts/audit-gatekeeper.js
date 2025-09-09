#!/usr/bin/env node

/**
 * FlavorWheel Audit v2.0 - Gatekeeper
 *
 * Determines if the audit passes based on critical issue resolution
 * and enforces the 100% pass rate requirement for critical user flows.
 */

const fs = require('fs')

function auditGatekeeper() {
  const args = process.argv.slice(2)
  const reportPath = getArgValue(args, '--report')
  const blockOnFailures = getArgValue(args, '--block-on-failures') === 'true'
  const minimumPassRate = parseInt(getArgValue(args, '--minimum-pass-rate') || '100')

  if (!reportPath) {
    console.error('❌ --report path is required')
    process.exit(1)
  }

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

    console.log('🔍 FlavorWheel Audit v2.0 - Gatekeeper Check')
    console.log('=' .repeat(50))

    // Check overall pass rate
    const overallPass = checkOverallPassRate(report, minimumPassRate)

    // Check critical user flows
    const userFlowsPass = checkCriticalUserFlows(report)

    // Check critical issues resolution
    const criticalIssuesPass = checkCriticalIssuesResolution(report)

    // Determine final status
    const auditPassed = overallPass && userFlowsPass && criticalIssuesPass

    console.log('=' .repeat(50))
    console.log(`🎯 AUDIT RESULT: ${auditPassed ? '✅ PASS' : '❌ FAIL'}`)

    if (!auditPassed && blockOnFailures) {
      console.error('🚫 Audit failed - blocking deployment')
      console.error('📋 See recommendations in the audit report')
      process.exit(1)
    } else if (!auditPassed) {
      console.warn('⚠️ Audit failed but not blocking (block-on-failures=false)')
    } else {
      console.log('🎉 All critical issues resolved - proceeding with confidence!')
    }

  } catch (error) {
    console.error('❌ Failed to run audit gatekeeper:', error.message)
    process.exit(1)
  }
}

function checkOverallPassRate(report, minimumPassRate) {
  const passRate = report.summary.passRate
  const passed = passRate >= minimumPassRate

  console.log(`📊 Overall Pass Rate: ${passRate}% (Required: ${minimumPassRate}%)`)
  console.log(`   Status: ${passed ? '✅ PASS' : '❌ FAIL'}`)

  return passed
}

function checkCriticalUserFlows(report) {
  console.log('\n🔄 Critical User Flows Status:')

  let allPassed = true
  report.userFlowsStatus.forEach(flow => {
    const status = flow.status ? '✅' : '❌'
    console.log(`   ${status} ${flow.id}: ${flow.name}`)
    if (!flow.status) allPassed = false
  })

  console.log(`   Overall: ${allPassed ? '✅ PASS' : '❌ FAIL'}`)
  return allPassed
}

function checkCriticalIssuesResolution(report) {
  console.log('\n🎯 Critical Issues Resolution:')

  const analysis = report.criticalIssuesAnalysis
  const resolved = analysis.resolvedCount
  const total = analysis.totalCount
  const resolutionRate = analysis.resolutionRate

  console.log(`   Resolved: ${resolved}/${total} (${resolutionRate}%)`)

  // Check individual critical issues
  Object.entries(analysis.issues).forEach(([issue, data]) => {
    const status = data.status ? '✅' : '❌'
    const testCount = data.tests.length
    console.log(`   ${status} ${formatIssueName(issue)} (${testCount} tests)`)
  })

  // Must resolve all critical issues for v2.0
  const allResolved = resolved === total
  console.log(`   Overall: ${allResolved ? '✅ PASS' : '❌ FAIL'}`)

  return allResolved
}

function formatIssueName(issue) {
  const names = {
    mobileNavLogo: 'Mobile Navigation Logo',
    flavorWheelOverflow: 'Flavor Wheel Overflow',
    buttonContrast: 'Button Contrast Violations',
    errorHandling: 'Error Handling & Boundaries',
    accessibility: 'Accessibility Compliance',
    performance: 'Performance Optimization'
  }
  return names[issue] || issue
}

function getArgValue(args, flag) {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

// Export for testing
module.exports = { auditGatekeeper }

// Run the script
if (require.main === module) {
  auditGatekeeper()
}


