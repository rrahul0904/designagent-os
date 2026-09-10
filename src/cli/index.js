#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { analyzeSource } from "../core/report.js";

const target = process.argv[2];

if (!target) {
  console.error("Usage: designagent <file>");
  process.exit(1);
}

try {
  const path = resolve(process.cwd(), target);
  const source = await readFile(path, "utf8");
  const report = analyzeSource(source, { path });
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
