---
name: designagent-os
description: Inspect an application's design DNA, audit generic AI UI patterns, choose a project-specific design direction, and verify UI changes before shipping.
license: MIT
---

# DesignAgent OS

Use this skill when building, reviewing, or improving frontend UI.

## Operating sequence

1. Inspect the existing frontend before changing styling.
2. Identify framework, styling system, tokens, local components, typography, spacing, radii, icons, accessibility patterns, and responsive behavior.
3. Run deterministic UI-quality checks before subjective redesign.
4. State one concrete design direction grounded in the product's real user workflow.
5. Reuse local primitives where possible.
6. Scout external patterns only when they solve a specific interaction or layout problem.
7. Evaluate visual fit, UX fit, stack compatibility, accessibility, dependency cost, and maintainability.
8. Adapt; do not transplant another library's visual language.
9. Render desktop and mobile.
10. Treat generic AI visual tells as defects unless intentionally justified.
11. Preserve functionality unless behavior changes are explicitly requested.

## Hard rules

- Existing brand/design tokens win.
- Workflow beats decoration.
- Coherence beats novelty.
- Never invent fake precision in data visualizations.
- Do not add packages without understanding their impact.
- Verify the actual render before declaring UI work complete.
