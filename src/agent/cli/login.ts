#!/usr/bin/env ts-node
import { chromium } from "playwright";

async function login() {
  const context = await chromium.launchPersistentContext(
    "./auth/asana-session",
    {
      headless: false,
      channel: "chrome",
    }
  );

  const page = context.pages()[0] || (await context.newPage());
  await page.goto("https://app.asana.com", { waitUntil: "networkidle" });

  console.log("⚠️ Login manually inside Chrome.");
  console.log(
    "👉 After you reach Asana Home, press ENTER here to save session."
  );

  process.stdin.once("data", async () => {
    console.log("💾 Session saved!");
    await context.close();
    process.exit(0);
  });
}

login();
