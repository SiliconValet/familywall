# Phase 4: Calendar Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 04-calendar-integration
**Areas discussed:** Google Calendar setup & sync, View layouts & rendering, Event display & interaction, Navigation & controls

---

## Google Calendar Setup & Sync

### Where should the Google OAuth flow live?

| Option | Description | Selected |
|--------|-------------|----------|
| Settings page (PIN-protected) | Matches Phase 2 pattern — settings gear icon opens config modal, requires PIN to change. Clean separation from daily use. | ✓ |
| First-launch wizard | One-time setup flow on first app open — blocks calendar view until configured. More guided experience. | |
| Calendar view with setup prompt | Empty state on Calendar tab shows 'Connect Google Calendar' button. Inline, discoverable, no separate settings page needed. | |

**User's choice:** Settings page (PIN-protected)

---

### How should users manage multiple Google Calendar sources?

| Option | Description | Selected |
|--------|-------------|----------|
| Single Google account, select calendars | OAuth once, then pick which calendars to display (Primary, Family, Work, etc.). Simplest auth flow, reuses one token. | ✓ |
| Multiple Google accounts supported | Each family member can connect their own Google account. More flexible but more complex OAuth management. | |
| Single family calendar only | Connect one shared family Google Calendar. Simplest setup, assumes family already consolidates events there. | |

**User's choice:** Single Google account, select calendars
**Notes:** User clarified: "I'd like to default to using just a family calendar, specifically created for this purpose, but allow for additional calendars for each person." — Default to single family calendar (simple), advanced option to add per-person calendars.

---

### How should calendars map to family members for color-coding?

| Option | Description | Selected |
|--------|-------------|----------|
| Manual assignment in settings | Calendar config UI lets you assign each calendar to a family member. Explicit control, shows which color each calendar gets. | |
| Automatic by calendar name match | If calendar name contains family member name, auto-assign that color. Falls back to default color if no match. Smart but might misfire. | ✓ |
| Use Google Calendar's native colors | Display events in the color Google Calendar already assigned. No family member mapping, just use source colors as-is. | |

**User's choice:** Automatic by calendar name match

---

### What refresh strategy for calendar events?

| Option | Description | Selected |
|--------|-------------|----------|
| 15-min auto-refresh only | Background polling every 15 minutes (per requirements). No manual refresh button — just wait for next auto-refresh. Minimal UI. | |
| 15-min auto + manual refresh button | Auto-refresh runs every 15 min, plus a manual refresh button (44px) for immediate sync. Gives user control when needed. | ✓ |
| Manual refresh only | No background polling — user taps refresh button when they want updated events. Simpler implementation, but stale data risk. | |

**User's choice:** 15-min auto + manual refresh button

---

## View Layouts & Rendering

### How should the daily view timeline be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| 6AM-10PM vertical timeline | Scrollable hour markers (6a, 7a, 8a...) with events positioned by time. Current time indicator line. Matches requirements, similar to Google Calendar mobile. | |
| Full 24-hour timeline | Midnight to midnight. More complete but lots of empty space (night hours). Less optimized for family schedule. | |
| Agenda list (time-sorted) | No hour grid — just list events chronologically. Simpler to build, but loses visual time-block context. | ✓ |

**User's choice:** Agenda list (time-sorted)

---

### How should the weekly view be laid out?

| Option | Description | Selected |
|--------|-------------|----------|
| 7-day grid with time blocks | Days across top (Mon-Sun), hours down the side (6AM-10PM rows). Events placed in cells. Classic calendar week view. | |
| 7-column agenda (daily lists side-by-side) | Each day is a vertical agenda list, 7 columns across. Shows all events per day without time grid. Simpler than time-block grid. | ✓ |
| Condensed timeline (week at a glance) | Single scrollable view showing all week's events in chronological order. No day separation, just one long agenda. | |

**User's choice:** 7-column agenda (daily lists side-by-side)

---

### How should the monthly view be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Traditional calendar grid | 7 columns (Sun-Sat), 5-6 rows for weeks. Event dots or truncated titles in each day cell. Classic month-at-a-glance view. | ✓ |
| Monthly agenda list | All events for the month in chronological order, grouped by day. No calendar grid — just scrollable list with date headers. | |
| You decide | Claude picks based on what works best with daily/weekly agenda pattern and touch constraints. | |

**User's choice:** Traditional calendar grid

---

### How should events display in the monthly calendar grid cells?

| Option | Description | Selected |
|--------|-------------|----------|
| Event dots (color-coded) | Small colored dots for each event in the day cell. Tap day to see full list. Clean, fits many events, but less info at a glance. | ✓ |
| Truncated event titles | Show event titles (truncated to fit cell width). More readable at a glance, but cells can get crowded with many events. | |
| Event count badge only | Just show '3 events' badge per day. Simplest, least clutter, but requires tap to see any details. | |

**User's choice:** Event dots (color-coded)

---

## Event Display & Interaction

### How should all-day events be differentiated from timed events?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate section at top | All-day events show in a banner section above the agenda/timeline. Clear separation, matches Google Calendar pattern. | ✓ |
| Mixed in timeline with special styling | All-day events appear inline with timed events, but with distinct background or border. Unified list, but might confuse order. | |
| Badge indicator on event card | All-day events show in timeline without a time (just date), with small 'All day' badge. Inline, visually marked. | |

**User's choice:** Separate section at top

---

### How should users view event details?

| Option | Description | Selected |
|--------|-------------|----------|
| Tap event → details modal | Tap opens Dialog with full event details (title, time, description, location). Modal pattern matches add/edit chore forms from Phase 2/3. | |
| Tap event → inline expansion | Event card expands to show details below. No modal — stays in context, but pushes other events down. Less disruption. | ✓ |
| No details view needed | Event cards show all needed info (title, time, color). No tap interaction — calendar is read-only display. Simplest. | |

**User's choice:** Tap event → inline expansion

---

### What info should event cards show in agenda view?

| Option | Description | Selected |
|--------|-------------|----------|
| Time + title only | Minimal: '9:00 AM - Soccer practice'. Color bar for family member. Tap to expand for location/description. | ✓ |
| Time + title + location | Show key info upfront: '9:00 AM - Soccer practice @ Park'. More detail, but longer cards. Tap for full description. | |
| You decide | Claude picks based on touch target sizing and readability constraints. Show what fits without overcrowding. | |

**User's choice:** Time + title only

---

### What should show when there are no events for the selected period?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal message: 'No events today' | Simple text message. No illustration or action. Matches chore system empty state pattern (minimal, no special messaging). | ✓ |
| Friendly illustration + message | 'Nothing scheduled!' with calendar icon or illustration. More engaging, but adds visual complexity. | |
| Celebration message: 'Free day!' | Positive spin on empty calendar. Matches 'All done for today!' pattern from chores. Encourages downtime. | |

**User's choice:** Minimal message: 'No events today'

---

## Navigation & Controls

### Should chores and calendar events be unified or separate?

| Option | Description | Selected |
|--------|-------------|----------|
| Separate tabs (Chores \| Calendar) | Keep them distinct. Chores tab = task checklist. Calendar tab = schedule view. Clear mental model, matches current nav. | |
| Unified 'Today' view (chores + events together) | One combined timeline. Chores show checkboxes, events don't. See everything in context. More ambitious integration. | |
| Calendar includes chores, but keep Chores tab | Calendar view shows both. Chores tab stays for focused task management. Best of both — context in calendar, focus in chores. | ✓ |

**User's choice:** Calendar includes chores, but keep Chores tab
**Notes:** Calendar view = unified context (events + chores). Chores tab = focused task completion mode.

---

### How should period navigation work (prev/next day/week/month)?

| Option | Description | Selected |
|--------|-------------|----------|
| Prev/Next arrow buttons + period label | < [March 2026] > — tap arrows to navigate, label shows current period. Classic calendar nav, touch-friendly. | ✓ |
| Swipe gestures + arrow buttons | Swipe left/right to navigate periods, arrow buttons as backup. More fluid on touchscreen, but requires gesture handling. | |
| Arrow buttons only (no swipe) | Just < > buttons. Simpler implementation, explicit tap interaction. No swipe complexity. | |

**User's choice:** Prev/Next arrow buttons + period label

---

### Where should 'Jump to Today' and 'Refresh' buttons be placed?

| Option | Description | Selected |
|--------|-------------|----------|
| Top bar with navigation (< Today Refresh >) | All controls in one row. Clean, grouped, but could get crowded. Today button jumps to current period, Refresh syncs Google Calendar. | |
| Today button in nav bar, Refresh in corner | Today button near < > arrows. Refresh button as icon in top-right corner. Separates nav from sync actions. | ✓ |
| Floating action button for Refresh only | Today implicit (part of < > nav). Refresh as FAB in bottom-right. Always accessible, doesn't compete for nav space. | |

**User's choice:** Today button in nav bar, Refresh in corner

---

### How should the Calendar top bar be organized overall?

| Option | Description | Selected |
|--------|-------------|----------|
| Two rows: [Daily/Weekly/Monthly] then [< Today March 2026 >] | View switcher on top row, navigation on second row. Clear separation, but uses more vertical space. | ✓ |
| One row: [Daily/Weekly/Monthly] + [< March 2026 >] + [Today] | Everything in one row. Compact, but might feel crowded on smaller touchscreens. Refresh icon in top-right corner. | |
| You decide | Claude picks based on 44px touch target constraints and screen space optimization. | |

**User's choice:** Two rows: [Daily/Weekly/Monthly] then [< Today March 2026 >]

---

## Claude's Discretion

Areas where user said "you decide" or deferred to Claude:
- Event card animation timing for inline expansion
- Loading skeleton design while fetching calendar data
- Exact color shade matching for family member palette
- Error message wording for API failures
- OAuth token storage mechanism (secure, persistent)
- Calendar API request batching and caching strategy
- Exact dot size and positioning in monthly grid cells
- Period label formatting and date localization

## Deferred Ideas

None — all discussion stayed within phase scope.
