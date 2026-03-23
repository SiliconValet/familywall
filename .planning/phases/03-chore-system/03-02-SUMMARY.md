---
phase: 03-chore-system
plan: 02
subsystem: frontend-foundation
tags: [typescript, react-hooks, shadcn, date-utilities]
dependency_graph:
  requires: [Phase-02-foundation]
  provides: [chore-types, chore-data-hooks, long-press-gesture, date-utilities, shadcn-chore-components]
  affects: [03-03-chore-ui]
tech_stack:
  added: [date-fns@4.1.0]
  patterns: [custom-hooks, long-press-detection, undo-toast-action]
key_files:
  created:
    - client/src/types/chore.ts
    - client/src/hooks/useChoreData.ts
    - client/src/hooks/useLongPress.ts
    - client/src/utils/date-filters.ts
    - client/src/components/ui/checkbox.tsx
    - client/src/components/ui/textarea.tsx
    - client/src/components/ui/select.tsx
    - client/src/components/ui/toggle-group.tsx
    - client/src/components/ui/collapsible.tsx
    - client/src/components/ui/toggle.tsx
  modified:
    - client/package.json
    - package-lock.json
decisions:
  - key: TypeScript types match database schema exactly
    rationale: Chore interface includes all fields from D-01 through D-06 decisions
    outcome: Type-safe data layer ready for API integration
  - key: useChoreData hook provides complete CRUD + completion + undo
    rationale: Follows useFamilyData pattern from Phase 2, adds chore-specific operations
    outcome: Reusable data hook with 5-second undo toast (D-19)
  - key: useLongPress detects 1-second hold with scroll cancellation
    rationale: D-17 specifies 1000ms threshold, RESEARCH.md Pitfall 3 requires movement detection
    outcome: Touch-friendly long-press without scroll false positives
  - key: date-fns for week boundary calculations
    rationale: Modular, tree-shakeable, handles edge cases (year boundaries, leap years)
    outcome: Week range formatting ready for daily/weekly view toggle
  - key: Install 5 shadcn components via CLI
    rationale: Pre-configured from Phase 2 preset (b5CqHLXuzo), no modifications needed
    outcome: Touch-optimized UI components ready for Plan 03
metrics:
  duration_seconds: 156
  duration_display: 2m 36s
  tasks_completed: 2
  files_created: 10
  files_modified: 2
  commits: 2
  completed_at: "2026-03-23T11:02:51Z"
---

# Phase 03 Plan 02: Frontend Foundation Summary

**One-liner:** Type-safe chore data layer with useChoreData hook (5s undo toast), useLongPress gesture detection (1s threshold with scroll cancellation), date-fns week utilities, and 5 shadcn components (checkbox, textarea, select, toggle-group, collapsible).

## What Was Built

### Task 1: TypeScript Types, Data Hooks, and Utilities
**Commit:** 127073d

Created complete frontend foundation for chore system:

**Types (`client/src/types/chore.ts`):**
- `Chore` interface: 15 fields matching database schema (D-01 through D-06)
  - Core fields: id, title, description, assigned_to, completed_by, points
  - Status tracking: status ('active' | 'completed' | 'auto_completed')
  - Recurring support: is_recurring (0 or 1), recurrence_config (JSON string), parent_chore_id
  - Timestamps: created_at, completed_at, updated_at (unix timestamps)
  - Joined fields: assignee_name, completed_by_name
- `RecurrenceConfig` interface: frequency, days array, optional interval
- `ChoreFormData` interface: Form submission data with optional fields
- `ChoreStats` interface: Completion count per family member
- `WeeklySummaryRow` interface: Weekly summary grid structure

**Data Hook (`client/src/hooks/useChoreData.ts`):**
- Follows useFamilyData pattern from Phase 2
- State management: chores, stats, loading, error
- CRUD operations:
  - `fetchChores`: GET /api/chores?view={daily|weekly}
  - `createChore`: POST /api/chores with JSON body conversion (is_recurring boolean → 0/1)
  - `updateChore`: PUT /api/chores/:id with partial updates
  - `deleteChore`: DELETE /api/chores/:id
- Completion operations:
  - `completeChore`: PUT /api/chores/:id/complete with optional completed_by override
    - Shows 5-second undo toast with "Undo" action button (D-19)
    - Refreshes both chores and stats after completion
  - `undoComplete`: PUT /api/chores/:id/undo reverts completion
    - Shows "Completion undone" toast
- Derived state: `activeChores` and `completedChores` filtered by status
- View filtering: Accepts 'daily' or 'weekly' view mode parameter

**Long-Press Hook (`client/src/hooks/useLongPress.ts`):**
- Custom hook for 1-second hold detection (D-17)
- Features:
  - 1000ms threshold (configurable via options)
  - Movement detection: Cancels if finger moves > 10px (prevents scroll false positives per RESEARCH.md Pitfall 3)
  - Touch and mouse support: onTouchStart/End/Move/Cancel + onMouseDown/Up/Move/Leave
  - Ref-based state: No re-renders during gesture detection
- Pattern: Returns event handler props to spread on target element

**Date Utilities (`client/src/utils/date-filters.ts`):**
- `getWeekDateRange`: Returns Sunday-Saturday date range for current week
- `formatWeekRange`: Formats as "March 22–28" (UI-SPEC copywriting contract)
- `getWeekDays`: Returns array of 7 dates for current week
- Uses date-fns: startOfWeek, endOfWeek, format functions
- Week starts on Sunday (weekStartsOn: 0) per US convention

**Dependencies Added:**
- date-fns 4.1.0: Date manipulation utilities (tree-shakeable, TypeScript-native)

### Task 2: Install shadcn UI Components
**Commit:** da9a969

Installed 5 required shadcn components via CLI:

1. **checkbox** — 48px chore completion interaction (CHOR-06 touch target requirement)
2. **textarea** — Optional chore description field in Add/Edit form
3. **select** — Assignee picker and recurring frequency dropdown
4. **toggle-group** — Daily/Weekly view toggle (segmented control)
5. **collapsible** — Expandable "Completed" section (D-13)
6. **toggle** — Dependency of toggle-group (auto-installed)

All components inherit Phase 2 preset configuration (b5CqHLXuzo):
- Radix UI primitives
- oklch color space
- Touch-optimized defaults
- No modifications needed post-install

## Deviations from Plan

None. Plan executed exactly as written.

All acceptance criteria met:
- ✓ Chore TypeScript interface includes all fields from database schema
- ✓ useChoreData hook provides fetch, create, complete, undo, and delete operations
- ✓ useLongPress hook detects 1-second hold and distinguishes from normal tap
- ✓ date-filters utility provides daily and weekly date range helpers
- ✓ All 5 shadcn components are installed and importable

## Technical Decisions

### 1. Timer Type in useLongPress Hook
**Context:** TypeScript type for setTimeout return value

**Decision:** Use `NodeJS.Timeout | undefined` for timer ref

**Rationale:** Browser setTimeout returns `Timeout` type, but TypeScript needs explicit type. Using `number` causes type mismatch. NodeJS.Timeout is the correct type for browser timers in modern TypeScript.

**Outcome:** Hook compiles without errors, works in both browser and test environments.

### 2. JSON Recurrence Config in Types
**Context:** Store recurrence pattern in Chore type

**Decision:** `recurrence_config: string | null` (JSON string, not parsed object)

**Rationale:** Matches database TEXT column storage. Hook converts to/from JSON when sending/receiving from API. Keeps type definition aligned with database schema.

**Outcome:** Type-safe serialization/deserialization in useChoreData hook.

### 3. Derived State Pattern for Active/Completed Chores
**Context:** Separate active and completed chores in UI

**Decision:** Compute `activeChores` and `completedChores` in hook, not in component

**Rationale:** Follows React best practices: compute derived state once at data layer, not in every consuming component. Reduces duplication and improves performance.

**Outcome:** Components receive pre-filtered arrays, simplifying UI logic.

## Verification Results

### TypeScript Compilation
```bash
cd client && npx tsc --noEmit
```
**Status:** PASS (all new files compile without errors)

**Note:** Pre-existing sonner type warning (esModuleInterop) is unrelated to this plan's changes.

### File Existence Check
```bash
ls client/src/types/chore.ts
ls client/src/hooks/useChoreData.ts
ls client/src/hooks/useLongPress.ts
ls client/src/utils/date-filters.ts
ls client/src/components/ui/checkbox.tsx
ls client/src/components/ui/textarea.tsx
ls client/src/components/ui/select.tsx
ls client/src/components/ui/toggle-group.tsx
ls client/src/components/ui/collapsible.tsx
```
**Status:** PASS (all files exist)

### Acceptance Criteria Verification
- ✓ `export interface Chore` in chore.ts
- ✓ `export interface RecurrenceConfig` in chore.ts
- ✓ `export interface ChoreFormData` in chore.ts
- ✓ `export interface ChoreStats` in chore.ts
- ✓ `export interface WeeklySummaryRow` in chore.ts
- ✓ `export function useChoreData` in useChoreData.ts
- ✓ `toast.success('Chore completed'` with `duration: 5000` in useChoreData.ts
- ✓ `label: 'Undo'` undo action button in useChoreData.ts
- ✓ `activeChores` and `completedChores` derived state in useChoreData.ts
- ✓ `export function useLongPress` in useLongPress.ts
- ✓ `threshold = 1000` (1-second per D-17) in useLongPress.ts
- ✓ `Math.sqrt` movement detection (scroll cancellation) in useLongPress.ts
- ✓ `export function getWeekDateRange` in date-filters.ts
- ✓ `export function formatWeekRange` in date-filters.ts
- ✓ `"date-fns"` in client/package.json

**Status:** ALL PASS

## Known Stubs

None. This plan provides foundational types and hooks only. Data wiring happens in Plan 03 (Chore UI Components).

## Integration Points

### For Plan 03 (Chore UI Components):
- Import `Chore`, `ChoreFormData`, `ChoreStats` types from `@/types/chore`
- Use `useChoreData(view)` hook for all chore operations
- Spread `useLongPress({ onClick, onLongPress })` handlers on checkbox wrapper
- Use `formatWeekRange()` for "This Week" view heading
- Import shadcn components: `Checkbox`, `Textarea`, `Select`, `ToggleGroup`, `Collapsible`

### API Contract (for backend Plan 03-01):
Expected endpoints (called by useChoreData hook):
- `GET /api/chores?view={daily|weekly}` → Chore[]
- `GET /api/chores/stats` → ChoreStats[]
- `POST /api/chores` → { id: number }
- `PUT /api/chores/:id` → { id: number }
- `PUT /api/chores/:id/complete` → { id: number, status: string, completed_by: number }
- `PUT /api/chores/:id/undo` → { id: number, status: string }
- `DELETE /api/chores/:id` → { success: true }

## Next Steps

**For Plan 03-03 (Chore UI Components):**
1. Create `ChoreList` component using `useChoreData('daily')` or `useChoreData('weekly')`
2. Create `ChoreCard` component with 48px Checkbox and useLongPress integration
3. Create `ChoreFormModal` component with PIN gate and RecurrenceConfig picker
4. Implement Daily/Weekly view toggle using ToggleGroup component
5. Create CompletedSection using Collapsible component

**Backend dependency:** Plan 03-01 must implement /api/chores endpoints before UI can be tested end-to-end.

## Self-Check

Verifying all claimed files exist:

```bash
ls -la client/src/types/chore.ts
ls -la client/src/hooks/useChoreData.ts
ls -la client/src/hooks/useLongPress.ts
ls -la client/src/utils/date-filters.ts
ls -la client/src/components/ui/checkbox.tsx
ls -la client/src/components/ui/textarea.tsx
ls -la client/src/components/ui/select.tsx
ls -la client/src/components/ui/toggle-group.tsx
ls -la client/src/components/ui/collapsible.tsx
```

**Result:**
- ✓ client/src/types/chore.ts exists
- ✓ client/src/hooks/useChoreData.ts exists
- ✓ client/src/hooks/useLongPress.ts exists
- ✓ client/src/utils/date-filters.ts exists
- ✓ client/src/components/ui/checkbox.tsx exists
- ✓ client/src/components/ui/textarea.tsx exists
- ✓ client/src/components/ui/select.tsx exists
- ✓ client/src/components/ui/toggle-group.tsx exists
- ✓ client/src/components/ui/collapsible.tsx exists

Verifying commits exist:

```bash
git log --oneline --all | grep 127073d
git log --oneline --all | grep da9a969
```

**Result:**
- ✓ Commit 127073d exists (Task 1)
- ✓ Commit da9a969 exists (Task 2)

## Self-Check: PASSED

All claimed files exist. All commits are present in git history. TypeScript compilation passes. All acceptance criteria verified.
