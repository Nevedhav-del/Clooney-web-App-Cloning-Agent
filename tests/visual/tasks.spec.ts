import { test, expect } from "@playwright/test";

test("Tasks page visual regression", async ({ page }) => {
  await page.goto("http://localhost:3000/tasks-preview", {
    waitUntil: "networkidle",
  });

  await expect(page).toHaveScreenshot("tasks.png", {
    mask: [],
  });
});
