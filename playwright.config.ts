import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "off",
    video: "off",
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 150, // allowed differences
    },
  },
});
