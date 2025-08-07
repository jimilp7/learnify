import { test, expect } from '@playwright/test';

test.describe('Simple Learning Preferences Test', () => {
  test('should navigate from topic to preferences to depth', async ({ page }) => {
    // Go to the application
    await page.goto('http://localhost:3002');
    
    // Should be on topic selection
    await expect(page.locator('h1')).toContainText('What do you want to learn');
    
    // Fill in topic
    await page.getByPlaceholder('Type anything...').fill('JavaScript');
    
    // Click Next (the main CTA button, not the dev tools button)
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Should now be on preferences screen
    await expect(page.locator('h1')).toContainText('How do you learn best');
    
    // Should see the topic we entered
    await expect(page.getByText('Learning: JavaScript')).toBeVisible();
    
    // Should see learning style options (use button locators to avoid duplicates)
    await expect(page.locator('button').filter({ hasText: 'Visual' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Auditory' })).toBeVisible();
    
    // Select a preference
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    
    // Next button should be enabled and show count
    await expect(page.locator('div.fixed button')).toContainText('Next (1 selected)');
    
    // Click Next
    await page.locator('div.fixed button').filter({ hasText: 'Next (1 selected)' }).click();
    
    // Should now be on depth selection
    await expect(page.locator('h1')).toContainText('How deep');
    
    // Should still show the topic
    await expect(page.getByText('Learning: JavaScript')).toBeVisible();
  });
});