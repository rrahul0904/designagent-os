const STYLE_REGISTRY = Object.freeze([
  {
    slug: "precision-light",
    name: "Precision Light",
    summary: "A restrained light interface for serious product workflows where hierarchy and clarity matter more than decoration.",
    tags: ["professional", "productivity", "dashboard"],
    principles: [
      "Use spacing and alignment as the primary hierarchy system.",
      "Reserve the accent color for primary actions, selection, and key state changes.",
      "Keep surfaces quiet so dense product content remains easy to scan."
    ],
    tokens: {
      colors: {
        background: "#F7F7F5",
        surface: "#FFFFFF",
        text: "#161616",
        muted: "#6B6B67",
        border: "#D9D9D4",
        accent: "#2957D6"
      },
      typography: {
        display: "system-ui, sans-serif",
        body: "system-ui, sans-serif",
        mono: "ui-monospace, SFMono-Regular, Menlo, monospace"
      },
      spacing: [4, 8, 12, 16, 24, 32, 48, 64],
      radius: { control: 8, card: 12 },
      borderWidth: 1,
      shadow: "0 8px 24px rgba(0,0,0,0.06)"
    },
    components: {
      button: "Solid accent for primary actions; neutral outline for secondary actions; visible focus ring.",
      card: "White surface, 1px neutral border, compact shadow only when elevation communicates hierarchy.",
      input: "Neutral surface, visible label, 1px border, accent focus ring, no placeholder-only labels."
    },
    motion: {
      durationMs: [120, 180],
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      reducedMotion: "Remove translation and scale; retain instant opacity/state changes."
    },
    avoid: [
      "Decorative gradients without semantic purpose.",
      "Excessive rounded pills for ordinary controls.",
      "Multiple competing accent colors in the same view."
    ]
  },
  {
    slug: "editorial-warm",
    name: "Editorial Warm",
    summary: "A content-led system with warm paper surfaces, serif-led display type, and deliberate editorial rhythm.",
    tags: ["editorial", "content", "elegant"],
    principles: [
      "Lead with type scale and composition before adding decoration.",
      "Use warm neutrals and thin rules to create structure without boxed-in layouts.",
      "Let important content breathe; do not compress every section into a card."
    ],
    tokens: {
      colors: {
        background: "#F4EFE6",
        surface: "#FBF8F2",
        text: "#231F1A",
        muted: "#786F64",
        border: "#CFC5B7",
        accent: "#9B3F2F"
      },
      typography: {
        display: "Georgia, 'Times New Roman', serif",
        body: "system-ui, sans-serif",
        mono: "ui-monospace, SFMono-Regular, Menlo, monospace"
      },
      spacing: [6, 12, 18, 24, 36, 54, 72],
      radius: { control: 4, card: 6 },
      borderWidth: 1,
      shadow: "0 10px 28px rgba(55,38,20,0.08)"
    },
    components: {
      button: "Short labels, modest radius, solid accent or text-link treatment; avoid oversized pill CTAs.",
      card: "Prefer section rules and whitespace; use cards only when grouping is meaningful.",
      input: "Paper-toned surface, persistent labels, generous vertical padding, strong focus outline."
    },
    motion: {
      durationMs: [160, 240],
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      reducedMotion: "Collapse movement to state changes with no parallax or long easing."
    },
    avoid: [
      "Generic dashboard card grids for narrative content.",
      "Cold blue-gray palettes that break the paper tone.",
      "Animation that competes with reading."
    ]
  },
  {
    slug: "technical-dark",
    name: "Technical Dark",
    summary: "A high-information dark system for engineering and operations tools with disciplined contrast and monospace detail.",
    tags: ["technical", "dark", "operations"],
    principles: [
      "Use luminance contrast to express hierarchy before using color.",
      "Keep accent usage sparse so alerts and active states stay meaningful.",
      "Use monospace for machine data, identifiers, and metrics—not every sentence."
    ],
    tokens: {
      colors: {
        background: "#111315",
        surface: "#181B1F",
        text: "#F2F4F5",
        muted: "#9EA5AD",
        border: "#343A40",
        accent: "#75D4A4"
      },
      typography: {
        display: "system-ui, sans-serif",
        body: "system-ui, sans-serif",
        mono: "ui-monospace, SFMono-Regular, Menlo, monospace"
      },
      spacing: [4, 8, 12, 16, 20, 28, 40, 56],
      radius: { control: 6, card: 8 },
      borderWidth: 1,
      shadow: "0 12px 30px rgba(0,0,0,0.28)"
    },
    components: {
      button: "Compact controls with clear active/disabled states and a visible keyboard focus ring.",
      card: "Dark elevated surface with subtle border; use density intentionally for operational scanning.",
      input: "Dark surface, persistent label, high-contrast caret/focus state, explicit validation message."
    },
    motion: {
      durationMs: [100, 160],
      easing: "cubic-bezier(0.2, 0.7, 0.2, 1)",
      reducedMotion: "Disable motion beyond short opacity transitions."
    },
    avoid: [
      "Pure black surfaces everywhere.",
      "Full-brightness neon text for body copy.",
      "Dense decorative grid overlays that reduce legibility."
    ]
  }
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function requireStyle(style) {
  if (!style || typeof style !== "object") throw new TypeError("style must be an object");
  for (const key of ["slug", "name", "summary", "tokens", "principles", "components", "motion", "avoid"]) {
    if (!(key in style)) throw new TypeError(`style.${key} is required`);
  }
  return style;
}

function bullets(values = []) {
  return values.map(value => `- ${value}`).join("\n");
}

function tokenLines(tokens) {
  return Object.entries(tokens).map(([name, value]) => `- ${name}: ${value}`).join("\n");
}

export function listDesignStyles() {
  return STYLE_REGISTRY.map(({ slug, name, summary, tags }) => ({ slug, name, summary, tags: [...tags] }));
}

export function getDesignStyle(slug) {
  const style = STYLE_REGISTRY.find(item => item.slug === slug);
  return style ? clone(style) : null;
}

export function compileStyleDocuments(styleOrSlug) {
  const style = typeof styleOrSlug === "string" ? getDesignStyle(styleOrSlug) : clone(styleOrSlug);
  requireStyle(style);

  const colors = style.tokens.colors || {};
  const typography = style.tokens.typography || {};
  const spacing = style.tokens.spacing || [];
  const radius = style.tokens.radius || {};

  const skillMd = `# ${style.name} Design Skill\n\n## Purpose\n${style.summary}\n\n## Principles\n${bullets(style.principles)}\n\n## Component rules\n- Button: ${style.components.button}\n- Card: ${style.components.card}\n- Input: ${style.components.input}\n\n## Motion\n- Durations: ${(style.motion.durationMs || []).join("ms, ")}ms\n- Easing: ${style.motion.easing}\n- Reduced motion: ${style.motion.reducedMotion}\n\n## Avoid\n${bullets(style.avoid)}\n\n## Accessibility contract\n- Preserve semantic HTML and keyboard navigation.\n- Keep visible focus states on every interactive control.\n- Do not use color alone to communicate state.\n- Respect reduced-motion preferences.\n\n## Project reference\nKeep the project-specific decisions in DESIGN.md and treat that file as the source of truth when implementation details diverge from this general style guidance.\n`;

  const designMd = `# DESIGN.md — ${style.name}\n\n## Intent\n${style.summary}\n\n## Palette\n${tokenLines(colors)}\n\n## Typography\n${tokenLines(typography)}\n\n## Spacing\n- scale: ${spacing.map(value => `${value}px`).join(", ")}\n\n## Shape and elevation\n- control-radius: ${radius.control}px\n- card-radius: ${radius.card}px\n- border-width: ${style.tokens.borderWidth}px\n- shadow: ${style.tokens.shadow}\n\n## Components\n- button: ${style.components.button}\n- card: ${style.components.card}\n- input: ${style.components.input}\n\n## Motion\n- durations: ${(style.motion.durationMs || []).map(value => `${value}ms`).join(", ")}\n- easing: ${style.motion.easing}\n- reduced-motion: ${style.motion.reducedMotion}\n\n## Guardrails\n${bullets(style.avoid)}\n\n## Accessibility\n- Visible keyboard focus is required.\n- Text and interactive states must meet the project's contrast requirements.\n- Motion must degrade safely when reduced motion is requested.\n`;

  return { style, skillMd, designMd };
}
