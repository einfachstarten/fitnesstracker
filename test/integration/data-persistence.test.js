import { test, expect } from '@playwright/test';
import { setupTestUser, completePartialWorkout } from './testUtils.js';

test.describe('Data Persistence', () => {
  test('data survives page reload', async ({ page }) => {
    await page.goto('./index.html');
    await setupTestUser(page);
    await completePartialWorkout(page);

    await page.reload();

    await expect(page.locator('h1:has-text("Hi Test User")')).toBeVisible();
    await expect(page.locator('.completed-check')).toBeVisible();
  });
});

