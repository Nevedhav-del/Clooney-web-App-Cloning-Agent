import fs from "fs";
import { llm } from "../llm/openaiClient.ts";

/**
 * Vision V2 — smarter screenshot + DOM → JSON SPEC converter
 */
export async function visionToSpec({ screenshotPath, dom }) {
  const screenshotBase64 = fs.readFileSync(screenshotPath).toString("base64");

  // Reduce large DOM to 300 entries (LLM sweet-spot)
  const trimmedDom = dom.slice(0, 300).map((n) => ({
    tag: n.tag,
    text: n.text,
    x: n.rect.x,
    y: n.rect.y,
    w: n.rect.width,
    h: n.rect.height,
  }));

  const prompt = `
You are a senior UI layout extraction system.

Your job:
Convert a screenshot + bounding-box DOM dump into a clean, hierarchical UI SPEC
that represents the true layout.

-----------------------------------
### RULES
-----------------------------------
1. Output ONLY valid JSON.
2. Use these component types ONLY:
   - page
   - header
   - sidebar
   - container
   - grid
   - list
   - card
   - text
   - button

3. HIGH-LEVEL LAYOUT RULES:
   - "header" is always a horizontal bar at the top.
   - "sidebar" is a vertical left column.
   - "container" is main content area.
   - Inside main container, detect grouped cards/lists/grids.
   - Group items that appear aligned vertically → list.
   - Group items aligned in a grid → grid.

4. TEXT RULE:
   - Represent text as:
     { "type": "text", "props": { "value": "Actual text content" } }

5. BUTTON RULE:
   - If the element visually looks like a button/action → button.

6. CARD RULE:
   - Rectangular sections with grouped text belong inside "card".

7. IGNORE NOISE:
   - Loading screens
   - Invisible elements
   - Script-generated content
   - Animated placeholders

-----------------------------------
### INPUT: Screenshot + DOM bounding boxes
Use both sources:
- Screenshot gives you the real UI.
- DOM bounding boxes help understand structure, grouping, and layout.

-----------------------------------
### Screenshot
Label: screenshot
(Base64 image loaded separately)

-----------------------------------
### DOM (trimmed)
${JSON.stringify(trimmedDom, null, 2)}

-----------------------------------
### OUTPUT
Return a JSON object shaped like:

{
  "type": "page",
  "children": [
    { "type": "header", ... },
    { "type": "sidebar", ... },
    { "type": "container", ... }
  ]
}

NO markdown.
NO backticks.
ONLY JSON.
`;

  const raw = await llm(prompt, {
    images: [
      {
        label: "screenshot",
        image: screenshotPath,
      },
    ],
  });

  // Cleanup markdown wrappers
  const cleaned = raw
    .replace(/^```json/, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  // Validate JSON
  try {
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error("❌ Vision result was not valid JSON:");
    console.log(cleaned);

    throw new Error("Vision output invalid");
  }
}
