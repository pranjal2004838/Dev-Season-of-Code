import { chromium } from 'playwright';
import path from 'path';

const BASE = 'http://localhost:3000';
const SHOTS_DIR = path.join(__dirname, '..', 'artifacts', 'screenshots');

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. Connect Your Tools (landing page)
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS_DIR, '01-connect-tools.png'), fullPage: true });
  console.log('✅ 01-connect-tools.png');

  // 2. Click "Connect Google Workspace" and capture scanning animation  
  await page.click('[data-testid="connect-google"]');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS_DIR, '02-scanning.png'), fullPage: true });
  console.log('✅ 02-scanning.png');

  // 3. Wait for dashboard to load fully  
  await page.waitForSelector('[data-testid="stats-grid"]', { timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SHOTS_DIR, '03-dashboard-stats.png'), fullPage: false });
  console.log('✅ 03-dashboard-stats.png');

  // 4. Full dashboard scroll 
  await page.screenshot({ path: path.join(SHOTS_DIR, '04-dashboard-full.png'), fullPage: true });
  console.log('✅ 04-dashboard-full.png');

  // 5. Click on a high-risk app playbook  
  const playbookBtn = page.locator('[data-testid^="playbook-btn-"]').first();
  if (await playbookBtn.isVisible()) {
    await playbookBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SHOTS_DIR, '05-playbook-modal.png'), fullPage: false });
    console.log('✅ 05-playbook-modal.png');
    // Close modal
    await page.click('.modal-close');
    await page.waitForTimeout(300);
  }

  // 6. Navigate to Simulator
  await page.click('text=💰 Simulator');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SHOTS_DIR, '06-simulator.png'), fullPage: true });
  console.log('✅ 06-simulator.png');

  // 7. Navigate to AI Insights  
  await page.click('[data-testid="ai-tab-btn"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SHOTS_DIR, '07-ai-risk.png'), fullPage: true });
  console.log('✅ 07-ai-risk.png');

  // 8. AI Compliance tab
  await page.click('[data-testid="ai-tab-compliance"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SHOTS_DIR, '08-ai-compliance.png'), fullPage: true });
  console.log('✅ 08-ai-compliance.png');

  // 9. AI Consolidation tab
  await page.click('[data-testid="ai-tab-consolidation"]');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SHOTS_DIR, '09-ai-consolidation.png'), fullPage: true });
  console.log('✅ 09-ai-consolidation.png');

  await browser.close();
  console.log('\n🎉 All screenshots captured in artifacts/screenshots/');
}

captureScreenshots().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
