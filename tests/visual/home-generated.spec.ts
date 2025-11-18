import { test, expect } from "@playwright/test";

test("Generated HomePage should visually match Asana baseline", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto("http://localhost:3000/home-preview");

  await expect(page).toHaveScreenshot("generated-home.png", {
    fullPage: false,
  });
});
