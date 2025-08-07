import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002');
  });

  test('should navigate through the complete flow with preferences', async ({ page }) => {
    // Step 1: Enter a topic
    await expect(page.getByText('What do you want to learn?')).toBeVisible();
    await page.getByPlaceholder('Type anything...').fill('JavaScript programming');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();

    // Step 2: Complete learning preferences
    await expect(page.getByText('How do you learn best?')).toBeVisible();
    await expect(page.getByText('Learning: JavaScript programming')).toBeVisible();
    
    // Select learning style - auditory should be pre-selected
    await expect(page.getByText('Auditory')).toBeVisible();
    
    // Select a different learning style
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    
    // Select pace - normal should be pre-selected
    await expect(page.getByText('Normal pace')).toBeVisible();
    
    // Change to slow pace
    await page.locator('button').filter({ hasText: 'Take it slow' }).click();
    
    // Focus areas - theory and examples should be pre-selected
    await expect(page.getByText('Theory & Concepts')).toBeVisible();
    await expect(page.getByText('Real-world Examples')).toBeVisible();
    
    // Add more focus areas
    await page.locator('button').filter({ hasText: 'Practical Applications' }).click();
    
    // Time available - 15 minutes should be pre-selected
    await expect(page.getByText('15 minutes')).toBeVisible();
    
    // Change to 30+ minutes
    await page.locator('button').filter({ hasText: '30+ minutes' }).click();
    
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3: Verify we reach depth selection
    await expect(page.getByText('How deep?')).toBeVisible();
    await expect(page.getByText('Learning: JavaScript programming')).toBeVisible();
    
    // Test back navigation from depth to preferences
    await page.locator('button').first().click(); // Back button
    await expect(page.getByText('How do you learn best?')).toBeVisible();
    
    // Continue to depth selection again
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('How deep?')).toBeVisible();
    
    // Select depth and continue
    await page.locator('button').filter({ hasText: 'Simple' }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    
    // Should reach generating screen
    await expect(page.getByText('Generating Lesson Plan')).toBeVisible();
  });

  test('should require at least one focus area selected', async ({ page }) => {
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('Test topic');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    
    await expect(page.getByText('How do you learn best?')).toBeVisible();
    
    // Unselect all focus areas (theory and examples are pre-selected)
    await page.locator('button').filter({ hasText: 'Theory & Concepts' }).click();
    await page.locator('button').filter({ hasText: 'Real-world Examples' }).click();
    
    // Continue button should be disabled
    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled();
    
    // Select one focus area
    await page.locator('button').filter({ hasText: 'Theory & Concepts' }).click();
    
    // Continue button should be enabled
    await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  test('should navigate back to topic selection from preferences', async ({ page }) => {
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('Test topic');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    
    await expect(page.getByText('How do you learn best?')).toBeVisible();
    
    // Click back button
    await page.locator('button').first().click(); // Back arrow
    
    // Should return to topic selection
    await expect(page.getByText('What do you want to learn?')).toBeVisible();
    await expect(page.getByPlaceholder('Type anything...')).toHaveValue('Test topic');
  });

  test('should preserve learning style selections', async ({ page }) => {
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('Test topic');
    await page.getByRole('button', { name: 'Next', exact: true }).first().click();
    
    // Change learning style from default auditory to kinesthetic
    await page.locator('button').filter({ hasText: 'Hands-on' }).click();
    
    // Verify visual feedback shows selection
    await expect(page.locator('button').filter({ hasText: 'Hands-on' })).toHaveClass(/bg-blue-500/);
    
    // Change pace to fast
    await page.locator('button').filter({ hasText: 'Quick pace' }).click();
    await expect(page.locator('button').filter({ hasText: 'Quick pace' })).toHaveClass(/bg-green-500/);
    
    // Add step-by-step guide focus
    await page.locator('button').filter({ hasText: 'Step-by-step Guide' }).click();
    await expect(page.locator('button').filter({ hasText: 'Step-by-step Guide' })).toHaveClass(/bg-purple-500/);
    
    // Change time to 5 minutes
    await page.locator('button').filter({ hasText: '5 minutes' }).first().click();
    await expect(page.locator('button').filter({ hasText: '5 minutes' }).first()).toHaveClass(/bg-orange-500/);
  });
});