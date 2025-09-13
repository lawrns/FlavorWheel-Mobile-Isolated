# Contributing Guide

Thank you for contributing to FlavorWheel! This guide defines the vibe-rules for this repo.

## Pull Requests

- Create a feature branch from `main`.
- Use clear PR titles: `feat(review): quick vs prose`, `fix(api): align tastings schema`.
- Include a brief checklist:
  - [ ] Type-check passes (`npm run type-check`)
  - [ ] Lint passes (`npm run lint`)
  - [ ] Prettier passes (`npm run format:check`)
  - [ ] Tests added/updated for critical paths

## Code Style

- Use design tokens (`fx-`) and Tailwind utilities; avoid inline styles.
- Never use raw HTML form elements. Use our Form components (`Input`, `Textarea`, `Select`, etc.).
- Keep logic in hooks/services; keep components focused on UI concerns.
- Prefer composition over inheritance.

## Commit Conventions

- Conventional commits style recommended:
  - `feat(scope): description`
  - `fix(scope): description`
  - `docs(scope): description`
  - `refactor(scope): description`
  - `test(scope): description`
  - `chore(scope): description`

## Tests

- Unit tests for pure functions and complex components.
- E2E for critical user journeys (Quick Tasting, Write Review, Create Study).

## Design System

- Colors/spacing/typography come from `design-tokens.json` and `tailwind.config.ts`.
- Run `node scripts/analyze-design-tokens.js` locally to catch legacy tokens.

## Supabase

- Use migrations in `database/migrations/`.
- Never hardcode project IDs; use `supabase link` locally.

## Governance

- Operational steps: `RUNBOOK.md`.
- Past decisions: `DECISIONS.md`.
- AI context anchors: `/.vibe/decisions.json`.
