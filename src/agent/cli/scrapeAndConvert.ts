#!/usr/bin/env ts-node

import { scrapePage } from "../analyzer/scraper.ts";
import { visionToSpec } from "../analyzer/visionToSpec.ts";
import fs from "fs";
import path from "path";

async function run() {
  const url = process.argv[2];
  const name = process.argv[3];

  if (!url || !name) {
    console.log("❌ Usage: npm run scrape <url> <name>");
    process.exit(1);
  }

  console.log("🌐 Scraping:", url);

  // 1️⃣ SCRAPE REAL DOM + SCREENSHOT
  const dom = await scrapePage(url, name);

  console.log("🤖 Converting screenshot → UI SPEC (Vision)...");

  // Vision input path
  const imgPath = path.join("src/agent/output", `${name}.png`);
  if (!fs.existsSync(imgPath)) {
    throw new Error("❌ Screenshot missing at " + imgPath);
  }

  // 2️⃣ CONVERT USING VISION MODEL
  const spec = await visionToSpec({
    screenshotPath: imgPath,
    dom,
  });

  // 3️⃣ SAVE SPEC
  const specDir = "src/agent/specs";
  if (!fs.existsSync(specDir)) fs.mkdirSync(specDir);

  const specPath = path.join(specDir, `${name}.json`);
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

  console.log("✅ UI SPEC saved at:", specPath);
}

run();
