#!/bin/bash
# Graceful restart script for FamilyWall kiosk browser and backend
# This script ensures proper shutdown sequence and backend readiness before browser restart

set -euo pipefail

# Log file location
LOG_FILE=/home/pi/familywall/logs/restart.log

# Logging function with timestamps
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Export display variables for user pi session
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority

log "Starting kiosk restart"

# Gracefully stop Chromium browser
log "Sending SIGTERM to chromium-browser"
pkill -SIGTERM chromium-browser || true

# Wait up to 10 seconds for clean exit
log "Waiting for chromium-browser to exit gracefully"
for i in {1..10}; do
  if ! pgrep chromium-browser > /dev/null 2>&1; then
    log "Chromium exited cleanly after ${i} seconds"
    break
  fi
  sleep 1
done

# Force kill if still running
if pgrep chromium-browser > /dev/null 2>&1; then
  log "Chromium did not exit gracefully, sending SIGKILL"
  pkill -SIGKILL chromium-browser || true
  sleep 1
fi

# Reload backend with pm2 (graceful reload, not restart)
log "Reloading backend via pm2"
cd /home/pi/familywall
pm2 reload ecosystem.config.js --update-env

# Wait for backend to be ready
log "Waiting for backend to come online"
sleep 3

# Verify backend is online
if ! pm2 status | grep -q "online"; then
  log "ERROR: Backend failed to come online"
  exit 1
fi

log "Backend is online, restarting Chromium"

# Restart Chromium with same configuration as autostart
chromium-browser http://localhost:3000 \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --disable-features=Translate \
  --disable-component-update \
  --ozone-platform=wayland \
  --enable-features=OverlayScrollbar \
  --disable-pinch \
  --overscroll-history-navigation=0 \
  --touch-events=enabled &

log "Kiosk restart complete"
