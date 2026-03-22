#!/bin/bash
# Graceful restart script for FamilyWall kiosk browser and backend
# This script ensures proper shutdown sequence and backend readiness before browser restart

set -euo pipefail

# Log file location
LOG_FILE=/home/jassmith/familywall/logs/restart.log

# Logging function with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Export display variables for jassmith user session
export DISPLAY=:0
# Note: Running under Wayland/labwc, no XAUTHORITY needed

log "Starting kiosk restart"

# Gracefully stop Chromium browser
log "Sending SIGTERM to chromium"
pkill -SIGTERM chromium || true

# Wait up to 10 seconds for clean exit
log "Waiting for chromium to exit gracefully"
for i in {1..10}; do
  if ! pgrep chromium > /dev/null 2>&1; then
    log "Chromium exited cleanly after ${i} seconds"
    break
  fi
  sleep 1
done

# Force kill if still running
if pgrep chromium > /dev/null 2>&1; then
  log "Chromium did not exit gracefully, sending SIGKILL"
  pkill -SIGKILL chromium || true
  sleep 1
fi

# Reload backend with pm2 (graceful reload, not restart)
log "Reloading backend via pm2"
cd /home/jassmith/familywall
pm2 reload ecosystem.config.cjs --update-env

# Wait for backend to be ready
log "Waiting for backend to come online"
sleep 3

# Verify backend is online
if ! pm2 status | grep -q "online"; then
  log "ERROR: Backend failed to come online"
  exit 1
fi

log "Backend is online, restarting Chromium"

# Kill gnome-keyring-daemon to prevent keyring modal (same as autostart)
killall gnome-keyring-daemon 2>/dev/null || true
killall gcr-prompter 2>/dev/null || true
sleep 1

# Restart Chromium with same configuration as autostart
chromium http://localhost:3000 \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --disable-features=Translate,PasswordManager \
  --disable-component-update \
  --ozone-platform=wayland \
  --enable-features=OverlayScrollbar \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --touch-events=enabled \
  --password-store=basic \
  --use-mock-keychain \
  --disable-sync \
  --no-default-browser-check \
  --disable-password-manager-reauthentication \
  --user-data-dir=/tmp/chromium-kiosk &

log "Kiosk restart complete"
