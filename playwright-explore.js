const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'C:\\Users\\bradynk\\Desktop\\nominapro\\screenshots';

async function main() {
  // Ensure screenshots dir exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const consoleMessages = [];
  const consoleErrors = [];

  const browser = await chromium.launch({ headless: true, slowMo: 300 });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  // Capture console messages
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  try {
    // 1. Navigate to login page
    console.log('Navigating to http://localhost:3000/...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());

    // Screenshot of login page
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png'), fullPage: true });
    console.log('Screenshot saved: 01-login-page.png');

    // List all visible text on login page
    const loginText = await page.evaluate(() => document.body.innerText.substring(0, 2000));
    console.log('Login page text:', loginText);

    // List all input fields
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        name: i.name,
        placeholder: i.placeholder,
        id: i.id
      }));
    });
    console.log('Input fields:', JSON.stringify(inputs));

    // List all buttons
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(),
        type: b.type,
        id: b.id,
        class: b.className.substring(0, 80)
      }));
    });
    console.log('Buttons on login page:', JSON.stringify(buttons));

    // 2. Log in
    console.log('\nAttempting login...');

    // Try to find email input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="correo" i]').first();
    await emailInput.fill('elsalvadorescristo777@gmail.com');
    console.log('Filled email');

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill('123456789');
    console.log('Filled password');

    // Screenshot before submitting
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-login-filled.png'), fullPage: true });
    console.log('Screenshot saved: 02-login-filled.png');

    // Click submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar"), button:has-text("Ingresar")').first();
    await submitBtn.click();
    console.log('Clicked submit');

    // Wait for navigation
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-after-login.png'), fullPage: true });
    console.log('Screenshot saved: 03-after-login.png');
    console.log('URL after login:', page.url());

    const afterLoginText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('After login text:', afterLoginText);

    // Wait for dashboard to fully load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-dashboard.png'), fullPage: true });
    console.log('Screenshot saved: 04-dashboard.png');

    // List navigation items
    const navItems = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="menuitem"], nav li, .nav-item, .sidebar a, .menu-item'));
      return links.map(el => el.innerText.trim()).filter(t => t.length > 0).slice(0, 30);
    });
    console.log('Navigation items:', JSON.stringify(navItems));

    // List all buttons on dashboard
    const dashButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim().substring(0, 60),
        id: b.id,
      })).filter(b => b.text.length > 0);
    });
    console.log('Dashboard buttons:', JSON.stringify(dashButtons));

    // 3. Navigate to "Procesar Nómina" / PayrollProcessor
    console.log('\nLooking for Procesar Nomina / Payroll section...');

    // Try to click on payroll link
    const payrollLink = page.locator('text=Procesar Nómina, text=Nómina, text=Payroll, a:has-text("Procesar"), button:has-text("Nómina")').first();

    let navigated = false;

    // Try various selectors for payroll navigation
    const payrollSelectors = [
      'text=Procesar Nómina',
      'text=Nómina',
      'text=Payroll',
      'text=Procesar',
      '[href*="nomina"]',
      '[href*="payroll"]',
      'a:has-text("Nóm")',
    ];

    for (const selector of payrollSelectors) {
      try {
        const el = page.locator(selector).first();
        const count = await el.count();
        if (count > 0) {
          console.log(`Found payroll element with selector: ${selector}`);
          await el.click();
          await page.waitForTimeout(2000);
          navigated = true;
          break;
        }
      } catch (e) {
        // continue
      }
    }

    if (!navigated) {
      console.log('Could not find payroll navigation, looking at all clickable elements...');
      const allClickable = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a, button')).map(el => ({
          tag: el.tagName,
          text: el.innerText.trim().substring(0, 80),
          href: el.href || '',
          id: el.id
        })).filter(el => el.text.length > 0);
      });
      console.log('All clickable elements:', JSON.stringify(allClickable));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-payroll-section.png'), fullPage: true });
    console.log('Screenshot saved: 05-payroll-section.png');
    console.log('URL after navigation:', page.url());

    const payrollText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('Payroll section text:', payrollText);

    // Look for toolbar buttons
    const toolbarButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button, .btn, [role="button"]')).map(b => ({
        text: b.innerText.trim().substring(0, 80),
        title: b.title || b.getAttribute('aria-label') || '',
        id: b.id,
        class: b.className.substring(0, 100)
      })).filter(b => b.text.length > 0 || b.title.length > 0);
    });
    console.log('Toolbar buttons:', JSON.stringify(toolbarButtons));

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-toolbar.png'), fullPage: false });
    console.log('Screenshot saved: 06-toolbar.png');

    // Look for tabs
    const tabs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[role="tab"], .tab, .tab-item, .tabs button, .tab-button')).map(t => ({
        text: t.innerText.trim(),
        active: t.classList.contains('active') || t.getAttribute('aria-selected') === 'true',
        id: t.id
      }));
    });
    console.log('Tabs found:', JSON.stringify(tabs));

    // Try to click LOTTT tab
    const lotttSelectors = ['text=LOTTT', 'text=Lottt', '[data-tab*="LOTTT"]', 'button:has-text("LOTTT")'];
    for (const sel of lotttSelectors) {
      try {
        const el = page.locator(sel).first();
        const count = await el.count();
        if (count > 0) {
          console.log(`Found LOTTT tab with selector: ${sel}`);
          await el.click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-lottt-tab.png'), fullPage: true });
          console.log('Screenshot saved: 07-lottt-tab.png');
          break;
        }
      } catch (e) {
        // continue
      }
    }

    // Try to click Prorrateo tab
    const prorrateoSelectors = ['text=Prorrateo', '[data-tab*="Prorrateo"]', 'button:has-text("Prorrateo")'];
    for (const sel of prorrateoSelectors) {
      try {
        const el = page.locator(sel).first();
        const count = await el.count();
        if (count > 0) {
          console.log(`Found Prorrateo tab with selector: ${sel}`);
          await el.click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-prorrateo-tab.png'), fullPage: true });
          console.log('Screenshot saved: 08-prorrateo-tab.png');
          break;
        }
      } catch (e) {
        // continue
      }
    }

    // Final screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-final-state.png'), fullPage: true });
    console.log('Screenshot saved: 09-final-state.png');

    // Check for specific new buttons
    const newButtons = ['Planilla General LOTTT', 'Planilla General Prorrateo', 'LOTTT', 'Prorrateo'];
    for (const btnText of newButtons) {
      const count = await page.locator(`text=${btnText}`).count();
      console.log(`Button/element "${btnText}" found: ${count > 0} (count: ${count})`);
    }

  } catch (err) {
    console.error('Error during execution:', err.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-state.png'), fullPage: true });
  }

  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach(e => console.log(e));

  console.log('\n=== ALL CONSOLE MESSAGES (last 30) ===');
  consoleMessages.slice(-30).forEach(m => console.log(m));

  await browser.close();
}

main().catch(console.error);
