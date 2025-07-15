import { test, expect } from '@playwright/test';
import { setupTestUser, completePartialWorkout } from './testUtils.js';

test.describe('Workout Completion Flow', () => {
  test('complete workout updates progress', async ({ page }) => {
    await page.goto('./index-new.html');
    await setupTestUser(page);

    await page.click('button:has-text("Heute trainieren")');

    const exercises = page.locator('.exercise-item');
    const exerciseCount = await exercises.count();
    for (let i = 0; i < exerciseCount; i++) {
      await exercises.nth(i).click();
    }

    await page.click('button:has-text("Tag als geschafft markieren")');
    await expect(page.locator('button:has-text("Tag geschafft")')).toBeVisible();

    await page.click('button:has-text("Zurück zur Übersicht")');
    await expect(page.locator('.completed-check')).toBeVisible();
  });
});

