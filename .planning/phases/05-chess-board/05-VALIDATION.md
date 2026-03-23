---
phase: 05
slug: chess-board
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-23
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `client/vitest.config.ts` (exists from Phase 2) |
| **Quick run command** | `npm test --workspace=client -- --run --reporter=dot` |
| **Full suite command** | `npm test --workspace=client -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test --workspace=client -- --run --reporter=dot`
- **After every plan wave:** Run `npm test --workspace=client -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | TBD | TBD | TBD | ⬜ pending | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Note: This table will be populated by the planner when creating PLAN.md files.*

---

## Wave 0 Requirements

- [ ] `client/src/components/__tests__/ChessBoard.test.tsx` — stubs for chess board rendering and square interaction
- [ ] `client/src/components/__tests__/MoveHistory.test.tsx` — stubs for move history display and auto-scroll
- [ ] `client/src/hooks/__tests__/useChessGame.test.tsx` — stubs for game state management and persistence

*Wave 0 test stubs ensure automated verification exists before implementation begins.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Game state persists across browser restarts | CHESS-12 | Requires actual browser close/reopen, cannot be automated in Vitest | 1. Make several moves 2. Note FEN position 3. Close browser tab 4. Reopen app 5. Verify board shows same position |
| Unicode chess pieces render correctly | CHESS-04, CHESS-05 | Visual verification of symbol clarity and distinction | 1. Inspect all 12 piece types (♔♕♖♗♘♙ and ♚♛♜♝♞♟) 2. Confirm white vs black symbols are clearly distinguishable 3. Check rendering on Pi touchscreen |
| Touch targets meet 44px minimum | CHESS-03 | Physical touch interaction on actual Pi hardware | 1. Test tapping squares on Pi touchscreen 2. Verify no accidental adjacent square taps 3. Confirm all buttons (New Game, Undo) are easily tappable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
