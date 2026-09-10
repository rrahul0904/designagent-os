const RULES = [
  {
    id: "gradient-text",
    severity: 9,
    message: "Gradient text is a common generated-UI default.",
    test: s => /background-clip\s*:\s*text|-webkit-background-clip\s*:\s*text/.test(s)
  },
  {
    id: "pill-overuse",
    severity: 7,
    message: "Large pill radii detected; verify they are intentional.",
    test: s => /border-radius\s*:\s*(?:9999?px|999rem|50vw)/i.test(s) || /rounded-full/.test(s)
  },
  {
    id: "generic-purple-gradient",
    severity: 10,
    message: "Purple/blue gradients are frequently used as an unspecified AI default.",
    test: s => /linear-gradient[^;]*(?:purple|violet|indigo|#8b5cf6|#7c3aed|#6366f1)/i.test(s)
  },
  {
    id: "glassmorphism",
    severity: 7,
    message: "Backdrop blur / glass styling should be justified by the product.",
    test: s => /backdrop-filter\s*:\s*blur|backdrop-blur/.test(s)
  },
  {
    id: "emoji-icons",
    severity: 6,
    message: "Emoji used as interface iconography can make product UI feel improvised.",
    test: s => /[\u{1F300}-\u{1FAFF}]/u.test(s)
  },
  {
    id: "missing-focus",
    severity: 8,
    message: "No focus-visible treatment detected.",
    test: s => /<(?:button|a|input|select|textarea)\b/i.test(s) && !/focus-visible/.test(s)
  },
  {
    id: "motion-without-reduced-motion",
    severity: 8,
    message: "Animations/transitions are present without a reduced-motion override.",
    test: s => /(?:animation|transition)\s*:/.test(s) && !/prefers-reduced-motion/.test(s)
  },
  {
    id: "three-card-template",
    severity: 8,
    message: "Three-column card pattern detected; confirm it follows the user workflow rather than a stock landing-page template.",
    test: s => /grid-template-columns\s*:\s*repeat\(3\s*,\s*1fr\)/.test(s)
  }
];

export function auditSource(source = "") {
  return RULES.filter(rule => rule.test(source)).map(({ test, ...rule }) => rule);
}

export function getRules() {
  return RULES.map(({ test, ...rule }) => rule);
}
