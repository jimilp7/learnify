import { test, expect } from '@playwright/test';

test.describe('Learning Preferences - Final Integration Test', () => {
  test('should successfully complete the full learning preferences flow', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3002');
    
    // Step 1: Topic Selection
    await expect(page.locator('h1')).toContainText('What do you want to learn');
    await page.getByPlaceholder('Type anything...').fill('Machine Learning Fundamentals');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Step 2: Learning Preferences Selection
    await expect(page.locator('h1')).toContainText('How do you learn best');
    await expect(page.getByText('Learning: Machine Learning Fundamentals')).toBeVisible();
    await expect(page.getByText('Select all that apply')).toBeVisible();
    
    // Verify all learning style options are present
    await expect(page.locator('button').filter({ hasText: 'Visual' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Auditory' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Hands-on' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Reading/Writing' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Step-by-step' })).toBeVisible();
    await expect(page.locator('button').filter({ hasText: 'Big Picture' })).toBeVisible();
    
    // Select multiple preferences
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await page.locator('button').filter({ hasText: 'Hands-on' }).click();
    
    // Verify Next button updates with count
    await expect(page.locator('div.fixed button')).toContainText('Next (2 selected)');
    
    // Continue to depth selection
    await page.locator('div.fixed button').filter({ hasText: 'Next (2 selected)' }).click();
    
    // Step 3: Verify Depth Selection
    await expect(page.locator('h1')).toContainText('How deep');
    await expect(page.getByText('Learning: Machine Learning Fundamentals')).toBeVisible();
    
    // Verify depth options are present
    await expect(page.getByText('Simple')).toBeVisible();
    await expect(page.getByText('Normal')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();
    
    // Success: We've successfully implemented and tested the learning preferences feature
    // The flow goes: Topic → Preferences → Depth Selection
  });
  
  test('should allow selecting and deselecting preferences', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('JavaScript');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Initially Next button should be disabled (no preferences selected)
    const nextButton = page.locator('div.fixed button');
    await expect(nextButton).toBeDisabled();
    
    // Select a preference
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await expect(nextButton).toContainText('Next (1 selected)');
    await expect(nextButton).toBeEnabled();
    
    // Select another preference
    await page.locator('button').filter({ hasText: 'Auditory' }).click();
    await expect(nextButton).toContainText('Next (2 selected)');
    
    // Deselect the first preference
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await expect(nextButton).toContainText('Next (1 selected)');
    
    // Deselect the last preference
    await page.locator('button').filter({ hasText: 'Auditory' }).click();
    await expect(nextButton).toBeDisabled();
  });
});