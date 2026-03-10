---
phase: 01-infrastructure-setup
plan: 01
subsystem: infrastructure
tags: [monorepo, npm-workspaces, pm2, fastify, react, vite]
completed: 2026-03-10T20:38:50Z
duration_minutes: 3.5

dependency_graph:
  requires: []
  provides:
    - npm-workspaces-monorepo
    - pm2-process-management
    - fastify-backend-server
    - react-frontend-build
    - health-check-endpoint
  affects:
    - all-future-development

tech_stack:
  added:
    - npm workspaces for monorepo management
    - Fastify ^5.0.0 for backend server
    - @fastify/static ^8.0.0 for static file serving
    - better-sqlite3 ^11.0.0 for database
    - React ^19.0.0 for frontend
    - Vite ^5.0.0 for frontend build
    - PM2 for process management
  patterns:
    - Monorepo with npm workspaces (no Turborepo/pnpm)
    - Client builds to server/public/ directory
    - Server serves both API and static files
    - PM2 manages backend with memory limits and crash recovery

key_files:
  created:
    - package.json (root workspace config)
    - client/package.json
    - server/package.json
    - server/ecosystem.config.js
    - server/index.js
    - client/index.html
    - client/src/main.tsx
    - client/src/App.tsx
    - client/vite.config.ts
    - .gitignore
    - server/data/.gitkeep
    - server/logs/.gitkeep
  modified:
    - package-lock.json

decisions:
  - decision: Use npm workspaces instead of Turborepo or pnpm
    rationale: Simple 2-package monorepo doesn't need complex tooling overhead
    alternatives: Turborepo (too complex), pnpm workspaces (unnecessary)
  - decision: Use @fastify/static v8 instead of v7
    rationale: v7 incompatible with Fastify v5, v8 required for compatibility
    alternatives: Downgrade Fastify to v4 (would lose v5 performance improvements)
  - decision: Use better-sqlite3 over node-sqlite3
    rationale: Synchronous API, faster, more reliable for single-threaded Pi deployment
    alternatives: node-sqlite3 (async, slower, more complex)
  - decision: Client builds to server/public/ directory
    rationale: Single deployment artifact, server serves both API and static files
    alternatives: Separate deployments (more complex), CDN (unnecessary for kiosk)

metrics:
  tasks_completed: 3
  tasks_planned: 3
  commits: 3
  files_created: 12
  files_modified: 2
  dependencies_added: 8
---

# Phase 1 Plan 1: Monorepo Foundation with PM2 Management Summary

**One-liner:** npm workspaces monorepo with Fastify backend serving React client, managed by PM2 with 512MB memory limits and crash recovery.

## Overview

Established the foundational project structure as a simple npm workspaces monorepo with a Fastify backend and React frontend. The backend is configured for PM2 management with memory limits and automatic crash recovery, ready for 24/7 kiosk deployment on Raspberry Pi.

## Tasks Completed

### Task 1: Create monorepo structure with npm workspaces
**Status:** Complete
**Commit:** 9c7c408

Created root package.json with npm workspaces configuration pointing to "client" and "server" directories. Installed shared TypeScript and Node.js type definitions at root level. Configured client with React 19, Vite, and necessary plugins. Configured server with Fastify, @fastify/static, and better-sqlite3. Added .gitignore to exclude node_modules, build outputs, logs, and database files.

**Verification:** Single `npm install` at root successfully installed all workspace dependencies. Both client and server node_modules accessible through npm's workspace hoisting.

**Files:**
- package.json
- client/package.json
- server/package.json
- .gitignore
- package-lock.json

### Task 2: Create PM2 ecosystem configuration with memory limits
**Status:** Complete
**Commit:** 2dc3d52

Created server/ecosystem.config.js with production-ready PM2 configuration following best practices. Configured 512MB memory limit (user requirement), maximum 10 restarts with 10-second minimum uptime threshold, 4-second restart delay, log output to ./logs/ directory with timestamps, production environment variables (PORT, DB_PATH), and 5-second graceful shutdown timeout.

**Verification:** Configuration file loads successfully and contains required 512MB memory limit, 10 max restarts, and all production settings.

**Files:**
- server/ecosystem.config.js

### Task 3: Create Fastify backend serving static React build
**Status:** Complete
**Commit:** d4b187d

Created Fastify server with logging, static file serving from ./public directory, better-sqlite3 database initialization with WAL mode, /api/health endpoint for monitoring, and graceful shutdown handlers for SIGTERM/SIGINT. Created minimal React app with modern createRoot API and configured Vite to build output to ../server/public directory. Added .gitkeep files to preserve data/ and logs/ directory structure in git.

**Verification:** Client builds successfully to server/public/index.html. Server starts on port 3000, responds to /api/health with JSON status, and serves static React app from root path.

**Files:**
- server/index.js
- server/data/.gitkeep
- server/logs/.gitkeep
- client/index.html
- client/src/main.tsx
- client/src/App.tsx
- client/vite.config.ts

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed @fastify/static version incompatibility**
- **Found during:** Task 3 - Server startup verification
- **Issue:** @fastify/static v7.0.0 incompatible with Fastify v5.8.2, throwing FST_ERR_PLUGIN_VERSION_MISMATCH error
- **Fix:** Updated server/package.json to use @fastify/static ^8.0.0 which supports Fastify v5
- **Files modified:** server/package.json, package-lock.json
- **Commit:** d4b187d (included in Task 3 commit)
- **Rationale:** Blocking issue preventing server startup. Version 8.x of @fastify/static adds Fastify v5 support while maintaining same API.

**2. [Rule 2 - Critical] Updated .gitignore to preserve directory structure**
- **Found during:** Task 3 - Committing .gitkeep files
- **Issue:** .gitignore completely excluded server/logs/ directory, preventing .gitkeep files from being tracked
- **Fix:** Changed blanket directory exclusions to specific file pattern exclusions (*.log instead of logs/, *.db instead of data/)
- **Files modified:** .gitignore
- **Commit:** d4b187d (included in Task 3 commit)
- **Rationale:** Critical for deployment - server expects data/ and logs/ directories to exist, .gitkeep files preserve structure.

## Verification Results

**Full stack verification passed:**
- Root `npm install` successfully installs all workspace dependencies
- `npm run build:client` creates server/public/index.html with React app bundle
- Server starts on port 3000 without errors
- GET /api/health returns `{"status":"ok","timestamp":...}`
- GET / serves React app HTML with "FamilyWall" title
- Graceful shutdown works (SIGTERM/SIGINT handlers implemented)

**PM2 verification:**
- PM2 configuration valid with correct memory limits
- Production deployment verification deferred to Pi deployment (PM2 not installed on dev machine)

**Success criteria met:**
- [x] Single `npm install` at root installs all workspace dependencies
- [x] PM2 ecosystem.config.js created with 512MB memory limit
- [x] Server responds to http://localhost:3000 with React app HTML
- [x] Server responds to http://localhost:3000/api/health with JSON status
- [x] Graceful shutdown handlers implemented for SIGTERM/SIGINT

## Architecture Decisions

### Monorepo Structure
Chose npm workspaces over Turborepo or pnpm workspaces. The project has only 2 packages (client and server) with no multi-team coordination needs or complex build orchestration requirements. npm workspaces (built into Node 16+) provides dependency hoisting and workspace scripts without additional tooling overhead.

### Fastify Version Compatibility
Initially specified @fastify/static ^7.0.0 per plan, but discovered incompatibility with Fastify ^5.0.0 during server startup. Upgraded to @fastify/static ^8.0.0 which adds Fastify v5 support. This maintains the same API while leveraging Fastify v5 performance improvements.

### Build Output Location
Configured Vite to build directly to server/public/ directory instead of separate deployment step. This creates a single deployment artifact and simplifies the production deployment - only the server directory needs to be deployed to the Pi.

### Database Setup
Initialized better-sqlite3 with WAL mode for better concurrency and crash recovery. Created database connection early in server startup to fail fast if there are DB issues.

## Next Steps

1. **Phase 1, Plan 2:** Kiosk setup automation with systemd service and display configuration
2. **Phase 1, Plan 3:** SQLite schema creation for users, chores, and schedule data
3. **Phase 2:** Core chore management features

## Notes

- PM2 production testing will occur during Pi deployment (Phase 1, Plan 2)
- Server currently creates empty database file - schema will be added in Phase 1, Plan 3
- React app is minimal placeholder - UI will be built in Phase 2
- Build warnings about outDir location are expected behavior (building outside project root)
- npm audit shows 2 moderate vulnerabilities - reviewing and addressing in future plan if necessary

## Files Changed

**Created:**
- package.json (root workspace config)
- client/package.json (React + Vite dependencies)
- server/package.json (Fastify + SQLite dependencies)
- server/ecosystem.config.js (PM2 configuration)
- server/index.js (Fastify server entry point)
- client/index.html (HTML entry point)
- client/src/main.tsx (React app entry)
- client/src/App.tsx (Root component)
- client/vite.config.ts (Build configuration)
- .gitignore (ignored files/directories)
- server/data/.gitkeep (preserve data directory)
- server/logs/.gitkeep (preserve logs directory)

**Modified:**
- package-lock.json (dependency tree)

**Commits:**
1. 9c7c408 - feat(01-01): create monorepo structure with npm workspaces
2. 2dc3d52 - feat(01-01): add PM2 ecosystem config with memory limits
3. d4b187d - feat(01-01): create Fastify backend serving static React build

## Self-Check

Verifying all claimed files and commits exist:

**Files:**
- ✓ package.json
- ✓ client/package.json
- ✓ server/package.json
- ✓ server/ecosystem.config.js
- ✓ server/index.js
- ✓ client/index.html
- ✓ client/src/main.tsx
- ✓ client/src/App.tsx
- ✓ client/vite.config.ts
- ✓ .gitignore
- ✓ server/data/.gitkeep
- ✓ server/logs/.gitkeep

**Commits:**
- ✓ 9c7c408 - Task 1: Create monorepo structure
- ✓ 2dc3d52 - Task 2: PM2 configuration
- ✓ d4b187d - Task 3: Fastify backend and React app

**Result:** PASSED - All files created and all commits exist in repository.
