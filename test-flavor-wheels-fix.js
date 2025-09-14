const puppeteer = require('puppeteer');

async function testFlavorWheelsFixes() {
  console.log('🧪 Testing Flavor Wheels fixes...');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to flavor wheels page
    console.log('📍 Navigating to flavor wheels page...');
    await page.goto('http://localhost:3010/en/flavor-wheels', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully');

    // Check for JavaScript errors
    const jsErrorCount = consoleErrors.filter(error =>
      error.includes('Invalid or unexpected token') ||
      error.includes('d3.color') ||
      error.includes('CSS variable')
    ).length;

    if (jsErrorCount > 0) {
      console.log('❌ JavaScript errors found:', consoleErrors.filter(error =>
        error.includes('Invalid or unexpected token') ||
        error.includes('d3.color') ||
        error.includes('CSS variable')
      ));
      return false;
    } else {
      console.log('✅ No JavaScript parsing errors');
    }

    // Check if AI Transparency button exists
    const aiButtonExists = await page.$('[data-testid*="transparency"], button:has-text("AI"), button:has-text("AI Transparency")');
    if (!aiButtonExists) {
      console.log('❌ AI Transparency button not found');
      return false;
    }
    console.log('✅ AI Transparency button found');

    // Click the AI Transparency button
    console.log('🖱️  Clicking AI Transparency button...');
    await page.click('[data-testid*="transparency"], button:has-text("AI"), button:has-text("AI Transparency")');

    // Wait a moment for modal to appear
    await page.waitForTimeout(1000);

    // Check if modal appears
    const modalVisible = await page.$('[role="dialog"], [data-state="open"], .fixed');
    if (!modalVisible) {
      console.log('❌ AI Transparency modal did not appear');
      return false;
    }

    // Check modal content
    const modalContent = await page.$eval('[role="dialog"], [data-state="open"], .fixed', el =>
      el.textContent?.includes('AI Transparency') || el.textContent?.includes('methodology')
    );

    if (!modalContent) {
      console.log('❌ Modal content incorrect');
      return false;
    }

    console.log('✅ AI Transparency modal appears with correct content');

    // Test that page still loads flavor wheel (if data available)
    const flavorWheelElement = await page.$('[data-testid="flavor-wheel-svg"], svg');
    if (flavorWheelElement) {
      console.log('✅ Flavor wheel SVG renders without errors');
    } else {
      console.log('⚠️  Flavor wheel not visible (may be due to no data)');
    }

    console.log('🎉 All tests passed! Fixes are working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testFlavorWheelsFixes().then(success => {
  process.exit(success ? 0 : 1);
});
