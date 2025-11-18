#!/usr/bin/env ts-node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { llm } from "../llm/openaiClient.ts";
import { computeSimilarity } from "../utils/computeSimilarity.ts";

// ------------------------------
// CLEAN + FIX LLM JSON OUTPUT
// ------------------------------
function cleanLLMJson(raw: string) {
  // Remove code fences
  raw = raw.replace(/```json/g, "").replace(/```/g, "");

  // Trim whitespace
  raw = raw.trim();

  // Extract JSON block
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("❌ LLM did not return valid JSON.");
  }

  const jsonString = raw.substring(start, end + 1);

  try {
    return JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch (e) {
    console.error("❌ Failed to parse cleaned JSON:\n", jsonString);
    throw e;
  }
}

// ----------------------
// Utility: run shell commands
// ----------------------
function run(cmd: string) {
  return execSync(cmd, { stdio: "pipe" }).toString();
}

// ----------------------
// REPAIR LOOP
// ----------------------
async function repair(pageName: string, iterationNumber = 1) {
  console.log(`\n🔧 Repair iteration #${iterationNumber}\n`);

  if (iterationNumber > 5) {
    console.log("⚠️ Max repair iterations reached.");
    return;
  }

  // 1. Run initial visual test to generate diff files
  console.log("🧪 Running visual regression test…");
  try {
    run(`npx playwright test tests/visual/${pageName}-generated.spec.ts`);
    console.log("🎉 No mismatches — UI matches baseline.");
    return;
  } catch (err) {
    console.log("❌ Visual mismatch detected.");
  }

  // ------------------------------
  // 2. Locate diff / expected / actual images
  // ------------------------------
  const resultsRoot = path.join(process.cwd(), "test-results");
  const resultFolders = fs.readdirSync(resultsRoot);

  const resultFolder = resultFolders.find(
    (f) => f.includes(pageName) && f.includes("generated")
  );

  if (!resultFolder) {
    console.error("❌ No Playwright result folder found.");
    console.log("Available folders:", resultFolders);
    return;
  }

  const folderPath = path.join(resultsRoot, resultFolder);
  const innerFiles = fs.readdirSync(folderPath);

  const diffFile = innerFiles.find((f) => f.includes("diff"));
  const expectedFile = innerFiles.find((f) => f.includes("expected"));
  const actualFile = innerFiles.find((f) => f.includes("actual"));

  if (!diffFile || !expectedFile || !actualFile) {
    console.error("❌ Missing expected/actual/diff files.");
    console.log("Folder contents:", innerFiles);
    return;
  }

  const diffImagePath = path.join(folderPath, diffFile);
  const expectedImagePath = path.join(folderPath, expectedFile);
  const actualImagePath = path.join(folderPath, actualFile);

  console.log("📸 Using diff:", diffImagePath);

  // 3. Similarity BEFORE repair
  const similarityBefore = computeSimilarity(
    expectedImagePath,
    actualImagePath
  );
  console.log(`📊 Similarity Before Repair: ${similarityBefore.toFixed(2)}%`);

  // 4. Load current spec
  const specPath = path.join(
    process.cwd(),
    "src/agent/specs",
    `${pageName}.json`
  );
  const spec = fs.readFileSync(specPath, "utf-8");

  // 5. Summarize spec
  function summarizeSpec(json: any) {
    const count = (node: any): number =>
      1 +
      (node.children
        ? node.children.reduce((a: number, c: any) => a + count(c), 0)
        : 0);

    return {
      totalNodes: count(json),
      hasSidebar: JSON.stringify(json).includes('"sidebar"'),
      hasHeader: JSON.stringify(json).includes('"header"'),
      rootType: json.type,
    };
  }

  let specJson;
  try {
    specJson = JSON.parse(spec);
  } catch {
    specJson = JSON.parse(cleanLLMJson(spec));
  }

  const specSummary = summarizeSpec(specJson);

  // 6. Build prompt
  const prompt = `
You are a senior UI layout correction agent.

Your goal:
Fix the JSON UI SPEC so the rendered page visually matches the baseline application.

### INPUT FILES
EXPECTED_IMAGE = baseline screenshot
ACTUAL_IMAGE = generated UI screenshot
DIFF_IMAGE = highlighted mismatches

### CURRENT UI SPEC
${spec}

### SPEC SUMMARY
${JSON.stringify(specSummary, null, 2)}

---

### RULES
- Output ONLY JSON.
- Modify ONLY structure, hierarchy, and props.
- DO NOT add CSS classes or HTML.
- Use ONLY: page, container, header, sidebar, text, card, button, grid, list

### FIX THESE:
- Alignment issues
- Wrong layout direction
- Wrong grid columns
- Missing or extra elements
- Wrong grouping
- Spacing differences

### STRATEGY
- Compare EXPECTED and ACTUAL.
- Use DIFF to localize mismatches.
- Adjust JSON tree.
- Keep layout minimal and correct.

### OUTPUT
Only the corrected JSON.
`;

  // 7. Ask LLM to fix spec
  console.log("🤖 Asking LLM to repair spec…");

  const newSpec = await llm(prompt, {
    images: [
      { image: expectedImagePath, label: "expected" },
      { image: actualImagePath, label: "actual" },
      { image: diffImagePath, label: "diff" },
    ],
  });

  // Save
  const cleaned = cleanLLMJson(newSpec);
  fs.writeFileSync(specPath, cleaned);

  // Regenerate UI
  console.log("⚙️ Regenerating UI…");
  run(`npm run generate ${pageName}`);

  // Re-run test
  console.log("🔁 Re-running tests…");
  try {
    run(`npx playwright test tests/visual/${pageName}-generated.spec.ts`);
    console.log("🎉 UI matches baseline after repair!");
    return;
  } catch {
    // Similarity AFTER repair
    const similarityAfter = computeSimilarity(
      expectedImagePath,
      actualImagePath
    );
    console.log(`📈 Similarity After Repair: ${similarityAfter.toFixed(2)}%`);

    if (similarityAfter > 98) {
      console.log("🎉 High similarity reached. Stopping repairs.");
      return;
    }

    console.log("🔁 More mismatches remain. Running next iteration...\n");
    await repair(pageName, iterationNumber + 1);
  }
}

// ------------------------------
const page = process.argv[2];
if (!page) {
  console.log("❌ Usage: npm run repair <pagename>");
  process.exit(1);
}

repair(page);
