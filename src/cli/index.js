#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { analyzeSource } from "../core/report.js";
import { compileStyleDocuments, listDesignStyles } from "../core/design-style-library.js";
import { compileDesignMdFromEvidence } from "../core/design-evidence.js";
import { compileDesignMdFromHtml } from "../core/html-design-evidence.js";
import {
  compileDesignTransferPlan,
  normalizeReferenceManifest,
  searchDesignReferences,
  verifyDesignTransferInvariants
} from "../core/design-reference-library.js";

const [commandOrTarget, ...args] = process.argv.slice(2);
const arg = args[0];

async function readText(target) {
  const path = resolve(process.cwd(), target);
  return readFile(path, "utf8");
}

async function readJson(target) {
  return JSON.parse(await readText(target));
}

function usage() {
  return [
    "Usage:",
    "  designagent <file>",
    "  designagent styles",
    "  designagent compile-style <slug>",
    "  designagent design-md <evidence.json>",
    "  designagent html-design <reference.html>",
    "  designagent reference-search <manifest.json> [query]",
    "  designagent transfer-plan <reference.json> <contract.json>",
    "  designagent verify-transfer <expected-contract.json> <actual-contract.json>"
  ].join("\n");
}

try {
  if (!commandOrTarget) {
    console.error(usage());
    process.exit(1);
  }

  if (commandOrTarget === "styles") {
    console.log(JSON.stringify(listDesignStyles(), null, 2));
  } else if (commandOrTarget === "compile-style") {
    if (!arg) throw new Error("compile-style requires a style slug");
    console.log(JSON.stringify(compileStyleDocuments(arg), null, 2));
  } else if (commandOrTarget === "design-md") {
    if (!arg) throw new Error("design-md requires an evidence JSON file");
    console.log(compileDesignMdFromEvidence(await readJson(arg)).designMd);
  } else if (commandOrTarget === "html-design") {
    if (!arg) throw new Error("html-design requires a local HTML file");
    const html = await readText(arg);
    console.log(JSON.stringify(compileDesignMdFromHtml(html, { sourceName: arg }), null, 2));
  } else if (commandOrTarget === "reference-search") {
    if (!arg) throw new Error("reference-search requires a manifest JSON file");
    const manifest = await readJson(arg);
    const query = args.slice(1).join(" ");
    const references = normalizeReferenceManifest(manifest);
    console.log(JSON.stringify(searchDesignReferences(references, query), null, 2));
  } else if (commandOrTarget === "transfer-plan") {
    if (!args[0] || !args[1]) throw new Error("transfer-plan requires reference.json and contract.json");
    console.log(JSON.stringify(compileDesignTransferPlan(await readJson(args[0]), await readJson(args[1])), null, 2));
  } else if (commandOrTarget === "verify-transfer") {
    if (!args[0] || !args[1]) throw new Error("verify-transfer requires expected-contract.json and actual-contract.json");
    console.log(JSON.stringify(verifyDesignTransferInvariants(await readJson(args[0]), await readJson(args[1])), null, 2));
  } else {
    const path = resolve(process.cwd(), commandOrTarget);
    const source = await readText(commandOrTarget);
    console.log(JSON.stringify(analyzeSource(source, { path }), null, 2));
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
