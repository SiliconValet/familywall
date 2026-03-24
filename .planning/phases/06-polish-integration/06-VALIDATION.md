---
phase: 6
slug: polish-integration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.x + Testing Library React 16.x |
| **Config file** | `client/vitest.config.ts` |
| **Quick run command** | `cd client && npm run test:client` |
| **Full suite command** | `cd client && npm run test:client` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd client && npm run test:client`
- **After every plan wave:** Run `cd client && npm run test:client`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| PIN timeout — skip PIN in grace period | TBD | 1 | D-16, D-17 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| PIN timeout — show PIN after expiry | TBD | 1 | D-16 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| FamilyMemberBadge hex color prop | TBD | 1 | D-08, D-09 | unit | `cd client && npm run test:client` | ❌ fix existing | ⬜ pending |
| FamilyFormModal color swatches | TBD | 1 | D-08, D-09, D-10 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| Virtual keyboard appears on focus | TBD | 2 | D-04, D-05 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| Virtual keyboard dismisses on blur/done | TBD | 2 | D-07 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| Calendar error triggers sonner toast | TBD | 1 | D-01, D-02 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| Settings tab is rightmost in nav | TBD | 1 | D-12 | unit | `cd client && npm run test:client` | ❌ W0 | ⬜ pending |
| Exit kiosk endpoint returns 200 | TBD | 2 | D-15 | smoke | manual curl | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `client/src/hooks/__tests__/usePinAuth.test.ts` — PIN session timeout logic (D-16, D-17, D-18)
- [ ] `client/src/components/__tests__/FamilyFormModal.test.tsx` — color swatch rendering (D-08, D-09)
- [ ] `client/src/components/__tests__/VirtualKeyboard.test.tsx` — keyboard visibility on focus/blur (D-04, D-05, D-07)
- [ ] Update `client/src/components/__tests__/ChoreCard.test.tsx` — fix pre-existing FamilyMemberBadge test (colorIndex → hex color prop)

*Existing test infrastructure: vitest.config.ts configured, setupFiles loaded, jsdom environment, @testing-library/react installed — no framework gaps.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Exit kiosk kills Chromium | D-15 | Chromium not installed on dev machine; pkill silently no-ops | On Pi hardware: tap Exit Kiosk (after PIN), verify Chromium closes |
| Touch interactions on Pi hardware | Success Criteria 1 | Physical touchscreen needed | Test all tap targets: chores, calendar, settings — confirm 44px targets register reliably |
| 24-hour stability | Success Criteria 2 | Requires long-running observation | Run app on Pi for 24h, check for memory leaks, crashes, performance degradation |
| Family usage walkthrough | Success Criteria 4 | Human acceptance testing | Ask family members to complete daily scenarios without assistance |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
