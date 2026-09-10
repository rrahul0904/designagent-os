# Implementation Plan

## Phase 0 — Foundation

### Completed in initial draft
- repository structure
- deterministic Design DNA extractor
- anti-pattern rules
- weighted score
- CLI
- HTTP API
- tests
- example fixture
- CI definition
- agent skill draft

### Exit criteria
- tests pass on Node 22
- CLI can analyze a CSS/HTML/text file
- API returns a report from submitted source
- no model/API key required

## Phase 1 — Repository Scanner

Implement:
- package-manager detection
- React/Next/Vue/Svelte detection
- routing discovery
- Tailwind/CSS Modules/styled-components detection
- local component inventory
- token and icon inventory
- dependency-risk report

## Phase 2 — Browser Verification

Implement:
- Playwright adapter
- desktop/tablet/mobile screenshots
- focus/keyboard smoke tests
- reduced-motion check
- axe accessibility scan
- layout overflow detection

## Phase 3 — Design Intelligence

Implement:
- design archetype inference
- component candidate registry
- fit scoring
- visual consistency evaluator
- project-specific design memory
- screenshot comparison

## Phase 4 — GitHub Workflow

Implement:
- PR diff ingestion
- changed-surface detection
- audit comment
- quality gate
- proposed code patch
- optional improvement PR

## Phase 5 — Hosted Control Plane

Implement organizations, projects, audit history, policy packs, team design memory, RBAC, and analytics.
