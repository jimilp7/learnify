import { test, expect } from '@playwright/test';

test.describe('Learning Style Selection Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should navigate through the complete learning style flow', async ({ page }) => {
    // Step 1: Topic Selection
    const topicTextarea = page.locator('textarea[placeholder="Type anything..."]');
    await expect(topicTextarea).toBeVisible();
    await topicTextarea.fill('JavaScript fundamentals');
    
    // Click Next button (should be enabled after typing)
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).not.toBeDisabled();
    await nextButton.click();

    // Step 2: Depth Selection
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    await expect(page.locator('text=Learning: JavaScript fundamentals')).toBeVisible();
    
    // Select Normal depth
    const normalDepth = page.locator('button:has-text("Normal")');
    await normalDepth.click();
    await nextButton.click();

    // Step 3: Learning Style Selection (NEW STEP)
    await expect(page.locator('h1:has-text("Learning Style?")')).toBeVisible();
    await expect(page.locator('text=Learning: JavaScript fundamentals')).toBeVisible();
    await expect(page.locator('text=Level: Normal (High School)')).toBeVisible();
    
    // Check all learning style options are present
    await expect(page.locator('button:has-text("Visual")')).toBeVisible();
    await expect(page.locator('button:has-text("Auditory")')).toBeVisible();
    await expect(page.locator('button:has-text("Hands-on")')).toBeVisible();
    await expect(page.locator('button:has-text("Reading")')).toBeVisible();
    
    // Select Visual learning style
    const visualStyle = page.locator('button:has-text("Visual")');
    await visualStyle.click();
    
    // Verify visual style is selected (should have purple background)
    await expect(visualStyle).toHaveClass(/bg-purple-400/);
    
    await nextButton.click();

    // Step 4: Should go to Generating Plan screen
    await expect(page.locator('h1:has-text("Generating Lesson Plan")')).toBeVisible();
    await expect(page.locator('text=JavaScript fundamentals')).toBeVisible();
    await expect(page.locator('text=Normal (High School)')).toBeVisible();
  });

  test('should show all learning style options with correct styling', async ({ page }) => {
    // Navigate to learning style step
    await page.locator('textarea[placeholder="Type anything..."]').fill('Python basics');
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Simple")').click();
    await page.locator('button:has-text("Next")').click();

    // Verify all learning style options
    const learningStyles = [
      { text: 'Visual', emoji: '👁️', description: 'Learn through diagrams, charts, and visual examples' },
      { text: 'Auditory', emoji: '👂', description: 'Learn through listening and discussion' },
      { text: 'Hands-on', emoji: '✋', description: 'Learn through practice and real examples' },
      { text: 'Reading', emoji: '📚', description: 'Learn through text and written information' }
    ];

    for (const style of learningStyles) {
      const styleButton = page.locator(`button:has-text("${style.text}")`);
      await expect(styleButton).toBeVisible();
      await expect(styleButton.locator(`text=${style.description}`)).toBeVisible();
    }
  });

  test('should allow back navigation from learning style selection', async ({ page }) => {
    // Navigate to learning style step
    await page.locator('textarea[placeholder="Type anything..."]').fill('React hooks');
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Advanced")').click();
    await page.locator('button:has-text("Next")').click();

    // Verify we're on learning style page
    await expect(page.locator('h1:has-text("Learning Style?")')).toBeVisible();

    // Click back button
    const backButton = page.locator('button').nth(0); // First button should be back arrow
    await backButton.click();

    // Should be back on depth selection
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    await expect(page.locator('text=Learning: React hooks')).toBeVisible();
  });

  test('should have correct selection state for learning styles', async ({ page }) => {
    // Navigate to learning style step
    await page.locator('textarea[placeholder="Type anything..."]').fill('CSS Grid');
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Normal")').click();
    await page.locator('button:has-text("Next")').click();

    // Default selection should be "Auditory"
    const auditoryButton = page.locator('button:has-text("Auditory")');
    await expect(auditoryButton).toHaveClass(/bg-purple-500/);

    // Click on Hands-on (Kinesthetic)
    const handsOnButton = page.locator('button:has-text("Hands-on")');
    await handsOnButton.click();

    // Hands-on should now be selected
    await expect(handsOnButton).toHaveClass(/bg-purple-600/);
    
    // Auditory should no longer be selected
    await expect(auditoryButton).not.toHaveClass(/bg-purple-500/);
    await expect(auditoryButton).toHaveClass(/bg-gray-50/);
  });

  test('should show error handling on learning style page', async ({ page }) => {
    // This test would be for API errors, but since we can't easily mock failures,
    // we'll just verify the error prop is passed through correctly
    
    // Navigate to learning style step
    await page.locator('textarea[placeholder="Type anything..."]').fill('Node.js');
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Normal")').click();
    await page.locator('button:has-text("Next")').click();

    // Verify the error container exists (even if empty)
    await expect(page.locator('h1:has-text("Learning Style?")')).toBeVisible();
    
    // The error div should exist but be empty in normal conditions
    const errorDiv = page.locator('.bg-red-50');
    // Error div should not be visible when there's no error
    await expect(errorDiv).not.toBeVisible();
  });

  test('should retain form data when navigating back and forth', async ({ page }) => {
    const topic = 'Machine Learning Basics';
    
    // Step 1: Enter topic
    await page.locator('textarea[placeholder="Type anything..."]').fill(topic);
    await page.locator('button:has-text("Next")').click();

    // Step 2: Select depth
    await page.locator('button:has-text("Advanced")').click();
    await page.locator('button:has-text("Next")').click();

    // Step 3: Select learning style
    await page.locator('button:has-text("Reading")').click();
    
    // Navigate back to depth
    await page.locator('button').nth(0).click(); // Back button
    await expect(page.locator('h1:has-text("How deep?")')).toBeVisible();
    
    // Navigate back to topic
    await page.locator('button').nth(0).click(); // Back button
    await expect(page.locator('h1:has-text("What do you want to learn?")')).toBeVisible();
    
    // Verify topic is retained
    await expect(page.locator('textarea')).toHaveValue(topic);
    
    // Go forward again
    await page.locator('button:has-text("Next")').click();
    await expect(page.locator('text=Learning: Machine Learning Basics')).toBeVisible();
    
    // Advanced should still be selected
    const advancedButton = page.locator('button:has-text("Advanced")');
    await expect(advancedButton).toHaveClass(/bg-green-600/);
  });

  test('should maintain learning style selection when navigating back from generating screen', async ({ page }) => {
    // Navigate through all steps
    await page.locator('textarea[placeholder="Type anything..."]').fill('TypeScript');
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Normal")').click();
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Hands-on")').click();
    await page.locator('button:has-text("Next")').click();

    // Should be on generating screen
    await expect(page.locator('h1:has-text("Generating Lesson Plan")')).toBeVisible();
    
    // Click back (this should go back to learning style, not depth)
    await page.locator('button').nth(0).click(); // Back button

    // Should be back on learning style page
    await expect(page.locator('h1:has-text("Learning Style?")')).toBeVisible();
    
    // Hands-on should still be selected
    const handsOnButton = page.locator('button:has-text("Hands-on")');
    await expect(handsOnButton).toHaveClass(/bg-purple-600/);
  });
});

test.describe('Learning Style Integration with API', () => {
  test('should include learning style in API request payload', async ({ page }) => {
    // This test verifies that the learning style is included in the API call
    // We'll monitor network requests
    
    let apiRequest: any = null;
    
    // Listen for API calls
    page.on('request', (request) => {
      if (request.url().includes('/api/generate-plan')) {
        apiRequest = request;
      }
    });

    // Navigate through the flow
    await page.goto('http://localhost:3000');
    await page.locator('textarea[placeholder="Type anything..."]').fill('Web Development');
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Normal")').click();
    await page.locator('button:has-text("Next")').click();
    await page.locator('button:has-text("Visual")').click();
    await page.locator('button:has-text("Next")').click();

    // Wait for the API call to be made
    await page.waitForTimeout(1000);
    
    // Verify the API request was made and includes learning style
    expect(apiRequest).not.toBeNull();
    if (apiRequest) {
      const postData = apiRequest.postData();
      expect(postData).toBeTruthy();
      
      const requestBody = JSON.parse(postData);
      expect(requestBody.topic).toBe('Web Development');
      expect(requestBody.depth).toBe('normal');
      expect(requestBody.learningStyle).toBe('visual');
    }
  });
});