import test from "node:test";
import assert from "node:assert/strict";
import { compileDesignMdFromHtml, extractDesignEvidenceFromHtml } from "../core/html-design-evidence.js";

const fixture = `<!doctype html>
<html lang="en">
<head>
  <style>
    :root { --color-accent: #5b5cf0; --surface: #ffffff; }
    body { font-family: Inter, sans-serif; font-size: 16px; line-height: 1.5; margin: 0; color: #171717; }
    main { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 1120px; padding: 48px; }
    .card { border: 1px solid #dedede; border-radius: 18px; box-shadow: 0 12px 30px rgba(0,0,0,.08); }
    button { transition: transform 160ms ease; }
    button:focus-visible { outline: 3px solid #5b5cf0; }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
  </style>
  <link rel="preconnect" href="https://fonts.example.test">
</head>
<body>
  <nav aria-label="Primary"></nav>
  <main><section class="card"><button>Start</button></section><form><input aria-label="Email"></form></main>
  <script>const fake = 'color: #ff0000; border-radius: 999px'; requestAnimationFrame(() => {});</script>
</body>
</html>`;

test("extracts bounded static design evidence without executing HTML", () => {
  const result = extractDesignEvidenceFromHtml(fixture, { sourceName: "fixture.html" });
  const { observations } = result.evidence;

  assert.ok(observations.palette.includes("#5b5cf0"));
  assert.ok(observations.typography.some(value => value.includes("Inter")));
  assert.ok(observations.spacing.some(value => value.includes("gap: 32px")));
  assert.ok(observations.radius.includes("border-radius: 18px"));
  assert.ok(observations.shadows.some(value => value.startsWith("box-shadow:")));
  assert.ok(observations.layout.includes("display: grid"));
  assert.ok(observations.components.includes("button: 1"));
  assert.ok(observations.accessibility.includes("reduced-motion override present"));
  assert.equal(result.manifest.executionPolicy.includes("never executed"), true);
});

test("script strings cannot poison CSS token extraction", () => {
  const result = extractDesignEvidenceFromHtml(fixture);
  assert.equal(result.evidence.observations.palette.includes("#ff0000"), false);
  assert.equal(result.evidence.observations.radius.includes("border-radius: 999px"), false);
});

test("external resources are reported but not fetched", () => {
  const result = extractDesignEvidenceFromHtml(fixture);
  assert.deepEqual(result.manifest.externalResources, ["https://fonts.example.test"]);
  assert.match(result.manifest.warnings[0], /never fetched/);
});

test("large HTML fails closed at the configured extraction boundary", () => {
  assert.throws(
    () => extractDesignEvidenceFromHtml(`<style>${"a".repeat(128)}</style>`, { maxBytes: 32 }),
    /extraction limit/
  );
});

test("HTML evidence compiles into the existing DESIGN.md contract", () => {
  const result = compileDesignMdFromHtml(fixture, { sourceName: "fixture.html" });
  assert.match(result.designMd, /# DESIGN\.md — Extracted Design Evidence/);
  assert.match(result.designMd, /font-family: Inter, sans-serif/);
  assert.match(result.designMd, /border-radius: 18px/);
  assert.equal(result.designManifest.unresolved.includes("palette"), false);
});
