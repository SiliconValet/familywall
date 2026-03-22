# 01-03 Deployment Documentation

## Deployment Summary

**Date:** 2026-03-22
**Target:** Raspberry Pi at 100.106.89.127 (user: jassmith)
**Repository:** /home/jassmith/familywall

## Deployment Steps Completed

1. **Repository Update**
   - Repository already existed at /home/jassmith/familywall
   - Reset to origin/main (commit: 70bb60b)
   - Latest code deployed successfully

2. **Dependencies Installation**
   - Ran `npm install` at root (npm workspaces)
   - All 186 packages installed successfully
   - Node.js v20.19.2 confirmed

3. **Client Build**
   - Ran `npm run build:client`
   - Vite build completed in 1.73s
   - Production build created in server/public/ (193.55 kB)

4. **PM2 Backend Setup**
   - Started backend: `cd server && pm2 start ecosystem.config.cjs`
   - Process: familywall-backend (id: 0, status: online)
   - Memory limit: 512M (max_memory_restart)
   - Saved PM2 process list: `pm2 save`
   - Configured PM2 startup: systemd service enabled
   - Service file: /etc/systemd/system/pm2-jassmith.service

5. **Kiosk Configuration**
   - Ran `sudo bash scripts/setup-kiosk.sh`
   - labwc autostart installed: ~/.config/labwc/autostart
   - labwc rc.xml updated with idle settings (timeout: 0)
   - systemd timer installed: /etc/systemd/system/kiosk-restart.timer
   - systemd service installed: /etc/systemd/system/kiosk-restart.service
   - Timer enabled and scheduled for daily 3am restart

## Verification Results

### PM2 Status
```
✓ familywall-backend running (status: online)
✓ Memory: 47.9mb / 512M limit
✓ Node.js: v20.19.2
✓ Working directory: /home/jassmith/familywall/server
✓ Error log: ./logs/error-0.log
✓ Output log: ./logs/output-0.log
✓ Restart count: 2 (from configuration updates)
```

### Systemd Timer Status
```
✓ kiosk-restart.timer: enabled
✓ Status: active (waiting)
✓ Next trigger: Mon 2026-03-23 03:00:00 EDT
✓ Service: kiosk-restart.service configured
```

### Backend Health Check
```
✓ curl http://localhost:3000/api/health
✓ Response: {"status":"ok","timestamp":1774213287493}
```

### labwc Configuration
```
✓ Autostart file: ~/.config/labwc/autostart (607 bytes)
✓ Idle config: ~/.config/labwc/rc.xml (timeout: 0, inhibitIdleHints: yes)
✓ Chromium flags: --kiosk, --ozone-platform=wayland, --touch-events=enabled
```

## Issues Encountered and Resolved

### Issue 1: PM2 Config ES Module Syntax
**Problem:** Initial ecosystem.config.js used ES module syntax (`export default`) which PM2 couldn't load.
**Root cause:** PM2 doesn't support ES module syntax in config files by default.
**Fix:** Converted to CommonJS syntax (`module.exports`).
**Commit:** ad31313

### Issue 2: PM2 Config File Extension
**Problem:** With `"type": "module"` in server/package.json, .js files are treated as ES modules.
**Root cause:** Node.js ES module/CommonJS detection based on package.json type field.
**Fix:** Renamed ecosystem.config.js to ecosystem.config.cjs to force CommonJS loading.
**Commit:** 70bb60b

### Issue 3: Hardcoded User Path
**Problem:** Original config had hardcoded `/home/pi/familywall/server` path.
**Root cause:** Initial config assumed default pi user.
**Fix:** Removed `cwd` field - PM2 uses the directory where it's started.
**Resolution:** Both issues fixed in same commits.

### Issue 4: Incorrect Chromium Binary Name
**Problem:** Boot verification failed - Chromium window did not appear after reboot.
**Root cause:** Autostart script used `chromium-browser` but actual binary on Raspberry Pi OS is `chromium`.
**Diagnosis:**
- labwc compositor was running correctly
- Autostart script executed but failed silently (wrong binary name)
- No error logging for autostart failures
**Fix:** Changed `chromium-browser` to `chromium` in config/labwc-autostart.example and redeployed.
**Verification:** Rebooted Pi - Chromium now launches successfully in kiosk mode.
**Commit:** f58c3f0

### Issue 5: Chromium Keyring Modal Blocking App Load
**Problem:** After boot, Chromium showed "password missing from keyring" modal and white screen appeared after dismissing it.
**Root cause:** Chromium tries to access system keyring (gnome-keyring/KWallet) for password storage in kiosk mode. In auto-login sessions, the keyring isn't unlocked, causing a blocking modal that prevents the app from loading.
**Diagnosis:**
- Chromium launched successfully (Issue 4 fix worked)
- Modal appeared blocking UI interaction
- Known issue with Chromium in headless/kiosk environments
**Initial Fix (FAILED):** Added `--password-store=basic` and `--use-mock-keychain` flags to Chromium command in config/labwc-autostart.example.
- `--password-store=basic` uses basic password storage (no keyring)
- `--use-mock-keychain` bypasses keyring authentication
**Initial Verification:** FAILED - Keyring modal still appeared after reboot. User clicked cancel, Chromium did not launch.
**Commit:** c75fbfb

**Root Cause Analysis (Second Attempt):**
- Checked running processes: Two gnome-keyring-daemon instances running (PIDs 1984, 1994)
- Checked journalctl logs: gcr-prompter (GNOME Credential Request prompter) was showing the modal
- Logs showed keyring daemon starting at boot (17:12:08) and prompting before Chromium launched
- User canceled modal at 17:20:25, causing Chromium session to fail
- Previous flags were insufficient because keyring daemon was already running and prompting

**Comprehensive Fix Applied:**
1. Kill gnome-keyring-daemon and gcr-prompter processes before Chromium starts
2. Use temporary user data directory (`--user-data-dir=/tmp/chromium-kiosk`) to avoid any keyring config
3. Add additional anti-keyring flags:
   - `--disable-sync` - Disable Chrome Sync entirely
   - `--no-default-browser-check` - Skip browser checks that might trigger keyring
   - `--disable-password-manager-reauthentication` - Disable password manager auth
   - `--disable-features=Translate,PasswordManager` - Disable password manager feature
4. Keep existing flags (`--password-store=basic`, `--use-mock-keychain`)

**Verification:** Pending reboot test - No keyring modal should appear, Chromium should launch successfully.
**Commit:** c75fbfb

### Issue 6: Confusing "Loading..." Message in React App
**Problem:** User verification (Task 2) reported app stuck on "Loading..." screen.
**Root cause:** App.tsx intentionally displayed static "FamilyWall - Loading..." text from Phase 1 placeholder implementation. No actual loading was occurring - the app was fully functional but looked broken.
**Diagnosis:**
- Backend serving HTML correctly (verified via logs)
- JavaScript bundle loading successfully (verified via logs)
- No API errors or build issues
- React app rendering correctly - just showing placeholder text
**Fix:** Updated App.tsx to display system status instead of ambiguous "Loading..." message:
- Added useEffect hook to fetch /api/health on mount
- Shows "System Online" with green checkmark when backend responds
- Shows connection error in red if backend unreachable
- Clear visual feedback that infrastructure is working
**Files modified:** client/src/App.tsx
**Commit:** dbc1741
**Deployed:** Rebuilt client and pushed to Pi (2026-03-22 17:31)

## Files Modified During Deployment

Local repository (committed and pushed):
- server/ecosystem.config.js → server/ecosystem.config.cjs (renamed, converted to CommonJS)
- config/labwc-autostart.example (fixed chromium binary name, disabled keyring)
- client/src/App.tsx (replaced "Loading..." with system status display)

Raspberry Pi:
- ~/.config/labwc/autostart (created by setup-kiosk.sh)
- ~/.config/labwc/rc.xml (idle section already existed)
- /etc/systemd/system/kiosk-restart.timer (created by setup-kiosk.sh)
- /etc/systemd/system/kiosk-restart.service (created by setup-kiosk.sh)
- /etc/systemd/system/pm2-jassmith.service (created by pm2 startup)

## Next Steps

Task 2 will perform human verification of:
1. Boot sequence → Chromium kiosk starts automatically
2. Screen blanking prevention → Screen stays on after 10+ minutes
3. PM2 management → Backend crash recovery
4. Scheduled restart → systemd timer triggers correctly

## Deployment Configuration

**SSH Access:**
- Host: 100.106.89.127
- User: jassmith
- Method: SSH key authentication
- Connection: Tailscale VPN

**PM2 Configuration:**
- App name: familywall-backend
- Script: ./index.js
- Instances: 1
- Max memory restart: 512M
- Max restarts: 10
- Min uptime: 10s
- Restart delay: 4000ms
- Environment: production

**Systemd Timer:**
- Timer: kiosk-restart.timer
- Schedule: Daily at 03:00:00
- Service: kiosk-restart.service
- Script: /home/jassmith/familywall/scripts/restart-kiosk.sh

## Verification Commands

For future reference:

```bash
# Check PM2 status
ssh jassmith@100.106.89.127 "pm2 list"
ssh jassmith@100.106.89.127 "pm2 logs familywall-backend --lines 50"

# Check systemd timer
ssh jassmith@100.106.89.127 "systemctl status kiosk-restart.timer"
ssh jassmith@100.106.89.127 "systemctl list-timers | grep kiosk"

# Check backend health
ssh jassmith@100.106.89.127 "curl http://localhost:3000/api/health"

# Check labwc configuration
ssh jassmith@100.106.89.127 "cat ~/.config/labwc/autostart"
ssh jassmith@100.106.89.127 "cat ~/.config/labwc/rc.xml"
```
