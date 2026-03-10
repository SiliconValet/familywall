# Phase 1: Infrastructure Setup - Research

**Researched:** 2026-03-10
**Domain:** Raspberry Pi 5 kiosk infrastructure with Wayland/labwc compositor, PM2 process management, and monorepo tooling
**Confidence:** HIGH

## Summary

Raspberry Pi 5 runs Raspberry Pi OS Bookworm which defaults to **labwc** Wayland compositor (not Wayfire as of late 2024). The kiosk setup involves configuring labwc's autostart file to launch Chromium with specific flags, disabling screen blanking via labwc idle settings, and scheduling daily 3am restarts via systemd timer. PM2 manages the Node.js backend with memory limits and crash recovery. The project uses npm workspaces for a simple monorepo structure (client/ and server/ folders at root).

**Critical correction:** User's CONTEXT.md mentions Wayfire, but Raspberry Pi OS switched to labwc as the default compositor in November 2024. Wayfire is no longer supported with updates on Raspberry Pi OS. This research uses labwc as the standard approach for 2026.

**Primary recommendation:** Use labwc autostart configuration for Chromium kiosk, systemd timer for scheduled restart (not PM2 cron_restart for browser), PM2 ecosystem.config.js for backend with 512MB memory limit, and npm workspaces for monorepo (avoiding overhead of Turborepo/pnpm for single-device deployment).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Target hardware:** Raspberry Pi 5
- **Kiosk startup:** Wayland autostart via wayfire.ini configuration (Pi 5 standard) — ⚠️ **UPDATE NEEDED:** Pi OS now uses labwc, not Wayfire
- **Browser mode:** Chromium with --kiosk flag (full-screen, no URL bar, no tabs)
- **Cursor visibility:** Hidden by default, but config option to show cursor for debugging
- **Screen management:** Disable blanking with `xset s off -dpms` — ⚠️ **UPDATE NEEDED:** xset is X11-only, use labwc idle settings for Wayland
- **Daily restart time:** 3am (low family activity period)
- **Restart method:** Graceful shutdown (SIGTERM, wait for clean exit)
- **Restart UX:** Display loading message during restart window
- **Backend coordination:** Node.js backend also restarts at 3am alongside browser
- **Full system refresh:** Both frontend and backend restart together for clean memory state
- **Memory limit:** 512MB triggers automatic backend restart
- **Crash policy:** Limited retries (restart up to 10 times on crash, then stop)
- **Log handling:** Daily rotation, keep last 7 days
- **Startup method:** PM2's built-in systemd service (`pm2 startup`)
- **Process management:** PM2 resurrects saved processes on boot
- **Repository type:** Monorepo with client/ and server/ folders at root
- **Database location:** `server/data/familywall.db` (.gitignore'd)
- **Build output:** React build outputs to `server/public/` (Fastify serves static files)
- **Code organization:** Feature-based structure
  - `client/features/{chores,calendar,chess}/`
  - `server/features/{chores,calendar,chess}/`

### Claude's Discretion
- Exact Chromium flags beyond --kiosk (disable extensions, sync, etc.)
- Loading message implementation details (framebuffer vs X11 background)
- PM2 ecosystem.config.js structure and environment variables
- Folder substructure within features (components, hooks, services)
- Development vs production build configuration

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Chromium runs in kiosk mode (full-screen, always-on) | labwc autostart configuration + Chromium flags section |
| INFRA-02 | Chromium auto-restarts daily to prevent memory leaks | systemd timer + graceful restart script section |
| INFRA-03 | Screen blanking is disabled for always-on display | labwc idle configuration section |
| INFRA-04 | Backend runs under PM2 with memory limits and auto-restart | PM2 ecosystem.config.js section |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Raspberry Pi OS Bookworm | 2024-11+ | Operating system | Default Pi OS with Wayland support, labwc compositor |
| labwc | Latest (bundled) | Wayland compositor | Official default compositor as of Nov 2024, replaced Wayfire |
| Chromium | Latest (apt) | Kiosk browser | Native touchscreen support, hardware acceleration, official Pi browser |
| PM2 | Latest (npm) | Process manager | Industry standard for Node.js production, built-in systemd integration |
| systemd | Built-in | Service & timer management | Native init system, reliable scheduling, journal logging |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| npm workspaces | Built-in (Node 16+) | Monorepo management | Simple client/server monorepo without multi-team complexity |
| BATS-Core | Latest (if testing) | Bash script testing | Infrastructure validation, systemd service verification |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| labwc | Wayfire | Wayfire no longer supported on Pi OS, higher resource usage, incompatible with Pi hardware direction |
| labwc | X11 + Openbox | X11 is legacy, Wayland provides better touchscreen support and security |
| npm workspaces | Turborepo/pnpm | Overkill for single-device deployment, adds build complexity |
| systemd timer | PM2 cron_restart | PM2 cron can't coordinate browser+backend restart, systemd timer more robust |
| PM2 | systemd service directly | PM2 provides superior process monitoring, memory limits, log rotation, and crash recovery |

**Installation:**
```bash
# OS and compositor (pre-installed on Pi OS Bookworm)
# Chromium (pre-installed, or):
sudo apt install chromium-browser

# PM2 (requires Node.js)
npm install -g pm2
```

## Architecture Patterns

### Recommended Project Structure
```
familywall/
├── client/                     # React frontend
│   ├── features/
│   │   ├── chores/
│   │   ├── calendar/
│   │   └── chess/
│   ├── shared/                # Shared UI components, hooks
│   ├── public/
│   └── package.json
├── server/                     # Fastify backend
│   ├── features/
│   │   ├── chores/
│   │   ├── calendar/
│   │   └── chess/
│   ├── shared/                # Shared services, utilities
│   ├── data/                  # SQLite database location
│   │   └── familywall.db      (.gitignored)
│   ├── public/                # React build output (served by Fastify)
│   ├── ecosystem.config.js    # PM2 configuration
│   └── package.json
├── scripts/                   # Infrastructure scripts
│   ├── restart-kiosk.sh       # Graceful browser restart
│   └── setup-kiosk.sh         # Initial configuration
├── package.json               # Root workspace config
└── README.md
```

### Pattern 1: labwc Kiosk Autostart
**What:** Configure labwc to launch Chromium in kiosk mode on boot using autostart file
**When to use:** All Raspberry Pi 5 kiosk deployments with Bookworm (default compositor)

**Configuration location:** `~/.config/labwc/autostart`

**Example:**
```bash
# Source: https://github.com/TOLDOTECHNIK/Raspberry-Pi-Kiosk-Display-System
# Chromium kiosk mode with touchscreen optimization
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
```

**Chromium flags explained:**
- `--kiosk`: Full-screen mode, no browser UI
- `--noerrdialogs`: Suppress crash recovery dialogs
- `--disable-infobars`: No "Chrome is being controlled" messages
- `--no-first-run`: Skip first-run experience
- `--disable-session-crashed-bubble`: No crash notifications
- `--ozone-platform=wayland`: Use Wayland backend (critical for labwc)
- `--enable-features=OverlayScrollbar`: Minimize scrollbar screen space
- `--disable-pinch`: Prevent accidental touchscreen zoom
- `--overscroll-history-navigation=0`: Disable swipe-to-navigate
- `--touch-events=enabled`: Enable multi-touch gestures

### Pattern 2: Screen Blanking Prevention (Wayland/labwc)
**What:** Disable screen blanking and DPMS via labwc idle configuration
**When to use:** Always-on kiosk displays

**Configuration location:** `~/.config/labwc/rc.xml` or labwc config

**Example:**
```xml
<!-- Source: https://forums.raspberrypi.com/viewtopic.php?t=362586 -->
<!-- In labwc config, disable idle timeouts -->
<idle>
  <timeout>0</timeout>
  <inhibitIdleHints>yes</inhibitIdleHints>
</idle>
```

**Alternative via GUI:**
Preferences → Raspberry Pi Configuration → Display tab → Screen Blanking: Off

⚠️ **IMPORTANT:** Do NOT use `xset s off -dpms` — this is X11-only and will not work with Wayland/labwc.

### Pattern 3: PM2 Ecosystem Configuration
**What:** Centralized PM2 configuration with memory limits, crash recovery, and log rotation
**When to use:** All Node.js backend deployments requiring production reliability

**File:** `server/ecosystem.config.js`

**Example:**
```javascript
// Source: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [{
    name: 'familywall-backend',
    script: './index.js',
    cwd: './server',
    instances: 1,
    autorestart: true,
    max_memory_restart: '512M',      // Restart if memory exceeds 512MB
    max_restarts: 10,                // Stop after 10 consecutive crashes
    min_uptime: '10s',               // Crash = restart within 10 seconds
    restart_delay: 4000,             // Wait 4s between restart attempts
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**PM2 startup configuration:**
```bash
# Generate systemd service for PM2
pm2 startup systemd -u pi --hp /home/pi

# Start app with ecosystem config
pm2 start ecosystem.config.js

# Save PM2 process list (resurrected on boot)
pm2 save
```

### Pattern 4: Scheduled Daily Restart (systemd timer)
**What:** Coordinate graceful restart of both Chromium and PM2 backend at 3am daily
**When to use:** Memory leak prevention, clean daily state

**Implementation:** systemd timer + shell script

**Timer file:** `/etc/systemd/system/kiosk-restart.timer`
```ini
# Source: https://oneuptime.com/blog/post/2026-03-04-systemd-timers-alternative-cron-rhel-9/view
[Unit]
Description=Daily kiosk restart at 3am

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

**Service file:** `/etc/systemd/system/kiosk-restart.service`
```ini
[Unit]
Description=Restart kiosk browser and backend

[Service]
Type=oneshot
User=pi
ExecStart=/home/pi/familywall/scripts/restart-kiosk.sh
```

**Restart script:** `scripts/restart-kiosk.sh`
```bash
#!/bin/bash
# Source: https://forums.raspberrypi.com/viewtopic.php?t=284538

# Gracefully stop Chromium
export DISPLAY=:0
pkill -SIGTERM chromium-browser

# Wait for clean exit (max 10 seconds)
for i in {1..10}; do
  if ! pgrep chromium-browser > /dev/null; then
    break
  fi
  sleep 1
done

# Force kill if still running
pkill -SIGKILL chromium-browser 2>/dev/null

# Restart PM2 backend (graceful reload)
pm2 reload ecosystem.config.js --update-env

# Wait for backend to be ready
sleep 3

# Restart Chromium
chromium-browser http://localhost:3000 \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --ozone-platform=wayland &
```

**Enable timer:**
```bash
sudo systemctl enable kiosk-restart.timer
sudo systemctl start kiosk-restart.timer
```

### Pattern 5: npm Workspaces Monorepo
**What:** Simple monorepo with client and server packages, shared dependencies at root
**When to use:** Single-repo deployments without multi-team coordination needs

**Root package.json:**
```json
{
  "name": "familywall",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "install:all": "npm install",
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "build:client": "npm run build --workspace=client"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**Key benefits:**
- Single `npm install` at root symlinks all workspace dependencies
- Shared devDependencies (TypeScript, ESLint) defined once at root
- Cross-package references work automatically (e.g., server imports shared types)
- No additional tooling overhead (Turborepo/pnpm/Nx)

### Pattern 6: Cursor Visibility Toggle
**What:** Hide cursor by default for kiosk, but allow showing via config for debugging
**When to use:** Touchscreen kiosks where cursor distracts from touch interface

**Implementation options:**

**Option A: Transparent cursor theme**
```bash
# Source: https://github.com/celly/transparent-xcursor
# Install transparent cursor
sudo apt install unclutter-xfixes  # Note: May not work on Wayland
```

**Option B: labwc configuration**
```bash
# Source: https://github.com/TOLDOTECHNIK/Raspberry-Pi-Kiosk-Display-System
# In labwc autostart, add HideCursor action
<action name="HideCursor"/>
```

**Option C: Wayfire hide-cursor plugin (if using Wayfire instead of labwc)**
```ini
# Source: https://github.com/WayfireWM/wayfire-plugins-extra
# In ~/.config/wayfire.ini
[core]
plugins = ... hide-cursor

[hide-cursor]
timeout = 0  # Hide immediately, 0 = always hidden
```

⚠️ **IMPORTANT:** labwc is now standard for Pi 5. Traditional X11 cursor-hiding tools (unclutter) do NOT work with Wayland.

### Anti-Patterns to Avoid
- **Using PM2 cron_restart for browser:** PM2 can't manage browser processes; use systemd timer instead
- **Using xset for screen blanking:** X11-only command; use labwc idle configuration for Wayland
- **Configuring wayfire.ini:** Wayfire is deprecated on Pi OS; use labwc autostart instead
- **SIGKILL without SIGTERM:** Always try graceful shutdown first to prevent database corruption
- **Running browser as root:** Security risk; run as pi user with proper DISPLAY export

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Process monitoring | Custom watchdog scripts | PM2 | Memory limits, log rotation, crash recovery, systemd integration |
| Task scheduling | Custom cron scripts | systemd timers | Better logging (journalctl), dependency management, persistent missed runs |
| Monorepo tooling | Custom symlink scripts | npm workspaces | Built-in, zero-config, handles dependency hoisting automatically |
| Browser crash recovery | Custom PID tracking | Chromium flags + systemd | Browser has built-in session management, systemd handles process lifecycle |
| Log rotation | Custom logrotate config | PM2 log management | Automatic daily rotation, configurable retention, per-app logs |

**Key insight:** Infrastructure tooling has matured significantly. PM2, systemd, and npm workspaces solve complex edge cases (log file locking, graceful shutdown coordination, dependency deduplication) that custom scripts will get wrong. Use battle-tested tools.

## Common Pitfalls

### Pitfall 1: Wayfire/labwc Confusion
**What goes wrong:** User configures `~/.config/wayfire.ini` expecting kiosk to start, but nothing happens
**Why it happens:** Raspberry Pi OS switched from Wayfire to labwc as default compositor in November 2024
**How to avoid:** Always use `~/.config/labwc/autostart` for kiosk configuration on current Pi OS
**Warning signs:** `ls ~/.config/wayfire.ini` exists but kiosk doesn't start on boot

### Pitfall 2: X11 Commands on Wayland System
**What goes wrong:** Running `xset s off -dpms` has no effect on screen blanking
**Why it happens:** xset is X11-only; Wayland uses different display management
**How to avoid:** Use labwc idle configuration or GUI settings for screen blanking control
**Warning signs:** Commands execute without error but screen still blanks after timeout

### Pitfall 3: DISPLAY Variable in systemd Services
**What goes wrong:** systemd service tries to launch Chromium but fails with "cannot open display"
**Why it happens:** systemd services don't inherit user session environment variables
**How to avoid:** Explicitly set `Environment="DISPLAY=:0"` in service file or export in script
**Warning signs:** Manual script execution works, but systemd service fails

### Pitfall 4: PM2 Process Resurrection Timing
**What goes wrong:** PM2 starts backend before network is ready, database mount fails
**Why it happens:** PM2 systemd service starts early in boot sequence
**How to avoid:** Configure PM2 service with `After=network-online.target` and `Wants=network-online.target`
**Warning signs:** Backend starts on manual `pm2 start` but fails on boot

### Pitfall 5: Chromium Profile Corruption on Hard Kill
**What goes wrong:** Chromium shows "crashed" notification after forced restarts
**Why it happens:** SIGKILL prevents Chromium from flushing profile data to disk
**How to avoid:** Always send SIGTERM first, wait up to 10 seconds, only then use SIGKILL as fallback
**Warning signs:** Crash recovery dialogs appear after scheduled restarts

### Pitfall 6: PM2 Cron Config Caching
**What goes wrong:** Updating `cron_restart` in ecosystem.config.js has no effect
**Why it happens:** PM2 caches cron configuration in memory on first start
**How to avoid:** Use `pm2 delete app-name` then `pm2 start ecosystem.config.js` after config changes
**Warning signs:** `pm2 show app-name` displays old cron pattern after config update

### Pitfall 7: Monorepo Dependency Hoisting Issues
**What goes wrong:** Server imports client dependency that wasn't declared in server/package.json
**Why it happens:** npm workspaces hoist dependencies to root, allowing phantom dependencies
**How to avoid:** Explicitly declare all dependencies in workspace package.json files, not just root
**Warning signs:** Works locally but fails in CI/production with "module not found"

### Pitfall 8: SQLite Database Locking During Restart
**What goes wrong:** Backend restart fails with "database is locked" error
**Why it happens:** Old process hasn't fully released database connection when new process starts
**How to avoid:** Use `pm2 reload` (graceful) instead of `pm2 restart` (immediate), ensure WAL mode enabled
**Warning signs:** Restart succeeds on second attempt but fails on first

## Code Examples

Verified patterns from official sources:

### Example 1: Complete labwc Autostart Configuration
```bash
# File: ~/.config/labwc/autostart
# Source: https://github.com/TOLDOTECHNIK/Raspberry-Pi-Kiosk-Display-System

# Wait for compositor to be ready
sleep 2

# Launch Chromium in kiosk mode
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
```

### Example 2: PM2 Ecosystem with All Production Settings
```javascript
// File: server/ecosystem.config.js
// Source: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [{
    name: 'familywall-backend',
    script: './index.js',
    cwd: '/home/pi/familywall/server',

    // Instance management
    instances: 1,
    exec_mode: 'fork',

    // Restart policies
    autorestart: true,
    max_memory_restart: '512M',
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,

    // Logging
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_PATH: './data/familywall.db'
    },

    // Process control
    kill_timeout: 5000,  // Wait 5s for graceful shutdown before SIGKILL
    listen_timeout: 3000,
    shutdown_with_message: false
  }]
};
```

### Example 3: Complete Restart Script with Error Handling
```bash
#!/bin/bash
# File: scripts/restart-kiosk.sh
# Source: Combined from multiple Pi forum discussions

set -euo pipefail

LOG_FILE="/home/pi/familywall/logs/restart.log"

log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log "Starting kiosk restart"

# Set display for user pi
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority

# Gracefully stop Chromium
log "Stopping Chromium (SIGTERM)"
pkill -SIGTERM chromium-browser || true

# Wait for clean exit (max 10 seconds)
for i in {1..10}; do
  if ! pgrep chromium-browser > /dev/null; then
    log "Chromium stopped gracefully"
    break
  fi
  sleep 1
done

# Force kill if still running
if pgrep chromium-browser > /dev/null; then
  log "Chromium didn't stop gracefully, force killing"
  pkill -SIGKILL chromium-browser || true
fi

# Reload PM2 backend
log "Reloading PM2 backend"
pm2 reload ecosystem.config.js --update-env

# Wait for backend to be ready
log "Waiting for backend startup"
sleep 3

# Verify backend is running
if ! pm2 status | grep -q "online"; then
  log "ERROR: Backend failed to start"
  exit 1
fi

# Restart Chromium
log "Starting Chromium"
chromium-browser http://localhost:3000 \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --disable-session-crashed-bubble \
  --ozone-platform=wayland &

log "Kiosk restart complete"
```

### Example 4: npm Workspaces Root Configuration
```json
{
  "name": "familywall",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "install:all": "npm install",
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "dev": "npm run dev:server & npm run dev:client",
    "build:client": "npm run build --workspace=client",
    "build": "npm run build:client",
    "start": "cd server && pm2 start ecosystem.config.js"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0"
  }
}
```

### Example 5: Verify systemd Timer Status
```bash
# Source: systemd documentation
# Check if timer is active
systemctl status kiosk-restart.timer

# View timer schedule
systemctl list-timers --all | grep kiosk

# View last restart logs
journalctl -u kiosk-restart.service -n 50

# Manually trigger restart (for testing)
sudo systemctl start kiosk-restart.service
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Wayfire compositor | labwc compositor | November 2024 | Config files moved from `~/.config/wayfire.ini` to `~/.config/labwc/autostart` |
| X11 + Openbox kiosk | Wayland + labwc | Bookworm release (2023) | Better touchscreen support, security, but different screen blanking config |
| cron for scheduling | systemd timers | Ongoing adoption | Better logging, dependency management, persistent catch-up |
| manual npm linking | npm workspaces | Node 16+ (2021) | Zero-config monorepo, built-in dependency hoisting |
| X11 cursor hiding (unclutter) | labwc HideCursor action | With Wayland adoption | X11 tools don't work on Wayland systems |

**Deprecated/outdated:**
- **Wayfire:** No longer supported on Raspberry Pi OS as of November 2024 — use labwc
- **xset commands:** X11-only, don't work with Wayland — use compositor-specific idle settings
- **lxde-pi-rc.xml:** X11 autostart config — use labwc autostart instead
- **unclutter:** X11 cursor hiding — use labwc HideCursor or Chromium CSS cursor:none

## Open Questions

1. **Loading message implementation during restart**
   - What we know: User wants loading message during 3am restart window
   - What's unclear: Best approach for Wayland framebuffer message vs HTML page
   - Recommendation: Start with simple HTML loading page served by backend before main app; framebuffer text requires Plymouth or fbv which adds complexity

2. **Cursor visibility toggle mechanism**
   - What we know: User wants cursor hidden by default but toggleable for debugging
   - What's unclear: Toggle via config file edit or runtime mechanism (environment variable, API endpoint)
   - Recommendation: Config file approach (labwc rc.xml) is simplest; runtime toggle requires compositor restart

3. **Feature folder substructure**
   - What we know: Feature-based organization chosen (chores/, calendar/, chess/)
   - What's unclear: Exact subfolder structure within features (components/, hooks/, etc.)
   - Recommendation: Defer to Phase 2 planning; standard would be features/chores/{components,hooks,services,types}

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | BATS-Core (Bash Automated Testing System) |
| Config file | None — tests in tests/ directory, run with `bats tests/` |
| Quick run command | `bats tests/infrastructure/*.bats` |
| Full suite command | `bats tests/` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Chromium runs in kiosk mode on boot | integration | `bats tests/infrastructure/test_chromium_kiosk.bats -x` | ❌ Wave 0 |
| INFRA-02 | Chromium auto-restarts daily at 3am | integration | `bats tests/infrastructure/test_scheduled_restart.bats -x` | ❌ Wave 0 |
| INFRA-03 | Screen blanking disabled | integration | `bats tests/infrastructure/test_screen_blanking.bats -x` | ❌ Wave 0 |
| INFRA-04 | PM2 manages backend with limits | integration | `bats tests/infrastructure/test_pm2_backend.bats -x` | ❌ Wave 0 |

**Test approach:**
- BATS tests verify systemd services, timers, and process states
- Tests run on actual Pi hardware (not mocked)
- Tests check configuration files, service status, and process behavior
- Example: Check `systemctl is-enabled kiosk-restart.timer` returns "enabled"

### Sampling Rate
- **Per task commit:** `bats tests/infrastructure/*.bats` (~5-10 seconds)
- **Per wave merge:** `bats tests/` (full suite, ~30 seconds)
- **Phase gate:** Full suite green + manual verification on Pi hardware before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/infrastructure/test_chromium_kiosk.bats` — Verify labwc autostart config, Chromium process running, --kiosk flag present
- [ ] `tests/infrastructure/test_scheduled_restart.bats` — Verify systemd timer enabled, service file exists, restart script executable
- [ ] `tests/infrastructure/test_screen_blanking.bats` — Verify labwc idle config, screen doesn't blank after timeout
- [ ] `tests/infrastructure/test_pm2_backend.bats` — Verify PM2 running, ecosystem.config.js valid, memory limit set, process resurrects on reboot
- [ ] `tests/helpers.bash` — Shared BATS helper functions

**BATS installation:**
```bash
# Install BATS-Core
sudo apt install bats

# Or via npm
npm install -g bats
```

## Sources

### Primary (HIGH confidence)
- [PM2 Ecosystem File Documentation](https://pm2.keymetrics.io/docs/usage/application-declaration/) - Complete ecosystem.config.js reference
- [PM2 Restart Strategies](https://pm2.keymetrics.io/docs/usage/restart-strategies/) - Memory limits, cron restart, exponential backoff
- [Raspberry Pi Kiosk Display System (GitHub)](https://github.com/TOLDOTECHNIK/Raspberry-Pi-Kiosk-Display-System) - labwc configuration examples
- [Raspberry Pi OS Official Announcement](https://www.raspberrypi.com/news/a-new-release-of-raspberry-pi-os/) - labwc as default compositor
- [Hackaday: Raspberry Pi OS Wayland Transition](https://hackaday.com/2024/10/28/raspberry-pi-oss-wayland-transition-completed-with-switch-to-labwc/) - Wayfire → labwc switch context

### Secondary (MEDIUM confidence)
- [systemd Timers Tutorial (OneUpTime 2026)](https://oneuptime.com/blog/post/2026-03-04-systemd-timers-alternative-cron-rhel-9/view) - Modern systemd timer patterns
- [npm Workspaces Guide (Medium 2026)](https://medium.com/@sanjaytomar717/the-ultimate-guide-to-building-a-monorepo-in-2025-sharing-code-like-the-pros-ee4d6d56abaa) - Monorepo best practices
- [Raspberry Pi Forums: Wayfire Autostart](https://forums.raspberrypi.com/viewtopic.php?t=363992) - Community kiosk configurations
- [BATS-Core GitHub](https://github.com/bats-core/bats-core) - Testing framework documentation
- [SQLite WAL Blog](https://blog.pecar.me/sqlite-wal/) - WAL mode benefits and tradeoffs

### Tertiary (LOW confidence, flagged for validation)
- [Raspberry Pi Forums: Screen Blanking](https://forums.raspberrypi.com/viewtopic.php?t=362586) - User-reported labwc idle workarounds (needs official doc verification)
- [GitHub: Wayfire Plugins Extra](https://github.com/WayfireWM/wayfire-plugins-extra) - Cursor hiding plugin (deprecated for labwc users)
- Various Raspberry Pi forum threads for troubleshooting edge cases

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official Pi OS documentation, PM2 official docs, npm built-in features
- Architecture: HIGH - Verified labwc configurations, PM2 ecosystem examples from official docs
- Pitfalls: MEDIUM - Combination of official docs and community forum experiences
- Wayland/labwc transition: HIGH - Multiple official sources confirm November 2024 switch
- Testing approach: MEDIUM - BATS is standard for bash testing, but infrastructure test patterns based on general practices

**Research date:** 2026-03-10
**Valid until:** 2026-06-10 (90 days) — Infrastructure tooling is relatively stable, but Raspberry Pi OS updates quarterly

---

**⚠️ CRITICAL NOTE FOR PLANNER:**
User's CONTEXT.md references Wayfire, but this is outdated. Raspberry Pi OS Bookworm switched to **labwc** as the default compositor in November 2024. All configuration must use labwc, not Wayfire. Similarly, xset commands won't work on Wayland — use labwc-specific configuration instead.
