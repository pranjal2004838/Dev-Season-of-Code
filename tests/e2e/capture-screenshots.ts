import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOTS_DIR = path.join(__dirname, '../../artifacts/screenshots');

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

test.describe('Comprehensive Screenshot Capture', () => {
  test('capture all pages and workflows', async ({ page }) => {
    // Screen 1: Landing Page
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await expect(page.locator('.app-header h1')).toContainText('Shadow SaaS Detector');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-landing-page.png'),
      fullPage: true,
    });
    console.log('✅ Screen 1: Landing page captured');

    // Screen 2: Upload Section (Before Uploading)
    const uploadSection = page.locator('[data-testid="upload-section"]');
    await expect(uploadSection).toBeVisible();
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-upload-section.png'),
      fullPage: true,
    });
    console.log('✅ Screen 2: Upload section captured');

    // Upload test files
    const expInput = page.locator('[data-testid="expenses-input"]');
    const brInput = page.locator('[data-testid="browser-input"]');
    const rosterInput = page.locator('[data-testid="roster-input"]');

    const testDataDir = path.join(__dirname, '../../test_data');
    
    if (await expInput.isVisible()) {
      await expInput.setInputFiles(path.join(testDataDir, 'expenses.csv'));
    }
    if (await brInput.isVisible()) {
      await brInput.setInputFiles(path.join(testDataDir, 'browser_history.json'));
    }
    if (await rosterInput.isVisible()) {
      await rosterInput.setInputFiles(path.join(testDataDir, 'roster.csv'));
    }

    // Click upload
    await page.locator('[data-testid="upload-btn"]').click();
    await expect(page.locator('[data-testid="apps-grid"]')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Screen 3: Dashboard - Full View
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-dashboard-full.png'),
      fullPage: true,
    });
    console.log('✅ Screen 3: Dashboard full view captured');

    // Screen 4: Dashboard - Statistics Section
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    if (await statsGrid.isVisible()) {
      await statsGrid.screenshot({
        path: path.join(SCREENSHOTS_DIR, '04-dashboard-stats.png'),
      });
      console.log('✅ Screen 4: Dashboard stats captured');
    }

    // Screen 5: Apps Grid / App Cards
    const firstAppCard = page.locator('[data-testid="app-card-0"]');
    if (await firstAppCard.isVisible()) {
      await firstAppCard.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '05-app-cards-grid.png'),
        fullPage: true,
      });
      console.log('✅ Screen 5: App cards grid captured');
    }

    // Screen 6: Threat Ticker
    const threatTicker = page.locator('[data-testid="threat-ticker"]');
    if (await threatTicker.isVisible()) {
      await threatTicker.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '06-threat-ticker.png'),
        fullPage: true,
      });
      console.log('✅ Screen 6: Threat ticker captured');
    }

    // Screen 7: Executive Brief
    const execBrief = page.locator('[data-testid="executive-brief"]');
    if (await execBrief.isVisible()) {
      await execBrief.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '07-executive-brief.png'),
        fullPage: true,
      });
      console.log('✅ Screen 7: Executive brief captured');
    }

    // Screen 8: Attack Surface Map
    const attackSurface = page.locator('[data-testid="attack-surface-map"]');
    if (await attackSurface.isVisible()) {
      await attackSurface.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '08-attack-surface-map.png'),
        fullPage: true,
      });
      console.log('✅ Screen 8: Attack surface map captured');
    }

    // Screen 9: Playbook Modal
    const playbookBtn = page.locator('[data-testid="playbook-btn-0"]').first();
    if (await playbookBtn.isVisible()) {
      await playbookBtn.click();
      await expect(page.locator('[data-testid="playbook-modal"]')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '09-playbook-modal.png'),
        fullPage: true,
      });
      console.log('✅ Screen 9: Playbook modal captured');

      // Screen 9b: Playbook - Before Revoke
      const simulateBtn = page.locator('[data-testid="simulate-revoke-btn"]');
      if (await simulateBtn.isVisible()) {
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '09b-playbook-details.png'),
          fullPage: true,
        });
        console.log('✅ Screen 9b: Playbook details captured');

        // Screen 10: Simulate Revoke Action
        await simulateBtn.click();
        await expect(page.locator('[data-testid="confirm-revoke-btn"]')).toBeVisible({ timeout: 3000 });
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '10-playbook-confirm.png'),
          fullPage: true,
        });
        console.log('✅ Screen 10: Playbook confirm dialog captured');

        // Confirm the revoke
        await page.locator('[data-testid="confirm-revoke-btn"]').click();
        await expect(page.locator('[data-testid="undo-btn"]')).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // Screen 11: Playbook - After Revoke/Undo
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '11-playbook-after-revoke.png'),
          fullPage: true,
        });
        console.log('✅ Screen 11: Playbook after revoke captured');
      }

      // Close modal
      const closeBtn = page.locator('.modal-close').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    // Navigation to AI Insights
    const aiInsightsNav = page.locator('nav a, [role="navigation"] a').filter({ hasText: /AI|Insights|Risk/i });
    const aiButton = page.locator('button, a').filter({ hasText: /AI|Insights/i }).first();
    
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await page.waitForTimeout(2000);
      
      // Screen 12: AI Insights - Risk Assessment
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '12-ai-insights-risk.png'),
        fullPage: true,
      });
      console.log('✅ Screen 12: AI Insights - Risk Assessment captured');

      // Screen 13: AI Insights - Smart Consolidation
      const consolidationBtn = page.locator('[data-testid="consolidation-tab"], button, a').filter({ hasText: /Consolidation|Combine|Duplicate/i }).first();
      if (await consolidationBtn.isVisible()) {
        await consolidationBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '13-ai-consolidation.png'),
          fullPage: true,
        });
        console.log('✅ Screen 13: AI Insights - Smart Consolidation captured');
      }

      // Screen 14: AI Insights - Compliance Audit
      const complianceBtn = page.locator('[data-testid="compliance-tab"], button, a').filter({ hasText: /Compliance|GDPR|CCPA/i }).first();
      if (await complianceBtn.isVisible()) {
        await complianceBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({
          path: path.join(SCREENSHOTS_DIR, '14-ai-compliance.png'),
          fullPage: true,
        });
        console.log('✅ Screen 14: AI Insights - Compliance Audit captured');
      }
    }

    // Back to Dashboard
    const dashboardBtn = page.locator('a, button').filter({ hasText: /Dashboard|Home/i }).first();
    if (await dashboardBtn.isVisible()) {
      await dashboardBtn.click();
      await page.waitForTimeout(1500);
    }

    // Screen 15: Simulator Page/Section
    const simulatorNav = page.locator('a, button').filter({ hasText: /Simulator|Scenario|Model/i }).first();
    if (await simulatorNav.isVisible()) {
      await simulatorNav.click();
      await page.waitForTimeout(2000);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '15-simulator.png'),
        fullPage: true,
      });
      console.log('✅ Screen 15: Simulator captured');
    }

    // Screen 16: Demo Story Page
    const demoStoryNav = page.locator('a, button').filter({ hasText: /Demo|Story|Guide/i }).first();
    if (await demoStoryNav.isVisible()) {
      await demoStoryNav.click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '16-demo-story.png'),
        fullPage: true,
      });
      console.log('✅ Screen 16: Demo story captured');
    }

    console.log('\n✅ All screenshots captured successfully!');
    console.log(`📁 Saved to: ${SCREENSHOTS_DIR}`);
  });
});
