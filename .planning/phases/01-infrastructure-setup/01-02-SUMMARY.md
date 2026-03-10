---
phase: 01-infrastructure-setup
plan: 02
type: summary
subsystem: deployment
tags: [kiosk, raspberry-pi, labwc, systemd, automation]

dependency_graph:
  requires:
    - "PM2 for backend process management"
    - "labwc compositor (Pi OS Bookworm default)"
    - "Chromium browser"
  provides:
    - "Kiosk mode autostart configuration"
    - "Screen blanking prevention"
    - "Scheduled daily restart coordination"
    - "Graceful browser and backend restart"
  affects:
    - "Pi deployment workflow"
    - "System uptime and reliability"

tech_stack:
  added:
    - name: "labwc"
      purpose: "Wayland compositor for Pi OS kiosk mode"
      alternative: "Replaced Wayfire as of Pi OS Bookworm (Nov 2024)"
    - name: "systemd timers"
      purpose: "Scheduled task execution for daily restarts"
      alternative: "PM2 cron_restart (rejected - can't coordinate browser+backend)"
  patterns:
    - "Graceful shutdown with SIGTERM→wait→SIGKILL sequence"
    - "PM2 reload (graceful) over PM2 restart (immediate)"
    - "Systemd timer coordination for multi-component restart"

key_files:
  created:
    - path: "config/labwc-autostart.example"
      purpose: "Chromium kiosk launch configuration for labwc compositor"
      lines: 21
    - path: "config/labwc-rc.xml.example"
      purpose: "Screen blanking prevention via idle timeout=0"
      lines: 11
    - path: "scripts/restart-kiosk.sh"
      purpose: "Graceful restart script with browser+backend coordination"
      lines: 74
    - path: "scripts/setup-kiosk.sh"
      purpose: "Automated installation script for Pi deployment"
      lines: 98
    - path: "systemd/kiosk-restart.timer"
      purpose: "Daily 3am restart scheduler"
      lines: 12
    - path: "systemd/kiosk-restart.service"
      purpose: "Restart script execution service"
      lines: 12
    - path: "README-KIOSK.md"
      purpose: "Comprehensive kiosk setup and troubleshooting guide"
      lines: 250
  modified: []

decisions:
  - choice: "Use labwc configuration instead of Wayfire"
    rationale: "Pi OS Bookworm switched from Wayfire to labwc in November 2024. Research confirmed labwc is the current default compositor."
    impact: "Ensures compatibility with current and future Pi OS releases"

  - choice: "Use systemd timer instead of PM2 cron_restart"
    rationale: "PM2 cron can only restart the backend, not coordinate browser+backend restart together. Systemd provides better control and logging."
    impact: "Enables coordinated restart of both components to prevent memory leaks"

  - choice: "SIGTERM with 10-second wait before SIGKILL"
    rationale: "Immediate SIGKILL can corrupt Chromium profile and cause SQLite locking issues. Graceful shutdown prevents data corruption."
    impact: "Improved reliability and reduced crash recovery on restart"

  - choice: "pm2 reload instead of pm2 restart"
    rationale: "pm2 reload is graceful (waits for connections to close), pm2 restart is immediate. Research showed reload prevents SQLite locking issues."
    impact: "Prevents database corruption during daily restart"

metrics:
  tasks_completed: 3
  tasks_total: 3
  duration_minutes: 2
  commits: 3
  files_created: 7
  lines_added: 478
  completed_date: "2026-03-10"

requirements_completed:
  - INFRA-01
  - INFRA-02
  - INFRA-03
---

# Phase 01 Plan 02: Kiosk Configuration Summary

Complete Raspberry Pi kiosk setup with labwc autostart, graceful shutdown coordination, and automated daily restart via systemd timer.

## Tasks Completed

### Task 1: Create labwc kiosk configuration files
**Status:** Complete
**Commit:** 0479224
**Files:**
- config/labwc-autostart.example
- config/labwc-rc.xml.example

Created labwc compositor configuration with Chromium kiosk launch using Wayland backend (`--ozone-platform=wayland`). Configured screen blanking prevention via `<idle><timeout>0</timeout>` in rc.xml. Includes essential kiosk flags: no error dialogs, no infobars, no first-run experience, touch events enabled, pinch zoom disabled.

### Task 2: Create graceful restart script with browser and backend coordination
**Status:** Complete
**Commit:** a9bb905
**Files:**
- scripts/restart-kiosk.sh

Implemented graceful restart script following best practices from research:
- SIGTERM to Chromium browser with 10-second wait period
- SIGKILL fallback only if needed (prevents profile corruption)
- PM2 reload for backend (graceful, prevents SQLite locking)
- Verification that backend is online before restarting browser
- Timestamp logging to /home/pi/familywall/logs/restart.log

### Task 3: Create systemd timer and kiosk setup automation
**Status:** Complete
**Commit:** 2e3e0c8
**Files:**
- systemd/kiosk-restart.timer
- systemd/kiosk-restart.service
- scripts/setup-kiosk.sh
- README-KIOSK.md

Created systemd timer for daily 3am restart with persistence. Implemented automated setup script that:
- Installs labwc configuration to ~/.config/labwc/
- Merges idle settings into existing rc.xml or creates new
- Installs systemd units to /etc/systemd/system/
- Provides PM2 startup instructions

Wrote comprehensive README-KIOSK.md with:
- Step-by-step installation guide
- Architecture overview
- Troubleshooting section addressing research pitfalls
- Verification commands
- Performance and security considerations

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All automated verification passed:
- labwc-autostart.example contains `--ozone-platform=wayland` flag
- labwc-rc.xml.example sets `<timeout>0</timeout>` for idle prevention
- restart-kiosk.sh implements SIGTERM before SIGKILL sequence
- systemd timer schedules execution at exactly `03:00:00`
- README-KIOSK.md references labwc (not outdated Wayfire)

## Key Implementation Details

### Critical Configuration Choices

1. **Wayland Backend**: Used `--ozone-platform=wayland` flag for Chromium. This is CRITICAL for labwc compatibility. Without it, Chromium will fail to start or display incorrectly.

2. **labwc vs Wayfire**: Pi OS Bookworm (November 2024) replaced Wayfire with labwc as the default compositor. All configuration targets labwc XML format and autostart location.

3. **Graceful Shutdown Sequence**:
   ```bash
   pkill -SIGTERM chromium-browser
   # Wait up to 10 seconds for clean exit
   # SIGKILL only as fallback
   ```
   This prevents Chromium profile corruption that can occur with immediate SIGKILL.

4. **PM2 Reload vs Restart**: Using `pm2 reload ecosystem.config.js --update-env` instead of `pm2 restart` ensures graceful backend restart without SQLite locking issues.

### Screen Blanking Prevention

Two-layer approach:
1. **labwc idle configuration**: `<timeout>0</timeout>` disables compositor-level blanking
2. **inhibitIdleHints**: `<inhibitIdleHints>yes</inhibitIdleHints>` prevents Wayland idle hints

Note: X11 tools like `xset` will NOT work with labwc (Wayland compositor).

### Daily Restart Coordination

Systemd timer triggers service at 3am:
1. Service runs restart-kiosk.sh as user `pi`
2. Script stops browser gracefully
3. Script reloads backend via PM2
4. Script waits for backend to be online
5. Script restarts browser with same flags as autostart

This coordinated approach prevents memory leaks in both Chromium and Node.js backend.

## Testing Notes

All configuration files are templates with `.example` extension or placed in version control. Actual deployment requires:
1. Running `sudo bash scripts/setup-kiosk.sh` on the Raspberry Pi
2. Configuring PM2 startup with `pm2 startup systemd`
3. Saving PM2 process list with `pm2 save`
4. Rebooting to test autostart

Verification commands provided in README-KIOSK.md for:
- PM2 status
- Backend connectivity
- Systemd timer status
- Restart log monitoring

## Documentation

README-KIOSK.md provides comprehensive guidance including:
- Prerequisites (Pi 5, Pi OS Bookworm, labwc)
- Installation steps with exact commands
- Architecture overview
- Troubleshooting section covering research pitfalls:
  - Wrong compositor (Wayfire vs labwc)
  - Missing Wayland flag
  - DISPLAY variable issues in systemd
  - PM2 PATH issues
  - Chromium profile corruption
- Performance tips (memory management, SQLite optimization)
- Security considerations (local network, auto-updates)

## Success Criteria Met

- [x] labwc configuration files ready for deployment to ~/.config/labwc/
- [x] restart-kiosk.sh executable and implements graceful shutdown sequence
- [x] systemd timer schedules daily 3am restart
- [x] systemd service executes restart script as user pi with proper DISPLAY variable
- [x] setup-kiosk.sh automates full installation on actual Pi hardware
- [x] README-KIOSK.md provides clear installation and troubleshooting instructions

## Impact

This plan establishes the foundation for reliable 24/7 kiosk operation:
- **Autostart**: Chromium launches automatically on Pi boot
- **Always-on display**: Screen never blanks or enters power save
- **Memory leak prevention**: Daily restart clears accumulated memory
- **Data safety**: Graceful shutdown prevents corruption
- **Easy deployment**: Automated setup script reduces manual steps
- **Maintainability**: Comprehensive documentation enables troubleshooting

The kiosk infrastructure is now ready for Pi deployment. Next phase can proceed with backend development knowing the deployment target is configured.

## Self-Check: PASSED

All claimed files and commits verified:

**Files:**
- FOUND: config/labwc-autostart.example
- FOUND: config/labwc-rc.xml.example
- FOUND: scripts/restart-kiosk.sh
- FOUND: scripts/setup-kiosk.sh
- FOUND: systemd/kiosk-restart.timer
- FOUND: systemd/kiosk-restart.service
- FOUND: README-KIOSK.md

**Commits:**
- FOUND: 0479224 (Task 1: labwc configuration files)
- FOUND: a9bb905 (Task 2: graceful restart script)
- FOUND: 2e3e0c8 (Task 3: systemd timer and automation)
