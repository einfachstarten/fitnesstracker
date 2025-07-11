import { test, expect } from '@playwright/test';

test.describe('Setup Wizard Flow', () => {
  test('complete setup creates valid plan', async ({ page }) => {
    await page.goto('./index-new.html');

    await page.fill('input[placeholder="Dein Name"]', 'Test User');
    await page.fill('input[placeholder="Dein Alter"]', '25');
    await page.click('button:has-text("Weiter")');

    await page.click('text=Muskelaufbau');
    await page.click('button:has-text("Weiter")');

    await page.click('text=Anfänger');
    await page.click('button:has-text("Weiter")');

    await page.click('text=Eigengewicht');
    await page.click('button:has-text("Weiter")');

    await page.click('text=Ganzkörper');
    await page.click('button:has-text("Weiter")');

    await page.click('text=3x');
    await page.click('text=45 Minuten');
    await page.click('button:has-text("Weiter")');

    await page.click('button:has-text("Plan erstellen")');

    await expect(page.locator('h1:has-text("Hi Test User")')).toBeVisible();
    await expect(page.locator('.calendar-day')).toHaveCount(7);

    const userData = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('fitness_user_data'))
    );
    expect(userData.name).toBe('Test User');
    expect(userData.goals).toContain('Muskelaufbau');
  });
});

