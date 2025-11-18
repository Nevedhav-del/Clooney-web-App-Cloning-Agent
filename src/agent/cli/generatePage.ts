#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";

console.log("🚀 Generating dynamic page…");

const page = process.argv[2];
if (!page) {
  console.error("❌ Usage: npm run generate <pagename>");
  process.exit(1);
}

// Output file path
const outPath = path.join(
  process.cwd(),
  "src",
  "generated",
  `${page.charAt(0).toUpperCase() + page.slice(1)}Page.tsx`
);

// Dynamic renderer-based page
const content = `
/* AUTO-GENERATED FILE — DO NOT EDIT */

import React from "react";
import spec from "@/agent/specs/${page}.json" assert { type: "json" };
import { renderNode } from "@/agent/generator/dynamicRenderer";

export default function ${page.charAt(0).toUpperCase() + page.slice(1)}Page() {
  return renderNode(spec);
}
`;

fs.writeFileSync(outPath, content);
console.log("✅ Generated UI at", outPath);
