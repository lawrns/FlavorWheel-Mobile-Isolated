const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`PAGE ERROR: ${error.message}`);
  });

  try {
    console.log('Navigating to http://localhost:3010...');
    await page.goto('http://localhost:3010', { waitUntil: 'networkidle' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
    
    console.log('Checking page content...');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const h1Text = await page.textContent('h1');
    console.log(`H1 text: ${h1Text}`);
    
    const buttonExists = await page.locator('button').isVisible();
    console.log(`Button visible: ${buttonExists}`);
    
    console.log('Testing button interaction...');
    await page.click('button');
    
    console.log('✅ Browser test completed successfully!');
    
  } catch (error) {
    console.log(`❌ Browser test failed: ${error.message}`);
  }
  
  await browser.close();
})();

