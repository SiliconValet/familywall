# Phase 2: Foundation & Family Management - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Family member management with PIN-protected parental controls and touch-friendly UI. Users can add, edit, delete, and view family members. All parental actions (add/edit/delete) require PIN authentication before proceeding. UI meets WCAG touch target standards (44px minimum) for kiosk touchscreen usability.

</domain>

<decisions>
## Implementation Decisions

### PIN Setup and Authentication
- **D-01:** Default PIN is 1234 on first launch (pre-configured, no setup wizard)
- **D-02:** Users can change PIN in settings page (requires current PIN to change)
- **D-03:** Unlimited PIN retry attempts (no lockout policy for home kiosk)
- **D-04:** PIN stored as bcrypt hash in settings table (cost factor 13 per RESEARCH.md)

### Edit Interaction Pattern
- **D-05:** Edit uses modal form (same pattern as add)
- **D-06:** Tap Edit button on family card → modal appears with pre-filled name field
- **D-07:** Modal includes Cancel and Save buttons (both 44px touch targets)

### List Ordering
- **D-08:** Family members sorted alphabetically by name (A-Z)
- **D-09:** List re-sorts automatically when name is added or edited
- **D-10:** No manual reordering in this phase (defer to future if needed)

### Claude's Discretion
- Loading skeleton design while fetching family members
- Exact error message wording for network failures
- Toast notification positioning and animation timing
- Form field focus behavior after modal opens

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Contract
- `.planning/phases/02-foundation-family-management/02-UI-SPEC.md` — Complete visual and interaction specs (spacing, typography, color, component inventory, touch targets, copywriting, accessibility)

### Technical Patterns
- `.planning/phases/02-foundation-family-management/02-RESEARCH.md` — Implementation patterns (React hooks, Fastify routes, SQLite schema, bcrypt PIN hashing, touch-friendly CSS, validation architecture)

### Project Requirements
- `.planning/REQUIREMENTS.md` §Family Management (FAM-01 through FAM-08) — 8 requirements mapped to this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/components/ui/button.tsx` — shadcn Button component already installed (meets 44px minimum per UI-SPEC)
- `client/src/lib/utils.ts` — shadcn utility functions (cn helper for className merging)
- `client/src/index.css` — shadcn design tokens pre-configured (oklch colors, spacing scale, typography)

### Established Patterns
- React 19 with TypeScript and hooks (useState, useEffect)
- Fastify 5 for REST API with JSON Schema validation
- SQLite with better-sqlite3 (WAL mode enabled in Phase 1)
- Monorepo structure with client/ and server/ workspaces
- Feature-based directory organization pattern from Phase 1 context

### Integration Points
- Frontend fetches from `/api/family` and `/api/auth` endpoints (server provides REST API)
- SQLite database at `server/data/familywall.db` (created in Phase 1)
- shadcn components import from `@/components/ui/` alias
- PM2 manages backend process (already configured in Phase 1)

</code_context>

<specifics>
## Specific Ideas

- Default PIN 1234 provides known starting point without onboarding friction
- Modal form pattern keeps UI consistent across add/edit/delete confirmation flows
- Alphabetical sorting matches family intuition ("where's Alice? Oh, first in the list")
- Unlimited retries appropriate for single-device home kiosk (no remote attack surface)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-foundation-family-management*
*Context gathered: 2026-03-22*
