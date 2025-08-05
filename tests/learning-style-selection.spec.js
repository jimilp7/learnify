const { test, expect } = require('@playwright/test');

test.describe('Learning Style Selection Feature', () => {
  test('complete flow with learning style selection', async ({ page }) => {
    console.log('🧪 Starting complete learning style selection test');
    
    await page.goto('/');
    
    // Step 1: Topic Selection
    console.log('📝 Step 1: Topic Selection');
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    const topicInput = page.locator('textarea');
    await expect(topicInput).toBeVisible();
    await topicInput.fill('JavaScript basics');
    
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    
    // Step 2: Depth Selection  
    console.log('🎓 Step 2: Depth Selection');
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: JavaScript basics')).toBeVisible();
    
    // Check all depth options are present
    await expect(page.locator('text=Simple')).toBeVisible();
    await expect(page.locator('text=Normal')).toBeVisible();
    await expect(page.locator('text=Advanced')).toBeVisible();
    
    // Select Normal depth
    await page.locator('text=Normal').click();
    await page.locator('button:has-text("Next")').click();
    
    // Step 3: Learning Style Selection (NEW)
    console.log('🎨 Step 3: Learning Style Selection');
    await expect(page.locator('h1')).toContainText('Learning style?');
    await expect(page.locator('text=JavaScript basics')).toBeVisible();
    await expect(page.locator('text=Normal (High School)')).toBeVisible();
    
    // Check all learning style options are present
    await expect(page.locator('text=Visual')).toBeVisible();
    await expect(page.locator('text=Auditory')).toBeVisible();
    await expect(page.locator('text=Hands-on')).toBeVisible();
    await expect(page.locator('text=Analytical')).toBeVisible();
    
    // Check descriptions are present
    await expect(page.locator('text=Charts, diagrams, and structured information')).toBeVisible();
    await expect(page.locator('text=Stories, discussions, and verbal explanations')).toBeVisible();
    await expect(page.locator('text=Practical examples and real-world applications')).toBeVisible();
    await expect(page.locator('text=Logical patterns and systematic breakdowns')).toBeVisible();
    
    // Select Visual learning style
    await page.locator('text=Visual').click();
    
    // Verify the visual option is selected (should have purple background)
    const visualOption = page.locator('button:has-text("Visual")');
    await expect(visualOption).toHaveClass(/bg-purple-400/);
    
    // Click Generate Plan button
    const generatePlanButton = page.locator('button:has-text("Generate Plan")');
    await expect(generatePlanButton).toBeVisible();
    await generatePlanButton.click();
    
    // Step 4: Generating Plan
    console.log('⏳ Step 4: Generating Plan');
    await expect(page.locator('h1')).toContainText('Generating your plan');
    await expect(page.locator('text=JavaScript basics')).toBeVisible();
    await expect(page.locator('text=Normal depth')).toBeVisible();
    
    // Wait for lesson plan to be generated (may take up to 30 seconds)
    console.log('⏱️ Waiting for lesson plan generation...');
    await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 60000 });
    
    // Step 5: Verify Lesson Plan Generated
    console.log('📚 Step 5: Lesson Plan Generated');
    await expect(page.locator('text=JavaScript basics')).toBeVisible();
    await expect(page.locator('text=Normal depth')).toBeVisible();
    
    // Check that lessons are displayed
    const lessons = page.locator('[data-testid="lesson"]');
    await expect(lessons.first()).toBeVisible();
    
    console.log('✅ Complete learning style selection flow test passed');
  });

  test('learning style selection back navigation', async ({ page }) => {
    console.log('🧪 Starting back navigation test');
    
    await page.goto('/');
    
    // Navigate to learning style selection
    await page.locator('textarea').fill('Python programming');
    await page.locator('button:has-text("Next")').click();
    
    await expect(page.locator('h1')).toContainText('How deep?');
    await page.locator('text=Advanced').click();
    await page.locator('button:has-text("Next")').click();
    
    // Now at learning style selection
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    // Test back navigation
    const backButton = page.locator('button').first(); // Back arrow button
    await backButton.click();
    
    // Should be back at depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: Python programming')).toBeVisible();
    
    console.log('✅ Back navigation test passed');
  });

  test('learning style selection state persistence', async ({ page }) => {
    console.log('🧪 Starting state persistence test');
    
    await page.goto('/');
    
    // Navigate through the flow
    await page.locator('textarea').fill('Machine Learning');
    await page.locator('button:has-text("Next")').click();
    
    await page.locator('text=Simple').click();
    await page.locator('button:has-text("Next")').click();
    
    // At learning style selection
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    // Select Analytical style
    await page.locator('text=Analytical').click();
    
    // Verify selection is visually indicated
    const analyticalOption = page.locator('button:has-text("Analytical")');
    await expect(analyticalOption).toHaveClass(/bg-purple-700/);
    
    // Navigate back and forward to test persistence
    await page.locator('button').first().click(); // Back to depth
    await page.locator('button:has-text("Next")').click(); // Forward to learning style
    
    // Verify Analytical is still selected
    await expect(analyticalOption).toHaveClass(/bg-purple-700/);
    
    console.log('✅ State persistence test passed');
  });

  test('all learning style options are interactive', async ({ page }) => {
    console.log('🧪 Starting interactive options test');
    
    await page.goto('/');
    
    // Navigate to learning style selection
    await page.locator('textarea').fill('Data Science');
    await page.locator('button:has-text("Next")').click();
    await page.locator('text=Normal').click();
    await page.locator('button:has-text("Next")').click();
    
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    // Test each learning style option
    const styles = ['Visual', 'Auditory', 'Hands-on', 'Analytical'];
    const colors = ['bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700'];
    
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      const color = colors[i];
      
      console.log(`🎨 Testing ${style} learning style`);
      
      const styleButton = page.locator(`button:has-text("${style}")`);
      await styleButton.click();
      
      // Verify the style is selected with correct color
      await expect(styleButton).toHaveClass(new RegExp(color));
      
      // Verify other styles are not selected
      for (let j = 0; j < styles.length; j++) {
        if (i !== j) {
          const otherStyleButton = page.locator(`button:has-text("${styles[j]}")`);
          await expect(otherStyleButton).not.toHaveClass(new RegExp(colors[j]));
        }
      }
    }
    
    console.log('✅ Interactive options test passed');
  });
});