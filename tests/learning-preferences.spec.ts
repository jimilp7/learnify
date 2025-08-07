import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test('should navigate to learning preferences screen after topic selection', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Start from topic selection
    await expect(page.getByRole('heading', { name: 'What do you want to learn?' })).toBeVisible();
    
    // Enter a topic
    const topicInput = page.getByPlaceholder('Type anything...');
    await topicInput.fill('JavaScript fundamentals');
    
    // Click Next button (the main CTA button)
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Should now be on learning preferences screen
    await expect(page.getByRole('heading', { name: 'How do you learn best?' })).toBeVisible();
    await expect(page.getByText('Learning: JavaScript fundamentals')).toBeVisible();
    await expect(page.getByText('Select all that apply')).toBeVisible();
  });

  test('should display all learning style options with correct styling', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate to preferences screen
    await page.getByPlaceholder('Type anything...').fill('Python programming');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Check all learning style options are present
    await expect(page.locator('button').filter({ hasText: 'Visual' })).toBeVisible();
    await expect(page.getByText('Auditory')).toBeVisible();
    await expect(page.getByText('Hands-on')).toBeVisible();
    await expect(page.getByText('Reading/Writing')).toBeVisible();
    await expect(page.getByText('Step-by-step')).toBeVisible();
    await expect(page.getByText('Big Picture')).toBeVisible();
    
    // Check descriptions are visible
    await expect(page.getByText('Learn through images, diagrams, and visual aids')).toBeVisible();
    await expect(page.getByText('Learn through listening and verbal explanations')).toBeVisible();
    await expect(page.getByText('Learn through practical examples and activities')).toBeVisible();
    
    // Check emojis are present
    await expect(page.getByText('👁️')).toBeVisible();
    await expect(page.getByText('🎧')).toBeVisible();
    await expect(page.getByText('🤲')).toBeVisible();
  });

  test('should allow selecting and deselecting multiple preferences', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate to preferences screen
    await page.getByPlaceholder('Type anything...').fill('Data Science');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Initially Next button should be disabled
    const nextButton = page.locator('div.fixed button');
    await expect(nextButton).toBeDisabled();
    
    // Select Visual learning style
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    
    // Next button should now be enabled and show count
    await expect(nextButton).toBeEnabled();
    await expect(nextButton).toHaveText('Next (1 selected)');
    
    // Select Hands-on learning style
    await page.locator('button').filter({ hasText: 'Hands-on' }).click();
    await expect(nextButton).toHaveText('Next (2 selected)');
    
    // Select Big Picture learning style
    await page.locator('button').filter({ hasText: 'Big Picture' }).click();
    await expect(nextButton).toHaveText('Next (3 selected)');
    
    // Deselect Visual (click again)
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await expect(nextButton).toHaveText('Next (2 selected)');
    
    // Deselect all remaining
    await page.locator('button').filter({ hasText: 'Hands-on' }).click();
    await page.locator('button').filter({ hasText: 'Big Picture' }).click();
    
    // Next button should be disabled again
    await expect(nextButton).toBeDisabled();
  });

  test('should navigate to depth selection after preferences selection', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate through topic to preferences
    await page.getByPlaceholder('Type anything...').fill('Machine Learning');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Select some preferences
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await page.locator('button').filter({ hasText: 'Reading/Writing' }).click();
    
    // Click Next
    await page.locator('div.fixed button').filter({ hasText: /Next \(2 selected\)/ }).click();
    
    // Should now be on depth selection screen
    await expect(page.getByRole('heading', { name: 'How deep?' })).toBeVisible();
    await expect(page.getByText('Learning: Machine Learning')).toBeVisible();
    
    // Should see depth options
    await expect(page.getByText('Simple')).toBeVisible();
    await expect(page.getByText('Normal')).toBeVisible();
    await expect(page.getByText('Advanced')).toBeVisible();
  });

  test('should navigate back to topic selection from preferences screen', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate to preferences screen
    await page.getByPlaceholder('Type anything...').fill('Web Development');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Should be on preferences screen
    await expect(page.getByRole('heading', { name: 'How do you learn best?' })).toBeVisible();
    
    // Click back button
    await page.locator('button').first().click();
    
    // Should be back on topic selection screen
    await expect(page.getByRole('heading', { name: 'What do you want to learn?' })).toBeVisible();
    
    // Topic input should still have the value
    const topicInput = page.getByPlaceholder('Type anything...');
    await expect(topicInput).toHaveValue('Web Development');
  });

  test('should navigate back to preferences from depth selection', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate through topic and preferences to depth
    await page.getByPlaceholder('Type anything...').fill('React Development');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Select preferences
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await page.locator('button').filter({ hasText: 'Hands-on' }).click();
    await page.locator('div.fixed button').filter({ hasText: /Next \(2 selected\)/ }).click();
    
    // Should be on depth selection
    await expect(page.getByRole('heading', { name: 'How deep?' })).toBeVisible();
    
    // Click back button
    await page.locator('button').first().click();
    
    // Should be back on preferences screen
    await expect(page.getByRole('heading', { name: 'How do you learn best?' })).toBeVisible();
    
    // Previously selected preferences should still be selected (visual styling check)
    const visualOption = page.locator('button').filter({ hasText: 'Visual' });
    const handsOnOption = page.locator('button').filter({ hasText: 'Hands-on' });
    
    // These should have selected styling (colored background)
    await expect(visualOption).toHaveClass(/bg-blue-400/);
    await expect(handsOnOption).toHaveClass(/bg-orange-400/);
  });

  test('should maintain preferences state when navigating back and forth', async ({ page }) => {
    await page.goto('http://localhost:3002');
    
    // Navigate to preferences
    await page.getByPlaceholder('Type anything...').fill('Game Development');
    await page.locator('div.fixed button').filter({ hasText: 'Next' }).click();
    
    // Select multiple preferences
    await page.locator('button').filter({ hasText: 'Visual' }).click();
    await page.locator('button').filter({ hasText: 'Auditory' }).click();
    await page.locator('button').filter({ hasText: 'Step-by-step' }).click();
    
    // Go to depth selection
    await page.locator('div.fixed button').filter({ hasText: /Next \(3 selected\)/ }).click();
    
    // Go back to preferences
    await page.locator('button').first().click();
    
    // All three preferences should still be selected
    await expect(page.locator('div.fixed button').filter({ hasText: /Next \(3 selected\)/ })).toBeVisible();
    
    // Deselect one
    await page.locator('button').filter({ hasText: 'Auditory' }).click();
    await expect(page.locator('div.fixed button').filter({ hasText: /Next \(2 selected\)/ })).toBeVisible();
    
    // Go forward again
    await page.locator('div.fixed button').filter({ hasText: /Next \(2 selected\)/ }).click();
    await expect(page.getByRole('heading', { name: 'How deep?' })).toBeVisible();
  });
});