---
phase: 06-polish-integration
plan: "00"
subsystem: testing
tags: [vitest, testing-library, react, typescript, tdd]

requires: []
provides:
  - "usePinAuth.test.ts: 4 behavioral tests for PIN session timeout grace period (RED state)"
  - "FamilyFormModal.test.tsx: 3 tests for color swatch picker (RED state until Plan 02)"
  - "VirtualKeyboard.test.tsx: 3 tests for keyboard visibility (stub state until Plan 04)"
  - "ChoreCard.test.tsx: updated FamilyMemberBadge test to expect hex color prop (RED state until Plan 02)"
affects:
  - "06-01-PLAN.md: usePinAuth grace period tests will turn GREEN"
  - "06-02-PLAN.md: FamilyFormModal swatch tests and ChoreCard badge test will turn GREEN"
  - "06-04-PLAN.md: VirtualKeyboard tests will turn GREEN"

tech-stack:
  added: []
  patterns:
    - "TDD RED phase: write tests against future interface before implementation"
    - "vi.useFakeTimers() for deterministic time control in hook tests"
    - "FamilyFormModalFuture = FamilyFormModal as any for testing future interface without compile errors"
    - "vi.mock stubs for not-yet-created modules so test files compile cleanly"

key-files:
  created:
    - client/src/hooks/__tests__/usePinAuth.test.ts
    - client/src/components/__tests__/FamilyFormModal.test.tsx
    - client/src/components/__tests__/VirtualKeyboard.test.tsx
  modified:
    - client/src/components/__tests__/ChoreCard.test.tsx

key-decisions:
  - "Use FamilyFormModal as any cast to write tests against Plan 02 future interface without TS errors"
  - "Use vi.mock stubs for VirtualKeyboard/KeyboardContext (not yet created) so test file compiles cleanly"
  - "Mark RED tests with comments indicating which plan will make them GREEN"

patterns-established:
  - "Wave 0 test scaffolding: create test files in RED state before implementation plans run"

requirements-completed: [D-16, D-17, D-08, D-09, D-04, D-07]

duration: 10min
completed: 2026-03-24
---

# Phase 06 Plan 00: Wave 0 Test Scaffolds Summary

**4 test files (3 new, 1 updated) create behavioral RED-state coverage for PIN grace period, color swatches, virtual keyboard, and hex color badge before implementation plans run**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-24T10:33:40Z
- **Completed:** 2026-03-24T10:43:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created usePinAuth.test.ts with 4 behavioral tests for PIN session timeout (grace period skip, 60s expiry re-prompt, timer reset) — RED state until Plan 01
- Created FamilyFormModal.test.tsx with 3 tests for color swatch count (8 swatches), selection ring indicator, submit with name+color — RED state until Plan 02
- Created VirtualKeyboard.test.tsx with 3 tests for keyboard focus show, tel exclusion, Done dismiss — using vi.mock stubs (Plan 04 will replace with real implementation)
- Updated ChoreCard.test.tsx FamilyMemberBadge test to assert hex color `#D50000` instead of `var(--chart-1)` — RED state until Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Create usePinAuth.test.ts with PIN session timeout tests** - `9dcff47` (test)
2. **Task 2: Create FamilyFormModal.test.tsx, VirtualKeyboard.test.tsx, and update ChoreCard.test.tsx** - `e3380fe` (test)

## Files Created/Modified

- `client/src/hooks/__tests__/usePinAuth.test.ts` - 4 behavioral tests for PIN session timeout using renderHook + vi.useFakeTimers
- `client/src/components/__tests__/FamilyFormModal.test.tsx` - 3 tests for color swatch picker (8 swatches, ring indicator, submit with color)
- `client/src/components/__tests__/VirtualKeyboard.test.tsx` - 3 tests for virtual keyboard visibility (focus show, tel exclusion, Done dismiss) with vi.mock stubs
- `client/src/components/__tests__/ChoreCard.test.tsx` - Updated FamilyMemberBadge test to expect hex color prop, mockFamilyMembers with color field

## Decisions Made

- Used `FamilyFormModal as any` cast to write tests against Plan 02's future `onSubmit: (name, color)` interface without TypeScript compilation errors on current interface
- Used `vi.mock` stubs for `@/context/KeyboardContext` and `@/components/VirtualKeyboard` (not yet created by Plan 04) so VirtualKeyboard.test.tsx compiles cleanly
- Added `@ts-expect-error` comments on ChoreCard mock data `color` field additions (FamilyMember type gains `color` in Plan 01)
- Marked RED tests with `// RED until Plan 0N implements X` comments for traceability

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Pre-existing TypeScript errors in ChessBoard.test.tsx, MoveHistory.test.tsx, useChessGame.test.tsx (unused imports in stub test files) — these are out-of-scope, no action taken
- `@ts-expect-error` placement in FamilyFormModal tests was flagged as unused (current interface accepted the mock fn without type mismatch) — switched to `as any` cast pattern which compiles cleanly

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All RED-state test files are in place for Plans 01-04 to turn GREEN
- Plan 01 (PIN grace period) will make usePinAuth tests GREEN
- Plan 02 (color swatches + hex color badge) will make FamilyFormModal and ChoreCard badge tests GREEN
- Plan 04 (virtual keyboard) will replace VirtualKeyboard.test.tsx stubs with real module imports

---
*Phase: 06-polish-integration*
*Completed: 2026-03-24*
