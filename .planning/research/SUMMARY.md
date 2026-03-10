# Project Research Summary

**Project:** FamilyWall Family Dashboard
**Domain:** Web-based family organization dashboard application
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

FamilyWall is a touchscreen-optimized family dashboard application for Raspberry Pi deployment, combining chore management, calendar integration, and recreational features (chess) into a kiosk-mode appliance. Based on research, the optimal approach is a React 19 + Fastify + SQLite stack with offline-first architecture for chores and cached calendar data. The application should be deployed as a single-device PWA running in Chromium kiosk mode, optimized for touch interaction with 44px+ minimum touch targets.

The recommended build strategy follows a foundation-first approach: establish infrastructure (power management, database reliability, kiosk configuration) before implementing features, then build features in dependency order (family profiles → chores → calendar → chess). Critical risks center on hardware reliability (SD card corruption, undervoltage, memory leaks) rather than software complexity. Mitigation requires USB SSD boot, proper power supply, WAL-mode SQLite, and automatic process restarts.

Key differentiator: This is not a mobile app competing with Cozi/FamilyWall, but a dedicated display appliance optimized for always-on, glanceable family coordination. The chess board feature is unique in this space and transforms the dashboard from pure utility to family engagement hub.

## Key Findings

### Recommended Stack

The research strongly recommends a modern, performance-optimized stack suitable for Raspberry Pi constraints. React 19 provides excellent touch event handling and proven performance on resource-limited hardware. Fastify offers 2-3x better performance than Express, critical for the Pi's CPU limitations. SQLite with better-sqlite3 delivers 2000+ queries/second with proper indexing, perfect for local-first chore storage.

**Core technologies:**
- **React 19.2 + TypeScript 5.9**: Modern UI framework with first-class touch support, React Compiler for performance optimization on resource-constrained Pi hardware
- **Vite 7**: Lightning-fast builds (5x faster with SWC), optimized bundling for kiosk-only deployment (no mobile responsive overhead)
- **Fastify 5**: Backend framework 2-3x faster than Express with built-in schema validation, minimal overhead critical for Pi deployment
- **better-sqlite3 12**: Fastest SQLite driver for Node.js, synchronous API outperforms async wrappers, achieves 2000+ queries/sec
- **Zustand 5**: Lightweight (1KB) state management for chore/chess state, simpler than Redux, excellent Pi performance
- **TanStack Query 5**: Server state management for Google Calendar with automatic caching, deduplication, and retry logic
- **Tailwind CSS 4**: Rust-powered compiler (5x faster builds), JIT mode generates only used classes, perfect for rapid prototyping

**Supporting libraries:**
- **dnd-kit 6**: Modern drag-drop with excellent touch/mobile support for chess pieces
- **react-chessboard 5 + chess.js 1**: Battle-tested chess UI and game logic, avoid custom implementation
- **googleapis 143**: Official Google Calendar client with OAuth2 and type-safe API
- **date-fns 4**: Tree-shakeable date manipulation with timezone support via @date-fns/tz

### Expected Features

Research reveals that family dashboard applications have well-established table stakes features, with differentiation opportunities in deployment model (kiosk vs mobile) and engagement features (games, gamification).

**Must have (table stakes):**
- **Shared Calendar with multi-source integration**: Every family organizer assumes Google/Outlook calendar sync, multi-calendar support per family
- **Color-coding**: Cited as #1 most important feature for family calendars, transforms cluttered schedules into instantly understandable views
- **Recurring tasks**: Core to family life patterns (daily/weekly/monthly), must support flexible end conditions
- **Multiple calendar views**: Daily/weekly/monthly perspectives for different planning horizons, users switch frequently
- **Chore assignment to family members**: Assignment with visual indicators of ownership
- **Touch-friendly interface**: 44x44px minimum touch targets, no hover states, clear tap feedback — universal requirement for touchscreen deployment

**Should have (differentiators):**
- **Chore gamification**: Points/leaderboards increase engagement, proven by OurHome/Levelty, but defer to v1.x until baseline usage established
- **Offline-first chore system**: Critical for reliability on single-device deployment, reduces internet dependency friction
- **Kiosk mode optimization**: Full-screen, auto-refresh, appliance-like behavior essential for dedicated display
- **Chess board (async family games)**: Unique differentiator creating engagement beyond utility, minimal competition in this feature space
- **Auto-refresh calendar**: Keeps display current without manual interaction, expected for always-on dashboard

**Defer (v2+):**
- **Meal planning + auto-grocery lists**: High value (saves 30+ min/week) but HIGH complexity, defer until core features validated
- **Shopping/grocery lists**: Table stakes but not critical for chore validation, add in v1.x
- **Document storage**: Adds encryption and storage management complexity, security concerns
- **Mobile companion app**: Only if users request off-dashboard access, significant scope creep risk
- **Location tracking**: Requires mobile apps, privacy concerns, not aligned with single-device use case (anti-feature)

### Architecture Approach

The standard architecture for React + Node.js + SQLite family dashboards follows a feature-module pattern with offline-first PWA capabilities. The research emphasizes single-device simplicity over multi-tenant complexity.

**Major components:**
1. **React feature modules** (Chores, Calendar, Chess) — Self-contained UI with components, hooks, and views organized by feature for clear boundaries
2. **Context + useReducer state management** — Global state for family members/settings using React Context API, avoiding Redux overhead for single-device deployment
3. **Fastify backend with service layer** — RESTful API with middleware chain (PIN auth, error handling), business logic separated from routes for testability
4. **SQLite database with WAL mode** — Local persistent storage for chores/chess/settings, write-ahead logging reduces SD card wear
5. **Service Worker with cache-first for chores** — Offline PWA capability with differentiated caching strategies (cache-first for chores, network-first for calendar)
6. **Google Calendar proxy** — Server-side API integration with 5-minute caching, incremental sync using syncToken to minimize quota usage

**Key architectural decisions:**
- **Monorepo structure** (client/ and server/ folders): Single deployment, simpler than separate repos for localhost-only app
- **Feature-based organization**: Each module self-contained, supports parallel development, matches 2026 React best practices
- **Offline-first for chores, cached for calendar**: Chores work without internet, calendar degrades gracefully with stale data indicators
- **Touch-first component design**: All interactive elements minimum 44px with visual feedback, no hover dependencies

### Critical Pitfalls

The research identified 10 critical pitfalls, with hardware reliability and touch optimization emerging as primary concerns over software complexity.

1. **SD card corruption from database writes**: Frequent writes accelerate wear, leading to unbootable systems or data loss. **Solution**: Boot from USB SSD, enable SQLite WAL mode, use tmpfs for /var/log, implement automatic backups.

2. **Chromium memory leaks in 24/7 kiosk mode**: Memory usage grows continuously over days until freeze/crash. **Solution**: Automatic daily browser restart via cron (3am), disable sync/background networking, React cleanup in useEffect hooks, limit service worker cache.

3. **Touchscreen unresponsiveness after display sleep**: Touch input fails to wake display, or accidental taps activate buttons on black screen. **Solution**: Disable screen blanking entirely (`xset s off -dpms`), or use motion sensor for wake (not touch).

4. **Inadequate power supply causing voltage drops**: Undervoltage warnings, erratic touch input, random reboots. **Solution**: Official 3A+ power supply, short high-quality USB cables, measure >4.75V at GPIO under load.

5. **Touch drag-and-drop failing for chess board**: HTML5 Drag and Drop API doesn't work on touch devices. **Solution**: Use dnd-kit or Pointer Events API with native touch support, test on actual hardware not DevTools emulation.

6. **Google Calendar API rate limits with auto-refresh**: 403 "rateLimitExceeded" errors from excessive polling. **Solution**: 15-minute refresh interval (not 5), incremental sync with syncToken, exponential backoff on errors, batch requests.

7. **Oversized touch targets causing accidental actions**: Buttons too large/close together leading to mis-taps and lost trust. **Solution**: Follow 2026 guidelines (27px minimum center, 44px edges, 48px critical actions), 8px spacing, confirmation for destructive actions.

8. **Display burn-in from static content** (OLED only): Permanent ghost images from always-on static UI elements. **Solution**: Choose LCD touchscreen not OLED, or implement pixel-shift and screensaver if OLED already purchased.

9. **Offline-first PWA misconfiguration**: Service worker caching wrong content, outdated app versions, no offline capability despite requirement. **Solution**: Separate strategies by content type (cache-first for static, network-first for dynamic), aggressive update checks.

10. **Node.js memory leaks from long-running backend**: Heap grows unbounded until crash. **Solution**: PM2 with max_memory_restart, automatic daily restart, close SQLite connections in finally blocks, implement cache eviction (LRU).

## Implications for Roadmap

Based on research, the project should follow a 6-phase structure prioritizing infrastructure reliability before features, then building features in dependency order. The architecture and pitfalls research clearly indicates that hardware setup and memory management must be addressed in Phase 1, not deferred.

### Phase 0: Hardware Selection & Procurement
**Rationale:** Critical decisions about hardware directly impact system reliability and determine which pitfalls can be avoided entirely. Must happen before any development.
**Delivers:** Raspberry Pi with USB SSD (not SD card), official 3A+ power supply, quality USB cable, LCD touchscreen (not OLED)
**Avoids:** Pitfalls #1 (SD corruption), #4 (undervoltage), #8 (burn-in)
**Duration:** 1 week

### Phase 1: Infrastructure & Deployment Setup
**Rationale:** All features depend on reliable foundation. Memory leaks, power management, and kiosk configuration must be addressed before implementing any user-facing features. Architecture research shows this prevents rework later.
**Delivers:** Raspberry Pi OS with USB SSD boot, Chromium kiosk mode with auto-restart, SQLite with WAL mode, PM2 process manager with memory limits, screen blanking disabled
**Addresses:** Core infrastructure from ARCHITECTURE.md (database, backend skeleton, deployment)
**Avoids:** Pitfalls #1 (SD corruption), #2 (browser memory leaks), #3 (touch wake issues), #10 (Node.js leaks)
**Stack elements:** Node.js 22 LTS, SQLite better-sqlite3 with WAL mode, Chromium with kiosk flags
**Research needed:** MEDIUM — Raspberry Pi kiosk configuration well-documented but Wayland vs X11 varies by Pi model

### Phase 2: Foundation & Family Management
**Rationale:** Every feature depends on family member profiles (chore assignment, chess players, calendar color-coding). Build this shared foundation before parallel feature work.
**Delivers:** Express/Fastify backend skeleton, React app skeleton, family member CRUD, parental PIN authentication, shared touch components (TouchButton, PinPad)
**Addresses:** Family profiles (FEATURES.md table stakes), touch-first component design (ARCHITECTURE.md pattern #4)
**Avoids:** Pitfall #7 (touch target sizing) by establishing standards early
**Stack elements:** Fastify 5, React 19 + TypeScript, Zustand for family state, Tailwind CSS 4
**Research needed:** LOW — Standard React + Express patterns, well-documented

### Phase 3: Core Chore System (Offline-First)
**Rationale:** Chores are the primary value proposition per feature research. Offline-first requirement means service worker infrastructure built here benefits calendar later. Implements highest-value feature first.
**Delivers:** Chore CRUD API, recurring chore generation, touch-optimized chore list, completion checkboxes (48px+), service worker with cache-first strategy, offline sync queue
**Addresses:** Chore system with assignment (FEATURES.md table stakes), recurring tasks, offline-first (differentiator)
**Avoids:** Pitfall #9 (PWA misconfiguration) by implementing offline correctly from start
**Stack elements:** better-sqlite3 with WAL, Zustand for chore state, service worker with Workbox
**Research needed:** MEDIUM — Service worker patterns well-documented, but offline sync queue needs careful design

### Phase 4: Calendar Integration
**Rationale:** Can reuse service worker infrastructure from Phase 3. Simpler than chess (display-only, no complex state). Second table stakes feature after chores.
**Delivers:** Google Calendar API integration, server-side proxy with caching, daily/weekly/monthly views, color-coding by person, auto-refresh (15-min interval), multi-calendar support
**Addresses:** Shared calendar, color-coding, multiple views (FEATURES.md table stakes)
**Avoids:** Pitfall #6 (rate limits) by implementing incremental sync and proper caching from start
**Uses:** TanStack Query for server state, googleapis client, date-fns for date manipulation
**Implements:** Google Calendar proxy component (ARCHITECTURE.md)
**Research needed:** MEDIUM — Google Calendar API well-documented, but incremental sync (syncToken) and rate limit handling need research

### Phase 5: Chess Board & Game Logic
**Rationale:** Most complex UI interactions benefit from mature codebase patterns established earlier. Independent feature can be built without blocking other work. Unique differentiator.
**Delivers:** Chess board component with touch drag-and-drop, move validation (chess.js), game state persistence, move history, new game/undo controls, player selection
**Addresses:** Multi-game recreation (FEATURES.md differentiator)
**Avoids:** Pitfall #5 (touch drag-drop failure) by using dnd-kit with pointer events, #4 (custom chess logic) by using battle-tested libraries
**Stack elements:** dnd-kit for touch drag-drop, react-chessboard + chess.js
**Research needed:** LOW — Libraries well-documented, but touch drag configuration on actual hardware needs testing

### Phase 6: Polish & Optimization
**Rationale:** Needs real hardware to test effectively. Performance optimization and UX refinement after features are functional. Integration testing with family users.
**Delivers:** Touch target sizing verification, memory leak testing (24+ hour runs), error handling polish, offline indicators, failed API retry logic, family user acceptance testing
**Addresses:** Touch-friendly interface refinement (FEATURES.md table stakes)
**Avoids:** All pitfall warning signs caught during testing before production deployment
**Research needed:** LOW — Testing and refinement, no new technical patterns

### Phase Ordering Rationale

- **Infrastructure first (Phase 1) is non-negotiable**: Pitfalls research shows memory leaks, SD card corruption, and power issues cause catastrophic failures. Address foundational reliability before any features.
- **Family profiles before features (Phase 2)**: Every feature depends on this. Building it first prevents rework and enables parallel development of later phases.
- **Chores before calendar (Phases 3-4)**: Chores are primary value prop and establish offline patterns. Calendar is simpler display-only feature that benefits from service worker infrastructure.
- **Chess last (Phase 5)**: Independent feature with complex touch interactions. Benefits from mature patterns. Can be deferred if timeline pressure without breaking core value prop.
- **Polish requires hardware (Phase 6)**: Real touchscreen needed for accurate testing. Do after features are functional.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 1 (Infrastructure)**: Raspberry Pi kiosk setup varies by model (Pi 5 uses Wayland/wayfire, older uses X11/LXDE). Needs model-specific research.
- **Phase 3 (Chore System)**: Service worker offline sync queue patterns need deeper research. Multiple strategies exist, need to choose right one for chore completion.
- **Phase 4 (Calendar)**: Google Calendar API incremental sync (syncToken), push notifications (watch API), and rate limit handling patterns need focused research.

**Phases with standard patterns (skip research-phase):**
- **Phase 2 (Foundation)**: React + Express backend is well-trodden path, standard patterns apply.
- **Phase 5 (Chess)**: Libraries (chess.js, react-chessboard, dnd-kit) have excellent documentation and examples.
- **Phase 6 (Polish)**: Testing and refinement, no new technical patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official documentation for all major dependencies (React 19, Vite 7, Fastify 5, Node.js 22 LTS). Version compatibility verified via package docs and release notes. Context7 confirms current versions and migration paths. |
| Features | HIGH | Multiple credible sources (app comparisons, user reviews, domain expert guides). Strong consensus on table stakes (calendar, color-coding, chores) and differentiators (offline-first, kiosk mode, gamification). FamilyWall/Cozi/OurHome comparison establishes clear competitive landscape. |
| Architecture | MEDIUM | React architecture patterns well-documented for 2026, but specific Raspberry Pi + kiosk deployment less common. Service worker offline patterns mature but need careful application. Architecture research based on community best practices and real-world implementations rather than official specifications. |
| Pitfalls | MEDIUM-HIGH | Raspberry Pi forum discussions provide strong evidence for hardware pitfalls (SD corruption, power, memory leaks). Touch interaction pitfalls verified across multiple sources. Google Calendar rate limiting documented officially. Some pitfalls based on community experience rather than official warnings. |

**Overall confidence:** HIGH

Research is comprehensive across all four dimensions. Stack and features have highest confidence due to official sources and strong community consensus. Architecture and pitfalls are slightly lower confidence but still well-supported by real-world implementations and community experience. No critical unknowns remain.

### Gaps to Address

**Service worker offline sync queue**: Multiple implementation strategies exist (IndexedDB queue, background sync API, optimistic updates). Need to research which approach best fits chore completion use case during Phase 3 planning.

**Raspberry Pi model-specific kiosk configuration**: Pi 5 with Bookworm uses Wayland/wayfire, older models use X11/LXDE. Autostart configuration differs. Need to determine target Pi model and research specific setup during Phase 1 planning.

**Google Calendar push notifications (watch API)**: Polling is simpler but wastes quota. Push notifications via watch API reduce polling but add complexity (webhook endpoint, HTTPS requirement, subscription management). Need to evaluate cost/benefit during Phase 4 planning, likely defer to optimization phase.

**Gamification complexity vs engagement**: Research shows points/leaderboards increase engagement but can fade after initial excitement. Unclear optimal approach for long-term engagement. Plan to implement basic gamification in v1.x and validate with family usage data before investing in complex systems.

## Sources

### Stack Research
**Primary (HIGH confidence):**
- React 19.2 Official Docs, Vite 7.0 Announcement, Fastify Official Docs, Node.js Release Schedule, TypeScript 5.9 Docs — Version verification and compatibility
- better-sqlite3 GitHub, Tailwind CSS v4 Blog, React Router Changelog — Library features and performance characteristics
- Raspberry Pi Kiosk Mode Official Tutorial, Advanced Guide to Using Vite with React in 2025 — Deployment and optimization

**Secondary (MEDIUM confidence):**
- Understanding Better-SQLite3, State Management in 2025, Top 5 Drag-and-Drop Libraries for React in 2026 — Technology comparisons and recommendations
- Fastify vs Express vs Hono, TanStack Query Guide, Node.js Google Calendar API Quickstart — Integration patterns

### Features Research
**Primary (HIGH confidence):**
- 10+ family organizer app comparison articles (2026) — Table stakes and differentiator identification
- Best Family Calendar App Features That Simplify Parenting Life, Shared Family Calendar Guide — User expectations
- Family chore app comparisons (8+ articles) — Gamification patterns and engagement strategies

**Secondary (MEDIUM confidence):**
- Digital Family Command Center guides (3+ articles) — Kiosk deployment patterns
- OurHome vs Cozi, FamilyWall vs Cozi comparisons — Competitive positioning
- Meal planning app reviews — Feature complexity assessment

### Architecture Research
**Primary (HIGH confidence):**
- React Architecture Patterns and Best Practices for 2026, React Folder Structure in 5 Steps — Project structure
- Node.js SQLite guides (2+ articles), Building Web APIs with Express — Backend patterns

**Secondary (MEDIUM confidence):**
- Progressive Web Apps 2026: PWA Performance Guide, Offline-First Architecture guides — Service worker patterns
- Wolfgang Ziegler Family Dashboard, Raspberry Pi Server guides — Real-world implementations
- Using Google Calendar API in React.js, react-chessboard guides — Integration examples

### Pitfalls Research
**Primary (HIGH confidence):**
- Google Calendar API Manage Quotas (official docs) — Rate limits and quotas
- Touch Targets on Touchscreens (Nielsen Norman), WCAG 2.1 Target Size — Touch UX standards
- Progressive Web Apps MDN, Node.js Memory Diagnostics (official) — Memory and offline best practices

**Secondary (MEDIUM confidence):**
- Raspberry Pi Forums (6+ threads): SD card wear, Chromium memory leaks, touchscreen issues, undervoltage, OLED burn-in — Hardware-specific pitfalls
- Community guides: Reducing SD Card Wear, SQLite3 Raspberry Pi Problems, Preventing Node.js Memory Leaks — Prevention strategies
- Top 5 Drag-and-Drop Libraries for React (2026), How I Built Drag and Drop Using Pointer Events — Touch drag-drop solutions

---
*Research completed: 2026-03-10*
*Ready for roadmap: yes*
