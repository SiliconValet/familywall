# Phase 1: Infrastructure Setup - Context

**Gathered:** 2026-03-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Configure Raspberry Pi for reliable 24/7 operation as kiosk appliance. Chromium runs full-screen on boot, restarts daily to prevent memory leaks, screen never blanks. Node.js backend runs under PM2 with memory limits and auto-restart. Project structure established as monorepo with client/server separation.

</domain>

<decisions>
## Implementation Decisions

### Pi Model & Kiosk Configuration
- Target hardware: Raspberry Pi 5
- Kiosk startup: Wayland autostart via wayfire.ini configuration (Pi 5 standard)
- Browser mode: Chromium with --kiosk flag (full-screen, no URL bar, no tabs)
- Cursor visibility: Hidden by default, but config option to show cursor for debugging
- Screen management: Disable blanking with `xset s off -dpms`

### Restart Timing & Behavior
- Daily restart time: 3am (low family activity period)
- Restart method: Graceful shutdown (SIGTERM, wait for clean exit)
- Restart UX: Display loading message during restart window
- Backend coordination: Node.js backend also restarts at 3am alongside browser
- Full system refresh: Both frontend and backend restart together for clean memory state

### PM2 Configuration
- Memory limit: 512MB triggers automatic backend restart
- Crash policy: Limited retries (restart up to 10 times on crash, then stop)
- Log handling: Daily rotation, keep last 7 days
- Startup method: PM2's built-in systemd service (`pm2 startup`)
- Process management: PM2 resurrects saved processes on boot

### Project Structure
- Repository type: Monorepo with client/ and server/ folders at root
- Database location: `server/data/familywall.db` (.gitignore'd)
- Build output: React build outputs to `server/public/` (Fastify serves static files)
- Code organization: Feature-based structure
  - `client/features/{chores,calendar,chess}/`
  - `server/features/{chores,calendar,chess}/`
  - Matches 2026 React best practices and research recommendations

### Claude's Discretion
- Exact Chromium flags beyond --kiosk (disable extensions, sync, etc.)
- Loading message implementation details (framebuffer vs X11 background)
- PM2 ecosystem.config.js structure and environment variables
- Folder substructure within features (components, hooks, services)
- Development vs production build configuration

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None yet — greenfield project
- GSD framework available in .claude/ directory

### Established Patterns
- Research recommends: React 19 + TypeScript, Fastify 5, better-sqlite3
- Research recommends: WAL mode for SQLite to reduce SD card wear
- Research recommends: Monorepo structure for localhost-only deployment

### Integration Points
- Chromium will load from localhost:3000 (or production port)
- PM2 will manage server process
- Wayfire compositor launches Chromium on boot
- SQLite database accessed by Fastify backend only (no direct client access)

</code_context>

<specifics>
## Specific Ideas

- "Hide cursor by default, but a config option can allow the display of the cursor" — cursor visibility should be toggleable for debugging
- Pi 5 uses Wayland/wayfire, not X11/LXDE — affects kiosk configuration approach
- Loading message during restart reduces confusion if family member walks by during 3am restart
- Feature-based organization matches research recommendation and supports parallel development later

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-infrastructure-setup*
*Context gathered: 2026-03-10*
