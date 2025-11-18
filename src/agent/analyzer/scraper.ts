import { chromium } from "playwright";
import fs from "fs";
import path from "path";

export async function scrapePage(url: string, outName: string) {
  console.log("🌐 Scraping:", url);

  // Launch Chrome with persistent session
  const context = await chromium.launchPersistentContext(
    "./auth/asana-session",
    {
      headless: false,
      channel: "chrome",
    }
  );

  const page = context.pages()[0] || (await context.newPage());

  console.log("🌐 Navigating:", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // ------------------------------------------------------------
  // 1. SESSION VALIDATION — CHECK IF LOGGED IN
  // ------------------------------------------------------------
  if (
    page.url().includes("login") ||
    page.url().includes("google") ||
    page.url().includes("auth")
  ) {
    console.log("❌ You are NOT logged in!");
    console.log("👉 Run this first:\n\n   npm run login\n");
    await context.close();
    throw new Error("Not logged in");
  }

  // ------------------------------------------------------------
  // 2. WAIT FOR REAL HYDRATED ASANA UI
  // ------------------------------------------------------------

  try {
    await page.waitForFunction(
      () => !!document.querySelector("[data-testid='topbar']"),
      { timeout: 15000 }
    );
    console.log("✅ React hydration detected");
  } catch {
    console.log("⚠️ Hydration not detected — continuing anyway");
  }

  // Sidebar
  try {
    await page.waitForSelector("aside", { timeout: 15000 });
  } catch {
    console.log("⚠️ Sidebar not found");
  }

  // Main content region
  try {
    await page.waitForSelector("main", { timeout: 15000 });
  } catch {
    console.log("⚠️ Main container not found");
  }

  // Validate content presence (avoid loading screen)
  try {
    await page.waitForSelector("text=Home", { timeout: 20000 });
    await page.waitForSelector("text=My tasks", { timeout: 20000 });
    console.log("✅ Real UI detected (Home + My tasks)");
  } catch {
    console.log("❌ Still on loading screen — scrape aborted.");
    await context.close();
    throw new Error("Stuck at loading screen");
  }

  // ------------------------------------------------------------
  // 3. EXTRACT CLEAN DOM SNAPSHOT
  // ------------------------------------------------------------
  const dom = await page.evaluate(() => {
    const out: any[] = [];

    const BLOCKED_TAGS = ["script", "style", "link", "meta"];
    const BLOCKED_CLASSES = ["loading-screen", "loading-screen-ui", "hidden"];

    document.querySelectorAll("body *").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (BLOCKED_TAGS.includes(tag)) return;
      if (BLOCKED_CLASSES.some((c) => el.classList.contains(c))) return;

      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);

      if (rect.width < 5 || rect.height < 5) return;
      if (style.display === "none" || style.visibility === "hidden") return;

      out.push({
        tag,
        text: el.textContent?.trim(),
        rect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        },
        styles: {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          background: style.backgroundColor,
        },
      });
    });

    return out;
  });

  // ------------------------------------------------------------
  // 4. SAVE FILES
  // ------------------------------------------------------------
  const outDir = "src/agent/output";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  fs.writeFileSync(
    path.join(outDir, `${outName}.json`),
    JSON.stringify(dom, null, 2)
  );

  await page.screenshot({
    path: path.join(outDir, `${outName}.png`),
    fullPage: true,
  });

  console.log("📸 Screenshot saved.");
  console.log("📦 DOM snapshot saved.");

  await context.close();

  return dom;
}
