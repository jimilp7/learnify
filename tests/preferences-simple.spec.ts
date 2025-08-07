import { test, expect } from '@playwright/test';

test.describe('Learning Preferences - Simple Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('should show learning preferences screen after topic selection', async ({ page }) => {
    // Enter a topic
    await page.getByPlaceholder('Type anything...').fill('JavaScript basics');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();

    // Should reach preferences screen
    await expect(page.getByText('How do you learn best?')).toBeVisible();
    await expect(page.getByText('Learning: JavaScript basics')).toBeVisible();
    
    // Check that preference options are visible
    await expect(page.getByText('Learning Style')).toBeVisible();
    await expect(page.getByText('Learning Pace')).toBeVisible();
    await expect(page.getByText('What interests you most?')).toBeVisible();
    await expect(page.getByText('Time Available')).toBeVisible();
  });

  test('should navigate from preferences to depth selection', async ({ page }) => {
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('Test topic');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    await expect(page.getByText('How do you learn best?')).toBeVisible();

    // Continue to depth selection
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Should reach depth selection
    await expect(page.getByText('How deep?')).toBeVisible();
    await expect(page.getByText('Learning: Test topic')).toBeVisible();
  });

  test('should have default selections on preferences screen', async ({ page }) => {
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('Test topic');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();

    // Check default selections are visible
    await expect(page.locator('button').filter({ hasText: 'Auditory' })).toHaveClass(/bg-blue-500/);
    await expect(page.locator('button').filter({ hasText: 'Normal pace' })).toHaveClass(/bg-green-500/);
    await expect(page.locator('button').filter({ hasText: '15 minutes' })).toHaveClass(/bg-orange-500/);
    
    // Theory and examples should be pre-selected (purple background)
    await expect(page.locator('button').filter({ hasText: 'Theory & Concepts' })).toHaveClass(/bg-purple-500/);
    await expect(page.locator('button').filter({ hasText: 'Real-world Examples' })).toHaveClass(/bg-purple-500/);
  });
});