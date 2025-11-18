Clooney Asana Agent — Pipeline Documentation

This project extracts UI from Asana, converts it into a clean UI specification, generates components, and validates them using visual regression testing. The workflow is built on a predictable four-layer pipeline.

Installation and Setup
1. Install dependencies
npm install

2. Start the development server
npm run dev

3. Scrape a page (example: Asana Home)

This command loads Asana in a headless browser, waits for the UI to fully render, removes loading states, and extracts DOM nodes with bounding boxes.

npm run scrape https://app.asana.com/0/home home

4. Generate UI components from the scraped specification

This converts the cleaned DOM into a structured UI specification and generates components.

npm run generate home

5. Update Playwright visual snapshots

Run this once to establish baseline snapshots needed for visual regression.

npx playwright test tests/visual/home-generated.spec.ts --update-snapshots

6. Run auto-repair based on visual regression

This compares the generated UI to the real Asana UI using Pixelmatch.
If similarity is below 98%, the system automatically repairs the generated components and re-runs tests.

npm run repair home

Final Structure: Rock-Solid Pipeline

Your agent is divided into four dependable layers. Each layer has a clear responsibility and produces a clean output for the next stage.

1. Scraper Layer

Purpose: Extract the real, fully rendered UI from Asana.

Responsibilities:

Load Asana

Wait for real UI to render (post-hydration)

Remove loading screens and placeholders

Extract clean DOM nodes with bounding boxes

Return only usable UI elements (no scripts, no noise)

Output: scraped/home.json

2. DOM to UI Specification Converter

Purpose: Transform the raw DOM into a stable, minimal, structured UI specification.

Responsibilities:

Classify elements into semantic groups (header, sidebar, main, etc.)

Group nodes based on layout relationships

Remove noise such as tooltips, script tags, animations, hidden nodes

Produce deterministic JSON suitable for generation

Output: specs/home-ui.json

3. UI Generator

Purpose: Convert the UI specification into clean, usable React components.

Responsibilities:

Render nodes based on type

Avoid unnecessary nested <div> wrappers

Normalize spacing, layout, and structure

Output maintainable, production-ready UI components

Output: generated/home/*

4. Visual Regression and Repair Loop

Purpose: Ensure the generated UI matches the real Asana UI as closely as possible.

Responsibilities:

Capture Playwright snapshots

Compare with baseline using Pixelmatch

Trigger repairs only when similarity falls below threshold

Stop automatically when similarity reaches or exceeds 98%

Prevent infinite loops with strict thresholds

Output:
Regression test file: tests/visual/home-generated.spec.ts
Repaired UI components during iterations.

Summary of the Workflow

Scrape UI → Real DOM + bounding boxes

Convert DOM → Clean UI specification

Generate UI → Optimized React components

Visual Regression → Auto-repair until stable
