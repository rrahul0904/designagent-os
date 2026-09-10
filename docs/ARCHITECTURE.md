# Technical Architecture

## Principles

1. Deterministic checks before model-based judgment.
2. Existing product design language wins over imported defaults.
3. Core intelligence remains framework-agnostic.
4. Browser and model integrations are adapters, not hard dependencies.
5. Every recommendation should preserve provenance and explain its score.

## Logical architecture

```text
                 +--------------------+
Repo / Source -->| Repository Scanner |
                 +----------+---------+
                            |
                            v
                 +--------------------+
                 | Design DNA Graph   |
                 +----+----------+----+
                      |          |
              +-------+--+   +---+----------------+
              | Auditor  |   | Direction Engine   |
              +-------+--+   +---+----------------+
                      |          |
                      +-----+----+
                            v
                 +--------------------+
                 | Intelligence Report|
                 +---------+----------+
                           |
              +------------+-------------+
              |            |             |
             CLI          API         Agent Skill

Future adapters:
- Browser renderer / Playwright
- axe accessibility
- screenshot + vision reviewer
- component registry crawler
- GitHub PR bot
- persistent design memory
```

## Phase 0 modules

- `design-dna.js`: extracts CSS variables, colors, fonts, radii, spacing signals.
- `anti-patterns.js`: deterministic generic-UI detection.
- `scoring.js`: converts findings into a quality score.
- `report.js`: assembles a machine-readable report.
- CLI and HTTP API expose the same core.

## Future persistence

The hosted product can persist:
- projects
- repository snapshots
- design tokens
- component graph
- audit runs
- screenshots
- recommendations
- PRs and remediation status
