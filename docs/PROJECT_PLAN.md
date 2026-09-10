# DesignAgent OS — Project Plan

## Product thesis

AI coding tools can generate functional interfaces quickly, but they frequently converge on generic visual patterns. DesignAgent OS adds a design-intelligence control layer between code generation and release.

## Workstreams

### 1. Design intelligence core
Extract design tokens, infer visual conventions, detect UI anti-patterns, and produce deterministic quality scores.

### 2. Repository intelligence
Inspect frameworks, routing, component boundaries, styling systems, package dependencies, and design-system usage.

### 3. Component intelligence
Maintain a registry of curated component sources and rank candidates by design fit, accessibility, dependency cost, maintainability, and stack compatibility.

### 4. Agent workflow
Expose the intelligence through Codex, Claude Code, Factory, and generic agent skills.

### 5. Browser verification
Render changed interfaces at desktop/tablet/mobile sizes and verify usability, accessibility, and visual consistency.

### 6. GitHub automation
Analyze pull requests, report UI-quality regressions, and eventually generate improvement PRs.

## Delivery phases

- Phase 0: deterministic intelligence core, CLI/API, docs, tests.
- Phase 1: repository scanner + component graph.
- Phase 2: browser rendering + accessibility checks.
- Phase 3: visual evaluation + design-memory layer.
- Phase 4: GitHub PR automation and team workflows.
- Phase 5: hosted multi-project control plane.
