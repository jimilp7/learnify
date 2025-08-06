import { test, expect } from '@playwright/test';

test.describe('Learning Preferences Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Navigate through topic selection to reach preferences screen
    await page.fill('textarea[placeholder="Type anything..."]', 'JavaScript programming');
    await page.click('button:has-text("Next")');
    // Should now be on preferences screen
    await page.waitForSelector('h1:has-text("How do you learn best?")');
  });

  test('should display learning preferences screen with correct elements', async ({ page }) => {
    // Check main heading
    await expect(page.locator('h1')).toContainText('How do you learn best?');
    
    // Check topic is displayed
    await expect(page.locator('text=Learning: JavaScript programming')).toBeVisible();
    
    // Check instructions
    await expect(page.locator('text=Select all that apply')).toBeVisible();
    
    // Check back button exists
    await expect(page.locator('button').first()).toBeVisible();
    
    // Check all 6 learning style options are present
    const expectedOptions = [
      'Visual',
      'Auditory', 
      'Hands-on',
      'Reading',
      'Social',
      'Analytical'
    ];
    
    for (const option of expectedOptions) {
      await expect(page.locator(`button:has-text("${option}")`)).toBeVisible();
    }
    
    // Check Next button exists and is disabled initially
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeDisabled();
  });

  test('should allow selecting single preference', async ({ page }) => {
    // Click on Visual preference
    await page.click('button:has-text("Visual")');
    
    // Check that Visual preference is selected (has colored background)
    const visualButton = page.locator('button:has-text("Visual")');
    await expect(visualButton).toHaveClass(/bg-purple-500/);
    
    // Check selection counter shows 1 preference
    await expect(page.locator('text=1 preference selected')).toBeVisible();
    
    // Check Next button is now enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
    
    // Check preference chip is displayed
    await expect(page.locator('.bg-blue-100:has-text("Visual")')).toBeVisible();
  });

  test('should allow selecting multiple preferences', async ({ page }) => {
    // Select Visual and Auditory preferences
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Auditory")');
    
    // Check both preferences are selected
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
    await expect(page.locator('button:has-text("Auditory")')).toHaveClass(/bg-blue-500/);
    
    // Check selection counter shows 2 preferences
    await expect(page.locator('text=2 preferences selected')).toBeVisible();
    
    // Check both preference chips are displayed
    await expect(page.locator('.bg-blue-100:has-text("Visual")')).toBeVisible();
    await expect(page.locator('.bg-blue-100:has-text("Auditory")')).toBeVisible();
    
    // Check Next button is enabled
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  });

  test('should allow deselecting preferences', async ({ page }) => {
    // Select Visual preference
    await page.click('button:has-text("Visual")');
    await expect(page.locator('text=1 preference selected')).toBeVisible();
    
    // Deselect Visual preference by clicking again
    await page.click('button:has-text("Visual")');
    
    // Check Visual preference is no longer selected
    const visualButton = page.locator('button:has-text("Visual")');
    await expect(visualButton).not.toHaveClass(/bg-purple-500/);
    
    // Check selection counter is hidden when no preferences selected
    await expect(page.locator('text=preference selected')).not.toBeVisible();
    
    // Check Next button is disabled again
    await expect(page.locator('button:has-text("Next")')).toBeDisabled();
  });

  test('should navigate back to topic selection', async ({ page }) => {
    // Click back button
    await page.locator('button').first().click();
    
    // Should be back on topic selection screen
    await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
    
    // Topic field should be empty since we went back
    const topicInput = page.locator('textarea[placeholder="Type anything..."]');
    await expect(topicInput).toHaveValue('');
  });

  test('should proceed to depth selection with preferences', async ({ page }) => {
    // Select preferences
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Hands-on")');
    
    // Click Next
    await page.click('button:has-text("Next")');
    
    // Should be on depth selection screen
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    await expect(page.locator('text=Learning: JavaScript programming')).toBeVisible();
  });

  test('should navigate from depth selection back to preferences', async ({ page }) => {
    // Select preferences and proceed to depth selection
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Next")');
    
    // Now on depth selection screen
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    
    // Click back button on depth selection
    await page.locator('button').first().click();
    
    // Should be back on preferences screen
    await expect(page.locator('h1:has-text("How do you learn best?")')).toBeVisible();
    
    // Previously selected preferences should still be selected
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
    await expect(page.locator('text=1 preference selected')).toBeVisible();
  });

  test('should handle all preference types correctly', async ({ page }) => {
    const preferenceTests = [
      { name: 'Visual', emoji: '👁️', color: 'bg-purple-500' },
      { name: 'Auditory', emoji: '🎧', color: 'bg-blue-500' },
      { name: 'Hands-on', emoji: '🛠️', color: 'bg-orange-500' },
      { name: 'Reading', emoji: '📚', color: 'bg-green-500' },
      { name: 'Social', emoji: '👥', color: 'bg-pink-500' },
      { name: 'Analytical', emoji: '🔬', color: 'bg-indigo-500' },
    ];

    // Test each preference individually
    for (const pref of preferenceTests) {
      await page.click(`button:has-text("${pref.name}")`);
      
      // Check button has correct background color
      await expect(page.locator(`button:has-text("${pref.name}")`)).toHaveClass(new RegExp(pref.color));
      
      // Check preference chip appears
      await expect(page.locator(`.bg-blue-100:has-text("${pref.name}")`)).toBeVisible();
      
      // Deselect for next iteration
      await page.click(`button:has-text("${pref.name}")`);
    }
  });

  test('should maintain selections through navigation', async ({ page }) => {
    // Select multiple preferences
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Auditory")');
    await page.click('button:has-text("Reading")');
    
    // Navigate to depth selection
    await page.click('button:has-text("Next")');
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    
    // Navigate back to preferences
    await page.locator('button').first().click();
    
    // All selections should be maintained
    await expect(page.locator('button:has-text("Visual")')).toHaveClass(/bg-purple-500/);
    await expect(page.locator('button:has-text("Auditory")')).toHaveClass(/bg-blue-500/);
    await expect(page.locator('button:has-text("Reading")')).toHaveClass(/bg-green-500/);
    await expect(page.locator('text=3 preferences selected')).toBeVisible();
  });

  test('should display proper descriptions for each preference', async ({ page }) => {
    const descriptions = [
      { name: 'Visual', desc: 'I learn best with diagrams, charts, and visual examples' },
      { name: 'Auditory', desc: 'I prefer listening and verbal explanations' },
      { name: 'Hands-on', desc: 'I learn by doing and practical exercises' },
      { name: 'Reading', desc: 'I like detailed text and written materials' },
      { name: 'Social', desc: 'I prefer group discussions and collaborative learning' },
      { name: 'Analytical', desc: 'I like logical, step-by-step explanations' },
    ];

    for (const item of descriptions) {
      await expect(page.locator(`text=${item.desc}`)).toBeVisible();
    }
  });
});