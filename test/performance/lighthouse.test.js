import { test } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';

test('lighthouse performance audit', async ({ page }) => {
  await page.goto('./index-new.html');
  await playAudit({
    page,
    thresholds: {
      performance: 90,
      accessibility: 95,
      'best-practices': 90,
      seo: 80,
      pwa: 85
    }
  });
});

