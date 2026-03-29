const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = 'C:\\Users\\bradynk\\Desktop\\nominapro\\screenshots';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function main() {
  const browser = await chromium.launch({ headless: true, slowMo: 400 });
  const context = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];
  const consoleInfos = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(`[error] ${msg.text()}`);
    else if (msg.type() === 'warning') consoleWarnings.push(`[warn] ${msg.text()}`);
    else consoleInfos.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => consoleErrors.push(`[pageerror] ${err.message}`));

  try {
    // ---- STEP 1: Login Page ----
    console.log('\n=== STEP 1: Login Page ===');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    const loginPageTitle = await page.title();
    console.log('Page title:', loginPageTitle);
    console.log('URL:', page.url());
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r01-login-page.png'), fullPage: true });
    console.log('Screenshot saved: r01-login-page.png');

    // Describe login form
    const loginFormFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type, name: i.name, placeholder: i.placeholder, id: i.id
      }));
      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim(), type: b.type
      }));
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.innerText.trim());
      return { inputs, buttons, headings };
    });
    console.log('Login form fields:', JSON.stringify(loginFormFields, null, 2));

    // ---- STEP 2: Fill and submit login ----
    console.log('\n=== STEP 2: Filling Login Form ===');
    await page.locator('input[type="email"]').fill('elsalvadorescristo777@gmail.com');
    await page.locator('input[type="password"]').fill('123456789');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r02-login-filled.png'), fullPage: true });
    console.log('Screenshot saved: r02-login-filled.png');

    await page.locator('button[type="submit"]').click();
    console.log('Clicked submit, waiting...');
    await page.waitForTimeout(4000);
    console.log('Post-login URL:', page.url());

    // ---- STEP 3: Dashboard ----
    console.log('\n=== STEP 3: Dashboard ===');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r03-dashboard.png'), fullPage: true });
    console.log('Screenshot saved: r03-dashboard.png');

    const dashboardInfo = await page.evaluate(() => {
      const text = document.body.innerText.substring(0, 3000);
      const navItems = Array.from(document.querySelectorAll('nav a, nav button, .sidebar a, .sidebar button, [class*="sidebar"] a, [class*="sidebar"] button, [class*="nav"] button, [class*="nav"] a')).map(el => el.innerText.trim()).filter(t => t.length > 0);
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4')).map(h => h.innerText.trim()).filter(t => t.length > 0);
      return { text, navItems, headings };
    });
    console.log('Dashboard nav items:', dashboardInfo.navItems);
    console.log('Dashboard headings:', dashboardInfo.headings);
    console.log('Dashboard text (first 1500 chars):\n', dashboardInfo.text.substring(0, 1500));

    // ---- STEP 4: Navigate to Nomina section ----
    console.log('\n=== STEP 4: Navigating to Nomina ===');

    // Try various selectors for the Nomina navigation item
    const nominaSelectors = [
      'button:has-text("Nómina")',
      'button:has-text("Nomina")',
      'a:has-text("Nómina")',
      'a:has-text("Nomina")',
      '[class*="nav"] button:has-text("N")',
    ];
    let clicked = false;
    for (const sel of nominaSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`Found nav item: ${sel} (${count})`);
        await page.locator(sel).first().click();
        await page.waitForTimeout(2000);
        clicked = true;
        console.log('Clicked Nomina nav item');
        break;
      }
    }
    if (!clicked) {
      console.log('Could not find Nomina nav item directly. Checking all clickable nav elements...');
      const allNavText = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a, [role="button"], [role="menuitem"], [role="tab"]')).map(el => ({
          tag: el.tagName,
          text: el.innerText.trim().substring(0, 80),
          href: el.href || '',
          class: el.className.substring(0, 80)
        })).filter(el => el.text.length > 0);
      });
      console.log('All clickable elements:', JSON.stringify(allNavText, null, 2));
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r04-after-nomina-click.png'), fullPage: true });
    console.log('Screenshot saved: r04-after-nomina-click.png');

    // ---- STEP 5: Find and click "Procesar Nomina" ----
    console.log('\n=== STEP 5: Looking for Procesar Nomina ===');

    const procSelectors = [
      'text=Procesar Nómina',
      'text=Procesar Nomina',
      'button:has-text("Procesar Nómina")',
      'button:has-text("Procesar Nomina")',
      'a:has-text("Procesar Nómina")',
      'a:has-text("Procesar Nomina")',
      '[class*="menu"] :has-text("Procesar")',
    ];

    let procClicked = false;
    for (const sel of procSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`Found Procesar element: ${sel} (${count})`);
        await page.locator(sel).first().click();
        await page.waitForTimeout(2500);
        procClicked = true;
        console.log('Clicked Procesar Nomina');
        break;
      }
    }

    if (!procClicked) {
      console.log('Could not find Procesar Nomina. Current page text:');
      const currentText = await page.evaluate(() => document.body.innerText.substring(0, 3000));
      console.log(currentText);
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r05-procesar-nomina.png'), fullPage: true });
    console.log('Screenshot saved: r05-procesar-nomina.png');

    // ---- STEP 6: Analyze the Procesar Nomina page ----
    console.log('\n=== STEP 6: Analyzing Procesar Nomina Page ===');

    const pageAnalysis = await page.evaluate(() => {
      // Get all buttons
      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.innerText.trim().replace(/\n/g, ' ').substring(0, 120),
        visible: b.offsetParent !== null && window.getComputedStyle(b).display !== 'none',
        disabled: b.disabled,
        title: b.title || b.getAttribute('aria-label') || '',
        id: b.id || '',
        class: b.className.substring(0, 100)
      })).filter(b => b.text.length > 0 || b.title.length > 0);

      // Get all tabs
      const tabs = Array.from(document.querySelectorAll('[role="tab"], .tab, [data-tab], button[class*="tab"]')).map(t => ({
        text: t.innerText.trim(),
        active: t.getAttribute('aria-selected') === 'true' || t.classList.contains('active') || t.classList.contains('selected'),
        class: t.className.substring(0, 100)
      }));

      // Get headings
      const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5')).map(h => h.innerText.trim());

      // Get full text
      const fullText = document.body.innerText.substring(0, 5000);

      // Check for specific keywords
      const fullTextLower = document.body.innerText.toLowerCase();
      const keywords = {
        'LOTTT': fullTextLower.includes('lottt'),
        'Prorrateo': fullTextLower.includes('prorrateo'),
        'Planilla General': fullTextLower.includes('planilla general'),
        'Planilla General LOTTT': fullTextLower.includes('planilla general lottt'),
        'Planilla General Prorrateo': fullTextLower.includes('planilla general prorrateo'),
        'Procesar': fullTextLower.includes('procesar'),
        'Nómina': fullTextLower.includes('nómina') || fullTextLower.includes('nomina'),
        'toolbar': fullTextLower.includes('toolbar'),
        'Exportar': fullTextLower.includes('exportar'),
        'Excel': fullTextLower.includes('excel'),
        'PDF': fullTextLower.includes('pdf'),
        'Imprimir': fullTextLower.includes('imprimir'),
      };

      return { buttons, tabs, headings, fullText, keywords };
    });

    console.log('\nBUTTONS FOUND:');
    pageAnalysis.buttons.forEach((b, i) => {
      console.log(`  [${i}] "${b.text}" | visible: ${b.visible} | disabled: ${b.disabled} | title: "${b.title}" | id: "${b.id}"`);
    });

    console.log('\nTABS FOUND:');
    pageAnalysis.tabs.forEach((t, i) => {
      console.log(`  [${i}] "${t.text}" | active: ${t.active}`);
    });

    console.log('\nHEADINGS:');
    pageAnalysis.headings.forEach((h, i) => console.log(`  [${i}] "${h}"`));

    console.log('\nKEYWORDS:');
    Object.entries(pageAnalysis.keywords).forEach(([kw, found]) => {
      console.log(`  "${kw}": ${found ? 'FOUND' : 'not found'}`);
    });

    console.log('\nFULL TEXT (first 2000 chars):');
    console.log(pageAnalysis.fullText.substring(0, 2000));

    // ---- STEP 7: Scroll to top and take toolbar screenshot ----
    console.log('\n=== STEP 7: Toolbar Screenshot ===');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r06-toolbar.png') });
    console.log('Screenshot saved: r06-toolbar.png (viewport only, showing toolbar)');

    // ---- STEP 8: Try to find and click LOTTT tab ----
    console.log('\n=== STEP 8: LOTTT Tab ===');
    const lotttSelectors = [
      'text=LOTTT',
      '[role="tab"]:has-text("LOTTT")',
      'button:has-text("LOTTT")',
    ];
    for (const sel of lotttSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`Found LOTTT tab: ${sel} (${count})`);
        await page.locator(sel).first().click();
        await page.waitForTimeout(1500);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r07-lottt-tab.png'), fullPage: true });
    console.log('Screenshot saved: r07-lottt-tab.png');

    // Get LOTTT tab content
    const lotttContent = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('LOTTT tab content (first 1500 chars):', lotttContent.substring(0, 1500));

    // ---- STEP 9: Try to find and click Prorrateo tab ----
    console.log('\n=== STEP 9: Prorrateo Tab ===');
    const prorrateoSelectors = [
      'text=Prorrateo',
      '[role="tab"]:has-text("Prorrateo")',
      'button:has-text("Prorrateo")',
    ];
    for (const sel of prorrateoSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) {
        console.log(`Found Prorrateo tab: ${sel} (${count})`);
        await page.locator(sel).first().click();
        await page.waitForTimeout(1500);
        break;
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r08-prorrateo-tab.png'), fullPage: true });
    console.log('Screenshot saved: r08-prorrateo-tab.png');

    // Get Prorrateo tab content
    const prorrateoContent = await page.evaluate(() => document.body.innerText.substring(0, 3000));
    console.log('Prorrateo tab content (first 1500 chars):', prorrateoContent.substring(0, 1500));

    // ---- STEP 10: Check for specific new buttons ----
    console.log('\n=== STEP 10: Checking for New Buttons ===');

    // Go back to check all tabs again
    await page.evaluate(() => window.scrollTo(0, 0));

    const newButtonCheck = await page.evaluate(() => {
      const allText = document.body.innerHTML;
      return {
        hasPlanillaGeneralLOTTT: allText.toLowerCase().includes('planilla general lottt') || allText.toLowerCase().includes('planillagenerallottt'),
        hasPlanillaGeneralProrrateo: allText.toLowerCase().includes('planilla general prorrateo') || allText.toLowerCase().includes('planillageneralprorrateo'),
        hasLOTTT: allText.toLowerCase().includes('lottt'),
        hasProrrateo: allText.toLowerCase().includes('prorrateo'),
        // Find all button texts containing 'planilla'
        planillaButtons: Array.from(document.querySelectorAll('button')).filter(b => b.innerText.toLowerCase().includes('planilla')).map(b => b.innerText.trim()),
        // All visible buttons text
        allVisibleButtons: Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null).map(b => b.innerText.trim().replace(/\n/g, ' ').substring(0, 100)).filter(t => t.length > 0),
      };
    });

    console.log('New button check:', JSON.stringify(newButtonCheck, null, 2));

    // Final full page screenshot
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r09-final-state.png'), fullPage: true });
    console.log('Screenshot saved: r09-final-state.png');

  } catch (err) {
    console.error('\n=== ERROR ===');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    try {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'r-error.png'), fullPage: true });
      console.log('Error screenshot saved: r-error.png');
    } catch (e2) {
      console.error('Could not take error screenshot:', e2.message);
    }
  }

  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected.');
  } else {
    consoleErrors.forEach(e => console.log(e));
  }

  console.log('\n=== CONSOLE WARNINGS ===');
  consoleWarnings.slice(0, 20).forEach(w => console.log(w));

  console.log('\n=== CONSOLE INFOS (first 10) ===');
  consoleInfos.slice(0, 10).forEach(i => console.log(i));

  await browser.close();
  console.log('\nDone.');
}

main().catch(console.error);
