# Phase 2: Foundation & Family Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 02-foundation-family-management
**Areas discussed:** First-time PIN setup, Edit interaction pattern, List ordering, PIN retry policy

---

## First-time PIN setup

| Option | Description | Selected |
|--------|-------------|----------|
| Default to 1234 | Pre-configured default PIN, changeable in settings | ✓ |
| Require immediate setup | Force PIN creation on first launch before any features work | |
| Skip for now | Allow using app without PIN, prompt to set later | |

**User's choice:** Default to 1234 and allow changes
**Notes:** Provides known starting point without onboarding friction. Users can change in settings page.

---

## Edit interaction pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Modal form (Recommended) | Same as add — tap Edit button, modal appears with pre-filled name field. Consistent with UI-SPEC modal patterns and PIN entry flow. | ✓ |
| Inline editing | Tap the name itself to edit in-place. Simpler interaction but may cause accidental edits on touchscreen. | |
| Navigate to edit page | Separate full-screen edit page. More space but adds navigation complexity for single-field edit. | |

**User's choice:** Modal form (Recommended)
**Notes:** Keeps UI consistent across add/edit/delete confirmation flows. Matches UI-SPEC modal pattern.

---

## List ordering

| Option | Description | Selected |
|--------|-------------|----------|
| Alphabetical by name (Recommended) | Matches research example. Easy to find members, predictable order. Sorts automatically as names are added/edited. | ✓ |
| Creation order (newest first) | Most recently added appears at top. Shows growth of family list over time. | |
| Creation order (oldest first) | Original members at top, new additions at bottom. Stable order that never changes. | |
| Manual drag-to-reorder | User can rearrange list. Flexible but adds complexity for Phase 2 (defer to later phase?). | |

**User's choice:** Alphabetical by name (Recommended)
**Notes:** Matches family intuition, predictable sorting. List re-sorts automatically when names change.

---

## PIN retry policy

| Option | Description | Selected |
|--------|-------------|----------|
| Unlimited retries (Recommended) | Single-device kiosk in your home — no risk of remote attacks. Family can keep trying until they remember. Simple, no lockout recovery needed. | ✓ |
| Lock after 3 failures | Requires restart or timeout to unlock. Adds security but may frustrate family if they forget PIN. | |
| Increasing delays | 1st fail: instant retry, 2nd: 5s delay, 3rd: 30s delay. Slows brute force without permanent lockout. | |

**User's choice:** Unlimited retries (Recommended)
**Notes:** Appropriate for single-device home kiosk with no remote attack surface.

---

## Claude's Discretion

- Loading skeleton design while fetching family members
- Exact error message wording for network failures
- Toast notification positioning and animation timing
- Form field focus behavior after modal opens

## Deferred Ideas

None — discussion stayed within phase scope.
