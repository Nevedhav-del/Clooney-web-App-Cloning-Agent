import { test, expect } from "@playwright/test";

test("Home page visual regression", async ({ page }) => {
  // 1. Start local dev server first with:
  // npm run dev

  await page.goto("http://localhost:3000/home-preview", {
    waitUntil: "networkidle",
  });

  // 2. Mask dynamic areas (if any)
  await page.addStyleTag({
    content: `
      * {
        caret-color: transparent !important;
      }
    `,
  });

  // 3. Take comparison screenshot
  await expect(page).toHaveScreenshot("home.png", {
    mask: [
      page.locator("h1"), // example masking dynamic text
    ],
  });
});
