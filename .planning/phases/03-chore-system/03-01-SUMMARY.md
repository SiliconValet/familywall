---
phase: 03-chore-system
plan: 01
subsystem: backend
tags: [chore-api, recurring-chores, cron-job, sqlite-schema]
dependency_graph:
  requires: [02-foundation-family-management]
  provides: [chore-crud-api, recurring-generation, completion-tracking]
  affects: [chore-ui]
tech_stack:
  added: [node-cron, date-fns]
  patterns: [fastify-routes, sqlite-schema, cron-scheduling, json-text-storage]
key_files:
  created:
    - server/db.js (chores table schema)
    - server/routes/chores.js
    - server/jobs/recurring-chores.js
    - server/utils/chore-generator.js
  modified:
    - server/index.js (route registration, cron initialization)
    - server/package.json (dependencies)
decisions:
  - Use TEXT JSON storage for recurrence_config (debuggable, sufficient for low-frequency queries)
  - Schedule cron at 12:01am daily to avoid midnight edge cases
  - Auto-complete missed recurring chores with status='auto_completed' and completed_by=NULL
  - Default completed_by to assignee for smooth UX, allow override via API
  - Use SQLite localtime for date filtering to match device timezone
  - Generated recurring instances have is_recurring=0 and recurrence_config=NULL
metrics:
  duration_seconds: 206
  tasks_completed: 2
  files_created: 4
  files_modified: 3
  commits: 2
  completed_at: "2026-03-23T11:09:19Z"
---

# Phase 03 Plan 01: Chore System Backend Summary

**One-liner:** Complete chore system backend with SQLite schema, 7-endpoint REST API (CRUD, completion, undo, stats, summary), recurring chore generation via midnight cron job, and auto-completion of missed chores.

## What Was Built

Built the complete server-side foundation for the chore management system:

1. **Database Schema**: Extended SQLite with chores table (13 columns, 4 indexes, 3 foreign keys) supporting recurring chores via is_recurring flag and recurrence_config JSON TEXT column. Status enum includes 'active', 'completed', and 'auto_completed' for distinguishing user vs system completions.

2. **REST API (7 endpoints)**:
   - GET /api/chores (daily/weekly view filtering via SQLite date functions)
   - POST /api/chores (create with optional recurring config)
   - PUT /api/chores/:id (update title, assignee, points, recurring settings)
   - PUT /api/chores/:id/complete (default-to-assignee per D-06)
   - PUT /api/chores/:id/undo (revert completion)
   - DELETE /api/chores/:id (remove chore)
   - GET /api/chores/stats (completion counts per family member)
   - GET /api/chores/summary (weekly grid of recurring chore completions)

3. **Recurring Chore Generation**: node-cron job runs at 12:01am daily, generating new instances for scheduled recurring chores. Auto-completes yesterday's incomplete instances with status='auto_completed' per D-23.

4. **Recurrence Engine**: shouldGenerateToday utility handles 4 frequency types (daily, weekly, custom days, interval-based) using date-fns for date calculations.

## Key Decisions Made

**Schema Design:**
- Chose TEXT JSON over JSONB for recurrence_config (more debuggable, sufficient for low-frequency queries)
- parent_chore_id links generated instances to recurring templates
- Generated instances have is_recurring=0 to distinguish templates from instances

**API Design:**
- Default completed_by to assignee for smooth UX, allow override for "someone else did it" tracking
- Daily/weekly filtering uses SQLite DATE() with 'localtime' modifier to match device timezone
- Weekly view uses Sunday-Saturday window per D-12

**Cron Scheduling:**
- 12:01am instead of midnight to avoid edge cases with date boundary queries
- Auto-complete missed chores before generating new ones to maintain completion history

## Files Changed

**Created:**
- `server/db.js` — Added chores table schema with recurrence support
- `server/routes/chores.js` — 7-endpoint REST API for chore CRUD and completion
- `server/jobs/recurring-chores.js` — Midnight cron job logic for recurring generation
- `server/utils/chore-generator.js` — shouldGenerateToday utility for recurrence patterns

**Modified:**
- `server/index.js` — Registered chore routes, initialized cron job
- `server/package.json` — Added node-cron and date-fns dependencies

## Testing Verification

**Automated checks passed:**
- ✅ Chores table exists with all 13 columns
- ✅ All indexes created (status, assigned_to, created_at, recurring)
- ✅ Foreign keys enforced (assigned_to, completed_by, parent_chore_id)
- ✅ All route modules load without errors
- ✅ Database CRUD operations work (insert, update, complete)
- ✅ Server starts and cron job initializes ("Recurring chore cron job scheduled")

**Manual verification:**
- Server startup logs show cron job scheduled message
- No import or syntax errors during module loading

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all endpoints are fully implemented with complete business logic.

## Integration Points

**Upstream dependencies:**
- Phase 02 family_members table (foreign key for assigned_to and completed_by)
- Phase 02 Fastify route plugin pattern
- Phase 02 SQLite schema initialization pattern

**Downstream consumers:**
- Phase 03-02 chore UI will consume all 7 API endpoints
- Phase 03-03 recurring chore setup form will use POST/PUT with recurrence_config
- Phase 03-04 weekly summary report will use GET /api/chores/summary

## Commits

- `c981f61`: feat(03-chore-system-01): add chores table schema and server dependencies
- `4a4b4c0`: feat(03-chore-system-01): add chore REST API routes, cron job, and server integration

## Self-Check: PASSED

**Files created verification:**
- ✅ server/db.js contains chores table
- ✅ server/routes/chores.js exists
- ✅ server/jobs/recurring-chores.js exists
- ✅ server/utils/chore-generator.js exists

**Commits verification:**
- ✅ c981f61 exists in git log
- ✅ 4a4b4c0 exists in git log

**Functional verification:**
- ✅ Database schema initialization successful
- ✅ All modules import without errors
- ✅ Server starts and registers cron job
- ✅ CRUD operations work correctly

All claims verified. Ready to proceed with state updates.
