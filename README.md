# DesignAgent OS

DesignAgent OS is an open-source design-intelligence and UI quality control plane for AI-generated software.

The project turns the core idea behind "humanize-ui" into a broader engineering system: inspect an existing application, extract its design DNA, detect generic/AI-generated UI patterns, select a deliberate product-specific design direction, rank reusable component patterns, and verify the result before shipping.

## Phase 0 goals

- Repository and design-system inspection
- Design DNA extraction
- Anti-pattern / "AI slop" auditing
- Deterministic UI quality scoring
- Product-archetype design guidance
- Component-source registry and ranking
- CLI and HTTP API
- Agent skill packaging
- Automated tests and CI

## Architecture

```text
Repository / UI source
        |
        v
Design DNA Extractor
        |
        +--> Anti-pattern Auditor
        |
        +--> Design Direction Engine
        |
        +--> Component Intelligence
        |
        v
UI Intelligence Report
        |
        v
Agent / CLI / API / Future Web UI
```

See `docs/ARCHITECTURE.md`, `docs/PROJECT_PLAN.md`, and `docs/IMPLEMENTATION_PLAN.md`.

## Development

Requires Node.js 22+.

```bash
npm test
npm run analyze -- examples/generic-ai.css
npm start
```

Then open `http://localhost:4317`.

## Status

Initial implementation draft. The repository is intentionally structured so the deterministic design-intelligence core can evolve independently from the future browser automation, visual evaluation, GitHub ingestion, and SaaS layers.

## License

MIT
