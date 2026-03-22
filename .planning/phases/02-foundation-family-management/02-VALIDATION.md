---
phase: 02
slug: foundation-family-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- tests/{module}.test.ts` (affected module only, < 30s)
- **After every plan wave:** Run `npm test` (full suite, < 2min expected)
- **Before `/gsd:verify-work`:** Full suite must be green + manual touch target verification on actual touchscreen
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

*Will be populated during planning with specific task IDs*

---

## Wave 0 Requirements

- [ ] Install Vitest: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event --workspace=client`
- [ ] Install supertest for API testing: `npm install -D vitest supertest --workspace=server`
- [ ] Create `client/vitest.config.ts` with jsdom environment
- [ ] Create `server/vitest.config.ts` with node environment
- [ ] Create `tests/family.test.ts` — covers FAM-01 through FAM-04 (CRUD operations)
- [ ] Create `tests/auth.test.ts` — covers FAM-05 and FAM-06 (PIN authentication)
- [ ] Create `tests/components.test.tsx` — covers FAM-07 and FAM-08 (touch UI)
- [ ] Add `"test": "vitest"` to client/package.json and server/package.json scripts

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Touch targets are 44px minimum | FAM-07 | Visual/physical measurement on actual touchscreen | Use browser DevTools to measure button dimensions, verify min-height: 44px in computed styles |
| Touch feedback is perceivable | FAM-08 | Subjective visual perception on touchscreen | Tap each interactive element on actual Pi touchscreen, verify scale/opacity change is visible within 100ms |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
