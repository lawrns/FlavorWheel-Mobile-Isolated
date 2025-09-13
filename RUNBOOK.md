# RUNBOOK

This runbook documents the day-to-day operational rules for the FlavorWheel app.

## Local Development

- Node.js ≥ 18
- Install deps: `npm ci`
- Start app: `npm run dev`
- Type-check: `npm run type-check`
- Lint: `npm run lint`
- Prettier check: `npm run format:check`
- Storybook: `npm run storybook`

## Supabase

- Link project (if not linked): `supabase link`
- Start local DB: `supabase start`
- Apply migrations: `npm run db:migrate` or `supabase db push`
- Reset DB: `npm run db:reset` (CAUTION)

### Verify critical tables

- `tastings`, `tasting_items`, `flavor_wheels`, `profiles`, (and `user_reviews` via migrations).
- Check table exists:
  - `SELECT table_name FROM information_schema.tables WHERE table_name = 'user_reviews';`

## Quick Tasting E2E

- Navigate to `/{locale}/quick-tasting`
- Steps: Product → Notes (aroma/flavor/other) → Overall (0–100)
- Save: "Add Item" (stays) or "End Tasting" (navigates)
- Data persisted to:
  - `tastings.tasting_data` (jsonb)
  - `tasting_items.details`
  - `flavor_wheels.wheel_data`

## Reviews

- Navigate to `/{locale}/review`
- Click "Write Review"
- Modes: Quick (stars + profile sliders) or Prose (free-form)
- Review metadata included in `user_reviews.review_data` (mode + base fields)

## Create

- Quick Start → `/{locale}/quick-tasting`
- Advanced Options → `/{locale}/create/study` (redirect fixed; no 404)

## Quality Gates

- Pre-commit: runs Prettier, ESLint, TypeCheck
- CI: type-check, lint, Prettier check, design token analysis, tests, build

## Incident Response

- Reproduce locally, capture logs
- Check `/monitoring/` and CI artifacts
- Rollback: revert last PR and redeploy
- Document in `DECISIONS.md` if policy or architecture changes

## References

- Decisions: `DECISIONS.md` and `/.vibe/decisions.json`
- Contributing: `CONTRIBUTING.md`
- Design System: `DESIGN_SYSTEM.md`, `tailwind.config.ts`, `design-tokens.json`
