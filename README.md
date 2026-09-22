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
- Original design-style registry with deterministic `SKILL.md` + `DESIGN.md` generation
- Provenance-preserving evidence-to-`DESIGN.md` compilation
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
        +--> Style Registry / Design Document Compiler
        |
        v
UI Intelligence Report / DESIGN.md
        |
        v
Agent / CLI / API / Future Web UI
```

See `docs/ARCHITECTURE.md`, `docs/PROJECT_PLAN.md`, `docs/IMPLEMENTATION_PLAN.md`, and `docs/reverse-engineering/skillsui-design-library.md`.

## Development

Requires Node.js 22+.

```bash
npm test
npm run analyze -- examples/generic-ai.css
npm start
```

Design-document commands:

```bash
node src/cli/index.js styles
node src/cli/index.js compile-style precision-light
node src/cli/index.js design-md evidence.json
```

Then open `http://localhost:4317` for the API. The new style/document routes are `GET /api/styles`, `GET /api/styles/:slug`, `POST /api/styles/:slug/documents`, and `POST /api/design-md/evidence`.

## Status

Initial implementation draft. The deterministic design-intelligence core, original style registry, paired document compiler, and structured evidence compiler are repository implemented. Screenshot pixel understanding, browser previews, hosted upload processing, billing/entitlements, and production visual certification remain future work.

## License

MIT
