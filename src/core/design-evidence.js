const FIELD_ORDER = [
  ["palette", "Palette"],
  ["typography", "Typography"],
  ["spacing", "Spacing"],
  ["radius", "Radius"],
  ["borders", "Borders"],
  ["shadows", "Shadows"],
  ["layout", "Layout"],
  ["components", "Components"],
  ["motion", "Motion"],
  ["accessibility", "Accessibility"]
];

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function normalizeObservation(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return unique(value);
  return unique([value]);
}

function normalizeScreenshots(screenshots = []) {
  if (!Array.isArray(screenshots)) throw new TypeError("screenshots must be an array");
  if (screenshots.length > 5) throw new RangeError("at most 5 screenshots are supported per extraction request");
  return screenshots.map((item, index) => {
    if (typeof item === "string") return { id: item, index };
    if (!item || typeof item !== "object") throw new TypeError("each screenshot must be a string id or object");
    return {
      id: String(item.id || item.name || `screenshot-${index + 1}`),
      index,
      sha256: item.sha256 ? String(item.sha256) : null,
      width: Number.isFinite(item.width) ? item.width : null,
      height: Number.isFinite(item.height) ? item.height : null
    };
  });
}

export function compileDesignMdFromEvidence(input = {}) {
  const screenshots = normalizeScreenshots(input.screenshots || []);
  const observations = input.observations && typeof input.observations === "object" ? input.observations : {};
  const source = input.source || "structured-evidence";
  const confidence = input.confidence || "unverified";

  const normalized = {};
  for (const [key] of FIELD_ORDER) normalized[key] = normalizeObservation(observations[key]);

  const sections = FIELD_ORDER.map(([key, title]) => {
    const values = normalized[key];
    const body = values.length ? values.map(value => `- ${value}`).join("\n") : "- Unresolved — requires direct evidence.";
    return `## ${title}\n${body}`;
  }).join("\n\n");

  const designMd = `# DESIGN.md — Extracted Design Evidence\n\n## Evidence boundary\n- source: ${source}\n- screenshot-count: ${screenshots.length}\n- confidence: ${confidence}\n- rule: missing values remain unresolved; this compiler must not invent design tokens.\n\n${sections}\n\n## Provenance\n${screenshots.length ? screenshots.map(item => `- ${item.id}${item.sha256 ? ` · sha256:${item.sha256}` : ""}${item.width && item.height ? ` · ${item.width}x${item.height}` : ""}`).join("\n") : "- No screenshots attached to this evidence bundle."}\n`;

  return {
    designMd,
    manifest: {
      version: 1,
      source,
      confidence,
      screenshots,
      observations: normalized,
      unresolved: FIELD_ORDER.filter(([key]) => normalized[key].length === 0).map(([key]) => key)
    }
  };
}
