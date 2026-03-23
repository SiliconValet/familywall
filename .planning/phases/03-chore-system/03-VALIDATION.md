---
phase: 03
slug: chore-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-22
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `npm run test:client -- --run` |
| **Full suite command** | `npm run test:client -- --run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:client -- --run`
- **After every plan wave:** Run `npm run test:client -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | CHOR-XX | unit | `npm run test:client -- --run` | ⬜ pending | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/features/chores/__tests__/chore.test.ts` — stubs for CHOR requirements
- [ ] `client/src/hooks/__tests__/useLongPress.test.ts` — long-press detection tests

*Existing Vitest infrastructure covers baseline testing needs.*

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 3s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
