# Phase 3: Chore System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 03-chore-system
**Areas discussed:** Chore data model & storage, Layout & grouping, Completion interaction, Recurring mechanics, Empty states

---

## Chore Data Model & Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Just title + assignee (minimal) | Keep it simple — only what's required. Due dates and descriptions can come in v2 if needed. | |
| Add optional description field | Let parents add details like 'Empty trash from all bathrooms' for clarity. Optional, can be blank. | ✓ |
| Add due date field | Track when chores should be done. Good for scheduled tasks but adds UI complexity for date picker. | |

**User's choice:** Optional description, points. I'd like to be able to use the points at a later time as a "currency" that can be cashed in for incentives.

| Option | Description | Selected |
|--------|-------------|----------|
| Template + instances (recommended) | Store a template chore (title, assignee, frequency) that generates individual instances. Each completion is its own row. Clean history tracking. | |
| Single row with completion history | One chore row with is_recurring flag + JSON array of completion timestamps. Simpler schema but harder to query history. | ✓ |

**User's choice:** Single row with completion history

| Option | Description | Selected |
|--------|-------------|----------|
| Mark completed, keep in DB (recommended) | Add completed_at timestamp, mark as done. Supports 'view completed' and completion counts. Can archive old ones later. | ✓ |
| Delete when completed | Remove from DB entirely. Simplest but loses completion history for counts (CHOR-11 wants counts per member). | |
| Move to archive table | Separate completed_chores table. Keeps active list lean but adds schema complexity. | |

**User's choice:** Mark completed, keep in DB (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Just completed_at timestamp (recommended) | NULL = active, timestamp = completed. Simple boolean-style check. Matches family CRUD pattern. | |
| Status enum (active/completed/archived) | Explicit status field allows future states like 'skipped' or 'archived'. More flexible but maybe overkill for v1. | ✓ |

**User's choice:** Status enum for "someone else did this" tracking
**Notes:** User wants to track who was supposed to do it vs who actually did it

| Option | Description | Selected |
|--------|-------------|----------|
| Track completed_by separately (recommended) | Add completed_by field. assigned_to stays unchanged. When completing, prompt 'Who did this?' with family member picker. Clean data model. | ✓ |
| Status handles it (done_by_other) | Status enum includes 'completed_by_assignee' and 'completed_by_other'. Simpler but doesn't track WHO did it, just that it wasn't the assignee. | |
| Just track completion, not who | Assigned person always gets credit when marked complete. Simpler but loses the 'Bob helped out' visibility you want. | |

**User's choice:** Track completed_by separately, but default to the assignee - so that it doesn't require an extra step under normal circumstances.

---

## Layout & Grouping

| Option | Description | Selected |
|--------|-------------|----------|
| Grouped sections (recommended) | Sections per family member: 'Alice's Chores', 'Bob's Chores'. Chores shown as cards within each section. Matches family mental model (reuses Card component). | |
| Tabs per family member | Tap 'Alice' tab to see only her chores. Cleaner but requires extra tap to see other members. Good if lots of chores per person. | |
| Single scrollable list | All chores in one list, sorted by family member. Simpler but harder to scan visually. | ✓ |

**User's choice:** Single list, but with an indicator of owner - perhaps color coding of the chore and/or a family member icon. At some later time, we can make the icon and/or color configurable.

| Option | Description | Selected |
|--------|-------------|----------|
| Global button at top (recommended) | One 'Add Chore' button in header (PIN-protected). When adding, user picks assignee from family dropdown. Matches Phase 2 'Add Family Member' pattern. | ✓ |
| Per-member add buttons | Each section has '+ Add for Alice', '+ Add for Bob'. Pre-fills assignee but more buttons on screen. | |
| Floating action button | Bottom-right FAB always visible for quick add. Modern mobile pattern but might conflict with touch targets. | |

**User's choice:** Global button at top (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Creation order (newest first) | Most recently added chores appear at top. Natural for todo lists. | |
| Active first, then completed | Incomplete chores at top (creation order), completed chores at bottom (faded). CHOR-07 wants completed to move/fade. | |
| Points-weighted (high points first) | Show high-point chores first to prioritize important tasks. Good for incentive system you mentioned. | ✓ |

**User's choice:** I'd like to see all the chores in one section. Completed chores should disappear from the main view. I'd also only like to see the chores for the current day if looking at a "daily" view.
**Notes:** User wants daily view filtering + points-based sort

| Option | Description | Selected |
|--------|-------------|----------|
| Same list, faded at bottom (recommended) | Completed chores stay visible but move below active ones with reduced opacity. Shows progress, supports CHOR-07 fade requirement. | |
| Separate 'Completed' expandable section | Collapsed by default, tap to expand and see completed. Keeps active list clean. | ✓ |
| Hide completely (toggle to view) | Completed chores hidden by default. 'Show completed' button reveals them. Cleanest but loses visibility. | |

**User's choice:** Separate 'Completed' expandable section

| Option | Description | Selected |
|--------|-------------|----------|
| Just daily view (show today's chores) | Single view mode. Only shows chores for current day. Simple and focused for daily kiosk check-ins. | |
| Daily + All chores views (recommended) | Toggle between 'Today' (current day chores only) and 'All' (everything). Helps plan ahead while keeping daily view focused. | |
| Daily + Weekly views | See today's chores or this week's chores. Good for recurring weekly tasks. | ✓ |

**User's choice:** Daily + Weekly views

| Option | Description | Selected |
|--------|-------------|----------|
| Points descending (high points first) | Prioritize important/valuable chores. Makes incentive system visible. | ✓ |
| Creation order (newest first) | Recently added chores appear at top. Natural for todo lists. | |
| Assignee name alphabetical | Alice's chores, then Bob's, then Charlie's. Predictable scanning even in unified list. | |

**User's choice:** Points descending (high points first)

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-assign from palette (recommended) | Pick from predefined colors (blue, green, purple, orange). Simple for v1, configurable in v2. | ✓ |
| User picks color per member | Let parents choose color when adding family member. More flexibility but adds UI complexity in Phase 2 retroactively. | |
| Use profile pictures instead | Skip color-coding, just show family member avatar/icon. Requires adding avatars to family members. | |

**User's choice:** Auto-assign from palette (recommended)

---

## Completion Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Tap 48px checkbox (recommended) | Dedicated checkbox on left/right of chore card. Meets CHOR-06 (48px minimum). Checkbox animates when tapped. Clear, familiar pattern. | ✓ |
| Tap anywhere on card | Whole chore card is tappable to complete. Bigger target but less obvious which action you're taking (complete vs edit). | |
| Swipe gesture | Swipe right to complete (like iOS reminders). Modern but less discoverable on kiosk touchscreen. | |

**User's choice:** Tap 48px checkbox (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Checkbox animation + toast (recommended) | Checkbox fills with checkmark animation, chore fades out, toast shows 'Chore completed!' Meets CHOR-12, reuses sonner toast from Phase 2. | ✓ |
| Confetti + sound effect | Celebration animation for positive reinforcement. Fun for kids but might get annoying with frequent use. | |
| Just fade out (minimal) | Chore fades and moves to completed section. Subtle, no interruption. | |

**User's choice:** Checkbox animation + toast (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Long-press checkbox opens picker (recommended) | Normal tap defaults to assignee. Long-press (1s hold) shows 'Who completed this?' family picker. Advanced feature, doesn't clutter normal flow. | ✓ |
| Always ask who completed | Every completion shows 'Who did this?' picker with assignee pre-selected. More explicit but adds friction to common case. | |
| Edit button + manual override | Complete as normal (assignee gets credit). To change who did it, use Edit menu option later. Least friction but less discoverable. | |

**User's choice:** Long-press checkbox opens picker (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| 5-second undo toast (recommended) | Toast shows 'Chore completed' with 'Undo' button for 5 seconds. Catches accidents without permanent clutter. Matches CHOR-V2-01 deferred feature. | ✓ |
| No undo, just re-add | Once completed, it moves to completed section. Parent can manually mark incomplete via menu if needed. Simpler code. | |
| Undo button always visible | Completed section shows undo icon per chore. Easy to reverse but clutters completed list. | |

**User's choice:** 5-second undo toast (recommended)

---

## Recurring Mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Daily and Weekly only | Simple toggles: 'Repeat daily' or 'Repeat weekly'. Covers most common chores (dishes, trash). Matches CHOR-08 requirement. | |
| Daily, Weekly, + custom days (recommended) | Daily, Weekly (all 7 days), or pick specific days (Mon/Wed/Fri for trash). More flexible, slightly more UI. | ✓ |
| Interval-based (every N days) | Set number (e.g., 'every 3 days'). Flexible but harder to visualize what day it lands on. | ✓ |

**User's choice:** We need daily, weekly + custom days and interval based
**Notes:** User wants ALL frequency options

| Option | Description | Selected |
|--------|-------------|----------|
| Server cron at midnight (recommended) | Node.js backend runs daily at 12:01am, generates next day's recurring chores. Reliable, works even if kiosk is off. | ✓ |
| On app load/refresh | When kiosk starts or page refreshes, check if new instances needed and generate. Simpler but tied to app being open. | |
| At configured time (e.g., 6am) | Let parents set when chores appear (e.g., generate at 6am when family wakes up). Customizable but adds settings complexity. | |

**User's choice:** Server cron at midnight (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-complete if incomplete (recommended) | If yesterday's chore wasn't done, mark it complete automatically (completed_by = null) when new one generates. Prevents accumulation. | ✓ |
| Leave incomplete, both show | Yesterday's incomplete chore stays in list alongside today's. Shows backlog but list can grow. | |
| Delete incomplete, fresh start | Remove yesterday's if not done. Clean slate daily but loses completion tracking history. | |

**User's choice:** Auto-complete if incomplete, but want to be able to see whether the chores for the week were completed at the end of the week.
**Notes:** Completion history tracking required for weekly review

| Option | Description | Selected |
|--------|-------------|----------|
| Toggle in add/edit form (recommended) | Add Chore form has 'Repeat' toggle. If on, shows frequency picker (daily/weekly/custom days). Simple addition to existing modal. | ✓ |
| Separate 'Templates' section | Recurring chores managed in separate 'Chore Templates' area. More organized but adds navigation complexity. | |
| Convert existing chore to recurring | Create normal chore, then 'Make Recurring' menu option. Two-step process but keeps add form simpler. | |

**User's choice:** Toggle in add/edit form (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Weekly summary report (recommended) | Dedicated view showing this week's chores with completion status: checkmark if done, X if auto-completed (missed). Per family member breakdown. | ✓ |
| Expand completed section shows all | The existing 'Completed' expandable section shows all completed chores with date. Can filter/search by week. | |
| Calendar-style heat map | Visual grid showing completion patterns over time. Green = done, red = missed. Good for trends but complex UI. | |

**User's choice:** Weekly summary report (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| completed_by = NULL + status = 'auto_completed' (recommended) | Distinct status in enum so reports can show 'missed vs completed'. completed_by is NULL to indicate no one did it. | ✓ |
| completed_by = 'system' | Special 'system' user. Simpler but mixes data types (family members vs system). | |
| completed = FALSE, just hide | Don't mark as completed, just hide from daily view. History shows 'incomplete' for that day. | |

**User's choice:** completed_by = NULL + status = 'auto_completed' (recommended)

---

## Empty States

| Option | Description | Selected |
|--------|-------------|----------|
| Friendly prompt to add first chore (recommended) | Empty state with icon + 'No chores yet' heading + 'Add your first chore to get started' message + prominent 'Add Chore' button. Matches Phase 2 empty family list pattern. | |
| Just the add button | Minimal - show 'Add Chore' button with no special empty state. Simple but less inviting. | ✓ |
| Onboarding tips | Show example chores + suggestions ('Try: Take out trash, Feed dog'). Helpful but might feel prescriptive. | |

**User's choice:** Just the add button

| Option | Description | Selected |
|--------|-------------|----------|
| Celebration message (recommended) | 'All done for today!' or similar positive reinforcement. Motivating for kids, matches incentive system you want. | ✓ |
| Just empty list | Show nothing in active section (completed section still has chores). Neutral, no special treatment. | |
| Preview tomorrow's chores | Show 'All done today! Tomorrow: 3 chores' as a heads-up. Helps with planning but adds complexity. | |

**User's choice:** Celebration message (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Empty state with week range (recommended) | 'No chores scheduled for [date range]' message. Clear communication. | ✓ |
| Show previous week's chores | Fall back to showing last week's completion. Provides context but might be confusing. | |
| Prompt to add recurring chores | 'Set up recurring chores to see them here.' Guides usage but assumes user intent. | |

**User's choice:** Empty state with week range (recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden when empty (recommended) | Don't show 'Completed' section at all if nothing completed yet. Reduces clutter. Appears once first chore is completed. | ✓ |
| Show '0 completed' message | Display section with 'No completed chores yet' placeholder. More explicit but adds visual noise. | |
| Show with count badge | 'Completed (0)' badge visible but collapsed. Teaches UI affordance upfront. | |

**User's choice:** Hidden when empty (recommended)

---

## Claude's Discretion

Areas where user deferred to Claude:
- Exact celebration message wording and animation style
- Checkbox animation timing and specific CSS transitions
- Color palette exact RGB/HSL values for blue/green/purple/orange
- Family member icon design (initials circle, emoji, or symbol)
- Weekly summary report specific layout and component design
- Toast notification exact duration and screen positioning

## Deferred Ideas

Points redemption/incentive rewards UI — explicitly noted for future phase or v2.
