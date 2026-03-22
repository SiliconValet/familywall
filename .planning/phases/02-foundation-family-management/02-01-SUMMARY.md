---
phase: 02-foundation-family-management
plan: 01
subsystem: backend-api
tags: [database, rest-api, authentication, sqlite, fastify]
dependencies:
  requires: [01-04-PLAN.md]
  provides: [family-crud-api, pin-auth-api, database-schema]
  affects: []
tech_stack:
  added: [bcryptjs]
  patterns: [fastify-route-plugins, json-schema-validation, bcrypt-hashing, prepared-statements]
key_files:
  created: [server/db.js, server/routes/family.js, server/routes/auth.js]
  modified: [server/index.js, server/package.json]
decisions: []
metrics:
  duration_seconds: 132
  duration_minutes: 2
  completed_date: "2026-03-22T23:04:33Z"
  tasks_completed: 2
  files_created: 3
  files_modified: 2
  commits: 2
---

# Phase 02 Plan 01: Backend Database and API Summary

**One-liner:** SQLite schema with family_members and settings tables, plus complete REST API for family CRUD operations and bcrypt-hashed PIN authentication.

## Objective

Build the complete backend: database schema (family_members + settings tables), family CRUD API routes, and PIN authentication routes. Establishes the data layer and API that the frontend will consume. All server-side logic for Phase 2 lives here.

## What Was Built

### Database Schema (server/db.js)
- **family_members table:** id, name, created_at, updated_at with auto-timestamps
- **settings table:** key-value store for configuration (parental_pin)
- **Default PIN seeding:** 1234 hashed with bcrypt cost 13 on first initialization
- **Index:** idx_family_name for alphabetical sorting performance

### Family CRUD API (server/routes/family.js)
- **GET /api/family:** Returns all family members sorted alphabetically (COLLATE NOCASE)
- **POST /api/family:** Creates family member with name validation (1-100 chars, trimmed)
- **PUT /api/family/:id:** Updates member name with 404 handling if not found
- **DELETE /api/family/:id:** Deletes member with 404 handling if not found
- All routes use JSON Schema validation for request/response type safety

### PIN Authentication API (server/routes/auth.js)
- **POST /api/auth/verify:** Verifies PIN with bcrypt.compare (unlimited retries per D-03)
- **PUT /api/settings/pin:** Changes PIN requiring current PIN verification (per D-02)
- Uses bcrypt async methods with cost factor 13 (per D-04)
- Secure upsert pattern with ON CONFLICT for settings updates

### Integration (server/index.js)
- Extracted database initialization to modular db.js
- Registered API routes before static file serving (route priority)
- Maintained graceful shutdown with database cleanup

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

### Automated API Tests
All 11 behavioral tests passed:
1. ✓ POST /api/family creates member and returns 201
2. ✓ GET /api/family returns alphabetically sorted array
3. ✓ PUT /api/family/:id updates name successfully
4. ✓ DELETE /api/family/:id returns 204 on success
5. ✓ DELETE /api/family/:id returns 404 for missing member
6. ✓ POST /api/auth/verify returns {valid: true} for correct PIN (1234)
7. ✓ POST /api/auth/verify returns {valid: false} for wrong PIN
8. ✓ PUT /api/settings/pin returns 403 for incorrect current PIN
9. ✓ PUT /api/settings/pin returns {success: true} for valid change
10. ✓ New PIN verifies successfully after change
11. ✓ Database cleanup completes without errors

### Live Server Tests
- Server starts without errors on port 3000
- All endpoints respond correctly via curl
- JSON Schema validation working (rejects invalid requests)
- Graceful shutdown closes database connection properly

## Technical Decisions

**Followed plan decisions:**
- **D-01:** Default PIN 1234 seeded on first run (verified working)
- **D-02:** PIN change requires current PIN verification (implemented in PUT /api/settings/pin)
- **D-03:** Unlimited PIN retry attempts (no lockout logic)
- **D-04:** bcrypt cost factor 13 (~250-400ms per verification)
- **D-08:** Alphabetical sorting with COLLATE NOCASE for case-insensitive ordering

**Implementation choices (Claude's discretion):**
- Used async bcrypt methods (bcrypt.compare/hash) instead of sync to avoid blocking event loop
- Trimmed name input before storage to prevent whitespace-only names
- Returned full row data (including timestamps) on POST/PUT for immediate client use
- Used prepared statements throughout for SQL injection prevention and query plan caching

## Known Stubs

None. All endpoints are fully implemented with real database operations and bcrypt hashing.

## Requirements Fulfilled

- **FAM-01:** User can add family member with name ✓ (POST /api/family)
- **FAM-02:** User can edit family member name ✓ (PUT /api/family/:id)
- **FAM-03:** User can delete family member ✓ (DELETE /api/family/:id with confirmation on frontend)
- **FAM-04:** User can view list of all family members ✓ (GET /api/family)
- **FAM-05:** Parental actions require PIN authentication ✓ (POST /api/auth/verify)
- **FAM-06:** User can set/change parental PIN in settings ✓ (PUT /api/settings/pin)

## Files Modified

### Created
- `server/db.js` — Database module with schema initialization and default PIN seeding
- `server/routes/family.js` — Family CRUD endpoints (GET/POST/PUT/DELETE /api/family)
- `server/routes/auth.js` — PIN authentication endpoints (verify, update)

### Modified
- `server/index.js` — Import db module, register route plugins before static files
- `server/package.json` — Added bcryptjs dependency
- `package-lock.json` — Dependency lock file updated

## Commits

| Hash | Message | Files |
|------|---------|-------|
| 121ec11 | feat(02-01): database module with family_members and settings tables | server/db.js, server/index.js, server/package.json, package-lock.json |
| b7724fb | feat(02-01): add family CRUD and PIN auth API routes | server/routes/family.js, server/routes/auth.js, server/index.js |

## Next Steps

Plan 02-02 will build the React frontend components to consume these APIs: family member list display, add/edit/delete forms, PIN authentication modal, and settings page for PIN management.

---

## Self-Check: PASSED

✓ All created files exist:
- server/db.js
- server/routes/family.js
- server/routes/auth.js

✓ All commits exist:
- 121ec11
- b7724fb

✓ Server starts successfully and all endpoints respond correctly
✓ All 11 behavioral API tests pass
✓ JSON Schema validation working on all routes
✓ Default PIN 1234 verifies successfully
✓ PIN change flow works with current PIN requirement
