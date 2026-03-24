---
phase: 06-polish-integration
plan: 02
subsystem: ui
tags: [react, typescript, hex-color, family-members, calendar]

requires:
  - phase: 06-01
    provides: FamilyMember.color field in type and DB, CalendarEvent.familyMemberColor field

provides:
  - Color swatch picker (8 PALETTE colors) in FamilyFormModal for add/edit family members
  - FamilyMemberBadge renders with explicit hex color prop (no more chart CSS variables)
  - Calendar events display with familyMemberColor hex color on left border
  - CalendarSettings stripped of Family Member Colors section and debug console.log statements
  - All client tests passing (31 tests, including previously-failing FamilyMemberBadge badge test)

affects:
  - 06-03
  - 06-04

tech-stack:
  added: []
  patterns:
    - "Hex color from member.color prop instead of CSS chart variable (colorIndex pattern removed)"
    - "Color PALETTE constant in FamilyFormModal for 8 fixed picker colors"
    - "colorMap (Map<memberId, hexColor>) replaces colorIndexMap for color lookups"

key-files:
  created: []
  modified:
    - client/src/components/FamilyMemberBadge.tsx
    - client/src/components/FamilyFormModal.tsx
    - client/src/components/FamilyList.tsx
    - client/src/hooks/useFamilyData.ts
    - client/src/components/ChoreCard.tsx
    - client/src/components/chess/PlayerPickerModal.tsx
    - client/src/components/WeeklySummary.tsx
    - client/src/components/ChoreList.tsx
    - client/src/components/calendar/EventCard.tsx
    - client/src/components/calendar/CalendarSettings.tsx
    - client/src/components/__tests__/ChoreCard.test.tsx

key-decisions:
  - "colorIndex prop removed from FamilyMemberBadge; replaced with explicit color: string hex prop"
  - "ChoreCard derives member hex color from familyMembers array via chore.assigned_to lookup"
  - "WeeklySummary prop changed from colorIndexMap to colorMap (Map<memberId, hexColor>)"
  - "CalendarSettings Family Member Colors section removed per D-11 - colors come automatically from familyMemberColor on events"
  - "EventCard accepts optional memberColorMap for chores, uses event.familyMemberColor directly for calendar events"

patterns-established:
  - "Hex color lookup: familyMembers.find(m => m.id === assignedId)?.color || DEFAULT_COLOR"
  - "Default fallback color: #039BE5 (Peacock blue from PALETTE)"

requirements-completed:
  - D-08
  - D-09
  - D-10
  - D-11

duration: 10min
completed: 2026-03-24
---

# Phase 06 Plan 02: Frontend Color UI Summary

**Color swatch picker in FamilyFormModal, hex-based FamilyMemberBadge, calendar event colors from familyMemberColor, and CalendarSettings debug cleanup**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-24T10:36:00Z
- **Completed:** 2026-03-24T10:46:27Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- FamilyMemberBadge replaced `colorIndex: number` with `color: string` (hex), removing all CSS chart variable usage
- FamilyFormModal now shows 8 circular color swatches (PALETTE) below the Name field; selected swatch has ring-2 ring-primary ring-offset-2 indicator; cancel button renamed to "Discard"
- CalendarSettings "Family Member Colors" section removed entirely (per D-11); all console.log debug statements removed
- All 31 client tests pass including the previously-failing FamilyMemberBadge hex color test

## Task Commits

1. **Task 1: FamilyMemberBadge hex color + FamilyFormModal color picker + FamilyList/useFamilyData color plumbing** - `4137288` (feat)
2. **Task 2: CalendarSettings cleanup + fix badge test** - `4fb89c9` (feat)

## Files Created/Modified

- `client/src/components/FamilyMemberBadge.tsx` - Replaced colorIndex with color: string prop; backgroundColor set via inline style
- `client/src/components/FamilyFormModal.tsx` - Added PALETTE constant, color state, 8-swatch picker UI, updated onSubmit signature to pass color, "Cancel" renamed to "Discard"
- `client/src/components/FamilyList.tsx` - handleAdd/handleEdit accept (name, color), edit modal passes initialColor={editingMember?.color}
- `client/src/hooks/useFamilyData.ts` - addMember/updateMember accept optional color param and include in request body
- `client/src/components/ChoreCard.tsx` - Derives hex color from familyMembers.find(m => m.id === assigned_to); colorIndex param kept in interface but unused (prefixed _colorIndex)
- `client/src/components/chess/PlayerPickerModal.tsx` - Uses member.color directly for FamilyMemberBadge instead of colorIndex
- `client/src/components/WeeklySummary.tsx` - Prop renamed from colorIndexMap to colorMap (Map<number, string>); uses memberColor directly
- `client/src/components/ChoreList.tsx` - Creates colorMap from members; passes to WeeklySummary and stats badges; keeps colorIndexMap for CompletedSection/ChoreCard backward compat
- `client/src/components/calendar/EventCard.tsx` - Uses event.familyMemberColor for calendar events; optional memberColorMap for chores; DEFAULT_COLOR fallback
- `client/src/components/calendar/CalendarSettings.tsx` - Removed Family Member Colors section; removed all console.log debug statements
- `client/src/components/__tests__/ChoreCard.test.tsx` - Removed @ts-expect-error directives (types now correct); test passes with hex color assertion

## Decisions Made

- `colorIndex` prop is kept in ChoreCard's props interface (renamed to `_colorIndex`) for backward compat since CompletedSection and ChoreList still pass it. The value is no longer used for color; member hex color is derived from familyMembers array instead.
- `WeeklySummary` prop changed from `colorIndexMap: Map<number, number>` to `colorMap: Map<number, string>` — clean API since it only uses the map for color display.
- `EventCard`'s `memberColorMap` prop is optional to preserve existing call sites in DailyAgenda and WeeklyAgenda; calendar events get color directly from `event.familyMemberColor`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Updated all FamilyMemberBadge call sites across codebase**
- **Found during:** Task 1
- **Issue:** Plan specified updating ChoreCard and FamilyCard as key files, but WeeklySummary, ChoreList, and PlayerPickerModal also called FamilyMemberBadge with colorIndex
- **Fix:** Updated all 5 callers (ChoreCard, PlayerPickerModal, WeeklySummary, ChoreList stats section) to pass hex color
- **Files modified:** ChoreCard.tsx, PlayerPickerModal.tsx, WeeklySummary.tsx, ChoreList.tsx
- **Verification:** TypeScript compilation passes with no errors in modified files
- **Committed in:** 4137288 (Task 1 commit)

**2. [Rule 1 - Bug] Removed @ts-expect-error directives from ChoreCard.test.tsx**
- **Found during:** Task 1 (TypeScript compilation check)
- **Issue:** Test had @ts-expect-error on mockFamilyMembers color field and FamilyMemberBadge color prop - these directives became TS errors once types were updated in Plan 01
- **Fix:** Removed the now-unnecessary @ts-expect-error directives
- **Files modified:** client/src/components/__tests__/ChoreCard.test.tsx
- **Verification:** All 31 tests pass
- **Committed in:** 4137288 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug, necessary for TypeScript compilation)
**Impact on plan:** Required to ensure full codebase consistency. No scope creep.

## Issues Encountered

None - TypeScript compilation and all tests passed cleanly after changes.

## Next Phase Readiness

- Color system fully propagated through all UI components
- FamilyMember.color (hex) is now the single source of truth for member color display
- Ready for Phase 06-03 (remaining polish tasks)

---
*Phase: 06-polish-integration*
*Completed: 2026-03-24*
