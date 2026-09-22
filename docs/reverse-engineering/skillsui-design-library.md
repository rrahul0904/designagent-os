# Skills UI donor study → DesignAgent OS

Date: 2026-09-22

## Sources reviewed

- Reddit post: https://www.reddit.com/r/claudeskills/comments/1wnmf3v/library_with_40_design_skills/
- Product home: https://www.skillsui.app/
- Library: https://www.skillsui.app/skills
- Extractor: https://www.skillsui.app/extractor
- Pricing: https://www.skillsui.app/pricing
- Example public skill page: https://www.skillsui.app/skills/clean
- Privacy: https://www.skillsui.app/privacy
- Terms: https://www.skillsui.app/terms

## Publicly observable product contract

Skills UI presents a searchable design-style library for AI builders. Public pages show paired `SKILL.md` and `DESIGN.md` artifacts, live CSS previews, guidance for Claude and Cursor, style categories, and a paid design extractor that accepts up to five screenshots and emits a structured `design.md`.

At research time the browse page showed 42 styles split into 11 free and 31 Pro. The pricing page still described 9 free core skills and 40+ premium skills, so counts are treated as mutable catalog content rather than a stable contract. Pricing publicly advertised Pro at $12/month or $79/year. The extractor page says up to five screenshots; pricing claims unlimited extractor use and no image storage.

## Clean-room boundary

The public Terms state that downloaded skill files are personal, non-exclusive, and non-transferable; redistribution is prohibited. The same Terms also prohibit reverse-engineering, scraping, bulk-download, and using the service to develop a competing product.

Accordingly, this work does **not** copy or redistribute Skills UI skill files, prompts, code, design assets, branding, private generation logic, or paid content. It uses only high-level public behavior as comparative product research. All implementation in this repository is original and aligned to DesignAgent OS's pre-existing purpose: design intelligence and UI quality control for AI-generated software.

## Capability mapping

| Observed pattern | DesignAgent OS interpretation | Phase A state |
| --- | --- | --- |
| Browse design styles | Original first-party style registry | Implemented |
| Paired `SKILL.md` + `DESIGN.md` | Deterministic compiler from our own style schema | Implemented |
| Screenshot(s) → `design.md` | Provenance-preserving evidence contract + deterministic compiler | Implemented contract; screenshot understanding deferred |
| Claude/Cursor usage | CLI/API outputs that agents/editors can consume | Implemented |
| Live style preview | Browser preview and visual regression harness | Deferred |
| Paid catalog / subscriptions | Entitlements, account system, billing | Deferred and not required for core design intelligence |
| No-image-storage promise | Ephemeral processing + explicit retention policy | Deferred hosted-runtime requirement |

## Phase A implementation

### Original style registry

`src/core/design-style-library.js` defines an original structured `DesignStyle` contract and three first-party starter styles: `precision-light`, `editorial-warm`, and `technical-dark`. Each style includes principles, tokens, component rules, motion behavior, accessibility guardrails, and anti-patterns.

`compileStyleDocuments()` deterministically produces paired `SKILL.md` and `DESIGN.md` strings from one manifest so the instruction layer and project source-of-truth stay synchronized.

### Evidence-to-DESIGN.md compiler

`src/core/design-evidence.js` accepts a bounded evidence bundle with up to five screenshot references and normalized observations for palette, typography, spacing, shape, borders, shadows, layout, components, motion, and accessibility.

The compiler intentionally refuses to invent missing values. Unobserved fields are emitted as `Unresolved — requires direct evidence.` and are listed in the returned manifest. Screenshot IDs, optional hashes, and dimensions are preserved as provenance.

This is the stable contract a future vision/OCR adapter can feed without coupling DesignAgent OS to one model provider.

### Interfaces

CLI:

```bash
node src/cli/index.js styles
node src/cli/index.js compile-style precision-light
node src/cli/index.js design-md evidence.json
```

HTTP API:

```text
GET  /api/styles
GET  /api/styles/:slug
POST /api/styles/:slug/documents
POST /api/design-md/evidence
POST /api/analyze                 # existing behavior retained
```

## What is not implemented or certified

- screenshot pixel analysis, OCR, color sampling, font recognition, or layout detection
- upload processing or temporary object storage
- account/authentication, subscription entitlements, Stripe, or marketplace commerce
- web catalog UI, live style preview, desktop/mobile preview switching
- browser visual regression or accessibility certification of generated designs
- hosted privacy/retention proof

## Next implementation slice

Add a provider-neutral `VisualEvidenceAdapter` that turns 1–5 image inputs into the existing evidence schema, deletes temporary input immediately after processing, records hashes rather than image contents in provenance, and includes deterministic fixture tests. Only after that contract is stable should the browser catalog/preview UI be built.

Tracking: GitHub Issue #1.
