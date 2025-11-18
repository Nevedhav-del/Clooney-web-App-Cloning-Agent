import { test, expect } from "@playwright/test";

test("Projects page visual regression", async ({ page }) => {
  await page.goto("http://localhost:3000/projects-preview", {
    waitUntil: "networkidle",
  });

  await expect(page).toHaveScreenshot("projects.png", {
    mask: [],
  });
});
