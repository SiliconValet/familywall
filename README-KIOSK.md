# FamilyWall Kiosk Setup Guide

This guide covers setting up FamilyWall on a Raspberry Pi 5 running Raspberry Pi OS Bookworm in kiosk mode for a dedicated family touchscreen.

## Prerequisites

- Raspberry Pi 5 (or Pi 4 with 4GB+ RAM)
- Raspberry Pi OS Bookworm (64-bit recommended)
- labwc compositor (default in Pi OS Bookworm as of November 2024)
- Touchscreen display connected via DSI or HDMI
- Internet connection for initial setup

## Architecture Overview

The kiosk setup consists of:

1. **labwc autostart** - Launches Chromium in kiosk mode on boot
2. **Backend (Node.js + PM2)** - Serves the React app and API
3. **Systemd timer** - Coordinates daily 3am restart for both components

## Installation Steps

### 1. Clone and Build

```bash
# Clone repository
cd ~
git clone https://github.com/yourusername/familywall.git
cd familywall

# Install dependencies
npm install

# Build client
npm run build:client
```

### 2. Start Backend

```bash
# Start backend with PM2
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Set up PM2 to start on boot
pm2 startup systemd -u pi --hp /home/pi
# Run the command PM2 outputs (sudo systemctl enable...)
```

### 3. Configure Kiosk

```bash
# Run the kiosk setup script (requires sudo)
sudo bash scripts/setup-kiosk.sh
```

This script will:
- Copy labwc configuration to `~/.config/labwc/`
- Install systemd timer and service
- Configure screen blanking prevention

### 4. Verify Setup

```bash
# Check PM2 is running
pm2 list

# Check backend is responding
curl http://localhost:3000

# Check systemd timer is active
systemctl status kiosk-restart.timer

# View next scheduled restart time
systemctl list-timers kiosk-restart.timer
```

### 5. Reboot

```bash
sudo reboot
```

After reboot, Chromium should launch automatically in full-screen kiosk mode displaying the FamilyWall interface.

## Configuration Details

### labwc Autostart

Location: `~/.config/labwc/autostart`

The autostart file launches Chromium with the following critical flags:

- `--kiosk` - Full-screen mode with no browser UI
- `--ozone-platform=wayland` - **CRITICAL**: Use Wayland backend for labwc compatibility
- `--noerrdialogs` - Suppress crash dialogs
- `--disable-infobars` - Remove "Chrome is being controlled" message
- `--touch-events=enabled` - Enable multi-touch support
- `--disable-pinch` - Prevent accidental touch zoom

### Screen Blanking Prevention

Location: `~/.config/labwc/rc.xml`

The idle configuration prevents the screen from blanking:

```xml
<idle>
  <timeout>0</timeout>
  <inhibitIdleHints>yes</inhibitIdleHints>
</idle>
```

### Daily Restart

The systemd timer triggers a graceful restart at 3am daily to prevent memory leaks:

1. Timer: `systemd/kiosk-restart.timer` - Schedules execution at 03:00:00
2. Service: `systemd/kiosk-restart.service` - Runs the restart script
3. Script: `scripts/restart-kiosk.sh` - Coordinates browser and backend restart

## Verification Commands

```bash
# Check PM2 backend status
pm2 list
pm2 logs

# Check systemd timer
systemctl status kiosk-restart.timer
systemctl list-timers

# View restart logs
tail -f ~/familywall/logs/restart.log

# Manual restart test
bash ~/familywall/scripts/restart-kiosk.sh
```

## Troubleshooting

### Chromium Not Starting on Boot

**Symptom:** Black screen or desktop visible after boot

**Possible causes:**
1. **Wrong compositor** - Ensure you're using labwc (not Wayfire). Wayfire was replaced by labwc in Pi OS Bookworm (November 2024).
2. **Missing Wayland flag** - Verify `--ozone-platform=wayland` is present in autostart file
3. **Backend not ready** - Check `pm2 list` shows backend as "online"

**Debugging:**
```bash
# Check which compositor is running
ps aux | grep -E "labwc|wayfire"

# View labwc logs
journalctl --user -u labwc

# Test Chromium manually
chromium-browser http://localhost:3000 --kiosk --ozone-platform=wayland
```

### Screen Blanking Despite Configuration

**Symptom:** Screen goes black after period of inactivity

**Solution:** Verify idle configuration in `~/.config/labwc/rc.xml` has `<timeout>0</timeout>`. Note that X11 tools like `xset` will NOT work with labwc (Wayland compositor).

### Restart Script Fails

**Symptom:** Daily restart doesn't work or leaves processes running

**Common issues:**

1. **DISPLAY variable not set** - The restart script exports `DISPLAY=:0` and `XAUTHORITY=/home/pi/.Xauthority`. Verify these match your session.

2. **PM2 not in PATH** - The systemd service runs as user `pi`. Ensure PM2 is installed globally or in pi's PATH.

3. **Chromium profile corruption** - The restart script uses `SIGTERM` first, waits up to 10 seconds, then uses `SIGKILL` as fallback. This prevents profile corruption.

**Debugging:**
```bash
# View restart service logs
journalctl -u kiosk-restart.service

# Test restart script manually
bash ~/familywall/scripts/restart-kiosk.sh

# Check restart log file
tail -f ~/familywall/logs/restart.log
```

### Backend Not Starting on Boot

**Symptom:** Chromium starts but shows "Cannot connect" or blank page

**Solution:**
```bash
# Verify PM2 startup is configured
pm2 startup systemd -u pi --hp /home/pi
# Run the command PM2 outputs

# Ensure process list is saved
pm2 save

# Check PM2 status
pm2 list
pm2 logs
```

## Performance Tips

1. **Memory management** - The daily 3am restart prevents memory leaks from accumulating in both Chromium and the Node.js backend.

2. **SQLite optimization** - The restart script uses `pm2 reload` (graceful) instead of `pm2 restart` (immediate) to prevent SQLite database locking issues.

3. **Touch responsiveness** - The Chromium flags disable features that can interfere with touch input (pinch zoom, swipe navigation).

## Security Considerations

1. **Local network only** - The backend listens on `localhost:3000` by default. For access from other devices, configure firewall rules appropriately.

2. **Auto-updates disabled** - Chromium component updates are disabled (`--disable-component-update`) to prevent unexpected UI changes. Manually update Pi OS regularly.

3. **No remote access** - This kiosk setup does not configure SSH or remote access. Set up separately if needed.

## References

- labwc documentation: https://github.com/labwc/labwc
- Raspberry Pi OS documentation: https://www.raspberrypi.com/documentation/computers/os.html
- Chromium command-line switches: https://peter.sh/experiments/chromium-command-line-switches/

## Support

For issues specific to the kiosk setup, check:
1. `.planning/phases/01-infrastructure-setup/01-RESEARCH.md` - Research notes and known pitfalls
2. Restart logs: `~/familywall/logs/restart.log`
3. Systemd logs: `journalctl -u kiosk-restart.service`
