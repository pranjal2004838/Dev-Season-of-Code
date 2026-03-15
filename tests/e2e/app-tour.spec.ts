import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, '../../artifacts/screenshots');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

test.describe('Complete App Tour', () => {
  test('navigate and capture all major screens', async ({ page }) => {
    console.log('\n🎬 Starting comprehensive app tour...\n');

    // === SCREEN 1: Landing Page ===
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, 'page-01-landing.png'),
      fullPage: true,
    });
    console.log('✅ Screen 1: Landing page captured');

    // === SCREEN 2: Upload Section ===
    const uploadSection = page.locator('[data-testid="upload-section"]');
    const uploadVisible = await uploadSection.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (uploadVisible) {
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-02-upload-form.png'),
        fullPage: true,
      });
      console.log('✅ Screen 2: Upload form captured');

      // Try to upload demo files
      const testDataDir = path.join(__dirname, '../../test_data');
      const expFile = path.join(testDataDir, 'expenses.csv');
      const brFile = path.join(testDataDir, 'browser_history.json');
      const rosterFile = path.join(testDataDir, 'roster.csv');

      const fileInputs = page.locator('input[type="file"]');
      const inputCount = await fileInputs.count();

      if (inputCount > 0 && fs.existsSync(expFile)) {
        try {
          await fileInputs.nth(0).setInputFiles(expFile);
          console.log('  📤 Set expenses file');
        } catch (e) {
          console.log('  ⚠️  Could not set expenses file');
        }
      }

      if (inputCount > 1 && fs.existsSync(brFile)) {
        try {
          await fileInputs.nth(1).setInputFiles(brFile);
          console.log('  📤 Set browser history file');
        } catch (e) {
          console.log('  ⚠️  Could not set browser history file');
        }
      }

      if (inputCount > 2 && fs.existsSync(rosterFile)) {
        try {
          await fileInputs.nth(2).setInputFiles(rosterFile);
          console.log('  📤 Set roster file');
        } catch (e) {
          console.log('  ⚠️  Could not set roster file');
        }
      }

      // Click upload button
      const uploadBtn = page.locator('[data-testid="upload-btn"], button').filter({ hasText: /Upload|Process|Scan/i }).first();
      if (await uploadBtn.isVisible()) {
        await uploadBtn.click();
        console.log('  🔘 Upload button clicked');
        
        // Wait for results  
        await page.waitForTimeout(3000);
      }
    } else {
      console.log('⚠️  Upload section not visible, trying to load demo data...');
    }

    // === SCREEN 3: Dashboard ===
    const appsGrid = page.locator('[data-testid="apps-grid"]');
    const gridVisible = await appsGrid.isVisible({ timeout: 5000 }).catch(() => false);

    if (gridVisible) {
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-03-dashboard.png'),
        fullPage: true,
      });
      console.log('✅ Screen 3: Dashboard captured');

      // === SCREEN 4: Interactive elements - Hover over one app card ===
      const firstCard = page.locator('[data-testid="app-card-0"]');
      if (await firstCard.isVisible()) {
        await firstCard.hover();
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'page-04-app-card-hover.png'),
          fullPage: true,
        });
        console.log('✅ Screen 4: App card hover state captured');
      }

      // === SCREEN 5: Playbook Modal ===
      const playbookBtn = page.locator('[data-testid*="playbook"], button').filter({ hasText: /Playbook|Action|Guide/i }).first();
      if (await playbookBtn.isVisible()) {
        await playbookBtn.click();
        const modal = page.locator('[data-testid="playbook-modal"], .modal, dialog').first();
        const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (modalVisible) {
          await page.waitForTimeout(1000);
          await page.screenshot({
            path: path.join(SCREENSHOTS_DIR, 'page-05-playbook-modal.png'),
            fullPage: true,
          });
          console.log('✅ Screen 5: Playbook modal captured');

          // === SCREEN 6: Playbook modal open with actions ===
          const simulateBtn = page.locator('[data-testid*="simulate"], button').filter({ hasText: /Simulate|Revoke|Test/i }).first();
          if (await simulateBtn.isVisible()) {
            await page.screenshot({
              path: path.join(SCREENSHOTS_DIR, 'page-06-playbook-details.png'),
              fullPage: true,
            });
            console.log('✅ Screen 6: Playbook details captured');
          }

          // Close modal
          const closeBtn = page.locator('.modal-close, [data-testid="close"], button').filter({ hasText: /Close|×|X/i }).first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
          } else {
            const closeByKey = page.locator('body');
            await closeByKey.press('Escape');
          }
          await page.waitForTimeout(500);
        }
      }
    } else {
      console.log('⚠️  Dashboard not loaded, creating synthetic screen');
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-03-dashboard-loading.png'),
        fullPage: true,
      });
    }

    // === SCREEN 7: Threat Map ===
    const threatMapBtn = page.locator('[data-testid="threat-map-tab"], button').filter({ hasText: /Threat|Map|Supply/i }).nth(0);
    if (await threatMapBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await threatMapBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-07-threat-map.png'),
        fullPage: true,
      });
      console.log('✅ Screen 7: Threat Map captured');
    }

    // === SCREEN 8: Simulator ===
    const simulatorBtn = page.locator('button').filter({ hasText: /Simulator|💰/ }).first();
    if (await simulatorBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await simulatorBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-08-simulator.png'),
        fullPage: true,
      });
      console.log('✅ Screen 8: Simulator captured');
    }

    // === SCREEN 9: AI Insights ===
    const aiBtn = page.locator('[data-testid="ai-tab-btn"], button').filter({ hasText: /AI|🤖|Insights/i }).first();
    if (await aiBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await aiBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-09-ai-insights.png'),
        fullPage: true,
      });
      console.log('✅ Screen 9: AI Insights captured');

      // === SCREEN 10: AI Insights - Risk Tab ===
      const riskTab = page.locator('button, a').filter({ hasText: /Risk|Scoring|Assessment/i }).first();
      if (await riskTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await riskTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'page-10-ai-risk-assessment.png'),
          fullPage: true,
        });
        console.log('✅ Screen 10: AI Risk Assessment captured');
      }

      // === SCREEN 11: AI Insights - Consolidation Tab ===
      const consolidationTab = page.locator('button, a').filter({ hasText: /Consolidation|Duplicate|Combine/i }).first();
      if (await consolidationTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await consolidationTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'page-11-ai-consolidation.png'),
          fullPage: true,
        });
        console.log('✅ Screen 11: AI Consolidation captured');
      }

      // === SCREEN 12: AI Insights - Compliance Tab ===
      const complianceTab = page.locator('button, a').filter({ hasText: /Compliance|GDPR|CCPA|Audit/i }).first();
      if (await complianceTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await complianceTab.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, 'page-12-ai-compliance.png'),
          fullPage: true,
        });
        console.log('✅ Screen 12: AI Compliance captured');
      }
    }

    // === SCREEN 13: Demo Story ===
    const demoBtn = page.locator('button').filter({ hasText: /Demo|Story|🎬/i }).first();
    if (await demoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await demoBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, 'page-13-demo-story.png'),
        fullPage: true,
      });
      console.log('✅ Screen 13: Demo Story captured');
    }

    console.log('\n🎉 All available screens captured!\n');
    console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);

    // List all captured screenshots
    const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.startsWith('page-'));
    console.log(`\n📸 Total screens captured: ${screenshots.length}`);
    screenshots.sort().forEach(f => console.log(`  • ${f}`));
  });
});
