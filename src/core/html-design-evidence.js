import { createHash } from "node:crypto";
import { compileDesignMdFromEvidence } from "./design-evidence.js";

const DEFAULT_MAX_BYTES = 500_000;
const OBSERVATION_LIMIT = 24;

function unique(values = [], limit = OBSERVATION_LIMIT) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].slice(0, limit);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function byteLength(value) {
  return Buffer.byteLength(value, "utf8");
}

function stripNonStyleNoise(html) {
  return html
    .replace(/<!--([\s\S]*?)-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/gi, " ");
}

function collectStyleSource(html) {
  const blocks = [];
  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)) blocks.push(match[1]);
  for (const match of html.matchAll(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi)) blocks.push(match[2]);
  return blocks.join("\n");
}

function declarationValues(css, propertyPattern) {
  const matcher = new RegExp(`(?:^|[;{\\s])(${propertyPattern})\\s*:\\s*([^;}{]+)`, "gi");
  const values = [];
  for (const match of css.matchAll(matcher)) values.push(`${match[1].toLowerCase()}: ${match[2].trim()}`);
  return unique(values);
}

function collectColors(css) {
  const values = [];
  const colorPattern = /#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\([^)]*\)/gi;
  for (const match of css.matchAll(colorPattern)) values.push(match[0]);

  for (const match of css.matchAll(/--[\w-]*(?:color|bg|background|surface|text|accent|border)[\w-]*\s*:\s*([^;}{]+)/gi)) {
    values.push(match[1].trim());
  }
  return unique(values);
}

function collectTypography(css) {
  return unique([
    ...declarationValues(css, "font-family"),
    ...declarationValues(css, "font-size"),
    ...declarationValues(css, "font-weight"),
    ...declarationValues(css, "line-height"),
    ...declarationValues(css, "letter-spacing")
  ]);
}

function collectSpacing(css) {
  return unique([
    ...declarationValues(css, "gap|row-gap|column-gap"),
    ...declarationValues(css, "padding(?:-(?:top|right|bottom|left))?"),
    ...declarationValues(css, "margin(?:-(?:top|right|bottom|left))?")
  ]);
}

function collectBorders(css) {
  return unique(declarationValues(css, "border(?:-(?:top|right|bottom|left))?(?:-(?:width|style|color))?"));
}

function collectLayout(css) {
  const observations = [];
  const interesting = [
    "display",
    "grid-template-columns",
    "grid-template-rows",
    "grid-auto-flow",
    "flex-direction",
    "flex-wrap",
    "justify-content",
    "align-items",
    "position",
    "max-width",
    "min-height"
  ];
  for (const property of interesting) observations.push(...declarationValues(css, property));
  return unique(observations);
}

function collectComponents(html) {
  const observations = [];
  const tags = ["header", "nav", "main", "section", "article", "aside", "footer", "form", "button", "input", "textarea", "select", "dialog", "table"];
  for (const tag of tags) {
    const matches = html.match(new RegExp(`<${tag}\\b`, "gi"));
    if (matches?.length) observations.push(`${tag}: ${matches.length}`);
  }
  return unique(observations);
}

function collectMotion(css, html) {
  const observations = unique([
    ...declarationValues(css, "transition(?:-[\\w-]+)?"),
    ...declarationValues(css, "animation(?:-[\\w-]+)?")
  ]);
  if (/@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)/i.test(css)) {
    observations.unshift("prefers-reduced-motion: reduce media query present");
  }
  if (/\brequestAnimationFrame\s*\(/.test(html)) observations.push("requestAnimationFrame used in executable script");
  return unique(observations);
}

function collectAccessibility(html, css) {
  const observations = [];
  if (/<html\b[^>]*\slang\s*=\s*["'][^"']+["']/i.test(html)) observations.push("document language attribute present");
  if (/\saria-[a-z-]+\s*=/i.test(html)) observations.push("ARIA attributes present");
  if (/\srole\s*=\s*["'][^"']+["']/i.test(html)) observations.push("explicit ARIA roles present");
  if (/<(?:header|nav|main|aside|footer)\b/i.test(html)) observations.push("semantic landmark elements present");
  if (/<img\b(?=[^>]*\balt\s*=)/i.test(html)) observations.push("at least one image alt attribute present");
  if (/:focus-visible\b/i.test(css)) observations.push(":focus-visible styling present");
  if (/@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce[^)]*\)/i.test(css)) observations.push("reduced-motion override present");
  return unique(observations);
}

function collectExternalResources(html) {
  const urls = [];
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*(["'])(https?:\/\/[^"']+)\1/gi)) urls.push(match[2]);
  return unique(urls, 50);
}

export function extractDesignEvidenceFromHtml(html, options = {}) {
  if (typeof html !== "string") throw new TypeError("html must be a string");

  const maxBytes = Number.isFinite(options.maxBytes) ? options.maxBytes : DEFAULT_MAX_BYTES;
  const size = byteLength(html);
  if (size > maxBytes) throw new RangeError(`html exceeds ${maxBytes} byte extraction limit`);

  const sanitized = stripNonStyleNoise(html);
  const css = collectStyleSource(sanitized);
  const externalResources = collectExternalResources(sanitized);
  const warnings = [];
  if (externalResources.length) warnings.push("external resources were observed but never fetched");
  if (!css.trim()) warnings.push("no inline <style> blocks or style attributes were found");

  const observations = {
    palette: collectColors(css),
    typography: collectTypography(css),
    spacing: collectSpacing(css),
    radius: declarationValues(css, "border-radius"),
    borders: collectBorders(css),
    shadows: unique([
      ...declarationValues(css, "box-shadow"),
      ...declarationValues(css, "text-shadow")
    ]),
    layout: collectLayout(css),
    components: collectComponents(sanitized),
    motion: collectMotion(css, html),
    accessibility: collectAccessibility(sanitized, css)
  };

  const observedFieldCount = Object.values(observations).filter(values => values.length > 0).length;
  const confidence = observedFieldCount >= 7 ? "structured-high" : observedFieldCount >= 4 ? "structured-medium" : "structured-low";
  const sourceHash = sha256(html);
  const sourceName = options.sourceName ? String(options.sourceName) : "local-html";

  const evidence = {
    source: `html-static-extractor:${sourceName}`,
    confidence,
    screenshots: [],
    observations
  };

  return {
    evidence,
    manifest: {
      version: "html-design-evidence/v1",
      sourceName,
      sha256: sourceHash,
      bytes: size,
      maxBytes,
      styleBytes: byteLength(css),
      observedFieldCount,
      externalResources,
      warnings,
      executionPolicy: "static-only; scripts are never executed and remote resources are never fetched"
    }
  };
}

export function compileDesignMdFromHtml(html, options = {}) {
  const extracted = extractDesignEvidenceFromHtml(html, options);
  const compiled = compileDesignMdFromEvidence(extracted.evidence);
  return {
    ...extracted,
    designMd: compiled.designMd,
    designManifest: compiled.manifest
  };
}
