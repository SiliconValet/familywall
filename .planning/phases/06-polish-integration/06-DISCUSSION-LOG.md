# Phase 6: Polish & Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-23
**Phase:** 06-polish-integration
**Areas discussed:** Offline & error indicators, On-screen keyboard UX, Family member color assignment, Settings tab restructure

---

## Todos Folded into Scope

All 5 matched todos were folded into Phase 6 scope:
- Color selection for family members (relevance: 0.9)
- On-screen virtual keyboard for touchscreen input (relevance: 0.9)
- PIN session timeout after 60 seconds inactivity (relevance: 0.9)
- Add exit kiosk mode button to settings page (relevance: 0.7) — bundled with tab rename
- Rename Family tab to Settings and move to right (relevance: 0.7) — bundled with exit kiosk

---

## Offline & Error Indicators

| Option | Description | Selected |
|--------|-------------|----------|
| Toast on failure, then silent | Show sonner toast when connectivity lost, continue showing cached data silently | ✓ |
| Persistent banner at top | Yellow/red strip stays visible until connectivity returns | |
| Per-section status badge | Each section shows its own offline badge | |

**User's choice:** Toast on failure, then silent

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-retry on interval | Existing useInterval already retries calendar every 15 minutes | ✓ |
| Exponential backoff on failure | Retry after 30s, 60s, 2m, 5m | |
| Manual refresh button only | Don't add retry logic, let auto-refresh intervals handle it | |

**User's choice:** Auto-retry on interval (existing behavior is sufficient)

| Option | Description | Selected |
|--------|-------------|----------|
| No indicator for Chores — it's always local | Chores use local SQLite, always work, no status needed | ✓ |
| Show 'local data' note in Chores too | Explicitly remind users chores work offline | |

**User's choice:** No indicator for Chores — it's always local

---

## On-Screen Keyboard UX

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-appear when any text input is focused | Keyboard slides up whenever user taps a text field | ✓ |
| Explicit keyboard button per input | Each text input has a keyboard icon to open it | |
| Only for specific inputs | Whitelist inputs that need the keyboard | |

**User's choice:** Auto-appear when any text input is focused

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed bottom overlay | Keyboard slides up from bottom edge, content above scrolls/shifts | ✓ |
| Inline below focused input | Keyboard appears inline below the focused field | |
| Centered modal overlay | Keyboard appears as a centered popup | |

**User's choice:** Fixed bottom overlay

| Option | Description | Selected |
|--------|-------------|----------|
| QWERTY + numbers row + backspace | Single layout for text fields; PinModal handles numeric | ✓ |
| QWERTY + numeric keypad separately | Two layouts: text keyboard and NUM pad | |
| QWERTY only — use existing PinModal for numbers | No numbers row | |

**User's choice:** QWERTY + numbers row + backspace

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — tap outside or press Done to close | Standard behavior | ✓ |
| Only explicit close via Done button | User must tap Done, prevents accidental dismissal | |

**User's choice:** Yes — tap outside or press Done to close

---

## Family Member Color Assignment

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-defined palette of ~8 colors | Fixed set of distinct accessible colors as swatches | ✓ |
| Full color picker (wheel/hex) | Unrestricted color selection | |
| Auto-assign on create, allow change later | System picks next available color automatically | |

**User's choice:** Pre-defined palette of ~8 colors

| Option | Description | Selected |
|--------|-------------|----------|
| Inside the Add/Edit Family Member modal | Color swatch row in FamilyFormModal | ✓ |
| Tap colored dot on family member card | Tapping opens a color picker popover | |
| Separate color settings section | Dedicated section in Settings for color assignment | |

**User's choice:** Inside the Add/Edit Family Member modal

| Option | Description | Selected |
|--------|-------------|----------|
| Calendar events automatically use member's chosen color | No additional config needed | ✓ |
| Separate calendar-source-to-color mapping in settings | Keep CalendarSettings for source config, add color pick there | |

**User's choice:** Calendar events automatically use member's chosen color

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-assign from palette on create, member can change | First member gets color 1, second gets color 2, etc. | ✓ |
| No default — member must pick before save | Color is required field | |
| Gray default until manually set | New members show in neutral gray | |

**User's choice:** Auto-assign from palette on create, member can change

---

## Settings Tab Restructure

| Option | Description | Selected |
|--------|-------------|----------|
| Settings tab = Family list + system settings | Keep family management in Settings, add Exit Kiosk and PIN change below | ✓ |
| Split: Family tab stays, new Settings tab for system | Keep Family tab, add fifth tab for system settings | |
| Settings tab = system only, family management elsewhere | Family list moves elsewhere | |

**User's choice:** Settings tab = Family list + system settings (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — PIN-protected | Prevent kids from accidentally exiting kiosk mode | ✓ |
| No — confirmation dialog only | Just a confirmation dialog, lower barrier | |

**User's choice:** Yes — PIN-protected

| Option | Description | Selected |
|--------|-------------|----------|
| Open a new terminal / exit Chromium fullscreen | Kill kiosk Chromium process so desktop is accessible | ✓ |
| Navigate Chromium to a non-kiosk URL | Send browser to non-kiosk URL | |
| Just a placeholder — decide during implementation | Log the action, leave system command as Claude's discretion | |

**User's choice:** Open a new terminal / exit Chromium fullscreen (kill Chromium kiosk process)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — 60s grace period after last auth | Parent can take multiple actions within 60 seconds without re-entering PIN | ✓ |
| Per-action only — each action requires PIN | Current behavior: PIN required for every individual action | |

**User's choice:** Yes — 60s grace period, timer resets on each action

---

## Claude's Discretion

- Exact color palette values (8 colors with good contrast)
- On-screen keyboard library choice vs. custom React component
- Keyboard animation timing and exact height
- Which system command kills the kiosk Chromium on labwc
- Memory monitoring approach for 24-hour stability
- Error toast wording for calendar connectivity failures

## Deferred Ideas

None — discussion stayed within phase scope.
