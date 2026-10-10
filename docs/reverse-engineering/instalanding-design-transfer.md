# InstaLanding.ai donor study → DesignAgent OS

Date: 2026-10-09
Tracking: #3

## Purpose

This dossier records public-source product research for InstaLanding.ai and maps the useful capability into DesignAgent OS without creating a duplicate landing-page product.

The reusable idea is not the InstaLanding brand or a mutable catalog of examples. The reusable idea is a governed **design reference → design DNA → visual transfer** workflow: choose a working reference, extract its visual language, apply that language to an existing product, and prove that content, routes, actions, data contracts, authorization, and business rules did not drift.

## Sources reviewed

- Supplied Reddit launch thread: https://www.reddit.com/r/vibecoding/comments/1x22l87/my_launch_video_for_instalandingai_is_getting/
- Public product: https://instalanding.ai/
- Machine-readable catalog: https://instalanding.ai/prompts.json
- Agent index: https://instalanding.ai/llms.txt
- Same-day Vercel launch discussion: https://www.reddit.com/r/vercel/

Research is limited to public product behavior and public machine-readable surfaces. No private implementation, prompts, credentials, unpublished assets, or restricted system internals were inspected.

## Evidence ledger

| ID | Evidence | Class | Confidence | Boundary |
| --- | --- | --- | --- | --- |
| E-01 | Supplied Reddit post describes selecting a working page, copying its HTML, and instructing an agent to extract typography, colors, spacing, layout, components, and overall aesthetic while preserving content/function/business logic. | Public creator statement | High | Workflow statement, not independent quality proof. |
| E-02 | `prompts.json` reported 39 catalog entries on 2026-10-09 and declared MIT at the catalog level. | Public machine-readable surface | High | Catalog size is mutable; per-artifact third-party rights still require provenance review. |
| E-03 | Current catalog categories were WEB 23, MOTION 5, PRODUCT 7, NAVIGATION 2, FORMS 2. | Public machine-readable surface | High | Snapshot only. |
| E-04 | Rich entries expose slug/title/category/description/best-for/style/theme/sections/stack/demo URLs and prompt/demo size estimates. | Public machine-readable surface | High | Schema can evolve. |
| E-05 | Rich current demos describe self-contained single-file HTML, no build step, no JS framework dependency, and many advertise reduced-motion behavior. | Public machine-readable surface | High | Metadata statement, not full browser certification of every demo. |
| E-06 | `llms.txt` exposes raw prompt/index/skill paths plus npm CLI and MCP invocation paths. | Public machine-readable surface | High | Distribution contract only; internal CLI/MCP source was not audited here. |
| E-07 | Same-day Vercel discussion describes 20 landing pages while the live catalog later reports 39 total entries. | Public creator statement + machine surface | High | Counts represent different/mutable snapshots or catalog scopes; never use count as a stable parity target. |
| E-08 | Some catalog entries carry explicit third-party inspiration credits. | Public machine-readable surface | High | Top-level MIT metadata must not be treated as proof that unrelated credited third-party material is MIT. |

## Product reconstruction

### Primary job to be done

Reduce repeated aesthetic prompting by giving humans and coding agents a concrete, working visual reference that can be inspected and adapted.

### User workflow

```text
Discover reference
  → search/filter catalog
  → inspect metadata + working demo
  → obtain prompt/reference artifact
  → extract visual DNA
  → define protected product invariants
  → generate visual transfer plan
  → apply in isolated workspace
  → run functional + accessibility + visual verification
  → keep or reject the change from evidence
```

### Public capability surface

1. Human-browsable reference gallery.
2. Machine-readable catalog/index.
3. Per-reference prompt/text/JSON artifacts.
4. Self-contained working HTML examples for richer references.
5. Search/inspect/get/add CLI flow.
6. MCP surface for agent access.
7. A transfer pattern that explicitly asks the agent to change visual language without changing product semantics.

## Why DesignAgent OS is the canonical destination

DesignAgent OS already owns repository/source design-DNA extraction, anti-pattern detection, deterministic quality scoring, product-archetype guidance, style manifests, `SKILL.md`/`DESIGN.md` compilation, CLI/API surfaces, and future visual evidence work.

InstaLanding therefore contributes a missing orchestration layer rather than a new product:

```text
Design reference catalog
        ↓
Reference ranking + provenance
        ↓
Design evidence / DNA extraction
        ↓
DESIGN.md + DesignTransferPlan
        ↓
Isolated visual implementation
        ↓
Invariant + browser + a11y + visual receipts
```

## Capability matrix

### MATCH — already owned

- source/repository design-DNA analysis
- design-style manifests
- `SKILL.md` + `DESIGN.md` generation
- anti-pattern detection and quality scoring
- CLI and HTTP API

### IMPROVE

- searchable machine-readable design reference catalog
- ranking by product archetype, tags, interaction type, theme, accessibility and complexity budget
- reference-level source/license/credit receipts
- reduced-motion/accessibility eligibility checks
- explicit before/after verification contract

### NEW

- `DesignReference` schema
- `DesignTransferPlan`
- rights state: `verified | unknown | restricted`
- deterministic catalog ranking
- protected invariant digest over content/routes/actions/data contracts/business rules/authorization
- HTML/reference evidence adapter into the existing design-evidence schema
- later MCP interface backed by the same contracts
- visual-transfer receipt combining source provenance, code SHA, functional evidence and visual evidence

### OMIT

- a verbatim InstaLanding clone
- InstaLanding branding or mutable catalog content as our product identity
- unsupported “premium” or quality claims
- assumption that catalog-level MIT automatically clears third-party credited inspirations
- any success claim based only on screenshot similarity

### INVESTIGATE

- exact per-artifact license/attribution requirements if any upstream artifact is ever vendored
- independent quality benchmark across different coding agents
- token/latency tradeoffs between full HTML references, structured design evidence and screenshots
- deterministic HTML/CSS extraction coverage before vision is needed
- whether MCP provides enough value beyond the same bounded CLI/API contracts

## Reconstruction model

A useful clean-room internal domain model is:

```text
DesignReference
  slug
  title
  category
  tags / bestFor / theme / sections
  stack + accessibility metadata
  prompt/demo URLs
  complexity estimates
  provenance
    source URL
    upstream ID
    license
    credits
    rightsStatus
    retrieval date

DesignTransferPlan
  reference identity + provenance
  allowed presentation changes
  forbidden semantic changes
  frozen target invariants
  invariant digest
  blockers
  verification checklist

TransferReceipt (later phase)
  source reference hash
  target repo + base SHA + result SHA
  invariant verification
  unit/integration/acceptance results
  browser interaction result
  accessibility/reduced-motion result
  before/after visual evidence
  reviewer/UAT decision
```

## Phase A — deterministic contract layer

Implemented in this branch:

- normalize public/reference manifests into a provider-neutral `DesignReference`
- explicit provenance and rights state
- deterministic search/ranking across title/category/tags/best-for/theme/sections/description
- filters for category, theme, rights, reduced-motion and approximate token budget
- `DesignTransferPlan` with protected invariants
- SHA-256 invariant digest
- fail-closed block when reuse rights are not `verified`
- invariant verifier that reports which protected contract class drifted
- deterministic/negative tests

This phase does **not** fetch or vendor the live InstaLanding catalog and does not copy its prompts, HTML, branding or assets.

## Phase B — evidence adapters

1. Parse deterministic design facts from local HTML/CSS where possible.
2. Convert those observations into the existing DesignAgent evidence schema.
3. Add provider-neutral visual evidence for non-parseable properties.
4. Keep image/reference inputs ephemeral by default; persist only bounded hashes/provenance needed for receipts.
5. Add adversarial fixtures for malformed HTML, external resources, huge inputs and prompt-like content embedded in artifacts.

## Phase C — isolated application + product verification

1. Select a reference using the deterministic ranker.
2. Snapshot target product invariants.
3. Apply only in an isolated worktree/branch.
4. Recompute invariant digest and reject semantic drift.
5. Run existing product tests.
6. Run browser route/action regression.
7. Run keyboard/a11y/reduced-motion checks.
8. Capture before/after screenshots and DOM evidence.
9. Produce one evidence-bound transfer receipt.

## Phase D — interfaces and certification

- catalog/preview UI
- bounded MCP interface backed by the same core contracts
- hosted preview
- UAT on at least three existing products with different stacks
- exact-SHA CI evidence
- functional invariance evidence
- accessibility and reduced-motion evidence
- visual UAT
- tracker reconciliation

## Acceptance gates

The donor is not complete because research or Phase A code exists. Completion requires:

1. source/evidence ledger current and contradiction-free
2. deterministic contract tests green
3. exact-head CI green
4. at least one real HTML/reference extraction path proven
5. isolated transfer against a real existing product
6. invariant digest and functional tests prove no semantic drift
7. browser/a11y/reduced-motion evidence green
8. three-product UAT matrix complete
9. hosted preview evidence where applicable
10. canonical tracker updated with exact repo/branch/PR/SHA/evidence links

## Known limitations

- No independent benchmark yet proves that the upstream references outperform other design-reference strategies.
- “Premium” is marketing language, not an audited quality metric.
- Public catalog content and counts changed within the same day; they are not parity requirements.
- The upstream creator explicitly frames the workflow as a starting point rather than a guarantee of perfect first-pass results.
- CLI/MCP internals were not source-audited in this slice.
- Third-party inspiration credits require separate rights analysis before exact reuse.
- Browser, deployment and production-readiness claims for our donor integration remain unverified until later gates are run.
