import { createHash } from "node:crypto";

const RIGHTS_STATUSES = new Set(["verified", "unknown", "restricted"]);
const REQUIRED_TRANSFER_KEYS = [
  "content",
  "routes",
  "actions",
  "dataContracts",
  "businessRules",
  "authorization"
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function strings(value = []) {
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map(item => String(item).trim()).filter(Boolean))];
}

function nullableNumber(value) {
  return Number.isFinite(value) ? value : null;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, stableValue(value[key])])
    );
  }
  return value;
}

function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

function sha256(value) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map(token => token.trim())
    .filter(Boolean);
}

function textScore(tokens, value, weight) {
  if (!tokens.length) return 0;
  const haystack = strings(value).join(" ").toLowerCase();
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? weight : 0), 0);
}

function normalizeRightsStatus(value) {
  const status = String(value || "unknown").toLowerCase();
  if (!RIGHTS_STATUSES.has(status)) throw new TypeError(`unsupported rightsStatus: ${status}`);
  return status;
}

export function normalizeDesignReference(input, defaults = {}) {
  if (!input || typeof input !== "object") throw new TypeError("design reference must be an object");

  const slug = String(input.slug || input.id || "").trim();
  const title = String(input.title || input.name || "").trim();
  const category = String(input.category || "").trim().toLowerCase();
  if (!slug) throw new TypeError("design reference slug is required");
  if (!title) throw new TypeError(`design reference ${slug} title is required`);
  if (!category) throw new TypeError(`design reference ${slug} category is required`);

  const upstreamProvenance = input.provenance && typeof input.provenance === "object" ? input.provenance : {};
  const rightsStatus = normalizeRightsStatus(
    upstreamProvenance.rightsStatus ?? input.rightsStatus ?? defaults.rightsStatus ?? "unknown"
  );

  const stack = input.stack && typeof input.stack === "object" ? input.stack : {};
  const features = strings(stack.features);

  return {
    slug,
    title,
    category,
    description: String(input.description || "").trim(),
    tags: strings(input.tags || input.style),
    bestFor: strings(input.bestFor),
    theme: input.theme ? String(input.theme).toLowerCase() : null,
    sections: strings(input.sections),
    preview: input.preview ? String(input.preview) : null,
    urls: {
      page: input.pageUrl ? String(input.pageUrl) : null,
      prompt: input.promptUrl ? String(input.promptUrl) : null,
      promptJson: input.promptJsonUrl ? String(input.promptJsonUrl) : null,
      demo: input.demoUrl ? String(input.demoUrl) : null,
      thumbnail: input.thumbnailUrl ? String(input.thumbnailUrl) : null,
      repository: input.repoUrl ? String(input.repoUrl) : null
    },
    stack: {
      format: stack.format ? String(stack.format) : null,
      buildStep: typeof stack.buildStep === "boolean" ? stack.buildStep : null,
      libraries: strings(stack.libraries),
      fonts: strings(stack.fonts),
      features
    },
    accessibility: {
      reducedMotion: features.includes("reduced-motion")
    },
    metrics: {
      promptChars: nullableNumber(input.promptChars),
      approxPromptTokens: nullableNumber(input.approxPromptTokens),
      demoBytes: nullableNumber(input.demoBytes)
    },
    provenance: {
      sourceUrl: upstreamProvenance.sourceUrl || defaults.sourceUrl || null,
      upstreamId: upstreamProvenance.upstreamId || slug,
      license: upstreamProvenance.license || input.license || defaults.license || null,
      rightsStatus,
      retrievedAt: upstreamProvenance.retrievedAt || defaults.retrievedAt || null,
      credits: Array.isArray(input.credits) ? clone(input.credits) : []
    },
    applyEligible: rightsStatus === "verified"
  };
}

export function normalizeReferenceManifest(manifest, defaults = {}) {
  const items = Array.isArray(manifest) ? manifest : manifest?.prompts;
  if (!Array.isArray(items)) throw new TypeError("reference manifest must be an array or expose prompts[]");

  const mergedDefaults = {
    ...defaults,
    sourceUrl: defaults.sourceUrl || manifest?.url || null,
    license: defaults.license || manifest?.license || null
  };

  return items.map(item => normalizeDesignReference(item, mergedDefaults));
}

export function searchDesignReferences(references, query = "", options = {}) {
  if (!Array.isArray(references)) throw new TypeError("references must be an array");

  const normalized = references.map(item => normalizeDesignReference(item, item.provenance || {}));
  const tokens = tokenize(query);
  const categories = new Set(strings(options.categories).map(value => value.toLowerCase()));
  const themes = new Set(strings(options.themes).map(value => value.toLowerCase()));
  const rightsStatuses = new Set(strings(options.rightsStatus).map(value => value.toLowerCase()));
  const maxApproxTokens = Number.isFinite(options.maxApproxTokens) ? options.maxApproxTokens : null;
  const requireReducedMotion = options.requireReducedMotion === true;
  const applyEligibleOnly = options.applyEligibleOnly === true;

  return normalized
    .filter(reference => !categories.size || categories.has(reference.category))
    .filter(reference => !themes.size || (reference.theme && themes.has(reference.theme)))
    .filter(reference => !rightsStatuses.size || rightsStatuses.has(reference.provenance.rightsStatus))
    .filter(reference => !requireReducedMotion || reference.accessibility.reducedMotion)
    .filter(reference => !applyEligibleOnly || reference.applyEligible)
    .filter(reference => maxApproxTokens == null || reference.metrics.approxPromptTokens == null || reference.metrics.approxPromptTokens <= maxApproxTokens)
    .map(reference => {
      const score =
        textScore(tokens, reference.title, 8) +
        textScore(tokens, reference.category, 5) +
        textScore(tokens, reference.tags, 5) +
        textScore(tokens, reference.bestFor, 5) +
        textScore(tokens, reference.theme || "", 3) +
        textScore(tokens, reference.sections, 2) +
        textScore(tokens, reference.description, 2);
      return { ...reference, score };
    })
    .filter(reference => !tokens.length || reference.score > 0)
    .sort((left, right) => right.score - left.score || left.slug.localeCompare(right.slug));
}

function normalizeTransferContract(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("target transfer contract must be an object");
  }

  const missing = REQUIRED_TRANSFER_KEYS.filter(key => !(key in input));
  if (missing.length) throw new TypeError(`target transfer contract missing: ${missing.join(", ")}`);

  return clone(input);
}

export function compileDesignTransferPlan(referenceInput, targetContractInput) {
  const reference = normalizeDesignReference(referenceInput, referenceInput?.provenance || {});
  const frozenInvariants = normalizeTransferContract(targetContractInput);
  const invariantDigest = sha256(frozenInvariants);
  const blockers = [];

  if (!reference.applyEligible) {
    blockers.push(`reference rights are ${reference.provenance.rightsStatus}; verify reuse rights before applying it`);
  }

  return {
    version: "design-transfer/v1",
    reference: {
      slug: reference.slug,
      title: reference.title,
      category: reference.category,
      theme: reference.theme,
      tags: reference.tags,
      provenance: reference.provenance
    },
    applyEligible: blockers.length === 0,
    blockers,
    allowedChanges: [
      "typography",
      "colors",
      "spacing",
      "visual hierarchy",
      "layout composition",
      "component presentation",
      "decorative assets",
      "motion within accessibility limits"
    ],
    forbiddenChanges: [
      "content meaning",
      "routes",
      "user actions",
      "data contracts",
      "authentication or authorization semantics",
      "business rules"
    ],
    frozenInvariants,
    invariantDigest,
    verification: [
      "Recompute the invariant digest from the post-transfer product contract and require an exact match.",
      "Run existing unit/integration/acceptance tests with no weakened assertions.",
      "Run keyboard, accessibility and reduced-motion checks for changed surfaces.",
      "Run browser interaction regression for all frozen routes and actions.",
      "Record before/after visual evidence without treating visual similarity as functional proof."
    ]
  };
}

export function verifyDesignTransferInvariants(expectedContractInput, actualContractInput) {
  const expected = normalizeTransferContract(expectedContractInput);
  const actual = normalizeTransferContract(actualContractInput);
  const expectedDigest = sha256(expected);
  const actualDigest = sha256(actual);
  const changedKeys = REQUIRED_TRANSFER_KEYS.filter(key => stableJson(expected[key]) !== stableJson(actual[key]));

  return {
    pass: expectedDigest === actualDigest,
    expectedDigest,
    actualDigest,
    changedKeys
  };
}
