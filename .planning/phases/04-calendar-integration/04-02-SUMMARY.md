---
phase: 04-calendar-integration
plan: 02
subsystem: calendar-types-hooks
tags: [types, hooks, data-layer, frontend]
dependency_graph:
  requires: []
  provides: [calendar-types, useCalendarData, useCalendarSync, useInterval]
  affects: [calendar-ui]
tech_stack:
  added: [date-fns]
  patterns: [declarative-polling, unified-timeline, visibility-detection]
key_files:
  created:
    - client/src/types/calendar.ts
    - client/src/hooks/useInterval.ts
    - client/src/hooks/useCalendarSync.ts
    - client/src/hooks/useCalendarData.ts
  modified: []
decisions:
  - key: useInterval-pattern
    choice: Dan Abramov's declarative interval hook
    rationale: Clean polling primitive with ref-based callback stability
  - key: visibility-detection
    choice: Page Visibility API to pause auto-refresh
    rationale: Saves resources when app is backgrounded (CAL-09)
  - key: unified-timeline
    choice: MergedTimelineItem discriminated union
    rationale: Type-safe rendering of events and chores together (D-31, D-33)
  - key: all-day-separation
    choice: Separate allDayItems and timedItems arrays
    rationale: Enables UI to render all-day events in separate section (D-17)
metrics:
  duration_seconds: 106
  tasks_completed: 2
  files_created: 4
  commits: 2
  completed_date: "2026-03-23"
---

# Phase 04 Plan 02: Frontend Type System & Data Hooks Summary

**One-liner:** Complete TypeScript type definitions and three data hooks (useInterval, useCalendarSync, useCalendarData) for calendar feature with event-chore merging and 15-minute auto-refresh.

## Tasks Completed

| Task | Name | Commit | Files Created |
|------|------|--------|---------------|
| 1 | Calendar TypeScript types and interfaces | ad89fa3 | client/src/types/calendar.ts |
| 2 | Calendar data hooks (useInterval, useCalendarSync, useCalendarData) | 1c3d9c7 | client/src/hooks/useInterval.ts, client/src/hooks/useCalendarSync.ts, client/src/hooks/useCalendarData.ts |

## What Was Built

### Type System
Created `client/src/types/calendar.ts` with complete type definitions:
- `CalendarViewMode` type for daily/weekly/monthly views
- `CalendarEvent` interface with separate `startTime`/`startDate` fields to distinguish timed from all-day events (per D-17, CAL-11)
- `CalendarSource` interface with `familyMemberId` for color mapping (per D-05, D-21)
- `CalendarAuthStatus` and `SyncResult` interfaces for OAuth state and sync results
- `MergedTimelineItem` discriminated union (`type: 'event' | 'chore'`) for type-safe unified timeline rendering (per D-31, D-33)

### Data Hooks
Created three custom hooks following existing `useChoreData` pattern:

**useInterval** (`client/src/hooks/useInterval.ts`)
- Declarative setInterval hook from Dan Abramov pattern
- `delay: null` pauses the interval (used for page visibility detection)
- Ref-based callback stability prevents stale closures

**useCalendarSync** (`client/src/hooks/useCalendarSync.ts`)
- Manages calendar sync with Google Calendar API
- 15-minute auto-refresh interval (per D-07, CAL-09)
- Page Visibility API integration pauses polling when app is backgrounded
- Manual `triggerSync()` function for refresh button (per D-08)
- Error state with user-friendly message

**useCalendarData** (`client/src/hooks/useCalendarData.ts`)
- Fetches both calendar events (`/api/calendar/events`) and chores (`/api/chores`)
- Merges into unified `MergedTimelineItem[]` timeline sorted by time (per D-31, D-33)
- Separates `allDayItems` and `timedItems` for different UI sections (per D-17)
- Computes date range based on view mode (daily/weekly/monthly)
- Monday week start (`weekStartsOn: 1`) per D-13
- Returns `authStatus` for empty state handling (not connected vs no events)

## Verification

All TypeScript types and hooks compile without errors:
```bash
npx tsc --noEmit client/src/types/calendar.ts
npx tsc --noEmit client/src/hooks/useInterval.ts client/src/hooks/useCalendarSync.ts client/src/hooks/useCalendarData.ts
```

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - types and hooks are complete implementations. Backend API endpoints (`/api/calendar/events`, `/api/calendar/sync`, `/api/calendar/status`) will be implemented in Plan 01.

## Key Decisions

1. **useInterval pattern:** Chose Dan Abramov's declarative interval hook with ref-based callback stability. Enables clean polling with pause support via `delay: null`.

2. **Visibility detection:** Used Page Visibility API to pause auto-refresh when app is backgrounded. Saves resources and prevents unnecessary API calls.

3. **Unified timeline approach:** `MergedTimelineItem` discriminated union enables type-safe rendering of both events and chores in a single sorted timeline. Type guard pattern: `item.type === 'event'` narrows to `CalendarEvent`.

4. **All-day separation:** Hook returns both `allDayItems` and `timedItems` arrays, enabling UI to render all-day events in a separate section at the top of daily/weekly views.

## Dependencies

**Provides to downstream plans:**
- Calendar types for UI components (Plan 03, 04)
- `useCalendarData` hook for CalendarView component
- `useCalendarSync` hook for refresh button functionality
- `useInterval` utility for any polling needs

**No blockers** - all tasks completed successfully.

## Files Created

- `client/src/types/calendar.ts` (46 lines) - Complete type system with discriminated unions
- `client/src/hooks/useInterval.ts` (15 lines) - Declarative polling primitive
- `client/src/hooks/useCalendarSync.ts` (42 lines) - Sync management with visibility detection
- `client/src/hooks/useCalendarData.ts` (117 lines) - Event-chore merge and date range logic

## Self-Check

Verifying created files exist:

```bash
[ -f "client/src/types/calendar.ts" ] && echo "FOUND: client/src/types/calendar.ts" || echo "MISSING: client/src/types/calendar.ts"
[ -f "client/src/hooks/useInterval.ts" ] && echo "FOUND: client/src/hooks/useInterval.ts" || echo "MISSING: client/src/hooks/useInterval.ts"
[ -f "client/src/hooks/useCalendarSync.ts" ] && echo "FOUND: client/src/hooks/useCalendarSync.ts" || echo "MISSING: client/src/hooks/useCalendarSync.ts"
[ -f "client/src/hooks/useCalendarData.ts" ] && echo "FOUND: client/src/hooks/useCalendarData.ts" || echo "MISSING: client/src/hooks/useCalendarData.ts"
```

Verifying commits exist:

```bash
git log --oneline --all | grep -q "ad89fa3" && echo "FOUND: ad89fa3" || echo "MISSING: ad89fa3"
git log --oneline --all | grep -q "1c3d9c7" && echo "FOUND: 1c3d9c7" || echo "MISSING: 1c3d9c7"
```

## Self-Check: PASSED

All files created and all commits found.
