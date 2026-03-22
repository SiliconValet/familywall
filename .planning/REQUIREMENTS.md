# Requirements: FamilyWall

**Defined:** 2026-03-10
**Core Value:** Family members complete their chores consistently because the system makes tasks visible, trackable, and easy to manage from a central touchscreen location.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: Chromium runs in kiosk mode (full-screen, always-on)
- [x] **INFRA-02**: Chromium auto-restarts daily to prevent memory leaks
- [x] **INFRA-03**: Screen blanking is disabled for always-on display
- [x] **INFRA-04**: Backend runs under PM2 with memory limits and auto-restart

### Family Management

- [x] **FAM-01**: User can add family member with name
- [x] **FAM-02**: User can edit family member name
- [x] **FAM-03**: User can delete family member (with confirmation)
- [x] **FAM-04**: User can view list of all family members
- [x] **FAM-05**: Parental actions require PIN authentication
- [x] **FAM-06**: User can set/change parental PIN in settings
- [x] **FAM-07**: All interactive elements have 44px minimum touch targets
- [x] **FAM-08**: Touch interactions provide clear visual feedback

### Chore System

- [ ] **CHOR-01**: User can create chore with title and assignee
- [ ] **CHOR-02**: User can assign chore to specific family member
- [ ] **CHOR-03**: User can mark chore as complete with single tap
- [ ] **CHOR-04**: User can delete chore (with parental PIN)
- [ ] **CHOR-05**: User can view chores grouped by family member
- [ ] **CHOR-06**: Chore completion checkboxes are 48px minimum size
- [ ] **CHOR-07**: Completed chores fade out or move to completed section
- [ ] **CHOR-08**: User can set chore as recurring (daily or weekly)
- [ ] **CHOR-09**: Recurring chores auto-generate at configured time
- [ ] **CHOR-10**: Chore system works offline (local data storage)
- [ ] **CHOR-11**: User can see completed chore count per family member
- [ ] **CHOR-12**: User sees visual feedback when completing chore

### Calendar Integration

- [ ] **CAL-01**: App connects to Google Calendar API
- [ ] **CAL-02**: User can configure multiple Google Calendar sources
- [ ] **CAL-03**: Events display with color-coding by family member
- [ ] **CAL-04**: User can switch between daily view (timeline 6AM-10PM)
- [ ] **CAL-05**: User can switch between weekly view (7-day grid)
- [ ] **CAL-06**: User can switch between monthly view (calendar grid)
- [ ] **CAL-07**: User can navigate to previous/next day/week/month
- [ ] **CAL-08**: User can jump to today with single tap
- [ ] **CAL-09**: Calendar auto-refreshes every 15 minutes
- [ ] **CAL-10**: User can see event details by tapping event
- [ ] **CAL-11**: All-day events display separately from timed events
- [ ] **CAL-12**: Current time indicator shows in daily view

### Chess Board

- [ ] **CHESS-01**: User can select white player from family members
- [ ] **CHESS-02**: User can select black player from family members
- [ ] **CHESS-03**: User can move chess piece by touch drag-and-drop
- [ ] **CHESS-04**: Board displays standard chess piece symbols
- [ ] **CHESS-05**: Board shows clear visual distinction between white and black pieces
- [ ] **CHESS-06**: Move history displays in algebraic notation
- [ ] **CHESS-07**: Move history auto-scrolls to latest move
- [ ] **CHESS-08**: Current turn indicator shows whose turn it is
- [ ] **CHESS-09**: User can start new game with confirmation dialog
- [ ] **CHESS-10**: New game resets board and clears move history
- [ ] **CHESS-11**: User can undo last move
- [ ] **CHESS-12**: Game state persists across browser restarts

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Infrastructure
- **INFRA-V2-01**: Raspberry Pi boots from USB SSD instead of SD card
- **INFRA-V2-02**: SQLite database uses WAL mode for reliability

### Chore System
- **CHOR-V2-01**: User can undo chore completion within 5-second window
- **CHOR-V2-02**: Chores have points values
- **CHOR-V2-03**: Leaderboard shows family member points totals
- **CHOR-V2-04**: User can add chore description (optional detail field)

### Calendar
- **CAL-V2-01**: User can create calendar events from touchscreen
- **CAL-V2-02**: User receives event reminders/notifications
- **CAL-V2-03**: User can filter calendar by category (sports, appointments, etc.)

### Chess
- **CHESS-V2-01**: User can save current game to history
- **CHESS-V2-02**: User can load previous game from history
- **CHESS-V2-03**: User can export game in PGN format
- **CHESS-V2-04**: Board can flip/rotate 180 degrees

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-family support | Single family instance only — no user accounts, authentication complexity, or data isolation needed |
| Mobile native apps | Web-only application optimized for fixed touchscreen — mobile access not needed for kiosk use case |
| Chess AI opponent | Human vs human only — AI adds significant complexity, not core to family engagement value |
| Chess rules enforcement | Trust-based gameplay — family members learn chess rules, validation removes learning opportunity |
| Event creation in app | Google Calendar is single source of truth — bi-directional sync adds complexity and conflict risk |
| Location tracking | Requires mobile apps and raises privacy concerns — not aligned with single-device kiosk model |
| Meal planning | High complexity feature — defer until core value prop (chores) is validated with real usage |
| Shopping/grocery lists | Not critical for chore validation — consider for v1.x after baseline usage established |
| Document storage | Adds encryption and storage complexity — out of scope for v1 |
| Cloud sync | Single device deployment — no multi-device sync needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 1 | Complete |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Complete |
| FAM-01 | Phase 2 | Complete |
| FAM-02 | Phase 2 | Complete |
| FAM-03 | Phase 2 | Complete |
| FAM-04 | Phase 2 | Complete |
| FAM-05 | Phase 2 | Complete |
| FAM-06 | Phase 2 | Complete |
| FAM-07 | Phase 2 | Complete |
| FAM-08 | Phase 2 | Complete |
| CHOR-01 | Phase 3 | Pending |
| CHOR-02 | Phase 3 | Pending |
| CHOR-03 | Phase 3 | Pending |
| CHOR-04 | Phase 3 | Pending |
| CHOR-05 | Phase 3 | Pending |
| CHOR-06 | Phase 3 | Pending |
| CHOR-07 | Phase 3 | Pending |
| CHOR-08 | Phase 3 | Pending |
| CHOR-09 | Phase 3 | Pending |
| CHOR-10 | Phase 3 | Pending |
| CHOR-11 | Phase 3 | Pending |
| CHOR-12 | Phase 3 | Pending |
| CAL-01 | Phase 4 | Pending |
| CAL-02 | Phase 4 | Pending |
| CAL-03 | Phase 4 | Pending |
| CAL-04 | Phase 4 | Pending |
| CAL-05 | Phase 4 | Pending |
| CAL-06 | Phase 4 | Pending |
| CAL-07 | Phase 4 | Pending |
| CAL-08 | Phase 4 | Pending |
| CAL-09 | Phase 4 | Pending |
| CAL-10 | Phase 4 | Pending |
| CAL-11 | Phase 4 | Pending |
| CAL-12 | Phase 4 | Pending |
| CHESS-01 | Phase 5 | Pending |
| CHESS-02 | Phase 5 | Pending |
| CHESS-03 | Phase 5 | Pending |
| CHESS-04 | Phase 5 | Pending |
| CHESS-05 | Phase 5 | Pending |
| CHESS-06 | Phase 5 | Pending |
| CHESS-07 | Phase 5 | Pending |
| CHESS-08 | Phase 5 | Pending |
| CHESS-09 | Phase 5 | Pending |
| CHESS-10 | Phase 5 | Pending |
| CHESS-11 | Phase 5 | Pending |
| CHESS-12 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47 (100% coverage)
- Unmapped: 0

**Phase Distribution:**
- Phase 1 (Infrastructure Setup): 4 requirements
- Phase 2 (Foundation & Family Management): 8 requirements
- Phase 3 (Chore System): 12 requirements
- Phase 4 (Calendar Integration): 12 requirements
- Phase 5 (Chess Board): 12 requirements
- Phase 6 (Polish & Integration): 0 explicit requirements (cross-cutting quality)

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after roadmap creation*
