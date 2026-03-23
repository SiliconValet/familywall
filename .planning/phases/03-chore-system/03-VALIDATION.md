---
phase: 03
slug: chore-system
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-22
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `client/vitest.config.ts` (created in Plan 03-03, Task 0) |
| **Quick run command** | `cd client && npx vitest run` |
| **Full suite command** | `cd client && npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Validation Approach

This phase uses a **hybrid validation strategy**:

1. **Plans 03-01, 03-02** (Wave 1): Inline validation via Node.js scripts and TypeScript compiler checks. No test files needed — these are backend schema/API and frontend types/hooks where inline verification (module import checks, PRAGMA table_info, tsc --noEmit) is more appropriate than unit tests.

2. **Plan 03-03** (Wave 2): Collocated component tests created alongside components. Task 0 sets up vitest + testing-library infrastructure (Wave 0 equivalent). Tasks 1-3 create test files as part of each task's deliverables.

3. **Plan 03-04** (Wave 3): TypeScript compiler check for WeeklySummary component + human-verify checkpoint for full visual verification.

**Rationale:** Backend plans verify via direct database/module checks (faster, more reliable for schema and API validation). Frontend plans verify via vitest component tests (appropriate for React components with user interactions).

---

## Sampling Rate

- **After every task commit:** Run task-specific verify command
- **After Plan 03-03:** Run `cd client && npx vitest run` (full client test suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 03-01-T1 | 01 | 1 | CHOR-01 | inline | `node -e "import('./server/db.js')..."` (PRAGMA table_info) | pending |
| 03-01-T2 | 01 | 1 | CHOR-02,03,04,08,09,10,11 | inline | `node -e "import('./server/db.js')..."` (module load + DB ops) | pending |
| 03-02-T1 | 02 | 1 | CHOR-03,06,07,12 | inline | `npx tsc --noEmit` (TypeScript compilation) | pending |
| 03-02-T2 | 02 | 1 | CHOR-06 | inline | `ls client/src/components/ui/*.tsx` (file existence) | pending |
| 03-03-T0 | 03 | 2 | — | infra | `npx vitest run --passWithNoTests` (test infra setup) | pending |
| 03-03-T1 | 03 | 2 | CHOR-06,07 | unit | `npx vitest run src/components/__tests__/ChoreCard.test.tsx` | pending |
| 03-03-T2 | 03 | 2 | CHOR-01,02 | unit | `npx vitest run src/components/__tests__/ChoreFormModal.test.tsx` | pending |
| 03-03-T3 | 03 | 2 | CHOR-03,04,12 | unit | `npx vitest run src/components/__tests__/ChoreList.test.tsx` | pending |
| 03-04-T1 | 04 | 3 | CHOR-05,11 | inline | `npx tsc --noEmit` (TypeScript compilation) | pending |
| 03-04-T2 | 04 | 3 | ALL | manual | Visual checkpoint (human-verify) | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

Wave 0 is handled by Plan 03-03, Task 0 which creates:

- [x] `client/vitest.config.ts` — Vitest configuration with jsdom environment
- [x] `client/src/test/setup.ts` — Testing-library jest-dom setup
- [x] Test dependencies installed (vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom)

Test files are created collocated with their component tasks (Tasks 1-3), not as separate stubs. This follows the project's existing pattern of creating tests alongside implementation.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 48px checkbox touch target | CHOR-06 | Visual verification | Measure checkbox hitbox in browser DevTools, confirm >= 48px |
| Long-press gesture (1s hold) | CHOR-07 | User interaction timing | Hold checkbox for 1s, verify family picker appears |
| Undo toast (5s duration) | CHOR-08 | Toast timing verification | Complete chore, verify toast stays visible for 5s, click Undo |
| Recurring chore midnight generation | CHOR-10 | Time-dependent cron | Set system time to 12:01am, verify new recurring chore instances created |
| Offline chore completion | CHOR-12 | Network state | Disable network, complete chore, verify local state updates |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (handled by Plan 03-03 Task 0)
- [x] No watch-mode flags
- [x] Feedback latency < 3s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
