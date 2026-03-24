# FamilyWall

## What This Is

FamilyWall is a web-based family dashboard application designed to run on a Raspberry Pi connected to a touchscreen display. It serves as a central hub for family organization with three main features: a chore management system for task tracking and accountability, a shared calendar pulling from Google Calendar, and an interactive chess board for ongoing family games.

## Core Value

Family members complete their chores consistently because the system makes tasks visible, trackable, and easy to manage from a central touchscreen location.

## Requirements

### Validated

**Phase 1: Infrastructure Setup** (Validated in Phase 1: infrastructure-setup)
- [x] Raspberry Pi kiosk mode with Chromium full-screen on boot
- [x] Daily auto-restart at 3am for memory leak prevention
- [x] Screen blanking disabled for always-on display
- [x] PM2-managed backend with 512MB memory limit and crash recovery

**Phase 2: Foundation & Family Management** (Validated in Phase 2: foundation-family-management)
- [x] Family member management (add, edit, delete, view list)
- [x] Parental PIN authentication system with bcrypt hashing
- [x] PIN change functionality in settings
- [x] Touch-friendly interface (44px minimum targets, visual feedback)
- [x] Backend REST API with SQLite database
- [x] Frontend React components with TypeScript types

**Phase 5: Chess Board** (Validated in Phase 5: chess-board)
- [x] Chess board with tap-tap piece movement (D-01: tap-tap chosen over drag-and-drop)
- [x] Chess move history display in algebraic notation
- [x] Chess game controls (new game, undo move)
- [x] Family member selection for chess players
- [x] Game persistence across page reload (SQLite single-row storage)

### Active

- [ ] Chore system with family member assignments
- [ ] Touch-friendly chore completion (large checkboxes)
- [ ] Recurring chores (daily/weekly auto-generation)
- [ ] Parental PIN protection for adding chores and settings
- [ ] Google Calendar integration with multiple calendar support
- [ ] Calendar views: daily, weekly, monthly
- [ ] Visual feedback for all touch interactions
- [ ] Offline-capable chore system (local data)
- [ ] Auto-refresh calendar data (configurable interval)

### Out of Scope

- Multi-family support — Single family instance only, no user accounts or multi-tenancy
- Mobile native apps — Web-only application, optimized for touchscreen browser
- Chess AI opponent — Human vs human only, no computer player
- Chess game history/archive — Current game only, no save/load past games (defer to v2)
- Points/leaderboard system — Chore points tracking deferred (defer to v2)
- Calendar event creation — Read-only calendar, create events in Google Calendar directly
- Mobile responsive design — Optimized for fixed touchscreen display size only

## Context

**Family Setup:**
- 3-4 family members using the system
- Raspberry Pi touchscreen as central family hub
- Deployed in kiosk mode (full-screen, always visible)

**Calendar Integration:**
- Pull events from Google Calendar API
- Support multiple calendar sources (different family members' calendars)
- Display-only (no event creation from FamilyWall)
- Auto-refresh every 5 minutes to stay current

**Chess Board Details:**
- Long-running games where family members take turns when passing by
- Touch-friendly piece movement (drag-and-drop or tap-tap)
- Move history in algebraic notation
- Basic controls: new game, undo move, player selection
- No rules enforcement (trust-based gameplay)

**Success Metrics:**
- Family naturally checks the display daily without prompting
- Noticeable improvement in chore completion rates
- Fewer "what's happening today?" questions

## Constraints

- **Platform**: Raspberry Pi with touchscreen display — Must run efficiently on Pi hardware
- **Tech Stack**: React frontend, Node.js backend, SQLite database — Modern stack with local data storage
- **Deployment**: Kiosk mode browser — Full-screen, always-on display
- **Touch Interface**: All interactions must be touch-friendly — Large buttons, clear targets, no hover states
- **Offline**: Chore system must work without internet — Calendar requires connectivity for refresh
- **Single Device**: One touchscreen, one family — No multi-device sync or mobile access needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React for frontend | Component-based architecture suits modular features (calendar/chores/chess), good touch event handling | — Pending |
| Node.js + SQLite backend | Local storage on Pi keeps chore data fast and offline-capable, SQLite lightweight for Pi hardware | — Pending |
| Google Calendar read-only | Family already uses Google Calendar, display-only avoids sync complexity | — Pending |
| Kiosk mode deployment | Dedicated family device, always visible, no switching contexts | — Pending |
| Chores as priority feature | Most critical for family value, build this robustly first | — Pending |

---
*Last updated: 2026-03-24 after Phase 5 completion*
