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
    console.log('Testing landing page at http://localhost:3010/en/landing...');
    await page.goto('http://localhost:3010/en/landing', { waitUntil: 'networkidle' });
    
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'landing-test.png', fullPage: true });
    
    console.log('Checking page content...');
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const h1Text = await page.textContent('h1');
    console.log(`H1 text: ${h1Text}`);
    
    const heroButton = await page.locator('text=Start Your Flavor Journey').isVisible();
    console.log(`Hero button visible: ${heroButton}`);
    
    const demoButton = await page.locator('text=Watch Demo').isVisible();
    console.log(`Demo button visible: ${demoButton}`);
    
    const statsSection = await page.locator('text=Join 10,000+ Passionate Tasters').isVisible();
    console.log(`Stats section visible: ${statsSection}`);
    
    console.log('Testing navigation...');
    await page.click('text=Start Your Flavor Journey');
    await page.waitForURL('**/en/create', { timeout: 5000 });
    console.log('✅ Navigation to create page successful!');
    
    console.log('Going back to landing page...');
    await page.goBack();
    
    console.log('Testing final CTA...');
    const finalCTA = await page.locator('text=Start Free Today').isVisible();
    console.log(`Final CTA visible: ${finalCTA}`);
    
    console.log('✅ Landing page test completed successfully!');
    
  } catch (error) {
    console.log(`❌ Landing page test failed: ${error.message}`);
  }
  
  await browser.close();
})();

