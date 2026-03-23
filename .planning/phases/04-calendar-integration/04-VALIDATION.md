---
phase: 04
slug: calendar-integration
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-23
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| **Config file** | client/vitest.config.ts |
| **Quick run command** | `npm run test:client -- --run` |
| **Full suite command** | `npm run test:client -- --run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:client -- --run` (modified component tests only)
- **After every plan wave:** Run `npm run test:client -- --run` (all calendar component tests)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | CAL-01 | integration | Manual verification (requires OAuth setup) | N/A | ⬜ pending |
| 04-01-02 | 01 | 1 | CAL-01, CAL-02, CAL-09 | integration | `cd /Users/jassmith/Projects/gsdTest && node -e "import('./server/routes/calendar.js').then(m => console.log('loaded:', typeof m.default === 'function'))"` | N/A | ⬜ pending |
| 04-02-01 | 02 | 1 | CAL-03, CAL-11 | unit | `npm run test:client -- --run client/src/types/calendar.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 1 | CAL-09 | unit | `npm run test:client -- --run useCalendarSync.test.tsx` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | CAL-03, CAL-10 | unit | `npm run test:client -- --run EventCard.test.tsx` | ❌ W0 | ⬜ pending |
| 04-03-02 | 03 | 2 | CAL-04, CAL-05, CAL-06, CAL-07, CAL-08, CAL-11, CAL-12 | unit | `npm run test:client -- --run CalendarView.test.tsx DailyAgenda.test.tsx WeeklyAgenda.test.tsx MonthlyGrid.test.tsx` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04 | 3 | CAL-01, CAL-02, CAL-03 | unit | `npm run test:client -- --run CalendarSettings.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/features/calendar/components/__tests__/CalendarView.test.tsx` — stubs for CAL-07, CAL-08 (view switching, navigation, today button)
- [ ] `client/src/features/calendar/components/__tests__/DailyAgenda.test.tsx` — stubs for CAL-04, CAL-11, CAL-12 (daily rendering, all-day section, time indicator)
- [ ] `client/src/features/calendar/components/__tests__/WeeklyAgenda.test.tsx` — stubs for CAL-05 (weekly 7-column rendering)
- [ ] `client/src/features/calendar/components/__tests__/MonthlyGrid.test.tsx` — stubs for CAL-06 (monthly grid, event dots, day click)
- [ ] `client/src/features/calendar/components/__tests__/EventCard.test.tsx` — stubs for CAL-03, CAL-10 (color mapping, tap expansion)
- [ ] `client/src/features/calendar/components/__tests__/CalendarSettings.test.tsx` — stubs for CAL-02 (calendar source selection)
- [ ] `client/src/features/calendar/hooks/__tests__/useCalendarSync.test.tsx` — stubs for CAL-09 (15-min auto-refresh, page visibility)

*Wave 0 test files will be created during plan execution as part of each task's TDD cycle.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google Calendar API OAuth connection | CAL-01 | Requires real Google Cloud credentials and browser-based OAuth consent flow | 1. Configure .env with Google OAuth credentials 2. Click "Connect Calendar" in Settings 3. Complete Google OAuth consent 4. Verify redirect back to app with "Connected" status |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
