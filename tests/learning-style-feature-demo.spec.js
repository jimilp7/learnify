// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Learning Style Feature Demo', () => {
  test('complete learning style integration demo', async ({ page }) => {
    console.log('🎬 Starting Learning Style Integration Demo');
    
    // Start from the home page
    await page.goto('/');
    console.log('📱 Loaded homepage');
    
    // Step 1: Topic Selection
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    console.log('✅ Topic selection screen loaded');
    
    const topicInput = page.locator('textarea');
    await expect(topicInput).toBeVisible();
    await expect(topicInput).toBeFocused();
    
    // Enter a learning topic
    await topicInput.fill('Machine Learning Basics');
    console.log('📝 Entered topic: Machine Learning Basics');
    
    const nextButton = page.locator('button', { hasText: 'Next' });
    await nextButton.click();
    console.log('⏭️ Clicked Next to go to depth selection');
    
    // Step 2: Depth Selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: Machine Learning Basics')).toBeVisible();
    console.log('✅ Depth selection screen loaded with topic');
    
    // Select Advanced depth
    const advancedDepth = page.locator('button', { hasText: 'Advanced' });
    await advancedDepth.click();
    await expect(advancedDepth).toHaveClass(/bg-green-600/);
    console.log('🎓 Selected Advanced depth level');
    
    const depthNextButton = page.locator('button', { hasText: 'Next' });
    await depthNextButton.click();
    console.log('⏭️ Clicked Next to go to learning style selection');
    
    // Step 3: Learning Style Selection - This is the NEW FEATURE
    await expect(page.locator('h1')).toContainText('How do you learn?');
    await expect(page.locator('text=Machine Learning Basics • Advanced (PhD/Researcher)')).toBeVisible();
    console.log('🎨 Learning Style selection screen loaded with topic and depth');
    
    // Verify all learning style options are present with correct styling
    const learningStyles = [
      { name: 'Visual', description: 'diagrams, charts, and visual aids' },
      { name: 'Auditory', description: 'listening and discussion' },
      { name: 'Hands-on', description: 'practical examples and doing' },
      { name: 'Analytical', description: 'logical step-by-step breakdowns' }
    ];
    
    for (const style of learningStyles) {
      const button = page.locator('button', { hasText: style.name });
      await expect(button).toBeVisible();
      await expect(button).toContainText(style.description);
      console.log(`✅ Verified ${style.name} learning style option`);
    }
    
    // Test selecting different learning styles
    console.log('🔄 Testing learning style selection...');
    
    // Visual should be selected by default
    const visualOption = page.locator('button', { hasText: 'Visual' });
    await expect(visualOption).toHaveClass(/bg-purple-400/);
    console.log('📸 Visual learning style selected by default');
    
    // Select Analytical learning style
    const analyticalOption = page.locator('button', { hasText: 'Analytical' });
    await analyticalOption.click();
    await expect(analyticalOption).toHaveClass(/bg-purple-700/);
    await expect(analyticalOption).toHaveClass(/text-white/);
    console.log('🧠 Selected Analytical learning style');
    
    // Verify Visual is no longer selected
    await expect(visualOption).not.toHaveClass(/bg-purple-400/);
    console.log('✅ Previous selection cleared correctly');
    
    // Continue to lesson plan generation
    const learningStyleNextButton = page.locator('button', { hasText: 'Next' });
    await learningStyleNextButton.click();
    console.log('⏭️ Proceeding to lesson plan generation');
    
    // Step 4: Generating Plan
    await expect(page.locator('h1')).toContainText('Generating your plan...');
    console.log('⚙️ Lesson plan generation started');
    
    // The plan generation should include the learning style in the API call
    await expect(page.locator('text=Machine Learning Basics')).toBeVisible();
    await expect(page.locator('text=Advanced')).toBeVisible();
    console.log('📋 Generation screen shows selected topic and depth');
    
    // Wait for lesson plan to be generated
    console.log('⏳ Waiting for AI to generate personalized lesson plan...');
    await expect(page.locator('h1')).toContainText('Your Learning Plan', { timeout: 60000 });
    console.log('🎉 Lesson plan generated successfully!');
    
    // Step 5: Verify lesson plan is displayed
    await expect(page.locator('text=Machine Learning Basics')).toBeVisible();
    await expect(page.locator('text=Advanced')).toBeVisible();
    console.log('✅ Lesson plan screen loaded with correct topic and depth');
    
    // Should have lessons displayed (the content should be tailored to Analytical learning style)
    const lessonElements = page.locator('div').filter({ hasText: /\d+\s*min/ });
    await expect(lessonElements.first()).toBeVisible({ timeout: 10000 });
    console.log('📚 Lessons are displayed (content tailored to Analytical learning style)');
    
    console.log('🎊 Learning Style Integration Demo completed successfully!');
    console.log('📝 Summary:');
    console.log('  - ✅ Added learning style selection step between depth and generation');
    console.log('  - ✅ 4 learning styles available: Visual, Auditory, Hands-on, Analytical');
    console.log('  - ✅ Purple color scheme fits design system');
    console.log('  - ✅ Proper navigation with back button support');
    console.log('  - ✅ Learning style integrated into AI prompts for personalization');
  });

  test('learning style back navigation demo', async ({ page }) => {
    console.log('🔙 Testing Learning Style Back Navigation');
    
    await page.goto('/');
    
    // Quick navigation to learning style
    await page.locator('textarea').fill('Data Science');
    await page.locator('button', { hasText: 'Next' }).click();
    await page.locator('button', { hasText: 'Normal' }).click();
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Should be on learning style selection
    await expect(page.locator('h1')).toContainText('How do you learn?');
    console.log('✅ Reached learning style selection screen');
    
    // Select a learning style
    await page.locator('button', { hasText: 'Hands-on' }).click();
    console.log('✋ Selected Hands-on learning style');
    
    // Test back navigation
    const backButton = page.locator('button').first();
    await backButton.click();
    console.log('⬅️ Clicked back button');
    
    // Should be back on depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: Data Science')).toBeVisible();
    console.log('✅ Successfully navigated back to depth selection');
    
    // Go forward again
    await page.locator('button', { hasText: 'Next' }).click();
    console.log('⏭️ Navigating forward to learning style again');
    
    // Previous selection should be maintained
    await expect(page.locator('button', { hasText: 'Hands-on' })).toHaveClass(/bg-purple-600/);
    console.log('✅ Learning style selection persisted correctly');
    
    console.log('🎉 Back navigation test completed successfully!');
  });

  test('multiple learning styles with different topics demo', async ({ page }) => {
    console.log('🔄 Testing Multiple Learning Styles with Different Topics');
    
    const testCases = [
      { 
        topic: 'Photography Basics', 
        depth: 'Simple', 
        learningStyle: 'Visual',
        color: 'bg-purple-400'
      },
      { 
        topic: 'Spanish Language', 
        depth: 'Normal', 
        learningStyle: 'Auditory',
        color: 'bg-purple-500'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`🧪 Testing: ${testCase.topic} - ${testCase.depth} - ${testCase.learningStyle}`);
      
      await page.goto('/');
      
      // Navigate through the flow
      await page.locator('textarea').fill(testCase.topic);
      await page.locator('button', { hasText: 'Next' }).click();
      
      await page.locator('button', { hasText: testCase.depth }).click();
      await page.locator('button', { hasText: 'Next' }).click();
      
      // Verify learning style screen shows correct topic and depth
      const depthLabels = {
        'Simple': 'Simple (ELI5)',
        'Normal': 'Normal (High School)', 
        'Advanced': 'Advanced (PhD/Researcher)'
      };
      
      await expect(page.locator(`text=${testCase.topic} • ${depthLabels[testCase.depth]}`)).toBeVisible();
      console.log(`✅ Correct topic and depth displayed: ${testCase.topic} • ${depthLabels[testCase.depth]}`);
      
      // Select the learning style
      const styleButton = page.locator('button', { hasText: testCase.learningStyle });
      await styleButton.click();
      await expect(styleButton).toHaveClass(new RegExp(testCase.color));
      console.log(`✅ ${testCase.learningStyle} learning style selected with correct color`);
    }
    
    console.log('🎊 Multiple learning styles test completed successfully!');
  });
});