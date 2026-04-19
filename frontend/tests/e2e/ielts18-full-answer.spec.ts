import { test, expect, Page } from "@playwright/test";

const CREDS = {
  email: "teststudent_1767460068@test.com",
  password: "testpassword",
};

async function login(page: Page) {
  await page.goto("http://localhost:3000/login");
  await page.getByLabel(/email/i).fill(CREDS.email);
  await page.getByLabel(/password/i).fill(CREDS.password);
  await page.getByRole("button", { name: /log in|sign in/i }).click();
  await expect(page.locator("body")).toContainText(/dashboard|cambridge|practice|welcome/i);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `playwright-report/screens/${name}.png`, fullPage: true });
}

// Top-right "x/40 answered" gibi sayaç
function answeredCounter(page: Page) {
  return page.locator("text=/\\b\\d+\\s*\\/\\s*(40|2)\\s*answered\\b/i").first();
}

// Navigator'daki soru butonlarını bul (alt şerit)
function navButtons(page: Page) {
  return page.locator('button:visible').filter({ hasText: /^\s*\d+\s*$/ });
}

async function getAnsweredCount(page: Page): Promise<number> {
  const txt = await answeredCounter(page).innerText().catch(() => "");
  const m = txt.match(/(\d+)\s*\/\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

async function answerVisibleQuestion(page: Page, qNumber: number) {
  // 1) Text inputs
  const textInputs = page.locator('input[type="text"]:visible');
  const tCount = await textInputs.count();
  for (let i = 0; i < tCount; i++) {
    await textInputs.nth(i).fill(`E2E_${qNumber}_${i+1}`);
  }

  // 2) Textareas (writing gibi)
  const areas = page.locator("textarea:visible");
  const aCount = await areas.count();
  for (let i = 0; i < aCount; i++) {
    await areas.nth(i).fill(
      `This is an automated E2E response for question ${qNumber}. ` +
      `It is intentionally long to satisfy minimum word requirements. ` +
      `Overall, the main trend is clear and the details support the summary.`
    );
  }

  // 3) Radios: birini seç
  const radios = page.locator('input[type="radio"]:visible');
  const rCount = await radios.count();
  if (rCount > 0) {
    await radios.first().check({ force: true });
  }

  // 4) Checkboxes: en az 1 tanesini seç
  const cbs = page.locator('input[type="checkbox"]:visible');
  const cCount = await cbs.count();
  if (cCount > 0) {
    await cbs.first().check({ force: true });
  }

  // 5) Select dropdown: placeholder hariç bir seçenek seç
  const selects = page.locator("select:visible");
  const sCount = await selects.count();
  for (let i = 0; i < sCount; i++) {
    const sel = selects.nth(i);
    const opts = sel.locator("option");
    const optCount = await opts.count();
    expect(optCount, `Dropdown #${i+1} has no options`).toBeGreaterThan(1);
    const v = await opts.nth(1).getAttribute("value");
    if (v) await sel.selectOption(v);
    else {
      const label = await opts.nth(1).innerText();
      await sel.selectOption({ label });
    }
  }
}

async function answerAllViaNavigator(page: Page, totalQuestions: number, label: string) {
  await expect(navButtons(page).first()).toBeVisible({ timeout: 15000 });

  for (let q = 1; q <= totalQuestions; q++) {
    const btn = page.getByRole("button", { name: new RegExp(`^\\s*${q}\\s*$`) });
    await btn.scrollIntoViewIfNeeded();
    await btn.click();

    await page.waitForTimeout(150);

    const before = await getAnsweredCount(page);
    await answerVisibleQuestion(page, q);

    await page.waitForTimeout(150);
    const after = await getAnsweredCount(page);

    if (after === before) {
      const cbs = page.locator('input[type="checkbox"]:visible');
      if (await cbs.count() > 1) await cbs.nth(1).check({ force: true });

      await page.waitForTimeout(200);
      const after2 = await getAnsweredCount(page);
      expect(after2, `${label}: answered count did not increase on Q${q} (before=${before}, after=${after2})`).toBeGreaterThan(before);
    }
  }
}

async function openReviewAndScreenshot(page: Page, name: string) {
  const reviewBtn = page.getByRole("button", { name: /review\s*\(/i });
  if (await reviewBtn.count()) {
    await reviewBtn.click();
    await page.waitForTimeout(300);
    await shot(page, name);
  } else {
    await shot(page, name);
  }
}

test.describe("IELTS18 — MUST answer every single question + review/eval screenshots", () => {
  test("Test 1 Listening full 40/40 + Review screenshot", async ({ page }) => {
    await login(page);
    await page.goto("http://localhost:3000/cambridge-test/ielts18/test1?skill=listening");
    const start = page.getByRole("button", { name: /start listening/i });
    if (await start.count()) await start.click();

    await answerAllViaNavigator(page, 40, "T1 Listening");
    expect(await getAnsweredCount(page), "T1 Listening should be 40/40").toBe(40);

    await openReviewAndScreenshot(page, "T1_listening_review_40of40");
  });

  test("Test 1 Reading full 40/40 + Review screenshot", async ({ page }) => {
    await login(page);
    await page.goto("http://localhost:3000/cambridge-test/ielts18/test1?skill=reading");
    const start = page.getByRole("button", { name: /start reading/i });
    if (await start.count()) await start.click();

    await answerAllViaNavigator(page, 40, "T1 Reading");
    expect(await getAnsweredCount(page), "T1 Reading should be 40/40").toBe(40);

    await openReviewAndScreenshot(page, "T1_reading_review_40of40");
  });

  test("Test 1 Writing 2/2 + submit screenshot", async ({ page }) => {
    await login(page);
    await page.goto("http://localhost:3000/cambridge-test/ielts18/test1?skill=writing");
    const start = page.getByRole("button", { name: /start writing/i });
    if (await start.count()) await start.click();

    const before = await getAnsweredCount(page);
    await answerVisibleQuestion(page, 1);

    const submit = page.getByRole("button", { name: /submit writing/i });
    if (await submit.count()) await submit.click();

    await page.waitForTimeout(500);
    await shot(page, "T1_writing_after_submit");
    const after = await getAnsweredCount(page);
    expect(after, `Writing answered should increase (before=${before}, after=${after})`).toBeGreaterThan(before);
  });
});
