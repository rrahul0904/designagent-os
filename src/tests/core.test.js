import test from "node:test";
import assert from "node:assert/strict";
import { extractDesignDNA } from "../core/design-dna.js";
import { auditSource } from "../core/anti-patterns.js";
import { analyzeSource } from "../core/report.js";

test("extracts design DNA", () => {
  const dna = extractDesignDNA(`:root{--brand:#111827}.x{color:#fff;font-family:Inter,sans-serif;border-radius:8px;padding:16px}`);
  assert.equal(dna.cssVariables.brand, "#111827");
  assert.ok(dna.colors.includes("#fff"));
  assert.ok(dna.radii.includes("8px"));
});

test("detects pill radius", () => {
  const findings = auditSource(`.pill{border-radius:9999px}`);
  assert.ok(findings.some(f => f.id === "pill-overuse"));
});

test("detects generic three-card layout", () => {
  const findings = auditSource(`.grid{display:grid;grid-template-columns:repeat(3, 1fr)}`);
  assert.ok(findings.some(f => f.id === "three-card-template"));
});

test("assembles a scored report", () => {
  const report = analyzeSource(`.x{border-radius:9999px}`);
  assert.ok(report.quality.score < 100);
  assert.equal(report.findings.length, 1);
});
