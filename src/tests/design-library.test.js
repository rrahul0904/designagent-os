import test from "node:test";
import assert from "node:assert/strict";
import { compileStyleDocuments, getDesignStyle, listDesignStyles } from "../core/design-style-library.js";
import { compileDesignMdFromEvidence } from "../core/design-evidence.js";

test("lists original first-party design styles", () => {
  const styles = listDesignStyles();
  assert.equal(styles.length, 3);
  assert.deepEqual(styles.map(style => style.slug), ["precision-light", "editorial-warm", "technical-dark"]);
});

test("returns cloned style manifests", () => {
  const style = getDesignStyle("precision-light");
  style.tokens.colors.accent = "#000000";
  assert.equal(getDesignStyle("precision-light").tokens.colors.accent, "#2957D6");
});

test("compiles paired skill and design documents", () => {
  const documents = compileStyleDocuments("technical-dark");
  assert.match(documents.skillMd, /# Technical Dark Design Skill/);
  assert.match(documents.skillMd, /Accessibility contract/);
  assert.match(documents.designMd, /# DESIGN\.md — Technical Dark/);
  assert.match(documents.designMd, /accent: #75D4A4/);
});

test("evidence compiler preserves unresolved fields instead of inventing values", () => {
  const output = compileDesignMdFromEvidence({
    screenshots: [{ id: "hero.png", sha256: "abc123", width: 1440, height: 900 }],
    confidence: "reviewed",
    observations: {
      palette: ["background: warm off-white", "accent: rust"],
      typography: "display: serif; body: sans-serif"
    }
  });
  assert.match(output.designMd, /background: warm off-white/);
  assert.match(output.designMd, /## Spacing\n- Unresolved — requires direct evidence\./);
  assert.equal(output.manifest.unresolved.includes("spacing"), true);
  assert.equal(output.manifest.screenshots[0].id, "hero.png");
});

test("evidence compiler enforces a five-screenshot boundary", () => {
  assert.throws(
    () => compileDesignMdFromEvidence({ screenshots: ["1", "2", "3", "4", "5", "6"] }),
    /at most 5 screenshots/
  );
});
