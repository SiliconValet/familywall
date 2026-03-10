# Architecture Research

**Domain:** Web-based family dashboard with React, Node.js, and SQLite
**Researched:** 2026-03-10
**Confidence:** MEDIUM

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Kiosk Mode)                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Chores    │  │  Calendar   │  │    Chess    │          │
│  │   Module    │  │   Module    │  │   Module    │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
│         │                │                │                  │
├─────────┴────────────────┴────────────────┴──────────────────┤
│                   React UI Layer                             │
│  ┌──────────────┐ ┌─────────────┐ ┌────────────────┐        │
│  │ State Mgmt   │ │ API Client  │ │ Service Worker │        │
│  │ (Context)    │ │ (Fetch)     │ │ (Offline)      │        │
│  └──────────────┘ └─────────────┘ └────────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                   Node.js + Express API                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐           │
│  │  Chores  │  │  Google  │  │     Chess        │           │
│  │  Routes  │  │ Calendar │  │     Routes       │           │
│  │          │  │ Proxy    │  │                  │           │
│  └────┬─────┘  └────┬─────┘  └────┬─────────────┘           │
├───────┴─────────────┴─────────────┴─────────────────────────┤
│                      Data Layer                              │
│  ┌──────────────────────────────┐  ┌──────────────────┐     │
│  │      SQLite Database         │  │   Google Cal API │     │
│  │   (chores, chess, settings)  │  │   (read-only)    │     │
│  └──────────────────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **React UI Modules** | Feature-specific UI components (Chores, Calendar, Chess) | React functional components with hooks |
| **State Management** | Global state for family members, settings, UI state | React Context API + useReducer for local state |
| **API Client** | HTTP communication with backend, request/response handling | Fetch API with async/await, error boundaries |
| **Service Worker** | Offline capability for chore system, asset caching | PWA Service Worker with cache-first strategy for static assets |
| **Express Routes** | RESTful endpoints for CRUD operations | Express.js middleware-based routing with async handlers |
| **Google Calendar Proxy** | Fetch events from Google Calendar API, cache responses | Server-side API calls with API key, refresh token management |
| **SQLite Database** | Local persistent storage for chores, chess state, family data | SQLite3 with better-sqlite3 npm package for synchronous queries |

## Recommended Project Structure

```
familywall/
├── client/                    # React frontend
│   ├── public/                # Static assets
│   │   ├── manifest.json      # PWA manifest
│   │   └── sw.js              # Service worker
│   └── src/
│       ├── features/          # Feature-based organization
│       │   ├── chores/        # Chore module
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── ChoresView.jsx
│       │   ├── calendar/      # Calendar module
│       │   │   ├── components/
│       │   │   └── CalendarView.jsx
│       │   └── chess/         # Chess module
│       │       ├── components/
│       │       ├── hooks/
│       │       └── ChessView.jsx
│       ├── shared/            # Shared components
│       │   ├── components/    # Reusable UI (TouchButton, PinPad)
│       │   ├── hooks/         # Custom hooks (useTouch, useAPI)
│       │   └── context/       # Global contexts (FamilyContext, SettingsContext)
│       ├── services/          # API communication
│       │   └── api.js         # Centralized API client
│       ├── styles/            # Global styles
│       │   └── touchscreen.css
│       └── App.jsx            # Root component
│
├── server/                    # Node.js backend
│   ├── routes/                # Express routes
│   │   ├── chores.js          # Chore CRUD endpoints
│   │   ├── calendar.js        # Google Calendar proxy
│   │   ├── chess.js           # Chess game state
│   │   └── settings.js        # Family/settings endpoints
│   ├── services/              # Business logic
│   │   ├── choresService.js
│   │   ├── calendarService.js # Google API integration
│   │   └── chessService.js
│   ├── db/                    # Database
│   │   ├── database.js        # SQLite connection
│   │   ├── migrations/        # Schema versions
│   │   └── familywall.db      # SQLite file
│   ├── middleware/            # Express middleware
│   │   ├── errorHandler.js
│   │   └── pinAuth.js         # PIN protection
│   └── server.js              # Express app entry
│
└── package.json               # Monorepo or separate packages
```

### Structure Rationale

- **Feature-based folders:** Each major feature (chores, calendar, chess) is self-contained with its components, hooks, and views. This matches 2026 best practices for medium-sized React apps and makes it clear which code belongs to which feature.
- **Shared/common extraction:** Touchscreen-specific components (large buttons, PIN pad) are reusable across features and belong in a shared folder.
- **Services layer separation:** API calls are centralized in services, not scattered in components. This improves testability and makes it easier to swap backend implementations.
- **Migration support:** Database migrations folder allows schema evolution as features are added (e.g., adding points system in v2).

## Architectural Patterns

### Pattern 1: Feature Module Pattern

**What:** Each feature (Chores, Calendar, Chess) is a self-contained module with its own components, state, and view.

**When to use:** Medium to large React applications where features have distinct responsibilities and limited cross-dependencies.

**Trade-offs:**
- **Pros:** Clear boundaries, easy to find code, supports parallel development
- **Cons:** Some code duplication across features, requires discipline to keep modules independent

**Example:**
```typescript
// features/chores/ChoresView.jsx
import { useChores } from './hooks/useChores';
import ChoreList from './components/ChoreList';
import AddChoreButton from './components/AddChoreButton';

export default function ChoresView() {
  const { chores, completeChore, addChore } = useChores();

  return (
    <div className="chores-module">
      <ChoreList chores={chores} onComplete={completeChore} />
      <AddChoreButton onAdd={addChore} requiresPin />
    </div>
  );
}
```

### Pattern 2: Context + useReducer for State Management

**What:** Use React Context API with useReducer for global state (family members, settings) instead of Redux. Server state (chores, calendar) managed separately.

**When to use:** Single-device applications without complex state synchronization needs. Perfect for FamilyWall's kiosk deployment.

**Trade-offs:**
- **Pros:** No external dependencies, simpler mental model, sufficient for local-only state
- **Cons:** Less tooling than Redux DevTools, no time-travel debugging

**Example:**
```typescript
// shared/context/FamilyContext.jsx
const FamilyContext = createContext();

function familyReducer(state, action) {
  switch (action.type) {
    case 'SET_MEMBERS':
      return { ...state, members: action.payload };
    case 'SET_ACTIVE_PLAYER':
      return { ...state, activeChessPlayer: action.payload };
    default:
      return state;
  }
}

export function FamilyProvider({ children }) {
  const [state, dispatch] = useReducer(familyReducer, initialState);

  return (
    <FamilyContext.Provider value={{ state, dispatch }}>
      {children}
    </FamilyContext.Provider>
  );
}
```

### Pattern 3: Service Worker Cache-First for Offline Chores

**What:** Service Worker intercepts network requests. For chore data, serve from cache first, then attempt background sync when online.

**When to use:** Offline-capable applications where some features must work without internet (chores) while others require connectivity (calendar).

**Trade-offs:**
- **Pros:** Reliable offline experience, smooth performance, automatic background sync
- **Cons:** Cache invalidation complexity, debugging difficulty, initial setup overhead

**Example:**
```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  // Cache-first for chore API endpoints
  if (event.request.url.includes('/api/chores')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          const clonedResponse = response.clone();
          caches.open('chores-v1').then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        });

        return cached || networkFetch;
      })
    );
  }

  // Network-first for calendar (always fresh when online)
  if (event.request.url.includes('/api/calendar')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
```

### Pattern 4: Touch-First Component Design

**What:** All interactive elements designed for touch with minimum 44px touch targets, visual feedback, no hover states.

**When to use:** Kiosk and touchscreen applications where mouse/keyboard may not be available.

**Trade-offs:**
- **Pros:** Better user experience on touch devices, accessibility benefits
- **Cons:** Larger UI footprint, less information density than mouse-optimized interfaces

**Example:**
```typescript
// shared/components/TouchButton.jsx
export function TouchButton({ children, onClick, variant = 'primary' }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      className={`touch-btn touch-btn-${variant} ${pressed ? 'pressed' : ''}`}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      onClick={onClick}
      style={{ minHeight: '56px', minWidth: '56px' }} // 44px minimum + padding
    >
      {children}
    </button>
  );
}
```

### Pattern 5: Express Middleware Chain

**What:** Express routes use middleware for cross-cutting concerns (PIN authentication, error handling, request validation).

**When to use:** All Node.js + Express APIs. Standard 2026 pattern.

**Trade-offs:**
- **Pros:** DRY principle, centralized concerns, composable
- **Cons:** Middleware execution order matters, can be hard to debug

**Example:**
```javascript
// server/routes/chores.js
const express = require('express');
const { requirePin } = require('../middleware/pinAuth');
const { asyncHandler } = require('../middleware/errorHandler');
const choresService = require('../services/choresService');

const router = express.Router();

// GET /api/chores - Public, no PIN required
router.get('/', asyncHandler(async (req, res) => {
  const chores = await choresService.getActiveChores();
  res.json(chores);
}));

// POST /api/chores - Requires PIN
router.post('/', requirePin, asyncHandler(async (req, res) => {
  const newChore = await choresService.createChore(req.body);
  res.status(201).json(newChore);
}));

module.exports = router;
```

## Data Flow

### Request Flow: Chore Completion

```
[User taps checkbox]
    ↓
[ChoreList Component] → [completeChore handler] → [API Client] → [POST /api/chores/:id/complete]
    ↓                                                                        ↓
[UI updates]  ← [State update] ← [Response] ← [choresService.complete()] ← [SQLite UPDATE]
    ↓                                                                        ↓
[Service Worker caches response for offline replay]
```

### Request Flow: Calendar Refresh

```
[Auto-refresh timer (5 min)]
    ↓
[CalendarView] → [fetchEvents hook] → [GET /api/calendar/events] → [calendarService]
    ↓                                                                       ↓
[Display events] ← [State update] ← [Response] ← [Cache + fetch Google Calendar API]
```

### State Management

```
[FamilyContext]
    ↓ (subscribe)
[All Feature Components] ←→ [dispatch actions] → [familyReducer] → [FamilyContext state]

[Local Component State (useState)]
    ↓
[ChessBoard drag state, Calendar view mode, PIN input]
```

### Key Data Flows

1. **Offline Chore Completion:** User completes chore → Optimistic UI update → API call queued → Service Worker syncs when online → Database updated
2. **Calendar Auto-Refresh:** Interval timer fires → Backend fetches from Google Calendar API → Cache result for 5 minutes → Send to frontend → UI updates
3. **Chess Move:** User drags piece → Component validates move → POST to backend → Save to SQLite → Broadcast to other potential viewers (future websocket)
4. **PIN Authentication:** User taps "Add Chore" → PIN pad modal → POST to /api/auth/verify-pin → Middleware sets auth cookie → Protected route accessible

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Single family (3-4 users)** | Current architecture is perfect. SQLite handles thousands of chores/moves easily. No optimization needed. |
| **Multiple families (future)** | Add `family_id` foreign key to all tables. Keep SQLite but add connection pooling. Consider better-sqlite3 for thread safety. |
| **Public deployment** | Switch to PostgreSQL for multi-tenancy. Add authentication system. Calendar API needs rate limiting and user OAuth tokens instead of single API key. |

### Scaling Priorities

1. **First bottleneck:** Google Calendar API rate limits. **Fix:** Implement aggressive caching (5-15 min), use If-Modified-Since headers, consider webhook subscriptions instead of polling.
2. **Second bottleneck:** SQLite write locks if chess moves happen simultaneously with chore completions. **Fix:** Better-sqlite3 already handles this with WAL mode. If still an issue, separate databases per feature.

**For FamilyWall's single-family use case:** Current architecture will never hit these bottlenecks. Don't optimize prematurely.

## Anti-Patterns

### Anti-Pattern 1: Using Redux for Single-Device State

**What people do:** Add Redux Toolkit because it's "best practice" for React state management.

**Why it's wrong:** Redux is designed for complex client-side state synchronization across multiple users/tabs/devices. FamilyWall is single-device with server as source of truth. Redux adds 3-4 extra files per feature and mental overhead without providing value.

**Do this instead:** Use React Context + useReducer for global state (family members, settings). Use local useState for component state (drag positions, modals). Use cache-invalidation for server state (chores, calendar events).

### Anti-Pattern 2: Splitting Frontend and Backend into Separate Repositories

**What people do:** Create `familywall-frontend` and `familywall-backend` as separate repos because "microservices are scalable."

**Why it's wrong:** This is a single-family application deployed on one Raspberry Pi. Separate repos mean coordinating versions, running two build processes, and complexity for no benefit. The entire app runs on localhost.

**Do this instead:** Monorepo with client/ and server/ folders. Single `npm start` command runs both. Express serves React build in production. Simpler deployment, easier development.

### Anti-Pattern 3: Over-Normalizing Database Schema

**What people do:** Create separate tables for `users`, `user_roles`, `chore_assignments`, `chore_templates` with foreign keys trying to prevent duplication.

**Why it's wrong:** You have 3-4 family members and maybe 20 chores. Over-normalization adds JOIN complexity and migration overhead for data that fits in a single SQLite page.

**Do this instead:** Store family members as JSON array in settings table. Chores table has `assigned_to` as simple TEXT field with member name. Recurring chore logic in application code, not database triggers.

### Anti-Pattern 4: Building Custom Chess Logic

**What people do:** Implement chess move validation, checkmate detection, and algebraic notation parsing from scratch.

**Why it's wrong:** Chess is a solved problem with battle-tested libraries. Custom implementation will have bugs (en passant, castling edge cases) and take weeks.

**Do this instead:** Use `chess.js` library for move validation and algebraic notation. Use `react-chessboard` component for UI. Focus your time on the unique parts (family integration, touchscreen UX, persistence).

### Anti-Pattern 5: Hover States and Small Click Targets

**What people do:** Design UI with 24px buttons and hover tooltips because it "looks clean."

**Why it's wrong:** Touchscreens don't support hover. Small targets cause mis-taps and frustration. The project explicitly requires touch-friendly design.

**Do this instead:** Minimum 44x44px touch targets (56px is better). Use active/pressed states instead of hover. Large checkboxes (48px+), large chess pieces. Space out interactive elements with 8-16px gaps.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Google Calendar API** | Server-side proxy with API key | Store API key in `.env` file (not committed). Backend makes requests, caches for 5 min, sends to frontend. No OAuth needed for read-only public calendar access. |
| **Google Calendar (OAuth)** | Alternative for private calendars | Use OAuth 2.0 flow, store refresh token in SQLite settings table. Require setup wizard on first run. More complex but supports private calendars. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **React ↔ Express** | RESTful JSON over HTTP (localhost) | Simple fetch() calls. All endpoints under `/api/*`. CORS not needed (same origin in production). |
| **Express ↔ SQLite** | Synchronous queries with better-sqlite3 | Use `better-sqlite3` (not async `sqlite3`) for simpler code. Wrap in try/catch, not `.then()`. |
| **Chores ↔ Calendar ↔ Chess** | No direct coupling | Features don't import each other. Only shared dependency is FamilyContext for family member names. |
| **Service Worker ↔ React** | Browser Cache API + postMessage | Service Worker caches API responses. React sends sync messages when online. Use Workbox library to simplify. |

## Build Order Recommendations

Based on component dependencies and project requirements:

### Phase 1: Foundation (Week 1)
1. **Backend skeleton**: Express server, SQLite connection, basic error handling
2. **Frontend skeleton**: React app, routing, shared components (TouchButton)
3. **Family management**: Settings API, FamilyContext, simple family member CRUD

**Rationale:** Everything depends on family members being defined. Build this infrastructure first.

### Phase 2: Chores (Week 2-3)
1. **Chores API**: CRUD endpoints, recurring chore generation
2. **Chores UI**: List view, completion checkboxes, add chore (with PIN)
3. **Offline support**: Service Worker, cache-first pattern for chores

**Rationale:** Chores are priority feature (per PROJECT.md). Offline requirement means Service Worker infrastructure benefits calendar later.

### Phase 3: Calendar (Week 4)
1. **Google Calendar API integration**: Backend proxy, caching
2. **Calendar UI**: Daily/weekly/monthly views, auto-refresh
3. **Multi-calendar support**: Fetch from multiple calendar IDs

**Rationale:** Can reuse Service Worker from Phase 2. Simpler than chess (display-only, no complex state).

### Phase 4: Chess (Week 5-6)
1. **Chess state API**: Persist game state, move history
2. **Chess UI**: Board component, drag-and-drop, move validation (chess.js)
3. **Game controls**: New game, undo, player selection

**Rationale:** Most complex UI interactions. Benefits from mature codebase patterns established earlier.

### Phase 5: Polish (Week 7)
1. **Kiosk mode setup**: Auto-start script, fullscreen browser config
2. **Touch optimization**: Adjust sizing, test on actual hardware
3. **Error handling**: Offline indicators, failed API retry logic

**Rationale:** Needs real hardware to test effectively. Do after features are functional.

## Sources

**React Architecture (2026):**
- [React Architecture Patterns and Best Practices for 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)
- [React Stack Patterns](https://www.patterns.dev/react/react-2026/)
- [React Folder Structure in 5 Steps [2025]](https://www.robinwieruch.de/react-folder-structure/)
- [State Management in React (2026): Best Practices, Tools & Real-World Patterns](https://www.c-sharpcorner.com/article/state-management-in-react-2026-best-practices-tools-real-world-patterns/)

**Node.js + SQLite:**
- [How to Use SQLite in Node.js Applications](https://oneuptime.com/blog/post/2026-02-02-sqlite-nodejs/view)
- [Node.js SQLite: Build a simple REST API with Express step-by-step](https://geshan.com.np/blog/2021/10/nodejs-sqlite/)
- [Building Web APIs with Express: A Beginner's Guide](https://betterstack.com/community/guides/scaling-nodejs/express-web-api/)

**Offline-First / PWA:**
- [Progressive Web Apps 2026: PWA Performance Guide](https://www.digitalapplied.com/blog/progressive-web-apps-2026-pwa-performance-guide)
- [Offline and background operation - Progressive web apps | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation)
- [Implementing Offline-First Architecture with Local Databases in React Native](https://www.innovationm.com/blog/react-native-offline-first-architecture-sqlite-local-database-guide/)

**Calendar Integration:**
- [Using the Google Calendar API in React.js: An In-Depth Guide](https://stateful.com/blog/google-calendar-react)
- [react-google-calendar-api - npm](https://www.npmjs.com/package/react-google-calendar-api)

**Chess Components:**
- [react-chessboard - GitHub](https://github.com/Clariity/react-chessboard)
- [Mastering React Chessboard: A Comprehensive Guide for Developers](https://www.dhiwise.com/post/react-chessboard-a-powerful-library-in-react)

**Touchscreen/Kiosk:**
- [Wolfgang Ziegler - Family Dashboard](https://wolfgang-ziegler.com/blog/family-dashboard) (Real-world implementation)
- [Kiosk Software 2025 Guide](https://touchwall.us/blog/kiosk-software-complete-guide/)

**Raspberry Pi Web Applications:**
- [10 Surprisingly Powerful Projects You Can Run on a Raspberry Pi (2025–2026)](https://blog.dreamfactory.com/10-surprisingly-powerful-projects-you-can-run-on-a-raspberry-pi-2025-2026)
- [How to Build a Raspberry Pi Server for Development](https://www.toptal.com/raspberry-pi/how-to-turn-your-raspberry-pi-into-a-development-server)

---
*Architecture research for: FamilyWall family dashboard application*
*Researched: 2026-03-10*
