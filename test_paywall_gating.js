// Simple test to verify paywall gating logic
const testPaywallGating = () => {
  // Mock user objects
  const freeUser = { plan: 'free', examCredits: 0 };
  const proUser = { plan: 'pro', examCredits: 0 };
  const userWithCredits = { plan: 'free', examCredits: 5 };
  
  // Mock test objects
  const test1 = { title: 'Test 1', id: 1 };
  const test2 = { title: 'Test 2', id: 2 };
  const test3 = { title: 'Test 3', id: 3 };
  const testNoNumber = { title: 'Practice Test', id: 4 };
  
  // Helper functions (copied from TestInterface.js)
  const canAccessPremium = (user) => (user?.plan === 'pro') || ((user?.examCredits ?? 0) > 0);
  
  const isPremiumTest = (title) => {
    if (!title) return false;
    const match = title.match(/Test\s*(\d+)/i);
    if (!match) return false;
    const num = parseInt(match[1], 10);
    return num >= 2;
  };
  
  // Test cases
  console.log('Testing paywall gating logic...\n');
  
  // Test 1: Free user should access Test 1 but not Test 2+
  console.log('Free user tests:');
  console.log(`Test 1 - isPremium: ${isPremiumTest(test1.title)}, canAccess: ${canAccessPremium(freeUser)}, locked: ${isPremiumTest(test1.title) && !canAccessPremium(freeUser)}`);
  console.log(`Test 2 - isPremium: ${isPremiumTest(test2.title)}, canAccess: ${canAccessPremium(freeUser)}, locked: ${isPremiumTest(test2.title) && !canAccessPremium(freeUser)}`);
  console.log(`Test 3 - isPremium: ${isPremiumTest(test3.title)}, canAccess: ${canAccessPremium(freeUser)}, locked: ${isPremiumTest(test3.title) && !canAccessPremium(freeUser)}`);
  console.log(`Practice Test - isPremium: ${isPremiumTest(testNoNumber.title)}, canAccess: ${canAccessPremium(freeUser)}, locked: ${isPremiumTest(testNoNumber.title) && !canAccessPremium(freeUser)}`);
  
  console.log('\nPro user tests:');
  console.log(`Test 1 - isPremium: ${isPremiumTest(test1.title)}, canAccess: ${canAccessPremium(proUser)}, locked: ${isPremiumTest(test1.title) && !canAccessPremium(proUser)}`);
  console.log(`Test 2 - isPremium: ${isPremiumTest(test2.title)}, canAccess: ${canAccessPremium(proUser)}, locked: ${isPremiumTest(test2.title) && !canAccessPremium(proUser)}`);
  console.log(`Test 3 - isPremium: ${isPremiumTest(test3.title)}, canAccess: ${canAccessPremium(proUser)}, locked: ${isPremiumTest(test3.title) && !canAccessPremium(proUser)}`);
  
  console.log('\nUser with credits tests:');
  console.log(`Test 1 - isPremium: ${isPremiumTest(test1.title)}, canAccess: ${canAccessPremium(userWithCredits)}, locked: ${isPremiumTest(test1.title) && !canAccessPremium(userWithCredits)}`);
  console.log(`Test 2 - isPremium: ${isPremiumTest(test2.title)}, canAccess: ${canAccessPremium(userWithCredits)}, locked: ${isPremiumTest(test2.title) && !canAccessPremium(userWithCredits)}`);
  console.log(`Test 3 - isPremium: ${isPremiumTest(test3.title)}, canAccess: ${canAccessPremium(userWithCredits)}, locked: ${isPremiumTest(test3.title) && !canAccessPremium(userWithCredits)}`);
  
  console.log('\nExpected results:');
  console.log('- Free user: Test 1 ✓, Test 2 ✗, Test 3 ✗, Practice Test ✓');
  console.log('- Pro user: All tests ✓');
  console.log('- User with credits: All tests ✓');
};

testPaywallGating();