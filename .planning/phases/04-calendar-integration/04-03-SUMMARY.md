---
phase: 04-calendar-integration
plan: 03
subsystem: calendar-ui
tags: [ui, components, calendar-views, frontend]
dependency_graph:
  requires: [calendar-types, useCalendarData, useCalendarSync]
  provides: [CalendarView, DailyAgenda, WeeklyAgenda, MonthlyGrid, EventCard, TimeIndicator]
  affects: [app-navigation]
tech_stack:
  added: []
  patterns: [view-switching, period-navigation, event-expansion, time-grouping, calendar-grid]
key_files:
  created:
    - client/src/components/calendar/EventCard.tsx
    - client/src/components/calendar/TimeIndicator.tsx
    - client/src/components/calendar/CalendarView.tsx
    - client/src/components/calendar/DailyAgenda.tsx
    - client/src/components/calendar/WeeklyAgenda.tsx
    - client/src/components/calendar/MonthlyGrid.tsx
  modified: []
decisions:
  - key: single-expanded-state
    choice: CalendarView manages expandedEventId state globally
    rationale: Only one event card expanded at a time (UI-SPEC requirement)
  - key: time-indicator-placement
    choice: DailyAgenda inserts TimeIndicator between time groups
    rationale: Matches current time position in sorted timeline (D-12, CAL-12)
  - key: weekly-column-scroll
    choice: Individual column overflow-y-auto for vertical scrolling
    rationale: Preserves column headers visibility when day content exceeds viewport
  - key: monthly-grid-sunday-start
    choice: Monthly grid uses Sunday as first day (weekStartsOn: 0)
    rationale: Traditional US calendar format, differs from Monday week start in daily/weekly views
  - key: event-dot-overflow
    choice: Show max 3 dots per day, "+N" label for overflow
    rationale: Prevents overcrowding in 64px cells (D-15, UI-SPEC)
metrics:
  duration_seconds: 185
  tasks_completed: 2
  files_created: 6
  commits: 2
  completed_date: "2026-03-23"
---

# Phase 04 Plan 03: Calendar View UI Components Summary

**One-liner:** Complete calendar UI with three view modes (daily agenda, weekly grid, monthly calendar), event card expansion, current time indicator, and unified event-chore timeline rendering.

## Tasks Completed

| Task | Name | Commit | Files Created |
|------|------|--------|---------------|
| 1 | EventCard and TimeIndicator components | 91260eb | client/src/components/calendar/EventCard.tsx, client/src/components/calendar/TimeIndicator.tsx |
| 2 | CalendarView container and three view mode components | b441522 | client/src/components/calendar/CalendarView.tsx, client/src/components/calendar/DailyAgenda.tsx, client/src/components/calendar/WeeklyAgenda.tsx, client/src/components/calendar/MonthlyGrid.tsx |

## What Was Built

### EventCard Component
Created `client/src/components/calendar/EventCard.tsx` with:
- Renders both calendar events and chores via `MergedTimelineItem` discriminated union (per D-31, D-33)
- Collapsed state (48px min-height): Time label + title + 4px left border in family member color
- Expanded state (auto height): Adds location, description, time range with 300ms transition
- Chore support: Checkbox (48px touch target) + points badge + completion handler
- Completed chores fade to 0.7 opacity (per D-35)
- Touch feedback: `active:scale-[0.96]` with 150ms transition
- Chart color mapping: `--chart-{N}` cyclic mapping from `familyMemberId`

### TimeIndicator Component
Created `client/src/components/calendar/TimeIndicator.tsx` with:
- 4px height horizontal line in primary accent color (per UI-SPEC)
- Time label (14px text-sm) in primary color showing "h:mm a" format
- Updates every minute via `setInterval(60000)`
- Only renders between 6:00 AM and 10:00 PM (per D-12)
- Layout: `flex items-center gap-2` with flex-1 line and right-aligned label

### CalendarView Container
Created `client/src/components/calendar/CalendarView.tsx` with:
- **Two-row top bar layout** (per D-23, D-24, D-25):
  - Header: "Calendar" heading + refresh icon (spinner during sync) + settings gear icon
  - Row 1: ToggleGroup with Daily/Weekly/Monthly buttons (48px height each)
  - Row 2: Navigation arrows + period label + Today button
- **View mode state management**: `viewMode` (daily/weekly/monthly) and `viewDate`
- **Period navigation handlers**: `addDays`/`addWeeks`/`addMonths` for prev/next
- **Period label formatting** (per D-27):
  - Daily: "March 23, 2026"
  - Weekly: "Mar 17–23, 2026"
  - Monthly: "March 2026"
- **Empty states**:
  - Not connected: "No Calendar Connected" / "Connect your Google Calendar in Settings to see events here."
  - Loading: Spinner with "Syncing calendar..." message
- **Sync status badge**: Shows "Last synced X minutes ago" when sync age > 15 minutes
- **Global expanded state**: Single `expandedEventId` managed by CalendarView, passed to child views

### DailyAgenda Component
Created `client/src/components/calendar/DailyAgenda.tsx` with:
- **All-Day Events section** (per D-17, CAL-11):
  - Section heading: "All-Day Events" (14px text-sm muted)
  - Collapsible (hidden when no all-day events)
  - 1px border divider below section
- **Timed Events section**:
  - Group events by hour with time labels ("9:00 AM")
  - Render EventCard for each item
  - Insert TimeIndicator at correct position based on current time
- **Empty state**: "No Events Today" / "Your schedule is clear. New events will sync automatically."
- **Spacing**: All-day to divider 16px, divider to first time 16px, time to card 8px

### WeeklyAgenda Component
Created `client/src/components/calendar/WeeklyAgenda.tsx` with:
- **7-column grid layout** (Mon-Sun, per D-13):
  - `grid grid-cols-7` with gap-2
  - Column headers: "Mon 17", "Tue 18", etc. (14px text-sm semibold, centered, muted background)
  - Monday week start: `startOfWeek(viewDate, { weekStartsOn: 1 })`
- **Column content**:
  - All-day events at top with "All-day:" label
  - Timed events below sorted by time
  - EventCard rendering with expansion support
- **Empty state**: "No Events This Week" / "You're free for [date range]. Events will appear when scheduled."
- **Scrolling**: `overflow-y-auto` per column for vertical scroll

### MonthlyGrid Component
Created `client/src/components/calendar/MonthlyGrid.tsx` with:
- **Calendar grid layout** (7×5-6 rows, Sun-Sat):
  - `grid grid-cols-7` with 64px cell height (per UI-SPEC exception)
  - Sunday week start: `weekStartsOn: 0` (traditional US format)
  - Day headers: "Sun", "Mon", ..., "Sat" (14px text-sm semibold)
- **Grid cell content**:
  - Date number: 14px text-sm, foreground for current month, muted for prev/next month
  - Event dots: 8px diameter circles, family member chart color, max 3 visible
  - Overflow: "+N" label if more than 3 events per day
  - Touch feedback: `active:scale-[0.98]` with 150ms transition
- **Cell interaction** (per D-16):
  - `onClick` calls `onDayClick(date)` to navigate to daily view for that date
  - Entire cell is tappable (64px height)
- **Color mapping**: Same `--chart-{N}` pattern as EventCard for dot colors

## Verification

All components compile without errors:
```bash
npm run build
```

All 6 calendar component files created and committed.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all components are complete implementations consuming existing hooks (`useCalendarData`, `useCalendarSync`, `useChoreData`) from Plan 02. Backend API endpoints (`/api/calendar/events`, `/api/calendar/sync`, `/api/calendar/status`) were implemented in Plan 01.

## Key Decisions

1. **Single expanded state**: CalendarView manages a global `expandedEventId` state that is shared across all view modes. When a user expands an event card, any previously expanded card collapses automatically. This ensures only one card is expanded at a time (UI-SPEC requirement).

2. **TimeIndicator placement**: DailyAgenda component inserts the TimeIndicator between time groups based on current time. The indicator only appears when current hour is between 6 AM and 10 PM and when current time falls before the next time group.

3. **Weekly column scrolling**: Each column in WeeklyAgenda has `overflow-y-auto` to enable independent vertical scrolling when day content exceeds viewport height. This preserves column headers at the top.

4. **Monthly grid Sunday start**: MonthlyGrid uses Sunday as the first day of the week (`weekStartsOn: 0`) to match traditional US calendar format. This differs from Daily/Weekly views which use Monday as first day (`weekStartsOn: 1`).

5. **Event dot overflow**: Monthly grid cells show a maximum of 3 event dots with a "+N" label for overflow. This prevents overcrowding in 64px cells and maintains visual clarity.

## Dependencies

**Requires from upstream plans:**
- Plan 02: `CalendarEvent`, `MergedTimelineItem`, `CalendarViewMode` types
- Plan 02: `useCalendarData`, `useCalendarSync` hooks
- Phase 03: `useChoreData` hook (for `completeChore` function)
- Phase 02: shadcn components (Button, ToggleGroup, Checkbox)

**Provides to downstream plans:**
- Plan 04: `CalendarView` component ready for App.tsx integration
- Complete set of calendar UI components for rendering all three view modes

**No blockers** - all tasks completed successfully.

## Files Created

- `client/src/components/calendar/EventCard.tsx` (173 lines) - Expandable event/chore card with color bar and completion support
- `client/src/components/calendar/TimeIndicator.tsx` (28 lines) - Current time line with minute-level updates
- `client/src/components/calendar/CalendarView.tsx` (208 lines) - Main container with navigation and view switching
- `client/src/components/calendar/DailyAgenda.tsx` (130 lines) - Vertical timeline with all-day section and time indicator
- `client/src/components/calendar/WeeklyAgenda.tsx` (108 lines) - 7-column weekly grid with abbreviated events
- `client/src/components/calendar/MonthlyGrid.tsx` (98 lines) - Calendar grid with event dots and day-click navigation

Total: 745 lines of TypeScript/React code across 6 component files.

## Self-Check

Verifying created files exist:

```bash
[ -f "client/src/components/calendar/EventCard.tsx" ] && echo "FOUND: client/src/components/calendar/EventCard.tsx" || echo "MISSING: client/src/components/calendar/EventCard.tsx"
[ -f "client/src/components/calendar/TimeIndicator.tsx" ] && echo "FOUND: client/src/components/calendar/TimeIndicator.tsx" || echo "MISSING: client/src/components/calendar/TimeIndicator.tsx"
[ -f "client/src/components/calendar/CalendarView.tsx" ] && echo "FOUND: client/src/components/calendar/CalendarView.tsx" || echo "MISSING: client/src/components/calendar/CalendarView.tsx"
[ -f "client/src/components/calendar/DailyAgenda.tsx" ] && echo "FOUND: client/src/components/calendar/DailyAgenda.tsx" || echo "MISSING: client/src/components/calendar/DailyAgenda.tsx"
[ -f "client/src/components/calendar/WeeklyAgenda.tsx" ] && echo "FOUND: client/src/components/calendar/WeeklyAgenda.tsx" || echo "MISSING: client/src/components/calendar/WeeklyAgenda.tsx"
[ -f "client/src/components/calendar/MonthlyGrid.tsx" ] && echo "FOUND: client/src/components/calendar/MonthlyGrid.tsx" || echo "MISSING: client/src/components/calendar/MonthlyGrid.tsx"
```

Verifying commits exist:

```bash
git log --oneline --all | grep -q "91260eb" && echo "FOUND: 91260eb" || echo "MISSING: 91260eb"
git log --oneline --all | grep -q "b441522" && echo "FOUND: b441522" || echo "MISSING: b441522"
```

## Self-Check: PASSED

All files created and all commits found.
