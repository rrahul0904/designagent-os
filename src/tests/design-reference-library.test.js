import test from "node:test";
import assert from "node:assert/strict";
import {
  compileDesignTransferPlan,
  normalizeDesignReference,
  normalizeReferenceManifest,
  searchDesignReferences,
  verifyDesignTransferInvariants
} from "../core/design-reference-library.js";

const manifest = {
  name: "example",
  url: "https://example.test/catalog.json",
  license: "MIT",
  prompts: [
    {
      slug: "speech-console",
      title: "Speech Console",
      category: "product",
      description: "Audio review dashboard with waveform and transcript",
      bestFor: ["voice AI consoles", "audio review dashboards"],
      style: ["light", "monospace"],
      theme: "light",
      sections: ["deck", "queue"],
      approxPromptTokens: 800,
      stack: { format: "single-file-html", buildStep: false, features: ["reduced-motion"] }
    },
    {
      slug: "dark-edge",
      title: "Dark Edge Hero",
      category: "web",
      description: "Technical infrastructure landing page",
      bestFor: ["developer platforms", "edge networks"],
      style: ["dark", "glass"],
      theme: "dark",
      sections: ["hero", "pricing"],
      approxPromptTokens: 1200,
      stack: { format: "single-file-html", buildStep: false, features: [] }
    }
  ]
};

const transferContract = {
  content: ["home headline", "pricing copy"],
  routes: ["/", "/pricing"],
  actions: ["open-signup", "submit-waitlist"],
  dataContracts: ["WaitlistRequestV1"],
  businessRules: ["one email creates at most one waitlist record"],
  authorization: ["pricing is public", "admin route remains protected"]
};

test("normalizes a machine-readable catalog with explicit provenance", () => {
  const references = normalizeReferenceManifest(manifest, {
    rightsStatus: "verified",
    retrievedAt: "2026-10-09"
  });

  assert.equal(references.length, 2);
  assert.equal(references[0].provenance.license, "MIT");
  assert.equal(references[0].provenance.sourceUrl, "https://example.test/catalog.json");
  assert.equal(references[0].provenance.rightsStatus, "verified");
  assert.equal(references[0].applyEligible, true);
  assert.equal(references[0].accessibility.reducedMotion, true);
});

test("search ranks by user intent and remains deterministic on ties", () => {
  const references = normalizeReferenceManifest(manifest, { rightsStatus: "verified" });
  const voice = searchDesignReferences(references, "voice dashboard");
  assert.equal(voice[0].slug, "speech-console");

  const all = searchDesignReferences(references, "");
  assert.deepEqual(all.map(item => item.slug), ["dark-edge", "speech-console"]);
});

test("search can require reduced motion and a complexity budget", () => {
  const references = normalizeReferenceManifest(manifest, { rightsStatus: "verified" });
  const results = searchDesignReferences(references, "", {
    requireReducedMotion: true,
    maxApproxTokens: 900
  });
  assert.deepEqual(results.map(item => item.slug), ["speech-console"]);
});

test("unknown rights stay discoverable but are blocked from apply plans", () => {
  const reference = normalizeDesignReference({
    slug: "unknown-source",
    title: "Unknown Source",
    category: "web"
  });

  assert.equal(reference.applyEligible, false);
  const plan = compileDesignTransferPlan(reference, transferContract);
  assert.equal(plan.applyEligible, false);
  assert.match(plan.blockers[0], /verify reuse rights/);
});

test("verified references produce a transfer plan with frozen product invariants", () => {
  const [reference] = normalizeReferenceManifest(manifest, { rightsStatus: "verified" });
  const plan = compileDesignTransferPlan(reference, transferContract);

  assert.equal(plan.applyEligible, true);
  assert.equal(plan.version, "design-transfer/v1");
  assert.equal(plan.frozenInvariants.routes[1], "/pricing");
  assert.equal(plan.invariantDigest.length, 64);
  assert.ok(plan.forbiddenChanges.includes("business rules"));
});

test("invariance verifier detects functional drift after a visual transfer", () => {
  const unchanged = verifyDesignTransferInvariants(transferContract, structuredClone(transferContract));
  assert.equal(unchanged.pass, true);
  assert.deepEqual(unchanged.changedKeys, []);

  const drifted = structuredClone(transferContract);
  drifted.actions.push("delete-account");
  const drift = verifyDesignTransferInvariants(transferContract, drifted);
  assert.equal(drift.pass, false);
  assert.deepEqual(drift.changedKeys, ["actions"]);
});

test("malformed manifests and unsupported rights states fail closed", () => {
  assert.throws(() => normalizeReferenceManifest({}), /prompts/);
  assert.throws(
    () => normalizeDesignReference({ slug: "x", title: "X", category: "web", rightsStatus: "maybe" }),
    /unsupported rightsStatus/
  );
});
