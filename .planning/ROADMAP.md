# Roadmap: FamilyWall

## Overview

FamilyWall transforms from empty repository to production-ready family dashboard through 6 phases. We build infrastructure first (Raspberry Pi kiosk, database reliability), then establish the foundation with family member management, before implementing the three core features in dependency order: chores (primary value), calendar (second key feature), and chess (engagement differentiator). The journey concludes with polish and integration testing on real hardware.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Infrastructure Setup** - Raspberry Pi kiosk configuration and database reliability
- [ ] **Phase 2: Foundation & Family Management** - Backend skeleton, React app, and family member CRUD
- [ ] **Phase 3: Chore System** - Offline-first chore management with recurring tasks
- [ ] **Phase 4: Calendar Integration** - Google Calendar sync with multi-view display
- [ ] **Phase 5: Chess Board** - Touch-enabled chess game with persistent state
- [ ] **Phase 6: Polish & Integration** - Production hardening and family user testing

## Phase Details

### Phase 1: Infrastructure Setup
**Goal**: Raspberry Pi runs reliably 24/7 with kiosk browser, protected against memory leaks and SD card corruption
**Depends on**: Nothing (first phase)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. Chromium browser opens full-screen in kiosk mode on boot
  2. Chromium automatically restarts daily at 3am without manual intervention
  3. Screen stays on continuously without blanking or sleep mode
  4. Node.js backend runs under PM2 with automatic restart on crashes or memory limits
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Monorepo foundation with npm workspaces and PM2-managed backend
- [x] 01-02-PLAN.md — Kiosk configuration with labwc autostart and scheduled restart
- [x] 01-03-PLAN.md — Hardware verification and integration testing
- [x] 01-04-PLAN.md — Gap closure: fix restart script binary name, flags, and user paths

### Phase 2: Foundation & Family Management
**Goal**: Users can manage family member profiles with PIN-protected actions and touch-friendly UI
**Depends on**: Phase 1
**Requirements**: FAM-01, FAM-02, FAM-03, FAM-04, FAM-05, FAM-06, FAM-07, FAM-08
**Success Criteria** (what must be TRUE):
  1. User can add, edit, and delete family members with names
  2. User can view complete list of all family members
  3. Parental actions (add/edit/delete) require PIN authentication before proceeding
  4. All buttons and touch targets are minimum 44px and provide clear visual feedback when tapped
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Database schema, family CRUD API, and PIN auth endpoints
- [ ] 02-02-PLAN.md — shadcn components, TypeScript types, data hooks, touch CSS
- [ ] 02-03-PLAN.md — Family management UI (list, modals, PIN pad) with visual verification

### Phase 3: Chore System
**Goal**: Family members can create, complete, and track chores with offline capability and automatic recurring task generation
**Depends on**: Phase 2
**Requirements**: CHOR-01, CHOR-02, CHOR-03, CHOR-04, CHOR-05, CHOR-06, CHOR-07, CHOR-08, CHOR-09, CHOR-10, CHOR-11, CHOR-12
**Success Criteria** (what must be TRUE):
  1. User can create chore with title and assign to specific family member
  2. User can mark chore complete with single tap on 48px+ checkbox
  3. User can see chores grouped by family member with completion counts
  4. User can set chores as recurring (daily/weekly) and they auto-generate at configured time
  5. Chore system works completely offline without internet connection
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema, family CRUD API, and PIN auth endpoints
- [ ] 02-02-PLAN.md — shadcn components, TypeScript types, data hooks, touch CSS
- [ ] 02-03-PLAN.md — Family management UI (list, modals, PIN pad) with visual verification

### Phase 4: Calendar Integration
**Goal**: Family can view synchronized Google Calendar events in multiple formats with automatic refresh
**Depends on**: Phase 3
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05, CAL-06, CAL-07, CAL-08, CAL-09, CAL-10, CAL-11, CAL-12
**Success Criteria** (what must be TRUE):
  1. User can configure multiple Google Calendar sources and see events from all calendars
  2. User can switch between daily (6AM-10PM timeline), weekly (7-day grid), and monthly (calendar grid) views
  3. Events display with color-coding by family member and show current time indicator in daily view
  4. User can navigate previous/next periods and jump to today with single tap
  5. Calendar automatically refreshes every 15 minutes with latest events from Google
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema, family CRUD API, and PIN auth endpoints
- [ ] 02-02-PLAN.md — shadcn components, TypeScript types, data hooks, touch CSS
- [ ] 02-03-PLAN.md — Family management UI (list, modals, PIN pad) with visual verification

### Phase 5: Chess Board
**Goal**: Family members can play long-running chess games with touch controls and persistent game state
**Depends on**: Phase 4
**Requirements**: CHESS-01, CHESS-02, CHESS-03, CHESS-04, CHESS-05, CHESS-06, CHESS-07, CHESS-08, CHESS-09, CHESS-10, CHESS-11, CHESS-12
**Success Criteria** (what must be TRUE):
  1. User can select white and black players from family member list
  2. User can move chess pieces by touch drag-and-drop with clear visual distinction
  3. Move history displays in algebraic notation with auto-scroll to latest move
  4. User can start new game (with confirmation) and undo last move
  5. Game state persists across browser restarts and daily Chromium reboots
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema, family CRUD API, and PIN auth endpoints
- [ ] 02-02-PLAN.md — shadcn components, TypeScript types, data hooks, touch CSS
- [ ] 02-03-PLAN.md — Family management UI (list, modals, PIN pad) with visual verification

### Phase 6: Polish & Integration
**Goal**: Application runs smoothly on real hardware with production-quality UX and successful family user acceptance
**Depends on**: Phase 5
**Requirements**: (Cross-cutting quality improvements across all features)
**Success Criteria** (what must be TRUE):
  1. All touch interactions work reliably on actual Raspberry Pi touchscreen hardware
  2. Application runs for 24+ hours without memory leaks, crashes, or performance degradation
  3. Offline indicators appear when internet unavailable and retry logic handles API failures gracefully
  4. Family members can complete daily usage scenarios without confusion or assistance
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Database schema, family CRUD API, and PIN auth endpoints
- [ ] 02-02-PLAN.md — shadcn components, TypeScript types, data hooks, touch CSS
- [ ] 02-03-PLAN.md — Family management UI (list, modals, PIN pad) with visual verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure Setup | 3/4 | In Progress|  |
| 2. Foundation & Family Management | 0/TBD | Not started | - |
| 3. Chore System | 0/TBD | Not started | - |
| 4. Calendar Integration | 0/TBD | Not started | - |
| 5. Chess Board | 0/TBD | Not started | - |
| 6. Polish & Integration | 0/TBD | Not started | - |
