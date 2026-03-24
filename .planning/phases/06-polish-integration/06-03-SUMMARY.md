---
phase: 06-polish-integration
plan: 03
subsystem: ui
tags: [react, typescript, nav, settings, kiosk, fastify, node]

# Dependency graph
requires:
  - phase: 06-01
    provides: usePinAuth hook with 60s grace period and withPinAuth wrapper
  - phase: 06-00
    provides: phase context and UI spec for settings tab design
provides:
  - Settings tab replacing Family tab in rightmost nav position
  - System Settings section in FamilyList with Change PIN and Exit Kiosk buttons
  - POST /api/system/exit-kiosk server endpoint that kills Chromium
affects: [06-04, future-maintenance]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - withPinAuth wrapping destructive actions (exit kiosk) for PIN gate
    - 300ms setTimeout before pkill to allow HTTP response to return first

key-files:
  created:
    - server/routes/system.js
  modified:
    - client/src/App.tsx
    - client/src/components/FamilyList.tsx
    - server/index.js

key-decisions:
  - "Settings tab is rightmost in nav (Chores, Calendar, Chess, Settings)"
  - "Gear icon removed from FamilyList header; Change PIN moved to System Settings section"
  - "Exit Kiosk button styled destructive and gated behind withPinAuth"
  - "pkill target is chromium (not chromium-browser), consistent with Phase 1 restart scripts"
  - "300ms delay before pkill allows HTTP response to reach client before process terminates"

patterns-established:
  - "System Settings section pattern: border-t divider with h2 heading and stacked action buttons"
  - "Server-side kiosk control: localhost endpoint with delayed exec for graceful response"

requirements-completed: [D-12, D-13, D-14, D-15]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 6 Plan 03: Settings Tab Restructure and Exit Kiosk Mode Summary

**Renamed Family tab to Settings (rightmost nav position) and added System Settings section with PIN-protected Exit Kiosk Mode button backed by a new server endpoint that terminates Chromium with a 300ms delay**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T10:48:39Z
- **Completed:** 2026-03-24T10:50:03Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Nav bar reordered to Chores | Calendar | Chess | Settings (Settings rightmost per D-12)
- FamilyList enhanced with System Settings section containing Change PIN and Exit Kiosk Mode buttons (D-13)
- Exit Kiosk Mode button styled destructive and gated behind withPinAuth PIN verification (D-14)
- Server endpoint POST /api/system/exit-kiosk created with pkill -SIGTERM chromium and 300ms response-first delay (D-15)
- Gear icon removed from FamilyList header (Change PIN moved to System Settings section)

## Task Commits

Each task was committed atomically:

1. **Task 1: App.tsx tab rename + reorder and FamilyList system settings section** - `5990ef0` (feat)
2. **Task 2: Server exit-kiosk endpoint + route registration** - `23e3208` (feat)

**Plan metadata:** _(docs commit pending)_

## Files Created/Modified
- `client/src/App.tsx` - View state updated to 'settings', nav reordered: Chores, Calendar, Chess, Settings
- `client/src/components/FamilyList.tsx` - Gear icon removed; System Settings section added with Change PIN and Exit Kiosk buttons
- `server/routes/system.js` - New file: POST /api/system/exit-kiosk endpoint with delayed pkill
- `server/index.js` - Added systemRoutes import and registration

## Decisions Made
- Reused existing `withPinAuth` pattern from usePinAuth hook (already has 60s grace period from Plan 01)
- Used `pkill -SIGTERM chromium` matching binary name from Phase 1 restart scripts
- 300ms setTimeout before exec ensures HTTP 200 response reaches client before Chromium terminates

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Settings tab and System Settings section ready for verification
- Exit Kiosk Mode provides PIN-protected maintenance escape from kiosk mode
- Plan 04 (final integration/polish) can proceed

---
*Phase: 06-polish-integration*
*Completed: 2026-03-24*
