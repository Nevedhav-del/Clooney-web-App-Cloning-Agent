#!/usr/bin/env ts-node

import { llm } from "../llm/openaiClient.ts";

async function run() {
  const out = await llm("Say 'LLM working'");
  console.log(out);
}

run();
