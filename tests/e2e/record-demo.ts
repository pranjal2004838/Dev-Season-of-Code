import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VIDEO_DIR = path.join(__dirname, '../../artifacts/video');

async function recordDemo() {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  console.log('🎬 Starting demo recording...');

  // Scene 1: Landing page
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);

  // Scene 2: Upload files
  console.log('📂 Uploading files...');
  const expInput = page.locator('[data-testid="expenses-input"]');
  const brInput = page.locator('[data-testid="browser-input"]');
  await expInput.setInputFiles(path.join(__dirname, '../../test_data/expenses.csv'));
  await page.waitForTimeout(500);
  await brInput.setInputFiles(path.join(__dirname, '../../test_data/browser_history.json'));
  await page.waitForTimeout(500);
  await page.locator('[data-testid="upload-btn"]').click();
  await page.locator('[data-testid="apps-grid"]').waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(3000);

  // Scene 3: Open Playbook on Recruiting Bot
  console.log('🛡️ Opening Playbook...');
  const playbookBtn = page.locator('[data-testid="playbook-btn-7"]');
  if (await playbookBtn.isVisible()) {
    await playbookBtn.click();
  } else {
    await page.locator('.app-card-actions .btn-primary').first().click();
  }
  await page.locator('[data-testid="playbook-modal"]').waitFor({ state: 'visible' });
  await page.waitForTimeout(3000);

  // Scene 4: Click Simulate Revoke
  console.log('⚡ Simulating revoke...');
  await page.locator('[data-testid="simulate-revoke-btn"]').click();
  await page.waitForTimeout(1000);
  await page.locator('[data-testid="confirm-revoke-btn"]').click();
  await page.locator('[data-testid="undo-btn"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(4000);

  // Scene 5: Close modal
  await page.locator('.modal-close').click();
  await page.waitForTimeout(1500);

  // Scene 6: Open Simulator
  console.log('💰 Opening Simulator...');
  await page.locator('.nav-tab', { hasText: 'Simulator' }).click();
  await page.locator('[data-testid="simulator"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(3000);

  // Scene 7: Adjust adoption slider
  const slider = page.locator('input[type="range"]');
  if (await slider.isVisible()) {
    await slider.fill('60');
    await page.waitForTimeout(2000);
    await slider.fill('100');
    await page.waitForTimeout(2000);
  }

  // Scene 8: Show Demo Story tab
  console.log('🎬 Opening Demo Story...');
  await page.locator('.nav-tab', { hasText: 'Demo Story' }).click();
  await page.waitForTimeout(3000);

  console.log('✅ Demo recording complete!');

  // Close and save
  await page.close();
  await context.close();
  await browser.close();

  // Rename video file
  const files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const src = path.join(VIDEO_DIR, files[files.length - 1]);
    const dest = path.join(VIDEO_DIR, 'demo_2min.webm');
    fs.renameSync(src, dest);
    console.log(`📹 Video saved to: ${dest}`);
    console.log('   Note: Video is in WebM format (Playwright native). Convert to mp4 if needed.');
  }
}

recordDemo().catch(console.error);
