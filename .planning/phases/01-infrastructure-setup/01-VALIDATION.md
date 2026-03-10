---
phase: 1
slug: infrastructure-setup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | BATS (Bash Automated Testing System) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `bats tests/infrastructure/*.bats` |
| **Full suite command** | `bats tests/` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bats tests/infrastructure/*.bats`
- **After every plan wave:** Run `bats tests/`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| (populated by planner) | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/infrastructure/kiosk.bats` — verify Chromium kiosk startup
- [ ] `tests/infrastructure/pm2.bats` — verify PM2 configuration
- [ ] `tests/infrastructure/restart.bats` — verify restart timer
- [ ] `tests/infrastructure/screen.bats` — verify screen blanking disabled
- [ ] BATS installation if not present

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chromium kiosk visible on boot | INFRA-01 | Requires physical touchscreen | Power on Pi, verify browser shows on screen in full-screen mode |
| Daily restart at 3am | INFRA-02 | Time-based trigger | Set system time to 2:59am, wait 2 minutes, verify browser restarts |
| Screen stays on continuously | INFRA-03 | Requires extended observation | Leave running for 30+ minutes, verify screen doesn't blank |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
