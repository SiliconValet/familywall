---
phase: 06-polish-integration
plan: "01"
subsystem: backend-data-layer
tags: [color-system, family-api, calendar-api, pin-auth, typescript]
dependency_graph:
  requires: ["06-00"]
  provides: [color-column, family-color-api, calendar-color-api, pin-grace-period, calendar-error-toast]
  affects: [06-02, 06-03, 06-04]
tech_stack:
  added: []
  patterns: [idempotent-migration, palette-auto-assign, useRef-session-tracking, sonner-error-toast]
key_files:
  created: []
  modified:
    - server/db.js
    - server/routes/family.js
    - server/routes/calendar.js
    - client/src/types/family.ts
    - client/src/types/calendar.ts
    - client/src/hooks/usePinAuth.ts
    - client/src/hooks/useCalendarData.ts
    - client/src/components/__tests__/ChoreFormModal.test.tsx
    - client/src/components/__tests__/ChoreList.test.tsx
decisions:
  - "Idempotent migration using pragma table_info check before ALTER TABLE (safe re-run)"
  - "PALETTE.find with ?? PALETTE[0] fallback handles >8 family members gracefully"
  - "useRef for lastAuthTime avoids state re-renders on every PIN auth check"
  - "toast.error fires on each failed calendar fetch — acceptable per D-01 (auto-dismissing)"
metrics:
  duration_minutes: 2
  completed_date: "2026-03-24"
  tasks_completed: 3
  files_modified: 9
requirements:
  - D-01
  - D-02
  - D-03
  - D-08
  - D-10
  - D-11
  - D-16
  - D-17
  - D-18
  - D-19
---

# Phase 6 Plan 1: Backend Color System, PIN Session Timeout, and Offline Toast Summary

**One-liner:** Added color column with 8-color palette auto-assign to family API, propagated familyMemberColor through calendar events query/types, and implemented 60s PIN grace period via useRef with sonner error toast on calendar fetch failure.

## Objective

Establish the non-UI data layer foundations that downstream UI plans (06-02 through 06-04) depend on: color persistence in the database, color propagation through the API and TypeScript types, PIN session caching to reduce friction, and offline feedback via toast.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Color column migration + family API schema + auto-assign | 562d7e9 | server/db.js, server/routes/family.js |
| 2 | TypeScript types + calendar event color propagation | d47e2b4 | client/src/types/family.ts, client/src/types/calendar.ts, server/routes/calendar.js, test mocks |
| 3 | PIN session timeout + calendar offline toast | 2c632ad | client/src/hooks/usePinAuth.ts, client/src/hooks/useCalendarData.ts |

## Verification Results

- `db.pragma('table_info(family_members)')` confirms `color` column exists: PASS
- `npx tsc --noEmit` — no errors attributable to plan changes: PASS
- Acceptance criteria for all 3 tasks met

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed test mock FamilyMember objects missing required color field**
- **Found during:** Task 2 TypeScript verification
- **Issue:** After adding `color: string` to FamilyMember interface, two test files had mock objects without the color property, causing TS2741 errors
- **Fix:** Added `color: '#D50000'` and `color: '#E67C73'` to mock FamilyMember objects in ChoreFormModal.test.tsx and ChoreList.test.tsx
- **Files modified:** client/src/components/__tests__/ChoreFormModal.test.tsx, client/src/components/__tests__/ChoreList.test.tsx
- **Commit:** d47e2b4

### Pre-existing Out-of-Scope Errors

The following TS errors existed before this plan and are deferred to avoid scope creep:
- ChessBoard.test.tsx — unused imports
- MoveHistory.test.tsx — unused imports
- DailyAgenda.tsx — unused `index` variable
- useChessGame.test.tsx — unused imports
- ChoreCard.test.tsx — unused `@ts-expect-error` directives

These are logged in deferred-items.md for later cleanup.

## Known Stubs

None — all changes wire real data (color from DB, toast from sonner library).

## Key Decisions

1. **Idempotent migration** — Using `pragma('table_info')` check before ALTER TABLE ensures safe re-runs without crashes on existing databases.
2. **Palette auto-assign fallback** — `PALETTE.find(...) ?? PALETTE[0]` handles families with more than 8 members by cycling back to the first color.
3. **useRef for session tracking** — `lastAuthTime` as `useRef` avoids triggering re-renders on every protected action call, which would otherwise cause flicker.
4. **Toast per fetch failure** — Each auto-refresh failure fires a toast; acceptable per D-01 since sonner toasts auto-dismiss and don't stack duplicates visually.
