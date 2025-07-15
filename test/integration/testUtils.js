export async function setupTestUser(page) {
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
}

export async function completePartialWorkout(page) {
  await page.click('button:has-text("Heute trainieren")');
  await page.locator('.exercise-item').first().click();
  await page.click('button:has-text("Tag als geschafft markieren")');
  await page.click('button:has-text("Zurück zur Übersicht")');
}

