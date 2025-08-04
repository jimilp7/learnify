// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Learning Style Integration Demo', () => {
  test('learning style selection and navigation demo', async ({ page }) => {
    console.log('🎬 Starting Learning Style Selection Demo');
    
    // Start from the home page
    await page.goto('/');
    console.log('📱 Loaded homepage');
    
    // Step 1: Topic Selection
    await expect(page.locator('h1')).toContainText('What do you want to learn?');
    const topicInput = page.locator('textarea');
    await expect(topicInput).toBeFocused();
    await topicInput.fill('React Hooks');
    console.log('📝 Entered topic: React Hooks');
    
    await page.locator('button', { hasText: 'Next' }).click();
    console.log('⏭️ Moved to depth selection');
    
    // Step 2: Depth Selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: React Hooks')).toBeVisible();
    
    const normalDepth = page.locator('button', { hasText: 'Normal' });
    await normalDepth.click();
    await expect(normalDepth).toHaveClass(/bg-green-500/);
    console.log('🎓 Selected Normal depth level');
    
    await page.locator('button', { hasText: 'Next' }).click();
    console.log('⏭️ Moved to learning style selection');
    
    // Step 3: Learning Style Selection - THE NEW FEATURE
    await expect(page.locator('h1')).toContainText('How do you learn?');
    await expect(page.locator('text=React Hooks • Normal (High School)')).toBeVisible();
    console.log('✅ Learning style screen loaded with correct context');
    
    // Test all 4 learning style options are present
    const learningStyleOptions = [
      { name: 'Visual', emoji: '👁️', color: 'bg-purple-400' },
      { name: 'Auditory', emoji: '👂', color: 'bg-purple-500' },
      { name: 'Hands-on', emoji: '✋', color: 'bg-purple-600' },
      { name: 'Analytical', emoji: '🧠', color: 'bg-purple-700' }
    ];
    
    for (const option of learningStyleOptions) {
      const button = page.locator('button', { hasText: option.name });
      await expect(button).toBeVisible();
      await expect(button.locator('span', { hasText: option.emoji })).toBeVisible();
      console.log(`✅ ${option.name} option (${option.emoji}) is visible`);
    }
    
    // Visual should be selected by default
    const visualButton = page.locator('button', { hasText: 'Visual' });
    await expect(visualButton).toHaveClass(/bg-purple-400/);
    console.log('👁️ Visual learning style is selected by default');
    
    // Test changing learning style
    const handsOnButton = page.locator('button', { hasText: 'Hands-on' });
    await handsOnButton.click();
    await expect(handsOnButton).toHaveClass(/bg-purple-600/);
    await expect(handsOnButton).toHaveClass(/text-white/);
    console.log('✋ Successfully selected Hands-on learning style');
    
    // Previous selection should be cleared
    await expect(visualButton).not.toHaveClass(/bg-purple-400/);
    console.log('✅ Previous selection cleared correctly');
    
    // Test back navigation
    const backButton = page.locator('button').first();
    await backButton.click();
    console.log('⬅️ Testing back navigation');
    
    // Should be back on depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: React Hooks')).toBeVisible();
    console.log('✅ Successfully navigated back to depth selection');
    
    // Go forward again to test state persistence
    await page.locator('button', { hasText: 'Next' }).click();
    console.log('⏭️ Navigating forward again');
    
    // Hands-on should still be selected (state persistence)
    await expect(page.locator('button', { hasText: 'Hands-on' })).toHaveClass(/bg-purple-600/);
    console.log('💾 Learning style selection persisted correctly');
    
    console.log('🎊 Learning Style Integration Demo completed successfully!');
    console.log('📋 Demo Summary:');
    console.log('  ✅ Added learning style selection between depth and generation');
    console.log('  ✅ 4 learning styles with unique purple colors and emojis');
    console.log('  ✅ Default selection (Visual) with proper highlighting');
    console.log('  ✅ Interactive selection with visual feedback');
    console.log('  ✅ Back navigation support');
    console.log('  ✅ State persistence across navigation');
    console.log('  ✅ Proper context display (topic + depth level)');
  });

  test('learning style back navigation demo', async ({ page }) => {
    console.log('🔙 Testing Learning Style Back Navigation');
    
    await page.goto('/');
    
    // Quick navigation to learning style
    await page.locator('textarea').fill('JavaScript Fundamentals');
    await page.locator('button', { hasText: 'Next' }).click();
    
    await page.locator('button', { hasText: 'Advanced' }).click();
    await page.locator('button', { hasText: 'Next' }).click();
    
    // Should be on learning style selection
    await expect(page.locator('h1')).toContainText('How do you learn?');
    await expect(page.locator('text=JavaScript Fundamentals • Advanced (PhD/Researcher)')).toBeVisible();
    console.log('✅ Learning style screen shows correct advanced context');
    
    // Select Analytical learning style
    const analyticalButton = page.locator('button', { hasText: 'Analytical' });
    await analyticalButton.click();
    await expect(analyticalButton).toHaveClass(/bg-purple-700/);
    console.log('🧠 Selected Analytical learning style (darkest purple)');
    
    // Test back navigation
    const backButton = page.locator('button').first();
    await backButton.click();
    console.log('⬅️ Clicked back button');
    
    // Should be back on depth selection
    await expect(page.locator('h1')).toContainText('How deep?');
    await expect(page.locator('text=Learning: JavaScript Fundamentals')).toBeVisible();
    console.log('✅ Back on depth selection screen');
    
    // Advanced should still be selected
    await expect(page.locator('button', { hasText: 'Advanced' })).toHaveClass(/bg-green-600/);
    console.log('✅ Depth selection state maintained');
    
    console.log('🎉 Back navigation test completed successfully!');
  });
});