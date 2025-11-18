import { test, expect } from "@playwright/test";

test("Home page CSS exactness", async ({ page }) => {
  await page.goto("http://localhost:3000/home-preview", {
    waitUntil: "networkidle",
  });

  // Example 1: Navbar background
  const navbar = page.locator("nav");
  await expect(navbar).toHaveCSS("background-color", "rgb(255, 255, 255)");

  // Example 2: Title font-size
  const title = page.locator("nav h1");
  await expect(title).toHaveCSS("font-size", "20px"); // Tailwind text-xl

  // Example 3: Section title font-size
  const sectionTitle = page.locator("main h2");
  await expect(sectionTitle).toHaveCSS("font-size", "18px"); // text-lg

  // Example 4: Card background
  const card = page.locator("main div > div").first();
  await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
});
