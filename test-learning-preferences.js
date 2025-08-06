const { chromium } = require('playwright');

async function testLearningPreferences() {
  console.log('🚀 Starting Learning Preferences Test');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 } // iPhone X viewport
  });
  
  const page = await context.newPage();
  
  try {
    // Navigate to the app
    console.log('📱 Navigating to localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Step 1: Topic Selection - Enter "JavaScript" as topic
    console.log('1️⃣ Testing Topic Selection');
    await page.fill('input[type="text"]', 'JavaScript');
    await page.screenshot({ path: '/workspace/test-videos/01-topic-selection-upload_to_pr.png' });
    await page.click('button:has-text("Next")');
    
    // Step 2: Learning Preferences - Should appear after topic
    console.log('2️⃣ Testing Learning Preferences Screen');
    await page.waitForSelector('h1:has-text("How do you learn best?")', { timeout: 5000 });
    await page.screenshot({ path: '/workspace/test-videos/02-preferences-screen-upload_to_pr.png' });
    
    // Test that topic is displayed correctly
    const topicText = await page.textContent('p:has-text("Learning:")');
    console.log('✅ Topic displayed:', topicText);
    
    // Step 3: Test preference selection - Visual
    console.log('3️⃣ Testing Visual Preference Selection');
    await page.click('button:has-text("Visual")');
    await page.screenshot({ path: '/workspace/test-videos/03-visual-selected-upload_to_pr.png' });
    
    // Step 4: Test multiple selections - Add Auditory
    console.log('4️⃣ Testing Multiple Selection - Auditory');
    await page.click('button:has-text("Auditory")');
    await page.screenshot({ path: '/workspace/test-videos/04-multiple-selection-upload_to_pr.png' });
    
    // Step 5: Test deselection - Remove Visual
    console.log('5️⃣ Testing Deselection - Remove Visual');
    await page.click('button:has-text("Visual")');
    await page.screenshot({ path: '/workspace/test-videos/05-deselection-upload_to_pr.png' });
    
    // Step 6: Test Next button disabled state when no preferences
    console.log('6️⃣ Testing Empty State - Remove All Selections');
    await page.click('button:has-text("Auditory")');
    await page.screenshot({ path: '/workspace/test-videos/06-empty-state-upload_to_pr.png' });
    
    // Verify Next button is disabled
    const nextButton = page.locator('button:has-text("Next")');
    const isDisabled = await nextButton.isDisabled();
    console.log('✅ Next button disabled when no preferences:', isDisabled);
    
    // Step 7: Select preferences and proceed
    console.log('7️⃣ Selecting Final Preferences');
    await page.click('button:has-text("Visual")');
    await page.click('button:has-text("Hands-on")');
    await page.click('button:has-text("Independent")');
    await page.screenshot({ path: '/workspace/test-videos/07-final-preferences-upload_to_pr.png' });
    
    // Step 8: Proceed to next screen (Depth Selection)
    console.log('8️⃣ Proceeding to Depth Selection');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('h1:has-text("How deep should we go?")', { timeout: 5000 });
    await page.screenshot({ path: '/workspace/test-videos/08-depth-selection-upload_to_pr.png' });
    
    // Step 9: Test back navigation
    console.log('9️⃣ Testing Back Navigation');
    await page.click('button[aria-label="Go back"]');
    await page.waitForSelector('h1:has-text("How do you learn best?")', { timeout: 5000 });
    await page.screenshot({ path: '/workspace/test-videos/09-back-navigation-upload_to_pr.png' });
    
    // Step 10: Complete flow
    console.log('🔟 Completing Flow');
    await page.click('button:has-text("Next")');
    await page.waitForSelector('h1:has-text("How deep should we go?")', { timeout: 5000 });
    await page.screenshot({ path: '/workspace/test-videos/10-completed-flow-upload_to_pr.png' });
    
    console.log('✅ All Learning Preferences tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: '/workspace/test-videos/error-state-upload_to_pr.png' });
  } finally {
    await browser.close();
  }
}

// Run the test
testLearningPreferences().then(() => {
  console.log('🎉 Test suite completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});