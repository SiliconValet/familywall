# Phase 4: Calendar Integration - Research

**Researched:** 2026-03-23
**Domain:** Google Calendar API integration, OAuth 2.0 authentication, React calendar view rendering
**Confidence:** HIGH

## Summary

Phase 4 integrates Google Calendar events with the existing FamilyWall chore system, providing a unified family timeline view. The implementation requires OAuth 2.0 authentication for read-only calendar access, local caching of calendar events in SQLite, and custom calendar view components (daily agenda, weekly multi-column, monthly grid) that merge Google Calendar events with chore data.

The technical approach leverages googleapis (Node.js official client library) for backend Calendar API access, custom React view components built on existing shadcn/ui patterns rather than heavy third-party calendar libraries, and a polling-based auto-refresh strategy with 15-minute intervals. User decisions from CONTEXT.md constrain the implementation to simple OAuth (single Google account), automatic color mapping by calendar name, and three specific view layouts.

**Primary recommendation:** Use googleapis package with OAuth 2.0 for backend calendar access, implement custom React view components using existing shadcn patterns (avoid react-big-calendar bloat), cache events in SQLite with sync tokens for efficient incremental updates, and leverage date-fns (already installed) with @date-fns/tz for timezone handling.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Google Calendar Setup & Authentication**
- **D-01:** OAuth flow lives in Settings page (PIN-protected, matches Phase 2 pattern)
- **D-02:** Default setup: Single family Google Calendar (simple onboarding)
- **D-03:** Advanced option: Additional per-person calendars can be added
- **D-04:** Single Google account authentication with calendar selection UI
- **D-05:** Automatic calendar-to-family-member color mapping by calendar name match (if calendar name contains family member name, assign that color; fallback to default color)
- **D-06:** Settings UI shows: connected account, list of selected calendars, family member color assignments

**Sync & Refresh Strategy**
- **D-07:** Auto-refresh every 15 minutes in background (per requirements CAL-09)
- **D-08:** Manual refresh button (icon in top-right corner) for immediate sync
- **D-09:** Refresh fetches latest events from Google Calendar API and merges with local chore data
- **D-10:** Loading indicator during sync (subtle spinner on refresh button)

**View Layouts & Rendering**
- **D-11:** Three view modes: Daily, Weekly, Monthly
- **D-12:** Daily view = vertical agenda list (time-sorted events + chores)
- **D-13:** Weekly view = 7-column agenda (daily lists side-by-side, Mon-Sun)
- **D-14:** Monthly view = traditional calendar grid (7 columns Sun-Sat, 5-6 week rows)
- **D-15:** Monthly grid cells show color-coded event dots (one dot per event/chore)
- **D-16:** Tap day cell in monthly view navigates to that day's agenda view

**Event Display & Interaction**
- **D-17:** All-day events display in separate section at top of daily/weekly views
- **D-18:** Event cards show: time + title only (color bar indicates family member)
- **D-19:** Tap event card opens inline expansion showing full details (description, location, time)
- **D-20:** Chores display inline with events (checkboxes visible, sorted by time or points)
- **D-21:** Color-coding reuses family member palette from Phase 3 (blue, green, purple, orange)
- **D-22:** Empty state shows minimal message: "No events today" (matches chore pattern)

**Navigation & Controls**
- **D-23:** Two-row top bar layout for Calendar view
- **D-24:** Row 1: View switcher buttons [Daily] [Weekly] [Monthly] (horizontal, reuses toggle pattern from chores)
- **D-25:** Row 2: Period navigation [< Today] [March 2026] [>]
- **D-26:** Arrow buttons navigate prev/next day/week/month based on current view
- **D-27:** Period label shows current period (e.g., "March 23, 2026" for daily, "Mar 17-23, 2026" for weekly, "March 2026" for monthly)
- **D-28:** Today button jumps to current period in active view mode
- **D-29:** Refresh icon button in top-right corner (separate from navigation)
- **D-30:** All buttons meet 44px minimum touch target (Phase 2 requirement)

**Chores + Calendar Integration**
- **D-31:** Calendar view shows unified timeline: Google Calendar events + chores together
- **D-32:** Chores tab remains separate for focused task completion (current functionality unchanged)
- **D-33:** Calendar queries both `/api/calendar/events` AND `/api/chores` endpoints, merges by time
- **D-34:** Chores in calendar view show checkbox (completion works same as Chores tab)
- **D-35:** Completed chores fade out in calendar view (same behavior as Chores tab)

### Claude's Discretion
- Event card animation timing for inline expansion
- Loading skeleton design while fetching calendar data
- Exact color shade matching for family member palette
- Error message wording for API failures
- OAuth token storage mechanism (secure, persistent)
- Calendar API request batching and caching strategy
- Exact dot size and positioning in monthly grid cells
- Period label formatting and date localization

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.

Event creation from FamilyWall explicitly out of scope (per PROJECT.md: "Calendar event creation — Read-only calendar, create events in Google Calendar directly").

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAL-01 | App connects to Google Calendar API | googleapis package (Node.js official client) + OAuth 2.0 authentication flow |
| CAL-02 | User can configure multiple Google Calendar sources | CalendarList API endpoint lists all calendars for authenticated account |
| CAL-03 | Events display with color-coding by family member | Automatic name-matching algorithm (calendar name → family member → chart color) |
| CAL-04 | User can switch between daily view (timeline 6AM-10PM) | Custom React component with vertical agenda list, time-sorted rendering |
| CAL-05 | User can switch between weekly view (7-day grid) | Custom React component with 7-column layout (Mon-Sun), agenda lists |
| CAL-06 | User can switch between monthly view (calendar grid) | Custom React component with 7×5-6 grid layout, color dots per event |
| CAL-07 | User can navigate to previous/next day/week/month | Date arithmetic with date-fns (addDays, addWeeks, addMonths) |
| CAL-08 | User can jump to today with single tap | Reset view state to current date with date-fns startOfDay/Week/Month |
| CAL-09 | Calendar auto-refreshes every 15 minutes | useInterval custom hook with 15-minute polling, page visibility detection |
| CAL-10 | User can see event details by tapping event | Inline expansion pattern (accordion-style) showing description, location, time |
| CAL-11 | All-day events display separately from timed events | Filter events by event.start.date (all-day) vs event.start.dateTime (timed) |
| CAL-12 | Current time indicator shows in daily view | Calculate current time position, render horizontal line with time label |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| googleapis | 171.4.0 | Google Calendar API client | Official Google library, auto token refresh, 2M+ weekly downloads |
| date-fns | 4.1.0 | Date manipulation | Already installed Phase 3, zero dependencies, tree-shakeable |
| @date-fns/tz | 1.4.1 | Timezone handling | Official date-fns timezone support, modern TZDate class (v4.0+) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| better-sqlite3 | 11.0.0 | Calendar event cache | Already installed, stores events for offline resilience |
| @testing-library/react | 16.3.2 | Component testing | Already installed, test calendar view rendering |
| vitest | 4.1.0 | Test framework | Already installed, test date logic and API mocking |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom calendar views | react-big-calendar | RBC is 500K+ downloads/week but brings 8,500+ lines of code for features not needed (drag-drop, resource scheduling); custom views match existing shadcn patterns and bundle size |
| Custom calendar views | FullCalendar | 1M+ downloads/week but commercial license for advanced features; overkill for read-only agenda views |
| Custom views | @date-fns/tz | TZDate approach (1kB) vs date-fns-tz (larger); v4.0+ TZDate is modern standard |
| SQLite cache | Redis/Memcached | Redis adds deployment complexity on Raspberry Pi; SQLite already installed, zero config |

**Installation:**
```bash
npm install googleapis@171.4.0 @date-fns/tz@1.4.1 --save
```

**Version verification:** Verified 2026-03-23 via npm registry. date-fns 4.1.0 already installed from Phase 3.

## Architecture Patterns

### Recommended Project Structure
```
server/
├── features/
│   └── calendar/
│       ├── calendar.db.js        # SQLite schema + queries
│       ├── calendar.service.js   # Google API client + sync logic
│       └── calendar.routes.js    # REST endpoints

client/src/
├── features/
│   └── calendar/
│       ├── components/
│       │   ├── CalendarView.tsx          # Main container
│       │   ├── DailyAgenda.tsx           # Vertical timeline
│       │   ├── WeeklyAgenda.tsx          # 7-column grid
│       │   ├── MonthlyGrid.tsx           # Calendar grid
│       │   ├── EventCard.tsx             # Event display
│       │   └── CalendarSettings.tsx      # OAuth + calendar picker
│       ├── hooks/
│       │   ├── useCalendarData.ts        # Fetch + merge events/chores
│       │   ├── useCalendarSync.ts        # Manual + auto refresh
│       │   └── useInterval.ts            # Declarative polling
│       └── types/
│           └── calendar.ts               # CalendarEvent, CalendarSource types
```

### Pattern 1: OAuth 2.0 Web Server Flow (Backend)
**What:** Server-side OAuth with authorization code exchange for access + refresh tokens
**When to use:** When frontend can't securely store client secret (single-page apps)
**Example:**
```javascript
// Source: https://developers.google.com/identity/protocols/oauth2/web-server
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:8000/api/calendar/oauth/callback'
);

// Step 1: Generate auth URL (server returns to frontend)
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline', // CRITICAL: required for refresh_token
  scope: ['https://www.googleapis.com/auth/calendar.readonly'],
  prompt: 'consent' // force consent to always get refresh token
});

// Step 2: Exchange authorization code for tokens (callback endpoint)
const { tokens } = await oauth2Client.getToken(code);
oauth2Client.setCredentials(tokens);

// Step 3: Store refresh_token in SQLite (only received on first auth)
// Access tokens auto-refresh via 'tokens' event listener
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    // Store in calendar_auth table
  }
});
```

### Pattern 2: Incremental Sync with Sync Tokens
**What:** Use Google Calendar sync tokens to fetch only changed events since last sync
**When to use:** After initial full sync, for all subsequent auto-refresh polling
**Example:**
```javascript
// Source: https://developers.google.com/workspace/calendar/api/guides/sync
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// Initial full sync
let response = await calendar.events.list({
  calendarId: 'primary',
  timeMin: new Date().toISOString(),
  maxResults: 2500,
  singleEvents: true
});
const nextSyncToken = response.data.nextSyncToken;
// Store events in SQLite, save nextSyncToken

// Incremental sync (15-minute polling)
response = await calendar.events.list({
  calendarId: 'primary',
  syncToken: nextSyncToken // only changed events returned
});
// Update SQLite with changes, save new nextSyncToken

// Handle invalidation: HTTP 410 → clear cache, re-run full sync
```

### Pattern 3: Declarative Polling with useInterval Hook
**What:** Custom hook that handles setInterval cleanup and stale closure issues
**When to use:** Auto-refresh every 15 minutes, pause when page not visible
**Example:**
```typescript
// Source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return; // pause polling
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// Usage with page visibility detection
function useCalendarSync() {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useInterval(() => {
    fetch('/api/calendar/sync', { method: 'POST' });
  }, isVisible ? 15 * 60 * 1000 : null); // 15 minutes when visible
}
```

### Pattern 4: Timezone-Aware Event Rendering
**What:** Convert Google Calendar event times (RFC3339 with timezone) to user's local timezone
**When to use:** Display event times in daily/weekly views
**Example:**
```typescript
// Source: https://www.npmjs.com/package/@date-fns/tz
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

// Google Calendar event: { start: { dateTime: "2026-03-23T14:00:00-07:00" } }
const eventStartTZ = new TZDate(event.start.dateTime); // preserves timezone
const localTime = format(eventStartTZ, 'h:mm a'); // "2:00 PM" (user's local)

// All-day events: { start: { date: "2026-03-23" } }
const isAllDay = !event.start.dateTime;
```

### Pattern 5: Merged Timeline (Events + Chores)
**What:** Fetch calendar events and chores separately, merge by time, render unified list
**When to use:** Daily and weekly views
**Example:**
```typescript
// Source: Project pattern from Phase 3 useChoreData
const { events, loading: eventsLoading } = useCalendarData(viewDate);
const { chores, loading: choresLoading } = useChoreData('daily');

const mergedItems = useMemo(() => {
  const items = [
    ...events.map(e => ({ type: 'event', time: e.start.dateTime || e.start.date, data: e })),
    ...chores.map(c => ({ type: 'chore', time: c.due_date || c.created_at, data: c }))
  ];
  return items.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}, [events, chores]);
```

### Anti-Patterns to Avoid
- **Storing access tokens without refresh tokens:** access_type must be 'offline' and prompt='consent' on first auth
- **Client-side OAuth with client secret:** Never expose GOOGLE_CLIENT_SECRET in frontend code
- **Polling without page visibility detection:** Wastes quota when user switches tabs
- **Full sync every 15 minutes:** Use sync tokens for incremental updates (saves quota + bandwidth)
- **Ignoring HTTP 410 on sync:** Token invalidation MUST trigger full re-sync, not retry with same token
- **Using react-big-calendar for simple agenda views:** 8,500+ lines of code for features not needed

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth 2.0 flow | Custom token exchange, refresh logic | googleapis OAuth2Client | Handles token refresh automatically, 'tokens' event for persistence, battle-tested |
| Date arithmetic | Custom day/week/month navigation | date-fns addDays/addWeeks/addMonths | Handles edge cases (month boundaries, leap years, DST) |
| Timezone conversion | Manual UTC offset calculations | @date-fns/tz TZDate | RFC3339 parsing, DST handling, locale-aware formatting |
| Polling interval | Raw setInterval with useState | useInterval custom hook | Avoids stale closure bugs, cleanup on unmount, pause/resume |
| Calendar sync | Full event re-fetch every poll | Google sync tokens | 410 invalidation handling, pagination, deleted event detection |

**Key insight:** Google Calendar API has subtle edge cases (sync token invalidation, refresh token one-time delivery, RFC3339 timezone formats) that official libraries handle correctly. Custom implementations miss these and cause production bugs.

## Runtime State Inventory

> Omitted — this is a greenfield feature phase with no rename/refactor/migration requirements.

## Common Pitfalls

### Pitfall 1: Refresh Token Not Saved on First Auth
**What goes wrong:** User completes OAuth flow, app works temporarily, then fails after access token expires (1 hour). Re-auth doesn't provide refresh token again.
**Why it happens:** Refresh tokens only appear on FIRST authorization when `access_type: 'offline'` AND `prompt: 'consent'` are set. Subsequent auths without `prompt: 'consent'` return no refresh token.
**How to avoid:**
1. Always set `access_type: 'offline'` and `prompt: 'consent'` in `generateAuthUrl()`
2. Listen to `oauth2Client.on('tokens', ...)` event and save `tokens.refresh_token` to SQLite IMMEDIATELY
3. Test: After first auth, delete browser session cookies and restart server — app should still work (using stored refresh token)
**Warning signs:** "invalid_grant" errors after app restart, access token works for 1 hour then fails

### Pitfall 2: Sync Token Invalidation Not Handled (HTTP 410)
**What goes wrong:** Auto-refresh polling fails with HTTP 410, app keeps retrying with same sync token, no events appear
**Why it happens:** Google invalidates sync tokens when: access control changes, too much time elapsed, calendar deleted. Server returns 410 Gone, expecting client to clear local cache and re-sync.
**How to avoid:**
1. Wrap `events.list({ syncToken })` in try-catch
2. On 410 error: DELETE all cached events for that calendar, clear sync token, trigger full sync
3. On 500/503: Retry with exponential backoff (temporary failure)
**Warning signs:** Events disappear from UI, logs show "Sync token is no longer valid"

### Pitfall 3: Timezone Confusion (UTC vs Local vs Event Timezone)
**What goes wrong:** Event shows "2:00 PM" but user calendar says "5:00 PM", or all-day events appear on wrong date
**Why it happens:** Google Calendar events have 3 formats:
- Timed events: `{ dateTime: "2026-03-23T14:00:00-07:00" }` (includes timezone)
- All-day events: `{ date: "2026-03-23" }` (no time, no timezone)
- Recurring: `{ dateTime: "2026-03-23T14:00:00Z", timeZone: "America/Los_Angeles" }` (UTC + separate timezone field)
**How to avoid:**
1. Use `@date-fns/tz` TZDate for all event time parsing (handles RFC3339 + timezone)
2. Check `event.start.date` (all-day) vs `event.start.dateTime` (timed) and render separately
3. Store events in SQLite as UTC, convert to local timezone only for display
4. For all-day events, use `date-fns` `startOfDay()` without timezone conversion
**Warning signs:** Events off by hours (timezone offset), all-day events span two days

### Pitfall 4: Exceeding Calendar API Quota (1M/day, per-minute limits)
**What goes wrong:** API returns 429 "Rate Limit Exceeded", calendar stops syncing
**Why it happens:** May 2021 change enforces per-minute quotas (not just daily). Polling 10 calendars every 15 minutes = 960 requests/day per user (safe), but burst polling (e.g., rapid manual refresh clicks) hits per-minute limit.
**How to avoid:**
1. Implement debounce on manual refresh button (prevent spam clicks)
2. Use incremental sync (sync tokens) instead of full event list every poll
3. If multiple calendars: batch requests or stagger fetches (e.g., 1 calendar per minute)
4. Handle 429: Exponential backoff, show user-friendly error ("Too many refreshes, try again in 1 minute")
**Warning signs:** 429 errors in logs, sync works initially then stops

### Pitfall 5: OAuth Redirect URI Mismatch (Development vs Production)
**What goes wrong:** OAuth consent screen works in dev (localhost), fails in production with "redirect_uri_mismatch" error
**Why it happens:** Google Cloud Console requires EXACT redirect URIs to be whitelisted. `http://localhost:8000/callback` works in dev, but production uses `http://192.168.1.100:8000/callback` (Pi's IP) — not whitelisted.
**How to avoid:**
1. Whitelist BOTH in Google Cloud Console: `http://localhost:8000/api/calendar/oauth/callback` AND `http://<PI_IP>:8000/api/calendar/oauth/callback`
2. Use environment variable for redirect URI: `process.env.OAUTH_REDIRECT_URI`
3. Test OAuth flow on actual Raspberry Pi (not just dev machine) before phase completion
**Warning signs:** "Error 400: redirect_uri_mismatch" on production device, works on laptop

### Pitfall 6: Storing Client Secret in Frontend Code
**What goes wrong:** GOOGLE_CLIENT_SECRET exposed in client bundle, security violation, OAuth compromised
**Why it happens:** Frontend needs to initiate OAuth flow, developer mistakenly imports client secret in React component
**How to avoid:**
1. OAuth flow MUST be server-initiated: Frontend calls `/api/calendar/auth` → server generates auth URL with client secret
2. Client secret NEVER leaves server, stored in `.env` (not committed to git)
3. Frontend receives auth URL as string, opens in new window, receives callback code
**Warning signs:** Build bundle contains "GOCSPX-" string (Google client secret format)

## Code Examples

Verified patterns from official sources:

### Google Calendar API Client Setup (Backend)
```javascript
// Source: https://developers.google.com/workspace/calendar/api/quickstart/nodejs
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URI
);

// Load stored refresh token from SQLite
const { refresh_token } = db.prepare('SELECT refresh_token FROM calendar_auth WHERE id = 1').get();
if (refresh_token) {
  oauth2Client.setCredentials({ refresh_token });
}

// Auto-refresh handled automatically
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
```

### Fetch Events for Date Range
```javascript
// Source: https://developers.google.com/workspace/calendar/api/v3/reference/events/list
import { startOfDay, endOfDay } from 'date-fns';

const dayStart = startOfDay(new Date()).toISOString();
const dayEnd = endOfDay(new Date()).toISOString();

const response = await calendar.events.list({
  calendarId: 'primary',
  timeMin: dayStart,
  timeMax: dayEnd,
  maxResults: 250,
  singleEvents: true, // expand recurring events
  orderBy: 'startTime'
});

const events = response.data.items;
```

### List User's Calendars
```javascript
// Source: https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list
const calendarListResponse = await calendar.calendarList.list();
const calendars = calendarListResponse.data.items.map(cal => ({
  id: cal.id,
  summary: cal.summary, // calendar name
  backgroundColor: cal.backgroundColor,
  selected: cal.selected
}));
```

### Custom useInterval Hook (React)
```typescript
// Source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => savedCallback.current?.(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

### Timezone-Aware Event Time Display
```typescript
// Source: https://www.npmjs.com/package/@date-fns/tz
import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';

interface CalendarEvent {
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}

function formatEventTime(event: CalendarEvent): string {
  if (event.start.date) {
    return 'All day'; // All-day event
  }

  const startTZ = new TZDate(event.start.dateTime!);
  const endTZ = new TZDate(event.end.dateTime!);

  return `${format(startTZ, 'h:mm a')} - ${format(endTZ, 'h:mm a')}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| date-fns-tz package | @date-fns/tz with TZDate | date-fns v4.0 (2024) | TZDate class works with all date-fns functions, 1kB size, native timezone support |
| Daily quota limits | Per-minute sliding window | May 2021 | Better burst handling, rate limiting instead of day-long failures |
| Moment.js for dates | date-fns | 2018+ | Tree-shakeable, immutable, zero dependencies (Moment deprecated 2020) |
| OAuth implicit flow | OAuth authorization code flow | 2019+ | More secure for SPAs, refresh token support |
| Full sync every poll | Incremental sync with sync tokens | Always available | Reduces bandwidth and quota usage by 90%+ after initial sync |

**Deprecated/outdated:**
- **Moment.js:** Project entered maintenance mode in 2020, recommends date-fns or Luxon
- **@google-cloud/local-auth for web apps:** Desktop OAuth library, use OAuth2Client for web server apps
- **OAuth implicit flow:** Google deprecated for security reasons, use authorization code flow

## Open Questions

1. **Calendar selection persistence strategy**
   - What we know: User can select multiple calendars, stored in `calendar_sources` table
   - What's unclear: Should calendar selection be per-family-member or global for household?
   - Recommendation: Start with global (simpler), can enhance to per-member in v2 if needed

2. **Offline behavior after initial sync**
   - What we know: SQLite cache stores events, auto-refresh polls every 15 minutes
   - What's unclear: How long should cached events remain valid without network?
   - Recommendation: Show cached events indefinitely, display "Last synced X minutes ago" banner when sync fails

3. **Recurring event expansion limits**
   - What we know: `singleEvents: true` expands recurring events into individual instances
   - What's unclear: Google's limit on expansion window (does it expand 1 year of daily events?)
   - Recommendation: Fetch events for current view period only (day/week/month), not unbounded future

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Backend Google API client | ✓ | v24.9.0 | — |
| npm | Package installation | ✓ | 11.6.2 | — |
| SQLite (better-sqlite3) | Event cache storage | ✓ | 11.0.0 | — |
| date-fns | Date manipulation | ✓ | 4.1.0 | — |
| Internet connection | Google Calendar API access | ✓ (assumed) | — | Show cached events only |

**Missing dependencies with no fallback:**
- None — all required dependencies already installed or available

**Missing dependencies with fallback:**
- Internet connection: If network unavailable, display last synced events from SQLite cache with warning banner

## Validation Architecture

> Section included because workflow.nyquist_validation is true in .planning/config.json

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 + @testing-library/react 16.3.2 |
| Config file | client/vitest.config.ts |
| Quick run command | `npm run test:client -- --run` |
| Full suite command | `npm run test:client -- --run --coverage` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAL-01 | Google Calendar API connection | integration | Manual verification (requires OAuth setup) | ❌ Wave 0 |
| CAL-02 | Configure multiple calendar sources | unit | `npm run test:client -- CalendarSettings.test.tsx -x` | ❌ Wave 0 |
| CAL-03 | Color-coding by family member | unit | `npm run test:client -- EventCard.test.tsx::test_color_mapping -x` | ❌ Wave 0 |
| CAL-04 | Daily view rendering | unit | `npm run test:client -- DailyAgenda.test.tsx -x` | ❌ Wave 0 |
| CAL-05 | Weekly view rendering | unit | `npm run test:client -- WeeklyAgenda.test.tsx -x` | ❌ Wave 0 |
| CAL-06 | Monthly view rendering | unit | `npm run test:client -- MonthlyGrid.test.tsx -x` | ❌ Wave 0 |
| CAL-07 | Previous/next navigation | unit | `npm run test:client -- CalendarView.test.tsx::test_navigation -x` | ❌ Wave 0 |
| CAL-08 | Jump to today | unit | `npm run test:client -- CalendarView.test.tsx::test_today_button -x` | ❌ Wave 0 |
| CAL-09 | Auto-refresh every 15 minutes | unit | `npm run test:client -- useCalendarSync.test.tsx -x` | ❌ Wave 0 |
| CAL-10 | Tap event for details | unit | `npm run test:client -- EventCard.test.tsx::test_expansion -x` | ❌ Wave 0 |
| CAL-11 | All-day events separate | unit | `npm run test:client -- DailyAgenda.test.tsx::test_allday_section -x` | ❌ Wave 0 |
| CAL-12 | Current time indicator | unit | `npm run test:client -- DailyAgenda.test.tsx::test_time_indicator -x` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Run tests for modified components only (fast unit tests < 5 seconds)
- **Per wave merge:** `npm run test:client -- --run` (all calendar component tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `client/src/features/calendar/components/__tests__/CalendarView.test.tsx` — covers CAL-07, CAL-08
- [ ] `client/src/features/calendar/components/__tests__/DailyAgenda.test.tsx` — covers CAL-04, CAL-11, CAL-12
- [ ] `client/src/features/calendar/components/__tests__/WeeklyAgenda.test.tsx` — covers CAL-05
- [ ] `client/src/features/calendar/components/__tests__/MonthlyGrid.test.tsx` — covers CAL-06
- [ ] `client/src/features/calendar/components/__tests__/EventCard.test.tsx` — covers CAL-03, CAL-10
- [ ] `client/src/features/calendar/components/__tests__/CalendarSettings.test.tsx` — covers CAL-02
- [ ] `client/src/features/calendar/hooks/__tests__/useCalendarSync.test.tsx` — covers CAL-09

**Note:** CAL-01 (Google Calendar API connection) requires manual verification with real OAuth credentials, not suitable for automated unit testing. Integration test should verify token refresh and API error handling with mocked API responses.

## Sources

### Primary (HIGH confidence)
- [Google Calendar API Node.js Quickstart](https://developers.google.com/workspace/calendar/api/quickstart/nodejs) - OAuth setup, authentication flow
- [Google Calendar API Reference - Events](https://developers.google.com/workspace/calendar/api/v3/reference/events/list) - Event fetching, query parameters
- [Google Calendar API Reference - CalendarList](https://developers.google.com/workspace/calendar/api/v3/reference/calendarList/list) - Calendar selection
- [Google Calendar API Sync Guide](https://developers.google.com/workspace/calendar/api/guides/sync) - Incremental sync, sync tokens
- [googleapis GitHub](https://github.com/googleapis/google-api-nodejs-client) - Official client library, token refresh
- [date-fns/tz npm package](https://www.npmjs.com/package/@date-fns/tz) - TZDate class, timezone handling
- [npm registry - googleapis 171.4.0](https://www.npmjs.com/package/googleapis) - Current version verification
- [npm registry - @date-fns/tz 1.4.1](https://www.npmjs.com/package/@date-fns/tz) - Current version verification

### Secondary (MEDIUM confidence)
- [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/) - Dan Abramov's useInterval pattern
- [React calendar components: 6 best libraries 2025](https://www.builder.io/blog/best-react-calendar-component-ai) - Library comparison
- [Google Calendar API Quota Limits](https://developers.google.com/workspace/calendar/api/guides/quota) - 1M/day limit, per-minute enforcement
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server) - Authorization code flow
- [shadcn/ui Calendar Component](https://ui.shadcn.com/docs/components/radix/calendar) - react-day-picker integration

### Tertiary (LOW confidence)
- [Polling in React - DEV Community](https://dev.to/tangoindiamango/polling-in-react-3h8a) - Polling patterns, page visibility
- [Node.js Auth Security Best Practices (2026)](https://www.authgear.com/post/nodejs-security-best-practices) - Token storage recommendations
- [React Calendar Timezones Example](https://demo.mobiscroll.com/react/calendar/setting-the-picker-timezone) - Timezone pitfalls

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - googleapis is official Google library, date-fns already used in project
- Architecture: HIGH - Patterns verified from official Google docs, React hooks from authoritative sources
- Pitfalls: MEDIUM-HIGH - Based on official docs + community reports, some edge cases need runtime validation

**Research date:** 2026-03-23
**Valid until:** 2026-04-23 (30 days - stable APIs, OAuth 2.0 and Calendar API v3 are mature standards)
