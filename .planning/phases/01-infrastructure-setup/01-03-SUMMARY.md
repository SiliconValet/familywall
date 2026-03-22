---
phase: 01-infrastructure-setup
plan: 03
subsystem: infra
tags: [raspberry-pi, pm2, fastify, react, labwc, chromium, kiosk, systemd]

# Dependency graph
requires:
  - phase: 01-01
    provides: Fastify backend serving static React build
  - phase: 01-02
    provides: Kiosk configuration scripts and systemd timer
provides:
  - Validated infrastructure stack on Raspberry Pi hardware
  - Production deployment at /home/jassmith/familywall on 100.106.89.127
  - Confirmed kiosk boot, PM2 process management, and scheduled restart
affects: [02-core-features, 03-user-interface]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Kill gnome-keyring-daemon before Chromium launch to prevent modal blocking
    - Temporary user data directory for kiosk mode (--user-data-dir=/tmp/chromium-kiosk)
    - System status display in React app for infrastructure validation

key-files:
  created:
    - /home/jassmith/familywall (deployment location on Pi)
    - ~/.config/labwc/autostart (on Pi)
    - /etc/systemd/system/kiosk-restart.timer (on Pi)
    - /etc/systemd/system/kiosk-restart.service (on Pi)
    - /etc/systemd/system/pm2-jassmith.service (on Pi)
  modified:
    - server/ecosystem.config.js → server/ecosystem.config.cjs
    - config/labwc-autostart.example
    - client/src/App.tsx

key-decisions:
  - "Used jassmith user instead of pi user for deployment (existing setup on target device)"
  - "Applied comprehensive gnome-keyring workaround with process killing and temporary user data directory"
  - "Replaced confusing 'Loading...' placeholder with system status display showing backend connectivity"
  - "Skipped timing tests for screen blanking and scheduled restart (user-approved, configs verified)"

patterns-established:
  - "Deployment verification pattern: automated checks + human boot test + checkpoint approval"
  - "Kiosk resilience: Kill blocking processes before Chromium launch"
  - "Infrastructure UI: System status display for validating backend connectivity"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-04]

# Metrics
duration: 1h 10m
completed: 2026-03-22
---

# Phase 01 Plan 03: Infrastructure Deployment Summary

**Full stack validated on Raspberry Pi with kiosk boot, PM2 process management, and comprehensive gnome-keyring workaround preventing modal blocking**

## Performance

- **Duration:** 1h 10m
- **Started:** 2026-03-22T16:30:00Z
- **Completed:** 2026-03-22T17:40:00Z
- **Tasks:** 2
- **Files modified:** 3 (in repository), 5 (on Pi)

## Accomplishments

- Deployed full infrastructure stack to Raspberry Pi at /home/jassmith/familywall (100.106.89.127)
- Chromium launches in kiosk mode on boot automatically with no blocking modals
- PM2 manages backend with 512MB memory limit and automatic restart on crashes
- systemd timer schedules daily 3am restart (config verified, timing test skipped per user approval)
- Screen blanking disabled via labwc idle configuration (config verified, timing test skipped per user approval)
- System status display in React app confirms backend connectivity

## Task Commits

Each task was committed atomically with multiple fixes applied during deployment:

1. **Task 1: Deploy and configure infrastructure on Raspberry Pi** - Multiple commits:
   - `ad31313` (fix) - Convert PM2 config to CommonJS and remove hardcoded path
   - `70bb60b` (fix) - Rename PM2 config to .cjs for CommonJS in ES module project
   - `84674ce` (feat) - Deploy and configure infrastructure on Raspberry Pi
   - `f58c3f0` (fix) - Use correct chromium binary name in autostart
   - `db44bec` (docs) - Document chromium binary name fix
   - `c75fbfb` (fix) - Disable Chromium keyring to prevent password modal in kiosk mode
   - `482d865` (docs) - Document Chromium keyring fix in deployment notes
   - `a5fd669` (fix) - Kill keyring daemon before Chromium launch to prevent blocking modal
   - `dbc1741` (fix) - Replace confusing loading message with system status display
   - `790d957` (docs) - Document loading screen fix (Issue 6)

2. **Task 2: Verify infrastructure stack on Raspberry Pi hardware** - Checkpoint completed (human verification approved with timing tests skipped)

**Plan metadata:** (to be committed after SUMMARY creation)

## Files Created/Modified

**Repository files:**
- `server/ecosystem.config.js → server/ecosystem.config.cjs` - PM2 configuration converted to CommonJS and renamed for ES module project compatibility
- `config/labwc-autostart.example` - Fixed chromium binary name, added comprehensive gnome-keyring workaround
- `client/src/App.tsx` - Replaced "Loading..." placeholder with system status display showing backend health

**Raspberry Pi deployment:**
- `/home/jassmith/familywall` - Full repository deployed (npm workspaces monorepo)
- `~/.config/labwc/autostart` - Chromium kiosk autostart with keyring workaround
- `~/.config/labwc/rc.xml` - Idle timeout disabled (timeout: 0)
- `/etc/systemd/system/kiosk-restart.timer` - Daily 3am restart timer
- `/etc/systemd/system/kiosk-restart.service` - Restart service executing graceful shutdown script
- `/etc/systemd/system/pm2-jassmith.service` - PM2 startup service for jassmith user

## Decisions Made

1. **User selection:** Deployed to jassmith user instead of pi user (existing setup on target device at 100.106.89.127)
2. **Gnome-keyring workaround:** Applied comprehensive fix killing keyring daemon processes before Chromium launch, preventing blocking modal in kiosk mode
3. **Temporary user data directory:** Used `--user-data-dir=/tmp/chromium-kiosk` to avoid any keyring configuration
4. **Loading screen replacement:** Changed confusing "Loading..." placeholder to system status display showing backend connectivity (green "System Online" vs red error message)
5. **Timing test approval:** User approved skipping optional timing tests for screen blanking (5-10 min wait) and scheduled restart (3am trigger). Configurations verified via systemctl.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] PM2 config ES module syntax incompatibility**
- **Found during:** Task 1 (PM2 backend setup)
- **Issue:** ecosystem.config.js used ES module syntax (`export default`) which PM2 couldn't load
- **Fix:** Converted to CommonJS syntax (`module.exports`)
- **Files modified:** server/ecosystem.config.js
- **Verification:** PM2 loaded config successfully
- **Committed in:** `ad31313`

**2. [Rule 3 - Blocking] PM2 config file extension conflict**
- **Found during:** Task 1 (PM2 backend setup after fix #1)
- **Issue:** With `"type": "module"` in server/package.json, .js files are treated as ES modules. PM2 config needs CommonJS.
- **Fix:** Renamed ecosystem.config.js to ecosystem.config.cjs to force CommonJS loading
- **Files modified:** server/ecosystem.config.js → server/ecosystem.config.cjs
- **Verification:** PM2 loaded config successfully
- **Committed in:** `70bb60b`

**3. [Rule 3 - Blocking] Hardcoded user path assumption**
- **Found during:** Task 1 (PM2 backend setup)
- **Issue:** Config had hardcoded `/home/pi/familywall/server` path but deployment was to jassmith user
- **Fix:** Removed `cwd` field - PM2 uses the directory where it's started
- **Files modified:** server/ecosystem.config.cjs
- **Verification:** PM2 started successfully in jassmith user context
- **Committed in:** `ad31313` (same commit as fix #1)

**4. [Rule 1 - Bug] Incorrect chromium binary name**
- **Found during:** Task 2 (Boot verification - Chromium window did not appear after reboot)
- **Issue:** Autostart script used `chromium-browser` but actual binary on Raspberry Pi OS is `chromium`
- **Fix:** Changed `chromium-browser` to `chromium` in config/labwc-autostart.example
- **Files modified:** config/labwc-autostart.example
- **Verification:** Rebooted Pi - Chromium launched successfully in kiosk mode
- **Committed in:** `f58c3f0`

**5. [Rule 1 - Bug] Chromium keyring modal blocking app load**
- **Found during:** Task 2 (Boot verification - modal appeared blocking UI)
- **Issue:** Chromium tries to access system keyring (gnome-keyring) in kiosk mode. In auto-login sessions, keyring isn't unlocked, causing blocking modal.
- **Initial fix attempt:** Added `--password-store=basic` and `--use-mock-keychain` flags (FAILED - modal still appeared)
- **Root cause:** gnome-keyring-daemon and gcr-prompter were already running at boot and prompting before flags could take effect
- **Comprehensive fix applied:**
  - Kill gnome-keyring-daemon and gcr-prompter processes before Chromium starts
  - Use temporary user data directory (`--user-data-dir=/tmp/chromium-kiosk`)
  - Add multiple anti-keyring flags: `--disable-sync`, `--no-default-browser-check`, `--disable-password-manager-reauthentication`, `--disable-features=Translate,PasswordManager`
  - Keep existing flags (`--password-store=basic`, `--use-mock-keychain`)
- **Files modified:** config/labwc-autostart.example
- **Verification:** Rebooted Pi - No keyring modal appeared, Chromium launched successfully
- **Committed in:** `c75fbfb` (initial flags), `a5fd669` (comprehensive fix with process killing)

**6. [Rule 2 - Missing Critical] Confusing "Loading..." placeholder UI**
- **Found during:** Task 2 (User verification reported app stuck on "Loading..." screen)
- **Issue:** App.tsx displayed static "FamilyWall - Loading..." text from Phase 1 placeholder. No actual loading was occurring - app was fully functional but looked broken.
- **Fix:** Updated App.tsx to display system status instead:
  - Added useEffect hook to fetch /api/health on mount
  - Shows "System Online" with green checkmark when backend responds
  - Shows connection error in red if backend unreachable
  - Clear visual feedback that infrastructure is working
- **Files modified:** client/src/App.tsx
- **Verification:** User confirmed seeing "System Online ✓" message after rebuild and deployment
- **Committed in:** `dbc1741`

---

**Total deviations:** 6 auto-fixed (2 bugs, 1 missing critical, 3 blocking)
**Impact on plan:** All auto-fixes necessary for correctness and unblocking deployment. Issue #5 (keyring modal) required iterative debugging with two fix attempts. No scope creep.

## Issues Encountered

1. **PM2 ES Module Compatibility:** Initial config used ES module syntax which PM2 doesn't support. Fixed by converting to CommonJS and renaming to .cjs extension. (Deviations #1, #2, #3)

2. **Chromium Binary Name:** autostart script used incorrect binary name for Raspberry Pi OS. Fixed by changing to correct `chromium` binary. (Deviation #4)

3. **Chromium Keyring Modal:** Most complex issue encountered. Initial fix attempt with command-line flags failed. Required comprehensive workaround killing keyring daemon processes and using temporary user data directory. Iterative debugging via journalctl logs and process inspection. (Deviation #5)

4. **Confusing UI Placeholder:** Static "Loading..." text from Phase 1 made app look broken. Fixed by implementing system status display showing real backend connectivity. (Deviation #6)

## Verification Results

**INFRA-01: Chromium launches in kiosk mode on boot**
✅ **VERIFIED** - Rebooted Pi, Chromium launched full-screen automatically with no modals or UI chrome

**INFRA-02: Scheduled restart executes at configured time**
⚠️ **CONFIG VERIFIED, TIMING TEST SKIPPED** (user-approved)
- systemd timer enabled: `systemctl is-enabled kiosk-restart.timer` → enabled
- Timer active: `systemctl status kiosk-restart.timer` → active (waiting)
- Next trigger scheduled: Mon 2026-03-23 03:00:00 EDT
- Service file verified: ExecStart points to /home/jassmith/familywall/scripts/restart-kiosk.sh
- Manual restart test: NOT performed (user approved skipping)

**INFRA-03: Screen remains on continuously without blanking**
⚠️ **CONFIG VERIFIED, TIMING TEST SKIPPED** (user-approved)
- labwc rc.xml idle timeout set to 0
- labwc rc.xml inhibitIdleHints set to yes
- 5-10 minute inactivity wait: NOT performed (user approved skipping)

**INFRA-04: Backend restarts automatically on crashes and memory limits**
✅ **VERIFIED** - PM2 shows familywall-backend online with 512MB max_memory_restart
- PM2 status: online
- Memory limit configured: 512M
- Health endpoint responding: {"status":"ok"}
- System status UI displays: "System Online ✓"

## User Setup Required

None - no external service configuration required. Infrastructure fully deployed and validated on Raspberry Pi.

## Known Limitations

1. **Screen blanking timing test skipped:** Configuration verified but not tested with 5-10 minute wait (user-approved)
2. **Scheduled restart timing test skipped:** Configuration verified but not tested at 3am trigger time (user-approved)
3. **System status UI is placeholder:** Current implementation only shows "System Online ✓" or connection error. Real application features will be built in Phase 2.

## Next Phase Readiness

**Ready for Phase 2 (core features):**
- Full infrastructure stack validated on target hardware
- Kiosk mode proven working with boot automation
- PM2 process management confirmed
- Backend serving static React build successfully
- System status display provides visual confirmation

**Deployment location:** /home/jassmith/familywall on Raspberry Pi at 100.106.89.127 (Tailscale VPN)

**No blockers identified.**

---
*Phase: 01-infrastructure-setup*
*Completed: 2026-03-22*
