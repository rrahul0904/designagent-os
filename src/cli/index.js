#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { analyzeSource } from "../core/report.js";
import { compileStyleDocuments, listDesignStyles } from "../core/design-style-library.js";
import { compileDesignMdFromEvidence } from "../core/design-evidence.js";

const [commandOrTarget, arg] = process.argv.slice(2);

async function readText(target) {
  const path = resolve(process.cwd(), target);
  return readFile(path, "utf8");
}

try {
  if (!commandOrTarget) {
    console.error("Usage: designagent <file> | styles | compile-style <slug> | design-md <evidence.json>");
    process.exit(1);
  }

  if (commandOrTarget === "styles") {
    console.log(JSON.stringify(listDesignStyles(), null, 2));
  } else if (commandOrTarget === "compile-style") {
    if (!arg) throw new Error("compile-style requires a style slug");
    console.log(JSON.stringify(compileStyleDocuments(arg), null, 2));
  } else if (commandOrTarget === "design-md") {
    if (!arg) throw new Error("design-md requires an evidence JSON file");
    const payload = JSON.parse(await readText(arg));
    console.log(compileDesignMdFromEvidence(payload).designMd);
  } else {
    const path = resolve(process.cwd(), commandOrTarget);
    const source = await readText(commandOrTarget);
    console.log(JSON.stringify(analyzeSource(source, { path }), null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
