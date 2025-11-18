import { test, expect } from "@playwright/test";

test.use({
  browserName: "chromium",
  channel: "chrome",
  storageState: "auth/storageState.json", // logged in session
});

test("Capture baseline screenshot of Asana Home", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("https://app.asana.com/0/home");

  // ⏳ Wait for REAL Asana UI to appear — not the loader
  await page.waitForSelector("text=My tasks", { timeout: 20000 });

  // Now take proper baseline
  await expect(page).toHaveScreenshot("asana-home-baseline.png", {
    fullPage: false,
  });
});
