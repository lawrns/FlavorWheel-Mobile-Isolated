# DECISIONS

This document chronicles architectural decisions made for the FlavorWheel app. Each decision includes context, alternatives considered, and rationale.

## 2025-09-13: Quick Tasting Notes-Based Flow

### Context
Users found the flavor selection step in Quick Tasting too restrictive. They wanted to enter free-form notes about aroma, flavor, and other characteristics instead of being forced to select from predefined options.

### Decision
- Replace flavor selection step with notes-based input (aroma, flavor, other)
- Allow either notes OR selected flavors (relaxed validation)
- Map overallScore (0-100) to overallRating (1-10) for backend compatibility
- Add "Add Item" vs "End Tasting" actions for multi-item sessions

### Alternatives Considered
- Keep flavor selection as primary, add notes as optional
- Create separate "Advanced Tasting" mode for notes
- Use AI to suggest flavors from notes

### Rationale
- Simplifies UX for users who prefer descriptive input
- Maintains backward compatibility with existing data
- Enables multi-item tastings without navigation disruption
- Supports both structured and unstructured tasting approaches

### Implementation
- Updated `types/quick-tasting.ts` with new fields
- Modified `components/ui/simplified-tasting-flow.tsx` flow
- Aligned API route with database schema
- Enhanced validation in error handling

## 2025-09-13: Review Modes (Quick vs Prose)

### Context
Reviews needed to support both structured evaluation (Quick) and free-form writing (Prose) to accommodate different user preferences and use cases.

### Decision
- Add tabs to Review creation dialog: "Quick Review" and "Prose Review"
- Quick mode: star ratings + detailed sliders (Salt, Umami, etc.)
- Prose mode: title + content fields only
- Shared base metadata: item name, batch ID, category, production date
- Persist mode in `user_reviews.review_data`

### Alternatives Considered
- Separate pages for Quick/Prose reviews
- Progressive disclosure within single form
- AI-powered mode detection

### Rationale
- Accommodates professional tasters (Quick) and casual reviewers (Prose)
- Reduces form complexity by hiding irrelevant fields
- Enables data consistency through shared metadata
- Future-proofs for additional modes

### Implementation
- Updated `app/[locale]/review/page.tsx` with tabs and conditional fields
- Enhanced `user_reviews` table schema (via migrations)
- Maintained backward compatibility

## 2025-09-13: Constitutional Layer Implementation

### Context
Codebase lacked enforceable rules for design system compliance, code quality, and development workflow consistency.

### Decision
- Hard-coded config files as constitution:
  - `.eslintrc.json`: Design system rules, form component enforcement
  - `.prettierrc.json`: Formatting standards
  - `tsconfig.json`: TypeScript boundaries
  - `tailwind.config.ts`: Design token enforcement
  - `design-tokens.json`: Centralized token definitions
- Runbook files as operational guidance:
  - `RUNBOOK.md`: Step-by-step ops and incident response
  - `CONTRIBUTING.md`: Development guidelines and PR standards
  - `DECISIONS.md`: Architectural history
- Automation hooks:
  - Pre-commit: ESLint, Prettier, TypeCheck
  - CI/CD: Quality gates with design token analysis
  - VSCode: Auto-format on save, inline ESLint problems

### Alternatives Considered
- Soft guidelines in README only
- Manual code reviews for enforcement
- Third-party linting services

### Rationale
- Rules in config files = machine-enforceable
- Pre-commit + CI = no stray code lands
- IDE automation = immediate feedback
- Documentation = human guidance for edge cases

### Implementation
- Enhanced ESLint with design system rules
- Added Prettier configuration
- Created governance documentation
- Set up Husky pre-commit hooks
- Updated CI pipeline

## 2025-09-13: Advanced Options Navigation Fix

### Context
"Advanced Options" button navigated to `/create/advanced` which doesn't exist, causing 404 errors.

### Decision
- Redirect "Advanced Options" to existing `/create/study` page
- Maintain existing study/competition features as "advanced" options

### Alternatives Considered
- Create `/create/advanced` page
- Remove "Advanced Options" button
- Redirect to `/create/competition`

### Rationale
- Immediate fix for broken navigation
- Existing study page provides advanced functionality
- Minimal disruption to user flow
- Can create dedicated advanced page later if needed

### Implementation
- Updated `app/[locale]/create/page.tsx` redirect

## 2025-09-13: API Schema Alignment

### Context
Quick Tasting API payload included fields not defined in database schema, causing potential data loss and inconsistencies.

### Decision
- Remove unsupported fields from API payload: `code`, `completed_at`, `mode`, `review_type`, `product_type`
- Use `tasting_data` jsonb for consolidated quick tasting data
- Store `characteristics` array for selected flavors
- Ensure `tasting_items` and `flavor_wheels` use correct foreign keys

### Alternatives Considered
- Update database schema to include all API fields
- Transform fields in database layer
- Validate API against schema at runtime

### Rationale
- Immediate fix for data persistence issues
- Maintains existing database structure
- Preserves data integrity
- Follows database-first architecture

### Implementation
- Updated `app/api/quick-tasting/route.ts` payload construction
- Verified schema compatibility with `database/create_base_tables.sql`

## 2025-09-13: Competition Rank Participants Toggle

### Context
Competition creation required preloaded answers for ranking categories, but users wanted optional ranking functionality.

### Decision
- Add "Rank Participants (by accuracy)" toggle
- When OFF: Skip preloaded answer validation for ranking categories
- When ON: Enforce preloaded answers as before
- Update UI to show toggle under Blind Tasting

### Alternatives Considered
- Always require preloaded answers
- Remove ranking functionality entirely
- Make ranking opt-in with separate workflow

### Rationale
- Provides flexibility for different competition types
- Maintains data integrity when ranking is enabled
- Simplifies workflow for non-competitive tastings
- Backward compatible with existing competitions

### Implementation
- Updated `app/[locale]/create/competition/page.client.tsx` validation logic
- Added toggle UI in competition form

## 2025-09-13: Flavor Analysis Fallback to tasting_data

### Context
Flavor analysis service only read from legacy `notes` fields, missing data from new note-based quick tastings.

### Decision
- Add `tasting_data` to query in `generateFlavorWheelData`
- Fallback to `tasting_data.aroma`, `tasting_data.flavor`, `tasting_data.other` when `notes` absent
- Include tasting_data fields in combined note text for analysis

### Alternatives Considered
- Migrate all data to legacy `notes` format
- Create separate analysis for new format
- Update database to denormalize notes

### Rationale
- Immediate compatibility with new tasting flow
- Preserves existing analysis logic
- No data migration required
- Future-proofs for additional note fields

### Implementation
- Updated `services/flavor-analysis-service.ts` queries and extraction functions

## 2025-09-13: Design System Token Enforcement

### Context
Codebase had inconsistent use of design tokens vs hardcoded colors and styles.

### Decision
- ESLint rules to prevent hardcoded colors, RGB/HSL values, and inline styles
- Ban raw `<input>`, `<textarea>`, `<select>` elements (enforce Form components)
- Allow inline styles only in test files
- Require `fx-*` semantic tokens over Tailwind utility classes

### Alternatives Considered
- Manual code reviews for token compliance
- Less restrictive rules to allow gradual migration
- Separate lint config for legacy files

### Rationale
- Machine-enforceable consistency
- Prevents design drift
- Immediate feedback during development
- Scalable as codebase grows

### Implementation
- Enhanced `.eslintrc.json` with design system rules
- Updated overrides for test files
- Documented in CONTRIBUTING.md
