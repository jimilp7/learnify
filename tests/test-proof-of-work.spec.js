const { test, expect } = require('@playwright/test');

test.describe('Learning Style Feature Proof of Work', () => {
  test('complete learning style flow proof of work', async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Verify we're on the topic selection screen
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    // Enter a topic
    await page.fill('textarea', 'JavaScript Promises');
    await page.click('button:has-text("Next")');
    
    // Verify we're on depth selection screen
    await expect(page.locator('h1')).toContainText('How deep?');
    
    // Select Normal depth
    await page.click('button:has(div:has-text("Normal"))');
    await page.click('button:has-text("Next")');
    
    // Verify we're on learning style selection screen
    await expect(page.locator('h1')).toContainText('How do you learn?');
    
    // Verify all learning style options are present
    await expect(page.locator('text=Visual')).toBeVisible();
    await expect(page.locator('text=Auditory')).toBeVisible(); 
    await expect(page.locator('text=Hands-on')).toBeVisible();
    await expect(page.locator('text=Analytical')).toBeVisible();
    
    // Select Analytical learning style
    await page.click('button:has(div:has-text("Analytical"))');
    
    // Verify the selection is highlighted
    await expect(page.locator('button:has(div:has-text("Analytical"))')).toHaveClass(/bg-purple-700/);
    
    // Proceed to lesson plan generation
    await page.click('button:has-text("Next")');
    
    // Wait for generating screen
    await expect(page.locator('text=Generating your lesson plan')).toBeVisible();
    
    // Wait for lesson plan screen (may take a while due to OpenAI API)
    await expect(page.locator('h2')).toContainText('Your Learning Plan', { timeout: 60000 });
    
    // Verify lessons are displayed
    const lessons = page.locator('[data-lesson-id]');
    await expect(lessons.first()).toBeVisible();
    
    console.log('✅ Learning style selection feature working correctly!');
  });
  
  test('back navigation proof of work', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Navigate to learning style screen
    await page.fill('textarea', 'React Hooks');
    await page.click('button:has-text("Next")');
    await page.click('button:has(div:has-text("Simple"))');
    await page.click('button:has-text("Next")');
    
    // Verify we're on learning style screen
    await expect(page.locator('h1')).toContainText('How do you learn?');
    
    // Test back navigation
    await page.click('button[aria-label="Back"], button:has([data-testid="arrow-left"]), svg[data-lucide="arrow-left"]');
    
    // Verify we're back on depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    
    console.log('✅ Back navigation working correctly!');
  });
});