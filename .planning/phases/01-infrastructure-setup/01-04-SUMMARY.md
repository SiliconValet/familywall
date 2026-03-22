---
phase: 01-infrastructure-setup
plan: 04
subsystem: infra
tags: [raspberry-pi, chromium, kiosk, systemd, pm2, restart-script]

# Dependency graph
requires:
  - phase: 01-03
    provides: Infrastructure deployment with jassmith user and gnome-keyring workaround
provides:
  - Restart script with correct chromium binary name matching deployed configuration
  - Restart script with all Chromium flags from autostart (including keyring workaround)
  - Systemd service file with jassmith user and correct paths
affects: [INFRA-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Restart script mirrors autostart configuration for consistency
    - User-specific paths in systemd service files

key-files:
  created: []
  modified:
    - scripts/restart-kiosk.sh
    - systemd/kiosk-restart.service

key-decisions:
  - "Removed XAUTHORITY export from restart script (not needed on Wayland/labwc)"
  - "Added gnome-keyring workaround to restart script matching autostart implementation"

patterns-established:
  - "Restart scripts must use same binary names and flags as autostart for consistency"
  - "PM2 ecosystem config filename must match actual file extension (.cjs for CommonJS in ES module projects)"

requirements-completed: [INFRA-02]

# Metrics
duration: 2m
completed: 2026-03-22
---

# Phase 01 Plan 04: Kiosk Restart Configuration Fix Summary

**Fixed restart script and systemd service to match deployed configuration, closing INFRA-02 gap identified in verification**

## Performance

- **Duration:** 2m
- **Started:** 2026-03-22T21:51:54Z
- **Completed:** 2026-03-22T21:53:31Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Updated restart-kiosk.sh to use correct `chromium` binary name (not `chromium-browser`)
- Changed ecosystem config filename from .js to .cjs matching actual file
- Updated all user paths from `pi` to `jassmith` matching deployment
- Added gnome-keyring workaround to restart script (same as autostart)
- Included all Chromium flags from labwc-autostart.example in restart script
- Fixed systemd service file to reference jassmith user and correct paths
- Closed INFRA-02 requirement gap: daily 3am restart will now execute successfully

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix restart script binary name, flags, config filename, and user paths**
   - Commit: `6420bb3`
   - Files: scripts/restart-kiosk.sh
   - Changes: chromium-browser → chromium, ecosystem.config.js → ecosystem.config.cjs, /home/pi → /home/jassmith, added gnome-keyring workaround, synchronized all Chromium flags with autostart

2. **Task 2: Fix systemd service file user and path references**
   - Commit: `0853209`
   - Files: systemd/kiosk-restart.service
   - Changes: User=pi → User=jassmith, updated ExecStart path

## Files Created/Modified

**Modified:**
- `scripts/restart-kiosk.sh` - Fixed binary name, config filename, user paths, added keyring workaround, synchronized Chromium flags
- `systemd/kiosk-restart.service` - Updated user and path references from pi to jassmith

## Decisions Made

1. **XAUTHORITY removal:** Removed XAUTHORITY export from restart script (X11-specific, not needed on Wayland/labwc). Kept DISPLAY export as it is harmless and may support mixed environments.

2. **Gnome-keyring workaround replication:** Added the same gnome-keyring kill commands to restart script as used in autostart, ensuring consistent behavior after restart.

3. **Complete flag synchronization:** Copied all Chromium flags from labwc-autostart.example to restart script, not just a subset. This ensures identical browser configuration for both boot and restart scenarios.

## Deviations from Plan

None - plan executed exactly as written. All fixes were specified in the plan based on VERIFICATION.md findings.

## Verification Results

**All verification criteria passed:**

✅ Zero occurrences of `chromium-browser` in restart-kiosk.sh
✅ Zero occurrences of `/home/pi/` in both modified files
✅ Chromium flags in restart-kiosk.sh match config/labwc-autostart.example exactly
✅ ecosystem.config.cjs filename matches actual file in server/
✅ gnome-keyring workaround present in restart script (killall gnome-keyring-daemon and gcr-prompter)
✅ systemd service references jassmith user
✅ systemd service ExecStart path uses /home/jassmith/familywall

**INFRA-02 Gap Closure Confirmed:**

The restart script can now correctly:
- Find and kill Chromium using correct `chromium` binary name
- Reload PM2 using correct ecosystem.config.cjs filename
- Execute in jassmith user context with correct paths
- Relaunch Chromium with identical configuration to autostart (preventing keyring modal)

## Known Stubs

None - this is a configuration fix plan with no UI or data components.

## Next Phase Impact

**Ready for deployment to Raspberry Pi:**
- Repository copies of restart-kiosk.sh and kiosk-restart.service now match deployed configuration
- Future deployments will use correct values without manual correction
- Daily 3am restart (INFRA-02) will execute successfully on the Pi

**No blockers identified.**

## Self-Check: PASSED

All files and commits verified:
- ✓ scripts/restart-kiosk.sh exists
- ✓ systemd/kiosk-restart.service exists
- ✓ Commit 6420bb3 exists
- ✓ Commit 0853209 exists
- ✓ 01-04-SUMMARY.md created

---
*Phase: 01-infrastructure-setup*
*Completed: 2026-03-22*
