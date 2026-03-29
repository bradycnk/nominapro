const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'C:\\Users\\bradynk\\Desktop\\nominapro\\screenshots';

async function main() {
  const browser = await chromium.launch({ headless: true, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[error] ${msg.text()}`);
  });
  page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));

  try {
    // Login
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.locator('input[type="email"]').fill('elsalvadorescristo777@gmail.com');
    await page.locator('input[type="password"]').fill('123456789');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(3000);
    console.log('Logged in, URL:', page.url());

    // Click "Nomina" in sidebar
    await page.locator('button:has-text("Nomina")').first().click();
    await page.waitForTimeout(2500);
    console.log('Clicked Nomina, URL:', page.url());

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10-nomina-view.png'), fullPage: true });
    console.log('Screenshot saved: 10-nomina-view.png');

    const nominaText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
    console.log('Nomina view text:\n', nominaText);

    // Get ALL buttons visible
    const allButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, [role="button"], .btn')).map(b => ({
        text: b.innerText.trim().substring(0, 100),
        title: b.title || b.getAttribute('aria-label') || '',
        id: b.id,
        visible: b.offsetParent !== null,
        class: b.className.substring(0, 120)
      })).filter(b => b.text.length > 0 || b.title.length > 0);
    });
    console.log('All buttons in Nomina view:', JSON.stringify(allButtons, null, 2));

    // Get all tabs
    const allTabs = await page.evaluate(() => {
      const selectors = ['[role="tab"]', '.tab', 'button[data-tab]', '.tab-button', '.tabs > button', '.tab-list button', '.tab-nav button'];
      const found = [];
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        if (els.length > 0) {
          els.forEach(el => found.push({ selector: sel, text: el.innerText.trim(), active: el.getAttribute('aria-selected') === 'true' || el.classList.contains('active') }));
        }
      }
      return found;
    });
    console.log('Tabs found:', JSON.stringify(allTabs));

    // Look for "Procesar Nomina" button/link
    const procesarSelectors = [
      'text=Procesar Nómina',
      'text=Procesar Nomina',
      'button:has-text("Procesar")',
      'a:has-text("Procesar")',
    ];
    for (const sel of procesarSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`Found "Procesar" element with: ${sel} (${count})`);
        await page.locator(sel).first().click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11-procesar-nomina.png'), fullPage: true });
        console.log('Screenshot saved: 11-procesar-nomina.png');

        const procText = await page.evaluate(() => document.body.innerText.substring(0, 5000));
        console.log('Procesar Nomina text:\n', procText);

        // Get buttons here
        const procButtons = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('button')).map(b => ({
            text: b.innerText.trim().substring(0, 100),
            visible: b.offsetParent !== null,
          })).filter(b => b.text.length > 0);
        });
        console.log('Buttons in Procesar Nomina:', JSON.stringify(procButtons, null, 2));
        break;
      }
    }

    // Full page screenshot of current state
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '12-final.png'), fullPage: true });

    // Get the full DOM structure of the main content area
    const mainContent = await page.evaluate(() => {
      const main = document.querySelector('main, #main, .main-content, [role="main"]');
      if (main) return main.innerHTML.substring(0, 8000);
      return document.body.innerHTML.substring(0, 8000);
    });
    console.log('\nMain content HTML (first 4000 chars):\n', mainContent.substring(0, 4000));

    // Check all text content for specific keywords
    const fullText = await page.evaluate(() => document.body.innerText);
    const keywords = ['LOTTT', 'Prorrateo', 'Planilla', 'Planilla General', 'Procesar', 'Nómina', 'toolbar', 'tab'];
    for (const kw of keywords) {
      const found = fullText.toLowerCase().includes(kw.toLowerCase());
      console.log(`Keyword "${kw}" present in page: ${found}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error2.png'), fullPage: true }).catch(() => {});
  }

  console.log('\n=== Console Errors ===');
  consoleErrors.forEach(e => console.log(e));

  await browser.close();
}

main().catch(console.error);
