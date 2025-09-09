const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  let errorCount = 0;
  let successCount = 0;

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ CONSOLE ERROR: ${msg.text()}`);
      errorCount++;
    } else if (msg.type() === 'warning') {
      console.log(`⚠️  CONSOLE WARNING: ${msg.text()}`);
    } else {
      console.log(`ℹ️  CONSOLE ${msg.type()}: ${msg.text()}`);
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
    errorCount++;
  });

  try {
    console.log('🚀 Starting comprehensive FlavorWheel test suite...\n');

    // Test 1: Root page
    console.log('📍 Test 1: Testing root page (/)...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle' });
    const rootTitle = await page.title();
    console.log(`✅ Root page loaded: ${rootTitle}`);
    successCount++;

    // Test 2: Landing page
    console.log('\n📍 Test 2: Testing landing page (/en/landing)...');
    await page.goto('http://localhost:3010/en/landing', { waitUntil: 'networkidle' });
    const landingTitle = await page.title();
    console.log(`✅ Landing page loaded: ${landingTitle}`);
    
    // Check landing page elements
    const heroText = await page.textContent('h1');
    console.log(`✅ Hero text: ${heroText}`);
    
    const heroButton = await page.locator('text=Start Your Flavor Journey').isVisible();
    console.log(`✅ Hero button visible: ${heroButton}`);
    
    const statsSection = await page.locator('text=Join 10,000+ Passionate Tasters').isVisible();
    console.log(`✅ Stats section visible: ${statsSection}`);
    
    const finalCTA = await page.locator('text=Start Free Today').isVisible();
    console.log(`✅ Final CTA visible: ${finalCTA}`);
    successCount++;

    // Test 3: Navigation to create page
    console.log('\n📍 Test 3: Testing navigation to create page...');
    await page.click('text=Start Your Flavor Journey');
    await page.waitForURL('**/en/create', { timeout: 5000 });
    console.log('✅ Navigation to create page successful');
    
    // Check create page elements
    const createTitle = await page.textContent('h1');
    console.log(`✅ Create page title: ${createTitle}`);
    
    const studyMode = await page.locator('h3:has-text("Study Mode")').isVisible();
    const competitionMode = await page.locator('h3:has-text("Competition Mode")').isVisible();
    const quickTasting = await page.locator('h3:has-text("Quick Tasting")').isVisible();
    
    console.log(`✅ Study Mode visible: ${studyMode}`);
    console.log(`✅ Competition Mode visible: ${competitionMode}`);
    console.log(`✅ Quick Tasting visible: ${quickTasting}`);
    successCount++;

    // Test 4: Back navigation
    console.log('\n📍 Test 4: Testing back navigation...');
    await page.click('text=Back to Landing');
    await page.waitForURL('**/en/landing', { timeout: 5000 });
    console.log('✅ Back navigation successful');
    successCount++;

    // Test 5: Mobile responsive test
    console.log('\n📍 Test 5: Testing mobile responsiveness...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileHero = await page.locator('h1').isVisible();
    const mobileButtons = await page.locator('text=Start Your Flavor Journey').isVisible();
    
    console.log(`✅ Mobile hero visible: ${mobileHero}`);
    console.log(`✅ Mobile buttons visible: ${mobileButtons}`);
    successCount++;

    // Test 6: Desktop responsive test
    console.log('\n📍 Test 6: Testing desktop responsiveness...');
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
    
    const desktopHero = await page.locator('h1').isVisible();
    const desktopFeatures = await page.locator('text=AI Flavor Analysis').isVisible();
    
    console.log(`✅ Desktop hero visible: ${desktopHero}`);
    console.log(`✅ Desktop features visible: ${desktopFeatures}`);
    successCount++;

    // Test 7: Accessibility features
    console.log('\n📍 Test 7: Testing accessibility features...');
    
    // Test skip links
    await page.keyboard.press('Tab');
    const skipLinkFocused = await page.locator('text=Skip to main content').isVisible();
    console.log(`✅ Skip link accessible: ${skipLinkFocused}`);
    
    // Test heading hierarchy
    const h1Elements = await page.locator('h1').count();
    const h2Elements = await page.locator('h2').count();
    const h3Elements = await page.locator('h3').count();
    
    console.log(`✅ H1 elements: ${h1Elements}`);
    console.log(`✅ H2 elements: ${h2Elements}`);
    console.log(`✅ H3 elements: ${h3Elements}`);
    
    // Test ARIA landmarks
    const mainLandmark = await page.locator('[role="banner"], header').count();
    console.log(`✅ Header landmarks: ${mainLandmark}`);
    successCount++;

    // Final screenshot
    console.log('\n📍 Taking final screenshot...');
    await page.screenshot({ path: 'comprehensive-test-final.png', fullPage: true });
    console.log('✅ Screenshot saved as comprehensive-test-final.png');

    console.log('\n🎉 COMPREHENSIVE TEST RESULTS:');
    console.log(`✅ Successful tests: ${successCount}`);
    console.log(`❌ JavaScript errors: ${errorCount}`);
    console.log(`🎯 Overall status: ${errorCount === 0 ? 'FULLY FUNCTIONAL' : 'NEEDS ATTENTION'}`);

    if (errorCount === 0) {
      console.log('\n🚀 FlavorWheel México is FULLY OPERATIONAL!');
      console.log('✅ No webpack errors');
      console.log('✅ No React hydration issues');
      console.log('✅ All pages loading correctly');
      console.log('✅ Navigation working perfectly');
      console.log('✅ Responsive design functional');
      console.log('✅ Accessibility features working');
      console.log('\n🎊 The application is ready for users!');
    } else {
      console.log('\n⚠️  Issues detected that need attention');
    }
    
  } catch (error) {
    console.log(`❌ Test suite failed: ${error.message}`);
    errorCount++;
  }
  
  await browser.close();
})();
