const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\bradynk\\Desktop\\nominapro\\screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // Login
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.locator('input[type="email"]').fill('elsalvadorescristo777@gmail.com');
  await page.locator('input[type="password"]').fill('123456789');
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(3000);

  // Click Nomina
  await page.locator('button:has-text("Nomina")').first().click();
  await page.waitForTimeout(2500);

  // Screenshot of LOTTT tab (default active tab)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '13-nomina-lottt-tab.png'), fullPage: false });
  console.log('Screenshot saved: 13-nomina-lottt-tab.png (LOTTT tab / default view)');

  // Scroll up to see the toolbar
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '14-toolbar-top.png'), fullPage: false });
  console.log('Screenshot saved: 14-toolbar-top.png (toolbar view scrolled to top)');

  // Click "RECIBO 2 (PRORRATEO)" tab
  const prorrateoTab = page.locator('button:has-text("PRORRATEO"), button:has-text("Prorrateo"), button:has-text("RECIBO 2")').first();
  const count = await prorrateoTab.count();
  console.log('Prorrateo tab found:', count);

  if (count > 0) {
    await prorrateoTab.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '15-prorrateo-tab.png'), fullPage: false });
    console.log('Screenshot saved: 15-prorrateo-tab.png');

    // Get all buttons in Prorrateo view
    const prorrateoButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim().substring(0, 80),
        visible: b.offsetParent !== null,
      })).filter(b => b.text.length > 0 && b.visible);
    });
    console.log('Prorrateo tab buttons (visible):', JSON.stringify(prorrateoButtons, null, 2));

    // Check for "Planilla General Prorrateo" button
    const pgProrrateo = await page.locator('text=PLANILLA GENERAL PRORRATEO, text=Planilla General Prorrateo').count();
    console.log('Planilla General Prorrateo button found:', pgProrrateo);

    // Get page text
    const prorrateoText = await page.evaluate(() => {
      // Get visible text from the main content
      return document.body.innerText.substring(0, 3000);
    });
    console.log('Prorrateo tab text:\n', prorrateoText.substring(0, 1500));

    // Full page screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '16-prorrateo-full.png'), fullPage: true });
    console.log('Screenshot saved: 16-prorrateo-full.png');
  }

  await browser.close();
}

main().catch(console.error);
