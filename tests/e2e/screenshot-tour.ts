import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, '../../artifacts/screenshots');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

test.describe('Screenshot Tour', () => {
  test('tour and capture all pages', async ({ page }) => {
    // 1. Landing Page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '00-landing.png'),
      fullPage: true,
    });
    console.log('✅ Landing page');

    // Check what upload elements exist
    const inputs = await page.locator('input').all();
    console.log(`Found ${inputs.length} input elements`);

    for (let i = 0; i < inputs.length; i++) {
      const type = await inputs[i].getAttribute('type');
      const testId = await inputs[i].getAttribute('data-testid');
      const id = await inputs[i].getAttribute('id');
      console.log(`  Input ${i}: type=${type}, testid=${testId}, id=${id}`);
    }

    // Try to upload files
    const testDataDir = path.join(__dirname, '../../test_data');
    const expFile = path.join(testDataDir, 'expenses.csv');
    const brFile = path.join(testDataDir, 'browser_history.json');
    const rosterFile = path.join(testDataDir, 'roster.csv');

    console.log(`\nLooking for files:`);
    console.log(`  Expenses: ${fs.existsSync(expFile) ? '✅' : '❌'}`);
    console.log(`  Browser: ${fs.existsSync(brFile) ? '✅' : '❌'}`);
    console.log(`  Roster: ${fs.existsSync(rosterFile) ? '✅' : '❌'}`);

    // Try different strategies to find and fill upload inputs
    try {
      const allInputs = page.locator('input[type="file"]');
      const count = await allInputs.count();
      console.log(`\nFound ${count} file input elements`);

      if (count > 0) {
        // Try to set files on each
        try {
          await allInputs.nth(0).setInputFiles(expFile);
          console.log('✅ Set expenses file');
        } catch (e) {
          console.log('⚠️  Could not set expenses file');
        }

        if (count > 1) {
          try {
            await allInputs.nth(1).setInputFiles(brFile);
            console.log('✅ Set browser history file');
          } catch (e) {
            console.log('⚠️  Could not set browser history file');
          }
        }

        if (count > 2) {
          try {
            await allInputs.nth(2).setInputFiles(rosterFile);
            console.log('✅ Set roster file');
          } catch (e) {
            console.log('⚠️  Could not set roster file');
          }
        }

        // Look for upload button and click
        const uploadButtons = await page.locator('button').all();
        for (const btn of uploadButtons) {
          const text = await btn.textContent();
          if (text && text.toLowerCase().includes('upload')) {
            console.log(`Found upload button: "${text}"`);
            await btn.click();
            console.log('✅ Clicked upload button');
            break;
          }
        }

        // Wait for results
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('Upload attempt error:', (e as Error).message);
    }

    // 2. Dashboard after results
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-dashboard-main.png'),
      fullPage: true,
    });
    console.log('✅ Dashboard main');

    // Check for different sections and navigate
    const buttons = await page.locator('a, button').all();
    const buttonTexts = [];
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text) {
        buttonTexts.push(text.toLowerCase());
      }
    }
    console.log(`\nAvailable buttons/links: ${[...new Set(buttonTexts)].join(', ')}`);

    // Try to navigate to different sections
    const sections = ['risk', 'compliance', 'consolidation', 'simulator', 'playbook'];
    for (const section of sections) {
      const btn = page.locator('a, button').filter({ hasText: new RegExp(section, 'i') }).first();
      if (await btn.isVisible()) {
        try {
          await btn.click();
          await page.waitForTimeout(1500);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, `02-section-${section}.png`),
            fullPage: true,
          });
          console.log(`✅ ${section} section captured`);
          // Go back to try next section
          await page.goto('/');
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`⚠️  Could not capture ${section} section`);
        }
      }
    }

    console.log('\n✅ Screenshot tour complete!');
  });
});
