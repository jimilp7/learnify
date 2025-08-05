const { test, expect } = require('@playwright/test');

test.describe('Learning Style Feature Demo', () => {
  test('comprehensive learning style feature demonstration', async ({ page }) => {
    console.log('🎬 Starting comprehensive learning style feature demo');
    
    await page.goto('/');
    
    // Demo 1: Complete flow with Visual learning style
    console.log('🎨 Demo 1: Visual Learning Style Flow');
    
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    
    // Enter topic with focus on visual learning
    const topicInput = page.locator('textarea');
    await topicInput.fill('Web Development with React');
    await page.waitForTimeout(1000); // Allow time to see typing
    
    await page.locator('button:has-text("Next")').click();
    await page.waitForTimeout(1000);
    
    // Select Advanced depth
    await expect(page.locator('h1')).toContainText('How deep?');
    await page.locator('text=Advanced').click();
    await page.waitForTimeout(1000);
    
    await page.locator('button:has-text("Next")').click();
    
    // Learning Style Selection Screen
    await expect(page.locator('h1')).toContainText('Learning style?');
    await expect(page.locator('text=Web Development with React')).toBeVisible();
    await expect(page.locator('text=Advanced (PhD/Researcher)')).toBeVisible();
    
    // Demonstrate all learning style options by hovering
    console.log('👀 Demonstrating all learning style options');
    
    // Visual option
    const visualOption = page.locator('button:has-text("Visual")');
    await visualOption.hover();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Charts, diagrams, and structured information')).toBeVisible();
    
    // Auditory option  
    const auditoryOption = page.locator('button:has-text("Auditory")');
    await auditoryOption.hover();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Stories, discussions, and verbal explanations')).toBeVisible();
    
    // Hands-on option
    const handsOnOption = page.locator('button:has-text("Hands-on")');
    await handsOnOption.hover();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Practical examples and real-world applications')).toBeVisible();
    
    // Analytical option
    const analyticalOption = page.locator('button:has-text("Analytical")');
    await analyticalOption.hover();
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Logical patterns and systematic breakdowns')).toBeVisible();
    
    // Select Visual learning style
    console.log('🎨 Selecting Visual learning style');
    await visualOption.click();
    await expect(visualOption).toHaveClass(/bg-purple-400/);
    await page.waitForTimeout(2000);
    
    // Generate plan
    await page.locator('button:has-text("Generate Plan")').click();
    
    // Show generating plan screen
    await expect(page.locator('h1')).toContainText('Generating your plan');
    console.log('⏳ Waiting for AI to generate personalized lesson plan...');
    
    // Wait for lesson plan (this is where AI integration happens)
    await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 60000 });
    
    console.log('📚 Lesson plan generated successfully with Visual learning style preferences');
    
    // Verify lesson plan shows topic and depth
    await expect(page.locator('text=Web Development with React')).toBeVisible();
    await expect(page.locator('text=Advanced depth')).toBeVisible();
    
    // Check that lessons are displayed
    const lessons = page.locator('[data-testid="lesson"]');
    await expect(lessons.first()).toBeVisible();
    
    console.log('✅ Visual learning style demo completed successfully');
    
    // Demo 2: Test back navigation preserves all selections
    console.log('⬅️ Demo 2: Testing back navigation');
    
    // Go back to learning style selection
    const backButton = page.locator('button').first();
    await backButton.click();
    
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    // Verify all previous selections are preserved
    await expect(page.locator('text=Web Development with React')).toBeVisible();
    await expect(page.locator('text=Advanced (PhD/Researcher)')).toBeVisible();
    await expect(visualOption).toHaveClass(/bg-purple-400/); // Visual should still be selected
    
    // Demo 3: Switch to different learning style
    console.log('🔄 Demo 3: Switching to Hands-on learning style');
    
    await handsOnOption.click();
    await expect(handsOnOption).toHaveClass(/bg-purple-600/);
    await expect(visualOption).not.toHaveClass(/bg-purple-400/); // Visual should no longer be selected
    await page.waitForTimeout(2000);
    
    // Generate plan with new learning style
    await page.locator('button:has-text("Generate Plan")').click();
    
    await expect(page.locator('h1')).toContainText('Generating your plan');
    console.log('⏳ Generating new plan with Hands-on learning style...');
    
    await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 60000 });
    
    console.log('📚 New lesson plan generated with Hands-on learning style preferences');
    console.log('✅ Comprehensive learning style feature demo completed');
  });

  test('learning style UI validation demo', async ({ page }) => {
    console.log('🎬 Starting UI validation demo');
    
    await page.goto('/');
    
    // Quick navigation to learning style screen
    await page.locator('textarea').fill('Python for Beginners');
    await page.locator('button:has-text("Next")').click();
    await page.locator('text=Simple').click();
    await page.locator('button:has-text("Next")').click();
    
    // Learning Style Screen UI Validation
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    console.log('🔍 Validating learning style UI elements');
    
    // Validate all required text elements
    await expect(page.locator('text=Python for Beginners')).toBeVisible();
    await expect(page.locator('text=Simple (ELI5)')).toBeVisible();
    
    // Validate all learning style options and their descriptions
    const expectedOptions = [
      { name: 'Visual', emoji: '📊', description: 'Charts, diagrams, and structured information' },
      { name: 'Auditory', emoji: '🎧', description: 'Stories, discussions, and verbal explanations' },
      { name: 'Hands-on', emoji: '🛠️', description: 'Practical examples and real-world applications' },
      { name: 'Analytical', emoji: '🧠', description: 'Logical patterns and systematic breakdowns' }
    ];
    
    for (const option of expectedOptions) {
      console.log(`✅ Validating ${option.name} option`);
      await expect(page.locator(`text=${option.name}`)).toBeVisible();
      await expect(page.locator(`text=${option.description}`)).toBeVisible();
      // Note: Emoji validation might be tricky in some environments, so we focus on text
    }
    
    // Validate Generate Plan button
    await expect(page.locator('button:has-text("Generate Plan")')).toBeVisible();
    await expect(page.locator('button:has-text("Generate Plan")')).toBeEnabled();
    
    // Validate back button
    const backButton = page.locator('button').first();
    await expect(backButton).toBeVisible();
    
    console.log('✅ UI validation demo completed successfully');
  });

  test('learning style selection color theme demo', async ({ page }) => {
    console.log('🎬 Starting color theme demo');
    
    await page.goto('/');
    
    // Navigate to learning style selection
    await page.locator('textarea').fill('Digital Marketing');
    await page.locator('button:has-text("Next")').click();
    await page.locator('text=Normal').click();
    await page.locator('button:has-text("Next")').click();
    
    await expect(page.locator('h1')).toContainText('Learning style?');
    
    console.log('🎨 Demonstrating purple color theme for learning styles');
    
    // Test each learning style's color theme
    const styleTests = [
      { name: 'Visual', expectedClass: 'bg-purple-400' },
      { name: 'Auditory', expectedClass: 'bg-purple-500' },
      { name: 'Hands-on', expectedClass: 'bg-purple-600' },
      { name: 'Analytical', expectedClass: 'bg-purple-700' }
    ];
    
    for (const styleTest of styleTests) {
      console.log(`🎨 Testing ${styleTest.name} color (${styleTest.expectedClass})`);
      
      const styleButton = page.locator(`button:has-text("${styleTest.name}")`);
      await styleButton.click();
      await page.waitForTimeout(1000);
      
      // Verify the selected style has the correct purple color
      await expect(styleButton).toHaveClass(new RegExp(styleTest.expectedClass));
      
      // Verify it has the scale transform effect
      await expect(styleButton).toHaveClass(/scale-105/);
      
      console.log(`✅ ${styleTest.name} color theme validated`);
    }
    
    console.log('✅ Color theme demo completed successfully');
  });
});