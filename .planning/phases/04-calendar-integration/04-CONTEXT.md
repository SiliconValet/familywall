# Phase 4: Calendar Integration - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Family can view synchronized Google Calendar events in multiple view formats (daily agenda, weekly multi-column, monthly grid) with automatic 15-minute refresh and manual sync. Calendar view displays both Google Calendar events AND chores together for unified context, while Chores tab remains separate for focused task completion. Users configure calendar sources in PIN-protected settings with automatic family member mapping.

</domain>

<decisions>
## Implementation Decisions

### Google Calendar Setup & Authentication
- **D-01:** OAuth flow lives in Settings page (PIN-protected, matches Phase 2 pattern)
- **D-02:** Default setup: Single family Google Calendar (simple onboarding)
- **D-03:** Advanced option: Additional per-person calendars can be added
- **D-04:** Single Google account authentication with calendar selection UI
- **D-05:** Automatic calendar-to-family-member color mapping by calendar name match (if calendar name contains family member name, assign that color; fallback to default color)
- **D-06:** Settings UI shows: connected account, list of selected calendars, family member color assignments

### Sync & Refresh Strategy
- **D-07:** Auto-refresh every 15 minutes in background (per requirements CAL-09)
- **D-08:** Manual refresh button (icon in top-right corner) for immediate sync
- **D-09:** Refresh fetches latest events from Google Calendar API and merges with local chore data
- **D-10:** Loading indicator during sync (subtle spinner on refresh button)

### View Layouts & Rendering
- **D-11:** Three view modes: Daily, Weekly, Monthly
- **D-12:** Daily view = vertical agenda list (time-sorted events + chores)
- **D-13:** Weekly view = 7-column agenda (daily lists side-by-side, Mon-Sun)
- **D-14:** Monthly view = traditional calendar grid (7 columns Sun-Sat, 5-6 week rows)
- **D-15:** Monthly grid cells show color-coded event dots (one dot per event/chore)
- **D-16:** Tap day cell in monthly view navigates to that day's agenda view

### Event Display & Interaction
- **D-17:** All-day events display in separate section at top of daily/weekly views
- **D-18:** Event cards show: time + title only (color bar indicates family member)
- **D-19:** Tap event card opens inline expansion showing full details (description, location, time)
- **D-20:** Chores display inline with events (checkboxes visible, sorted by time or points)
- **D-21:** Color-coding reuses family member palette from Phase 3 (blue, green, purple, orange)
- **D-22:** Empty state shows minimal message: "No events today" (matches chore pattern)

### Navigation & Controls
- **D-23:** Two-row top bar layout for Calendar view
- **D-24:** Row 1: View switcher buttons [Daily] [Weekly] [Monthly] (horizontal, reuses toggle pattern from chores)
- **D-25:** Row 2: Period navigation [< Today] [March 2026] [>]
- **D-26:** Arrow buttons navigate prev/next day/week/month based on current view
- **D-27:** Period label shows current period (e.g., "March 23, 2026" for daily, "Mar 17-23, 2026" for weekly, "March 2026" for monthly)
- **D-28:** Today button jumps to current period in active view mode
- **D-29:** Refresh icon button in top-right corner (separate from navigation)
- **D-30:** All buttons meet 44px minimum touch target (Phase 2 requirement)

### Chores + Calendar Integration
- **D-31:** Calendar view shows unified timeline: Google Calendar events + chores together
- **D-32:** Chores tab remains separate for focused task completion (current functionality unchanged)
- **D-33:** Calendar queries both `/api/calendar/events` AND `/api/chores` endpoints, merges by time
- **D-34:** Chores in calendar view show checkbox (completion works same as Chores tab)
- **D-35:** Completed chores fade out in calendar view (same behavior as Chores tab)

### Claude's Discretion
- Event card animation timing for inline expansion
- Loading skeleton design while fetching calendar data
- Exact color shade matching for family member palette
- Error message wording for API failures
- OAuth token storage mechanism (secure, persistent)
- Calendar API request batching and caching strategy
- Exact dot size and positioning in monthly grid cells
- Period label formatting and date localization

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Calendar Integration (CAL-01 through CAL-12) — 12 requirements mapped to this phase

### Prior Phase Patterns
- `.planning/phases/02-foundation-family-management/02-CONTEXT.md` — PIN auth pattern, modal forms, touch targets, settings page structure
- `.planning/phases/02-foundation-family-management/02-UI-SPEC.md` — shadcn component usage, 44px touch targets, visual feedback patterns
- `.planning/phases/03-chore-system/03-CONTEXT.md` — View mode toggle (daily/weekly), color-coding by family member, empty states, completion interaction
- `.planning/phases/03-chore-system/03-UI-SPEC.md` — Color palette for family members, card component patterns, toggle group usage

### External Documentation
- Google Calendar API v3 documentation — Event fetching, OAuth 2.0 flow, calendar list endpoints
- React Query or SWR patterns — Auto-refresh polling, cache management, background sync

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/components/ui/button.tsx` — shadcn Button (44px touch targets)
- `client/src/components/ui/card.tsx` — shadcn Card (reuse for event cards)
- `client/src/components/ui/dialog.tsx` — shadcn Dialog (reuse for settings modal)
- `client/src/components/ui/toggle-group.tsx` — shadcn ToggleGroup (reuse for Daily/Weekly/Monthly switcher)
- `client/src/hooks/useChoreData.ts` — Data fetching hook pattern (create `useCalendarData`)
- `client/src/hooks/usePinAuth.ts` — PIN authentication hook (guard calendar settings)
- `client/src/components/PinModal.tsx` — PIN modal component (reuse for settings access)
- `client/src/components/ChangePinModal.tsx` — Settings modal pattern (extend for calendar config)
- `client/src/types/chore.ts` — TypeScript interface pattern (create `types/calendar.ts`)
- Family member color palette from Phase 3 (blue, green, purple, orange) — reuse for event color-coding

### Established Patterns
- Feature-based organization: `client/features/calendar/` and `server/features/calendar/`
- Custom hooks separate data from UI: create `useCalendarData()`, `useCalendarSync()`
- View mode toggle pattern from chores (Daily/Weekly) — extend to include Monthly
- PIN authentication gates settings operations (Phase 2 pattern)
- REST API route pattern: create `server/routes/calendar.js`
- SQLite schema pattern: create `calendar_events` cache table, `calendar_sources` config table

### Integration Points
- Calendar view merges data from `/api/calendar/events` (Google Calendar) and `/api/chores` (local)
- Family members from Phase 2 used for color-coding calendar events (automatic name matching)
- Chore completion endpoints reused in calendar view (checkbox interaction)
- Settings page extended with calendar configuration section (OAuth, calendar selection)
- Auto-refresh polling every 15 minutes (setInterval or React Query refetchInterval)
- App.tsx navigation extended: Chores | **Calendar** | Family (add third tab)

</code_context>

<specifics>
## Specific Ideas

- **Default to simple:** Single family calendar is the recommended starting point (avoid overwhelming setup)
- **Expand when needed:** Advanced users can add per-person calendars for richer context
- **Name-based auto-mapping:** If "Alice's Calendar" exists and Alice is a family member, auto-assign Alice's color (smart, reduces manual config)
- **Unified context view:** Calendar shows "the whole picture" (appointments + tasks), Chores tab is "focus mode" for completion
- **Agenda list over timeline:** Simpler to implement, cleaner on touchscreen, avoids complex time-block grid layout
- **Color dots in monthly view:** Clean, fits many events per day, encourages tap-to-explore interaction
- **Two-row top bar:** Separates view selection from navigation, avoids crowding 44px touch targets into one row

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

Event creation from FamilyWall explicitly out of scope (per PROJECT.md: "Calendar event creation — Read-only calendar, create events in Google Calendar directly").

</deferred>

---

*Phase: 04-calendar-integration*
*Context gathered: 2026-03-23*
