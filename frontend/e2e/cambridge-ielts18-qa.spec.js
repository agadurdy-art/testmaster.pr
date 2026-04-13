// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  email: 'teststudent_1767460068@test.com',
  password: 'testpassword'
};

// Answer keys for Cambridge IELTS 18
const ANSWER_KEYS = {
  test1: {
    listening: {
      1: '




















SW2', 2: '












































9


PM', 3: '


coffee', 4: '




















bike', 5: '
























































evening', 6: '




















garage', 7: '





















































certificate', 8: '







































































cleaning', 9: '























plants', 10: '








printer',
      11: 'B', 12: 'B', 13: 'B', 14: 'B,E', 15: 'B,E', 16: 'F', 17: 'B', 18: 'C', 19: 'G', 20: 'E',
      21: 'C', 22: 'A', 23: 'A', 24: 'C', 25: 'A,C', 26: 'A,C', 27: 'A', 28: 'C', 29: 'B', 30: 'A',
      31: '








trees', 32: '



























































elephants', 33: '








fence', 34: '





































































































helicopters', 35: '















































water', 36: '














distance', 37: '
































holes', 38: '

































































legs', 39: '


monitoring', 40: '

























































































rehabilitation'
    }
  }
};

test.describe('Cambridge IELTS 18 - Full QA', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  test('Test 1 - Listening Part 1 - Fill all inputs', async ({ page }) => {
    // Navigate to Test 1 Listening
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test1?skill=listening`);
    await page.waitForTimeout(2000);
    
    // Start the test
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);

    // Find all text inputs and fill them
    const inputs = await page.locator('input[type="text"]').all();
    console.log(`Found ${inputs.length} text inputs in Part 1`);
    
    // Fill each input with test data
    for (let i = 0; i < inputs.length; i++) {
      await inputs[i].fill(`answer_${i + 1}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/t1-listening-part1.png' });
    
    expect(inputs.length).toBeGreaterThan(0);
  });

  test('Test 1 - Listening Part 2 - Verify all question types render', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test1?skill=listening`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);
    
    // Go to Part 2
    await page.click('button:has-text("Part 2")');
    await page.waitForTimeout(2000);
    
    // Check for multiple choice questions (radio buttons)
    const radioGroups = await page.locator('input[type="radio"]').count();
    console.log(`Found ${radioGroups} radio buttons`);
    
    // Check for dropdowns
    const dropdowns = await page.locator('select').count();
    console.log(`Found ${dropdowns} dropdowns`);
    
    // Check for checkboxes (multiple selection)
    const checkboxes = await page.locator('input[type="checkbox"]').count();
    console.log(`Found ${checkboxes} checkboxes`);
    
    await page.screenshot({ path: 'test-results/t1-listening-part2.png' });
    
    // At least some question inputs should exist
    const totalInputs = radioGroups + dropdowns + checkboxes;
    expect(totalInputs).toBeGreaterThan(0);
  });

  test('Test 1 - Reading Passage 1 - Fill inputs and verify', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test1?skill=reading`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Reading")');
    await page.waitForTimeout(2000);
    
    // Fill text inputs
    const textInputs = await page.locator('input[type="text"]').all();
    console.log(`Found ${textInputs.length} text inputs in Reading P1`);
    
    for (let i = 0; i < textInputs.length; i++) {
      await textInputs[i].fill(`reading_ans_${i + 1}`);
    }
    
    // Check for radio buttons (T/F/NG questions)
    const radios = await page.locator('input[type="radio"]').count();
    console.log(`Found ${radios} radio buttons`);
    
    await page.screenshot({ path: 'test-results/t1-reading-p1.png' });
    
    expect(textInputs.length + radios).toBeGreaterThan(0);
  });

  test('Test 1 - Writing Task 1 - Visual and textarea present', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test1?skill=writing`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Writing")');
    await page.waitForTimeout(2000);
    
    // Check for image/visual
    const images = await page.locator('img').count();
    console.log(`Found ${images} images`);
    
    // Check for textarea
    const textareas = await page.locator('textarea').count();
    console.log(`Found ${textareas} textareas`);
    
    // Fill textarea with sample text
    if (textareas > 0) {
      await page.locator('textarea').first().fill('This is a sample writing response for testing purposes. The graph shows the percentage of population living in cities in four Asian countries.');
    }
    
    await page.screenshot({ path: 'test-results/t1-writing-task1.png' });
    
    expect(images).toBeGreaterThan(0);
    expect(textareas).toBeGreaterThan(0);
  });

  test('Test 1 - Speaking Part 2 - Cue Card present', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test1?skill=speaking`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Speaking")');
    await page.waitForTimeout(2000);
    
    // Go to Part 2
    await page.click('button:has-text("Part 2")');
    await page.waitForTimeout(2000);
    
    // Check for cue card content
    const taskCard = await page.locator('text=TASK CARD').count();
    const describeText = await page.locator('text=/Describe/i').count();
    
    console.log(`Task Card found: ${taskCard > 0}`);
    console.log(`Describe text found: ${describeText > 0}`);
    
    await page.screenshot({ path: 'test-results/t1-speaking-part2.png' });
    
    expect(taskCard + describeText).toBeGreaterThan(0);
  });

  // Test 2 tests
  test('Test 2 - Listening Part 1 - Notes and Table', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test2?skill=listening`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);
    
    // Check for notes structure
    const headings = await page.locator('text=/Benefits|Person specification/i').count();
    console.log(`Found ${headings} section headings`);
    
    // Check for table
    const tables = await page.locator('table').count();
    console.log(`Found ${tables} tables`);
    
    // Check for inputs
    const inputs = await page.locator('input[type="text"]').count();
    console.log(`Found ${inputs} text inputs`);
    
    await page.screenshot({ path: 'test-results/t2-listening-part1.png' });
    
    expect(inputs).toBeGreaterThanOrEqual(10);
  });

  test('Test 2 - Listening Part 2 - Map Labelling', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test2?skill=listening`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Part 2")');
    await page.waitForTimeout(2000);
    
    // Check for map image
    const mapImage = await page.locator('img').count();
    console.log(`Found ${mapImage} images (map)`);
    
    // Check for dropdowns (map labelling)
    const dropdowns = await page.locator('select').count();
    console.log(`Found ${dropdowns} dropdowns`);
    
    await page.screenshot({ path: 'test-results/t2-listening-part2.png' });
    
    expect(mapImage).toBeGreaterThan(0);
  });

  test('Test 2 - Listening Part 3 - Multiple Choice with question text', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test2?skill=listening`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Part 3")');
    await page.waitForTimeout(2000);
    
    // Check for question text (should contain "Laki")
    const lakiText = await page.locator('text=/Laki/i').count();
    console.log(`Laki text found: ${lakiText > 0}`);
    
    // Check for multiple choice questions
    const radios = await page.locator('input[type="radio"]').count();
    console.log(`Found ${radios} radio buttons`);
    
    await page.screenshot({ path: 'test-results/t2-listening-part3.png' });
    
    expect(radios).toBeGreaterThan(0);
  });

  // Test 3 tests
  test('Test 3 - Writing Task 1 - Two maps side by side', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test3?skill=writing`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Writing")');
    await page.waitForTimeout(2000);
    
    // Check for two images (maps)
    const images = await page.locator('img').count();
    console.log(`Found ${images} images`);
    
    // Check for "Central Library" text
    const libraryText = await page.locator('text=/Central Library/i').count();
    console.log(`Central Library text found: ${libraryText > 0}`);
    
    await page.screenshot({ path: 'test-results/t3-writing-task1.png' });
    
    expect(images).toBeGreaterThanOrEqual(2);
  });

  // Test 4 tests
  test('Test 4 - Listening Part 1 - Job Details Form', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test4?skill=listening`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);
    
    // Check for job details title
    const jobTitle = await page.locator('text=/Job details|employment agency/i').count();
    console.log(`Job details title found: ${jobTitle > 0}`);
    
    // Check for inputs
    const inputs = await page.locator('input[type="text"]').count();
    console.log(`Found ${inputs} text inputs`);
    
    await page.screenshot({ path: 'test-results/t4-listening-part1.png' });
    
    expect(inputs).toBeGreaterThanOrEqual(10);
  });

  test('Test 4 - Listening Part 4 - Victor Hugo Notes', async ({ page }) => {
    await page.goto(`${BASE_URL}/cambridge-test/ielts18/test4?skill=listening`);
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Start Listening")');
    await page.waitForTimeout(2000);
    
    await page.click('button:has-text("Part 4")');
    await page.waitForTimeout(2000);
    
    // Check for Victor Hugo title
    const hugoTitle = await page.locator('text=/Victor Hugo/i').count();
    console.log(`Victor Hugo title found: ${hugoTitle > 0}`);
    
    // Check for notes structure
    const inputs = await page.locator('input[type="text"]').count();
    console.log(`Found ${inputs} text inputs`);
    
    await page.screenshot({ path: 'test-results/t4-listening-part4.png' });
    
    expect(inputs).toBeGreaterThanOrEqual(10);
  });
});
