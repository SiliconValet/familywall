# Phase 3: Chore System - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Offline-first chore management with family member assignment, one-tap completion, and automatic recurring task generation. Users can create chores with points for incentive system, mark chores complete (default to assignee, override for "someone else did it"), and view chores in daily or weekly views. Recurring chores auto-generate via server cron with completion history tracking.

</domain>

<decisions>
## Implementation Decisions

### Chore Data Model
- **D-01:** Chore fields: title (required), assignee (family_member_id), description (optional text), points (integer for future incentive system)
- **D-02:** Recurring pattern: single row with is_recurring flag + recurrence_config JSON (stores frequency, days, interval)
- **D-03:** Completed chores stay in database with completed_at timestamp (not deleted)
- **D-04:** Status enum: 'active', 'completed', 'auto_completed' (for missed recurring chores)
- **D-05:** Track completed_by (family_member_id, nullable) separate from assigned_to
- **D-06:** completed_by defaults to assignee for normal completion flow (no extra step)

### Layout & Display
- **D-07:** Single unified chore list (not grouped by family member)
- **D-08:** Color-code chores by assignee using auto-assigned palette colors (blue, green, purple, orange)
- **D-09:** Show family member icon alongside each chore (configurable color in future v2)
- **D-10:** Global "Add Chore" button at top (PIN-protected, matches Phase 2 pattern)
- **D-11:** Sort chores by points descending (high-value chores first)
- **D-12:** Two view modes: Daily (today's chores only) and Weekly (this week's chores)
- **D-13:** Completed chores live in separate expandable "Completed" section (collapsed by default, hidden from main view)
- **D-14:** Completed section hidden entirely when no completed chores exist

### Completion Interaction
- **D-15:** 48px checkbox on chore card for completion (meets CHOR-06 touch target requirement)
- **D-16:** Normal tap defaults to assignee completing (smooth UX for common case)
- **D-17:** Long-press checkbox (1 second hold) opens "Who completed this?" family picker for override
- **D-18:** Visual feedback: checkbox animation + fade-out + toast notification (reuses sonner from Phase 2)
- **D-19:** 5-second undo toast after completion with "Undo" button (catches accidental taps)

### Recurring Chore Mechanics
- **D-20:** Frequency options: Daily, Weekly (all 7 days), Custom days (select Mon/Wed/Fri etc.), Interval-based (every N days)
- **D-21:** Setup via toggle in Add/Edit Chore form (not separate templates section)
- **D-22:** New recurring instances generate via Node.js server cron at midnight (12:01am daily)
- **D-23:** When new instance generates, auto-complete yesterday's if incomplete: status='auto_completed', completed_by=NULL
- **D-24:** Weekly summary report view for parents to review completion history (checkmark=done, X=missed)
- **D-25:** Missed chores marked with status='auto_completed' + completed_by=NULL (distinct from normal completion)

### Empty States
- **D-26:** No chores yet: just show "Add Chore" button (minimal, no special empty state messaging)
- **D-27:** All chores completed (daily view): celebration message "All done for today!" for positive reinforcement
- **D-28:** No chores this week (weekly view): empty state message with week date range
- **D-29:** Completed section hidden when empty (appears once first chore is completed)

### Claude's Discretion
- Exact celebration message wording and animation
- Checkbox animation timing and style
- Color palette exact shades (blue/green/purple/orange family)
- Family member icon design (avatar initials, emoji, or symbol)
- Weekly summary report layout and design
- Toast notification duration and positioning
- Loading skeleton for chore list initial load

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §Chore System (CHOR-01 through CHOR-12) — 12 requirements mapped to this phase

### Prior Phase Patterns
- `.planning/phases/02-foundation-family-management/02-CONTEXT.md` — PIN auth pattern, modal forms, touch targets, toast notifications
- `.planning/phases/02-foundation-family-management/02-UI-SPEC.md` — shadcn component usage, touch target sizing, visual feedback patterns
- `.planning/phases/02-foundation-family-management/02-RESEARCH.md` — React hooks pattern, Fastify routes, SQLite schema design, validation

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `client/src/components/ui/button.tsx` — shadcn Button (44px minimum touch target)
- `client/src/components/ui/card.tsx` — shadcn Card component (reuse for chore cards)
- `client/src/components/ui/dialog.tsx` — shadcn Dialog (reuse for add/edit chore modal)
- `client/src/components/ui/input.tsx` — shadcn Input (form fields)
- `client/src/components/ui/label.tsx` — shadcn Label (form labels)
- `client/src/components/ui/sonner.tsx` — Toast notifications (reuse for completion feedback)
- `client/src/components/PinModal.tsx` — PIN authentication modal (gate create/delete operations)
- `client/src/hooks/usePinAuth.ts` — PIN authentication hook pattern (reuse for chore mutations)
- `client/src/types/family.ts` — TypeScript interface pattern (create types/chore.ts)
- `server/db.js` — SQLite schema initialization pattern (add chores table)
- `server/routes/family.js` — Fastify REST API route pattern (create routes/chores.js)

### Established Patterns
- Feature-based organization: `client/features/chores/` and `server/features/chores/`
- Custom hooks separate data from UI: create `useChoreData()` hook
- Modal forms for create/edit operations
- PIN authentication gates parental actions (add/delete chores)
- Toast notifications for user feedback
- SQLite WAL mode enabled, better-sqlite3 prepared statements
- JSON Schema validation on Fastify routes

### Integration Points
- Family members from Phase 2 used as chore assignees (foreign key to family_members table)
- Color palette assigned based on family member (order-based from family_members list)
- PIN modal guards chore create/edit/delete operations
- Server cron job (node-cron or similar) for midnight recurring chore generation
- SQLite database at `server/data/familywall.db` gets chores table

</code_context>

<specifics>
## Specific Ideas

- Points system enables future "currency" incentive rewards (defer redemption UI to v2)
- "Someone else did it" tracking preserves family accountability while acknowledging help
- Auto-completing missed recurring chores prevents backlog accumulation while preserving history
- Weekly summary report lets parents review completion patterns end-of-week
- Daily vs Weekly views match natural family check-in patterns (morning daily, weekend planning weekly)
- Celebration message on "all done" provides positive reinforcement for kids
- Long-press gesture for advanced "who completed" keeps common case friction-free

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

Points redemption UI and incentive rewards system explicitly noted for future phase/v2.

</deferred>

---

*Phase: 03-chore-system*
*Context gathered: 2026-03-22*
