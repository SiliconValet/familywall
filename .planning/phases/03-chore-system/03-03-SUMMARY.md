---
phase: 03-chore-system
plan: 03
subsystem: chore-ui
tags: [react-components, vitest, testing-library, touch-ui, shadcn]
dependency_graph:
  requires: [03-01-backend, 03-02-frontend-foundation]
  provides: [chore-list-ui, chore-completion-flow, recurring-chore-forms, pin-protected-mutations]
  affects: []
tech_stack:
  added: []
  patterns: [component-testing, mock-hooks, touch-targets, color-coding]
key_files:
  created:
    - client/vitest.config.ts
    - client/src/test/setup.ts
    - client/src/components/FamilyMemberBadge.tsx
    - client/src/components/ChoreCard.tsx
    - client/src/components/CompletedSection.tsx
    - client/src/components/CelebrationMessage.tsx
    - client/src/components/RecurrenceConfig.tsx
    - client/src/components/ChoreFormModal.tsx
    - client/src/components/ChoreList.tsx
    - client/src/components/__tests__/ChoreCard.test.tsx
    - client/src/components/__tests__/ChoreFormModal.test.tsx
    - client/src/components/__tests__/ChoreList.test.tsx
  modified:
    - client/src/App.tsx
    - client/package.json
    - package-lock.json
decisions:
  - key: Vitest with jsdom for component testing
    rationale: Modern testing framework with Vite integration, jsdom environment for DOM testing
    outcome: Fast test execution with React Testing Library integration
  - key: ResizeObserver polyfill in test setup
    rationale: Radix UI components require ResizeObserver which is not available in jsdom
    outcome: All Radix UI components (Select, Dialog, Collapsible) work in tests
  - key: ChoreList as main app view replacing FamilyList
    rationale: Chore system is the priority feature per PROJECT.md, family management will be accessible via future navigation
    outcome: ChoreList is the primary view, FamilyList removed from App.tsx
  - key: Color-coding by assignee using chart-1 through chart-4
    rationale: D-08 specifies auto-assigned palette colors, UI-SPEC defines chart color tokens
    outcome: Stable color mapping via colorIndexMap, consistent across all components
  - key: Long-press family picker for "someone else did it"
    rationale: D-17 specifies 1-second hold for completion override, keeps common case friction-free
    outcome: useLongPress hook integrated with ChoreCard checkbox wrapper
metrics:
  duration_seconds: 465
  duration_display: 7m 45s
  tasks_completed: 4
  files_created: 12
  files_modified: 3
  commits: 4
  completed_at: "2026-03-23T11:19:07Z"
---

# Phase 03 Plan 03: Chore UI Components Summary

**One-liner:** Complete chore management UI with ChoreList (daily/weekly views), ChoreCard (48px checkbox with long-press), ChoreFormModal (add/edit with recurring), CompletedSection, CelebrationMessage, FamilyMemberBadge, and 21 passing automated tests.

## What Was Built

Built the complete chore user interface that family members interact with daily:

### Task 0: Test Infrastructure (commit 11caf50)
- Installed vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
- Created vitest.config.ts with jsdom environment, globals, and path aliases
- Created test setup file with jest-dom matchers and ResizeObserver polyfill
- Added test:client and test:watch scripts to package.json

### Task 1: Core Chore Components (commit 74cd89a)
Created 4 components with 8 passing tests:

**FamilyMemberBadge** — Colored circle with family member initial
- Uses chart-1 through chart-4 CSS variables for consistent color-coding
- 32px circle with white text, font-semibold
- Color index maps to family member order: first = chart-1, second = chart-2, etc.

**ChoreCard** — Individual chore display with completion interaction
- 48px checkbox touch target (min-w-12 min-h-12 classes) per CHOR-06
- Left border accent (4px) using assignee's chart color (D-08)
- useLongPress hook integration: normal tap completes, 1-second hold opens family picker (D-17)
- Family picker dialog: "Who completed this?" with family member buttons (48px each)
- Points badge (right-aligned), edit/delete icons with ARIA labels (aria-label="Edit chore", aria-label="Delete chore")
- Completed state: opacity 0.7, checkbox filled with assignee's chart color
- Missed state (auto_completed): strikethrough text, "Missed" badge

**CompletedSection** — Collapsible completed chores section
- Hidden entirely when no completed chores (D-14)
- Collapsed by default (D-13): defaultOpen={false}
- Trigger shows "Completed (N)" with rotating chevron (180deg when expanded)
- Trigger is 48px touch target
- Transition: transition-all duration-300 ease-in-out per UI-SPEC
- 32px top margin (mt-8) per UI-SPEC spacing

**CelebrationMessage** — "All Done for Today!" celebration
- Rendered when activeChores.length === 0 and completedChores.length > 0 and view === 'daily'
- Sparkle emoji (✨) with text-6xl
- Heading: text-2xl font-semibold font-serif per UI-SPEC typography
- Animation: animate-in fade-in zoom-in-95 duration-300 per UI-SPEC

### Task 2: Forms and Recurring Configuration (commit 1612593)
Created 2 components with 7 passing tests:

**RecurrenceConfig** — Recurring frequency picker
- Supports 4 frequency types per D-20:
  1. Daily: frequency='daily', days=[0,1,2,3,4,5,6]
  2. Weekly: frequency='weekly', days=[0,1,2,3,4,5,6]
  3. Custom Days: frequency='custom', days=user-selected, shows 7 day checkboxes (Mon-Sun)
  4. Every N Days: frequency='interval', interval=user-specified (1-365 range)
- Day checkboxes: 48px touch targets (min-h-12) with labels (Mon/Tue/Wed/Thu/Fri/Sat/Sun)
- Days stored as numbers: 0=Sunday, 1=Monday, ..., 6=Saturday
- Display order: Mon(1) through Sun(0)
- Spacing: Label to select 8px (space-2), Select to options 16px (space-4)

**ChoreFormModal** — Add/Edit chore form modal
- Title changes based on mode: "Add Chore" or "Edit Chore"
- Form fields (all with 48px touch targets):
  - Chore Title (required): Input with min-h-12, placeholder "Enter chore title..."
  - Assigned To (required): Select dropdown, min-h-12, placeholder "Select family member..."
  - Points (Optional): Number input, min-h-12, placeholder "0", min={0}
  - Description (Optional): Textarea, min-h-24, placeholder "Add details..."
  - Recurring: Checkbox toggle
- RecurrenceConfig appears when Recurring toggle is checked (D-21)
- Validation:
  - Title required: shows "Chore title is required" error
  - Assigned To required: shows "Assigned family member is required" error
  - Error borders: aria-invalid attribute
- Form actions: Cancel (outline) + Submit (primary), both min-h-12, gap-2, mt-6
- Submit button text: "Add Chore" or "Save Changes"
- Form scrollable: max-h-[80vh] overflow-y-auto per UI-SPEC
- Error toast: "Unable to create chore. Please try again." or "Unable to update chore. Please try again."
- Pre-fills all fields when editing (initialData provided)
- Parses recurrence_config JSON string to populate RecurrenceConfig

### Task 3: ChoreList Main View (commit 82258e1)
Created main orchestration component with 6 passing integration tests:

**ChoreList** — Complete chore management UI
- Header: "Today's Chores" or "This Week's Chores" (text-2xl font-semibold font-serif)
- Add Chore button: min-h-12, PIN-protected via withPinAuth per D-10
- Daily/Weekly view toggle: ToggleGroup with two 48px items ("Today", "This Week")
- Weekly view shows week range below toggle: text-sm text-muted-foreground, formatWeekRange() output
- Stats display (CHOR-11): FamilyMemberBadge + "{name}: {count} done" for each member with completions
- Color index mapping: stable Map<member_id, index> for consistent coloring across all components

**Empty states:**
- No chores yet (D-26): "No Chores Yet" heading + "Tap Add Chore to create your first task." body
- All done daily (D-27): CelebrationMessage component
- No chores this week (D-28): "No Chores This Week" heading + "You're all caught up for {week range}. New chores will appear here when created." body
- Loading: 3 skeleton cards with pulse animation
- Error: error message + "Retry" button

**Active chores list:**
- ChoreCard for each active chore
- gap-2 (8px) between cards per UI-SPEC
- Sorted by points descending (handled by API, per D-11)
- Each card gets: chore, colorIndex, onComplete, onEdit, onDelete, familyMembers

**Modals:**
- PinModal: for PIN authentication
- ChoreFormModal (add): open when showAddForm, closes on submit
- ChoreFormModal (edit): open when editingChore, pre-filled with initialData
- Delete confirmation dialog: "Delete This Chore?" heading, "This chore will be permanently removed. This action cannot be undone." description, "Keep Chore" cancel button, "Delete" destructive button

**App.tsx changes:**
- Replaced FamilyList with ChoreList as primary view
- FamilyList import removed
- ChoreList is now the main app entry point

## Test Coverage

All 21 automated tests pass:

**ChoreCard.test.tsx (8 tests):**
- FamilyMemberBadge renders initial letter and chart color
- ChoreCard renders title, assignee name, and points
- ChoreCard has 48px checkbox touch target
- ChoreCard calls onComplete on checkbox click
- ChoreCard shows edit/delete buttons with ARIA labels
- CompletedSection renders null when empty
- CompletedSection shows "Completed (N)" header
- CelebrationMessage displays "All Done for Today!" text

**ChoreFormModal.test.tsx (7 tests):**
- ChoreFormModal shows "Add Chore" title when no initialData
- ChoreFormModal shows "Edit Chore" title when initialData provided
- ChoreFormModal shows validation error when title is empty on submit
- ChoreFormModal calls onSubmit with form data on valid submission
- ChoreFormModal shows RecurrenceConfig when Recurring toggle checked
- RecurrenceConfig shows frequency options
- RecurrenceConfig shows day checkboxes when Custom Days selected

**ChoreList.test.tsx (6 tests):**
- ChoreList renders "Today's Chores" heading in daily view
- ChoreList renders Add Chore button
- ChoreList shows "No Chores Yet" empty state when no chores
- ChoreList renders ChoreCard for each active chore
- ChoreList shows CelebrationMessage when all daily chores complete
- App renders ChoreList

## Deviations from Plan

None — plan executed exactly as written.

All acceptance criteria met:
- ✓ All components contain required UI-SPEC copywriting strings
- ✓ All interactive elements have min-h-12 class (48px touch targets)
- ✓ ChoreCard contains useLongPress, aria-label attributes, "Who completed this?" picker
- ✓ CompletedSection contains Collapsible, "Completed" header text
- ✓ CelebrationMessage contains "All Done for Today!" per D-27
- ✓ ChoreFormModal contains "Add Chore", "Edit Chore", "Save Changes", form labels per UI-SPEC
- ✓ RecurrenceConfig contains "Daily", "Weekly", "Custom Days", "Every N Days"
- ✓ ChoreList contains all required hooks, empty states, modals, headings
- ✓ App.tsx contains ChoreList, does NOT contain FamilyList
- ✓ All tests pass (21/21)

## Known Stubs

None — all components are fully functional with complete business logic and data wiring.

- ChoreList integrates with useChoreData, useFamilyData, usePinAuth hooks from Plan 02
- ChoreCard integrates with useLongPress hook from Plan 02
- ChoreFormModal integrates with toast notifications (sonner) from Phase 2
- All API endpoints from Plan 01 are consumed and wired correctly

## Technical Decisions

**ResizeObserver polyfill for tests:**
- **Context:** Radix UI components (Select, Dialog, Collapsible) require ResizeObserver which is not available in jsdom
- **Decision:** Add global.ResizeObserver polyfill to test setup
- **Outcome:** All Radix UI components work in tests without modification

**Mock hooks pattern for integration tests:**
- **Context:** ChoreList depends on 3 custom hooks with API calls
- **Decision:** Use vi.mock to mock hooks at module level, return mock data and functions
- **Outcome:** Integration tests verify component behavior without API calls, fast test execution

**Color index mapping stability:**
- **Context:** Family members may be added/removed/reordered
- **Decision:** Create colorIndexMap once per ChoreList render based on current members array
- **Outcome:** Consistent color assignment during a single view, colors may change if members are reordered (acceptable)

## Verification Results

**TypeScript compilation:** PASS (0 errors)
```bash
cd client && npx tsc --noEmit
```

**Vite dev build:** PASS (built in 895ms)
```bash
cd client && npx vite build --mode development
```

**All component tests:** PASS (21/21)
```bash
cd client && npx vitest run
```

**File existence verification:**
- ✓ client/vitest.config.ts exists
- ✓ client/src/test/setup.ts exists
- ✓ client/src/components/FamilyMemberBadge.tsx exists
- ✓ client/src/components/ChoreCard.tsx exists
- ✓ client/src/components/CompletedSection.tsx exists
- ✓ client/src/components/CelebrationMessage.tsx exists
- ✓ client/src/components/RecurrenceConfig.tsx exists
- ✓ client/src/components/ChoreFormModal.tsx exists
- ✓ client/src/components/ChoreList.tsx exists
- ✓ client/src/components/__tests__/ChoreCard.test.tsx exists
- ✓ client/src/components/__tests__/ChoreFormModal.test.tsx exists
- ✓ client/src/components/__tests__/ChoreList.test.tsx exists
- ✓ client/src/App.tsx modified

**Commit verification:**
- ✓ 11caf50 exists (Task 0: vitest setup)
- ✓ 74cd89a exists (Task 1: core components)
- ✓ 1612593 exists (Task 2: forms)
- ✓ 82258e1 exists (Task 3: ChoreList)

## Integration Points

**Upstream dependencies (Plan 02):**
- useChoreData hook: provides activeChores, completedChores, stats, CRUD operations, completion with 5s undo toast
- useFamilyData hook: provides members array for assignee selection and color mapping
- usePinAuth hook: provides withPinAuth for gating add/edit/delete operations
- useLongPress hook: provides 1-second hold detection for "who completed" picker
- formatWeekRange utility: provides week range formatting for weekly view header
- Chore, ChoreFormData, FamilyMember types: type-safe data layer
- shadcn components: Checkbox, Textarea, Select, ToggleGroup, Collapsible (installed Plan 02)

**Upstream dependencies (Plan 01):**
- GET /api/chores?view={daily|weekly}: fetches chores filtered by view
- GET /api/chores/stats: fetches completion counts per family member
- POST /api/chores: creates new chore with optional recurrence_config
- PUT /api/chores/:id: updates existing chore
- PUT /api/chores/:id/complete: marks chore complete (default-to-assignee or override)
- PUT /api/chores/:id/undo: reverts completion
- DELETE /api/chores/:id: deletes chore

**Downstream consumers:**
- Phase 03-04 (Weekly Summary): will read weekly summary data and render report view
- Future navigation system (Phase 6): will provide access to FamilyList via menu/tabs

## Commits

- `11caf50`: feat(03-chore-system-03): set up vitest and testing-library for client component tests
- `74cd89a`: feat(03-chore-system-03): create ChoreCard, CompletedSection, CelebrationMessage, FamilyMemberBadge with tests
- `1612593`: feat(03-chore-system-03): create ChoreFormModal with RecurrenceConfig and form tests
- `82258e1`: feat(03-chore-system-03): create ChoreList main view and wire into App.tsx with integration tests

## Self-Check: PASSED

**Files created verification:**
- ✓ client/vitest.config.ts exists and contains jsdom environment config
- ✓ client/src/test/setup.ts exists and contains ResizeObserver polyfill
- ✓ All 7 component files exist and are non-empty
- ✓ All 3 test files exist and contain test cases

**Commits verification:**
- ✓ All 4 commit hashes exist in git log
- ✓ Each commit contains expected files based on git show

**Functional verification:**
- ✓ TypeScript compilation passes with no errors
- ✓ Vite dev build succeeds
- ✓ All 21 automated tests pass
- ✓ App.tsx renders ChoreList (not FamilyList)
- ✓ All UI-SPEC copywriting strings present in source code
- ✓ All interactive elements have min-h-12 class

All claims verified. Ready to proceed with state updates.
