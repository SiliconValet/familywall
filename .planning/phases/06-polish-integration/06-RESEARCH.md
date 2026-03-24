# Phase 6: Polish & Integration - Research

**Researched:** 2026-03-23
**Domain:** React/TypeScript frontend hardening, SQLite schema evolution, Raspberry Pi kiosk UX
**Confidence:** HIGH — all findings grounded in direct codebase inspection and verified package registry

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Offline & Error Indicators**
- D-01: Show a sonner toast when internet/API connectivity is lost, then stay silent. No persistent banner, no per-section status badges.
- D-02: Calendar is the only internet-dependent section. Chores use local SQLite — no offline indicator needed.
- D-03: Retry strategy: keep existing useInterval auto-refresh (calendar every 15 minutes). No additional exponential backoff or manual retry button needed.

**On-Screen Virtual Keyboard**
- D-04: Keyboard auto-appears when any text input field is focused (no explicit keyboard button per input).
- D-05: Fixed bottom overlay — keyboard slides up from the bottom edge, content above scrolls/shifts.
- D-06: Single QWERTY layout with top numbers row and backspace. PIN numeric input already handled by PinModal — no separate NUM pad layout needed.
- D-07: Keyboard dismisses on tap outside OR when the Done button is pressed.

**Family Member Color Assignment**
- D-08: Pre-defined palette of ~8 distinct, accessible colors shown as swatches. No full color picker.
- D-09: Color selection lives inside the existing FamilyFormModal. No new screens or separate settings section.
- D-10: Auto-assign from palette on create (first unassigned color). Member can change color in edit modal at any time.
- D-11: Calendar events automatically use the matched family member's assigned color. No separate calendar-source-to-color mapping needed in CalendarSettings.

**Settings Tab Restructure**
- D-12: Rename the "Family" tab to "Settings" and move it to the rightmost position in the nav bar.
- D-13: Settings tab contains: family member list (existing), followed by system settings section — PIN change and Exit Kiosk button.
- D-14: Exit Kiosk Mode button requires PIN before executing.
- D-15: Exit Kiosk action kills the kiosk Chromium process via a server-side `/api/system/exit-kiosk` endpoint.

**PIN Session Timeout**
- D-16: 60-second grace period after last successful PIN verification.
- D-17: Timer resets on each successful authenticated action.
- D-18: No visual countdown indicator — session expires silently.
- D-19: Implemented in `usePinAuth` hook — add `lastAuthTime` ref and check elapsed time before showing PIN modal vs. executing directly.

### Claude's Discretion
- Exact color palette values (8 colors with good contrast on both light and dark backgrounds)
- On-screen keyboard library choice vs. custom React component
- Keyboard animation timing and exact height
- Which system command kills the kiosk Chromium on labwc (reference Phase 1 restart script pattern)
- Memory monitoring approach for 24-hour stability (if any client-side action is taken)
- Error toast wording for calendar connectivity failures

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 6 is a production-hardening phase with no new features — only cross-cutting quality improvements on an already-complete codebase. All five work streams are internal UI/UX and system-level changes: offline error notifications (sonner toast on calendar fetch failure), an on-screen virtual keyboard (context provider + fixed-bottom overlay), family member color assignment (SQLite schema column + color swatch picker in FamilyFormModal), Settings tab restructure (rename/reorder nav + exit-kiosk endpoint), and PIN session timeout (lastAuthTime ref in usePinAuth).

The codebase is clean and well-structured. Every change builds on an established pattern: sonner toasts are already used, the withPinAuth pattern is already established, FamilyFormModal already handles add/edit, and the Chromium kill command already appears in `scripts/restart-kiosk.sh`. The main technical challenge is the on-screen keyboard — this is the only component with meaningful library vs. custom trade-offs.

One pre-existing test failure exists in `ChoreCard.test.tsx` (FamilyMemberBadge color assertion using `var(--chart-1)` which doesn't resolve in jsdom). This test will need to be updated as part of Phase 6's color assignment work.

**Primary recommendation:** Use `react-simple-keyboard` v3.8.178 for the on-screen keyboard — it is maintained, has zero production dependencies, supports React 19, and provides the exact QWERTY layout needed. Implement all other changes as direct code edits using established project patterns.

---

## Standard Stack

### Core (already installed — no new installs required except keyboard)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.0.0 | UI components | Project baseline |
| TypeScript | 5.9.3 | Type safety | Project baseline |
| shadcn/ui (radix-ui) | 1.4.3 | Dialog, Button, Label, Input | Already installed, all modals use it |
| sonner | 2.0.7 | Toast notifications | Established in Phase 2, already used project-wide |
| better-sqlite3 | 11.0.0 | SQLite DDL migration (add color column) | Server DB layer |
| Fastify 5 | 5.0.0 | New `/api/system/exit-kiosk` endpoint | Server baseline |

### New Dependency — Virtual Keyboard

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-simple-keyboard | 3.8.178 | On-screen QWERTY keyboard overlay | Zero production deps, React 19 peer dep declared, 3.8M weekly downloads, kiosk/touch-screen standard |

**Installation:**
```bash
cd client && npm install react-simple-keyboard
```

**Version verification (confirmed 2026-03-23):**
- `react-simple-keyboard`: 3.8.178 (latest) — peer deps: `react ^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`
- `sonner`: 2.0.7 (already installed)

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-simple-keyboard | Custom React component | Custom = faster bundle, but significant implementation time for key repeat, layout rendering, and touch handling. react-simple-keyboard is designed for kiosk/touchscreen use cases. |
| react-simple-keyboard | simple-keyboard (vanilla) | simple-keyboard is the underlying engine; react-simple-keyboard wraps it in a React component. The React wrapper is the right choice for this project. |

---

## Architecture Patterns

### Recommended Project Structure (additions only)

```
client/src/
├── components/
│   ├── VirtualKeyboard.tsx       # New: keyboard overlay component
│   ├── FamilyFormModal.tsx       # Modified: add color swatch picker
│   ├── FamilyMemberBadge.tsx     # Modified: consume member.color instead of colorIndex
│   └── FamilyList.tsx            # Modified: settings section + exit kiosk button
├── context/
│   └── KeyboardContext.tsx       # New: context provider for keyboard visibility
├── hooks/
│   └── usePinAuth.ts             # Modified: add lastAuthTime ref
├── types/
│   └── family.ts                 # Modified: add color field to FamilyMember interface
server/
├── routes/
│   ├── family.js                 # Modified: add color to GET/POST/PUT
│   └── system.js                 # New: exit-kiosk endpoint
├── db.js                         # Modified: ALTER TABLE to add color column
└── index.js                      # Modified: register system routes
```

### Pattern 1: PIN Session Timeout (usePinAuth extension)

**What:** Add `lastAuthTime` as a `useRef<number>` initialized to 0. In `withPinAuth`, check `Date.now() - lastAuthTime.current < 60_000` before deciding to show modal or execute directly. On successful PIN verification, set `lastAuthTime.current = Date.now()`.

**When to use:** All protected actions that already flow through `withPinAuth`.

**Current usePinAuth shape (confirmed by source read):**
```typescript
// Current withPinAuth (simplified)
const withPinAuth = useCallback((action: () => Promise<void>) => {
  setPendingAction(() => action);
  setPinError(null);
  setShowPinModal(true);
}, []);
```

**Extended pattern:**
```typescript
// Add at hook top:
const lastAuthTime = useRef<number>(0);

// Modified withPinAuth:
const withPinAuth = useCallback((action: () => Promise<void>) => {
  const elapsed = Date.now() - lastAuthTime.current;
  if (elapsed < 60_000 && lastAuthTime.current > 0) {
    // Within grace period — execute directly
    action();
    lastAuthTime.current = Date.now(); // Reset timer (D-17)
    return;
  }
  setPendingAction(() => action);
  setPinError(null);
  setShowPinModal(true);
}, []);

// In verifyPin, after `data.valid` is true:
lastAuthTime.current = Date.now();
```

**Key nuance:** `useRef` (not `useState`) is correct here — timer updates must NOT trigger re-renders. The CONTEXT.md explicitly specifies `useRef<number>` (D-19).

### Pattern 2: Virtual Keyboard Context Provider

**What:** A React context that listens for `focus` events on `<input>` elements globally, shows/hides the keyboard overlay accordingly.

**When to use:** Wraps the entire app in App.tsx so all inputs site-wide get keyboard support.

**Pattern:**
```typescript
// KeyboardContext.tsx
const KeyboardContext = createContext<{ show: boolean; setValue: (v: string) => void }>(...);

export function KeyboardProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false);
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement) {
        setInputRef(e.target as HTMLInputElement);
        setShow(true);
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      // hide if click target is not keyboard or input
    };
    document.addEventListener('focusin', onFocus);
    return () => document.removeEventListener('focusin', onFocus);
  }, []);

  // ...
}
```

**react-simple-keyboard integration:**
```typescript
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

// Layout: standard QWERTY with numbers row and backspace
const layout = {
  default: [
    '1 2 3 4 5 6 7 8 9 0 {bksp}',
    'q w e r t y u i o p',
    'a s d f g h j k l',
    'z x c v b n m {space}',
    '{done}'
  ]
};
```

**Important:** react-simple-keyboard does NOT control React input state directly — it fires `onChange` with the new value. The keyboard must push the value back to the focused `<input>` via a controlled update or by calling `nativeInputValueSetter` trick.

**Recommended approach:** Use an uncontrolled approach where the keyboard inserts characters into the focused element via `document.execCommand('insertText')` (deprecated but still functional in Chromium) OR by directly calling the input's React synthetic event handler. The cleanest approach for this project: keyboard `onChange` fires → context calls `inputRef.value = newValue` and dispatches a synthetic `input` event so React picks up the change.

### Pattern 3: Family Member Color — SQLite Migration

**What:** Add `color TEXT` column to `family_members` table. Use `ALTER TABLE ... ADD COLUMN` (SQLite supports this idempotently when using `IF NOT EXISTS` pattern via a try/catch or checking column existence first).

**SQLite ADD COLUMN pattern (safe for existing DB):**
```javascript
// db.js — in the CREATE TABLE section, add:
try {
  db.exec(`ALTER TABLE family_members ADD COLUMN color TEXT`);
} catch (e) {
  // Column already exists — ignore (SQLite throws on duplicate column add)
}
```

**Alternatively**, use the existence check:
```javascript
const cols = db.pragma('table_info(family_members)');
if (!cols.find(c => c.name === 'color')) {
  db.exec(`ALTER TABLE family_members ADD COLUMN color TEXT`);
}
```

**Why:** SQLite does not support `ADD COLUMN IF NOT EXISTS`. Wrapping in try/catch or preflight check is the standard pattern for incremental migrations in this codebase.

### Pattern 4: Color Swatch Picker in FamilyFormModal

**What:** Below the Name input, add a row of colored circle buttons. Tap selects that color. Current selection has a ring/outline indicator.

**Color palette recommendation (Claude's Discretion):**

8 colors drawn from Google Calendar's palette, verified accessible on white backgrounds:

| Name | Hex | Tailwind bg | Notes |
|------|-----|-------------|-------|
| Tomato | `#D50000` | custom | High-contrast red |
| Flamingo | `#E67C73` | custom | Soft pink-red |
| Tangerine | `#F4511E` | custom | Orange |
| Banana | `#F6BF26` | custom | Yellow (use dark text) |
| Sage | `#33B679` | custom | Green |
| Basil | `#0B8043` | custom | Dark green |
| Peacock | `#039BE5` | custom | Light blue |
| Blueberry | `#3F51B5` | custom | Indigo-blue |

**Implementation approach:** Store as hex strings in the `color` TEXT column. Render swatches using `style={{ backgroundColor: member.color }}` — avoids Tailwind's JIT class-name safety issues with dynamic colors.

**Auto-assign logic:** On POST `/api/family`, server checks which palette colors are already assigned, picks the first unassigned one. If all 8 are used, cycles back to index 0.

### Pattern 5: Calendar Event Color Integration

**What:** `CalendarEvent` already has `familyMemberId` and `familyMemberName` fields (confirmed in types/calendar.ts). The server's calendar routes already join family member data. The missing piece: the `color` field is not yet propagated from family_members through the join to calendar events.

**Changes needed:**
1. Server: `calendar_sources` already has `family_member_id` FK. The events query already joins to get `familyMemberId`. Extend the JOIN to also pull `family_members.color` as `familyMemberColor`.
2. Client: Add `familyMemberColor: string | null` to `CalendarEvent` type.
3. CalendarView sub-components (DailyAgenda, WeeklyAgenda, MonthlyGrid): Use `event.familyMemberColor` for event background color instead of chart variables.

**Current event rendering uses chart variables** (confirmed from FamilyMemberBadge: `oklch(var(--chart-${(colorIndex % 4) + 1}))`). This pattern will be replaced with direct hex color strings from the member's assigned color.

### Pattern 6: Exit Kiosk Endpoint

**What:** POST `/api/system/exit-kiosk` → server runs a shell command to kill the Chromium kiosk process.

**Chromium kill command (confirmed from `scripts/restart-kiosk.sh`):**
```bash
pkill -SIGTERM chromium
```
The restart script uses `pkill chromium` (not `chromium-browser` — the binary name on this Pi is `chromium`). The exit action only needs SIGTERM — it does not need to restart, so no SIGKILL fallback is required.

**Server implementation:**
```javascript
import { exec } from 'child_process';

fastify.post('/api/system/exit-kiosk', async (request, reply) => {
  exec('pkill -SIGTERM chromium', (err) => {
    // Error is expected if chromium is not running — ignore
  });
  return { success: true };
});
```

**Security note:** This endpoint has no authentication at the server level — it relies on the client-side PIN check (D-14). The Fastify server is only accessible on localhost:3000, so remote attack surface is nil. This matches the established pattern for other parental actions in this project.

### Pattern 7: Offline Toast on Calendar Failure

**What:** When `useCalendarData`'s `fetchEvents` catches an error (network failure or API error), fire a sonner toast instead of (or in addition to) setting the `error` state.

**Current behavior (confirmed from useCalendarData.ts):**
- `fetchEvents` catch block: `setError('Unable to load calendar events.')` — stored in state but not shown as toast.
- `fetchAuthStatus` catch block: silent (swallows error).

**Required change (D-01):**
```typescript
// In fetchEvents catch:
import { toast } from 'sonner';

catch {
  toast.error('Calendar unavailable — check your internet connection');
  setError('Unable to load calendar events.');
}
```

**Toast wording recommendation (Claude's Discretion):**
- `"Calendar unavailable — no internet connection"` — clear, kiosk-appropriate, non-alarming
- Use `toast.error()` for distinct visual (red) vs. info toast
- No retry button in toast (D-03 — no manual retry needed)

### Anti-Patterns to Avoid

- **setState for lastAuthTime timer:** Using `useState` instead of `useRef` for `lastAuthTime` would cause a re-render every time the timer updates — use `useRef` (D-19 is explicit about this).
- **Dynamic Tailwind color classes for swatches:** `bg-[${member.color}]` with hex — Tailwind's JIT cannot purge unknown classes at build time. Use `style={{ backgroundColor: member.color }}` with inline styles instead.
- **Keyboard controlling React input state directly:** react-simple-keyboard's `onChange` returns the full keyboard buffer string, not a delta. If the context doesn't track which input is focused and what its current value is, the keyboard buffer gets out of sync when switching between inputs. Each input focus must reset the keyboard's internal state.
- **ALTER TABLE without idempotency guard:** Running `ALTER TABLE family_members ADD COLUMN color TEXT` unconditionally on server startup will crash if the column already exists (SQLite throws `duplicate column name`). Always wrap in try/catch or preflight check.
- **pkill with wrong binary name:** The binary is `chromium` on this Pi (not `chromium-browser`). Using the wrong name silently does nothing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| QWERTY on-screen keyboard layout | Custom keyboard grid component | react-simple-keyboard 3.8.178 | Key layout, backspace, space, repeat handling, CSS styling — ~2000 lines of work for marginal gain |
| Toast notifications | Custom toast component | sonner (already installed) | Already project-standard, D-01 specifies sonner |
| SQLite column migration | Migration framework | `try/catch ALTER TABLE` | Project uses db.js inline schema — no migration runner exists; try/catch is the established pattern |
| Color palette accessibility | Custom WCAG contrast checker | Pre-selected 8-color palette | Google Calendar palette is already validated for contrast |

**Key insight:** Every new behavior in Phase 6 can be implemented as an extension of an existing pattern. The only truly new component is the virtual keyboard overlay — everything else is an edit to an existing file.

---

## Common Pitfalls

### Pitfall 1: Keyboard Breaks PIN Modal Input

**What goes wrong:** The virtual keyboard fires on ALL `<input>` focus events site-wide, including the numeric PIN pad inputs in PinModal. This causes conflicts: QWERTY layout appears over the PIN modal, overwriting digit input.

**Why it happens:** The global `focusin` listener doesn't distinguish between PIN inputs and text inputs.

**How to avoid:** Add a `data-no-keyboard` attribute to PIN pad inputs (or detect input type="number"/"tel"). In the keyboard context `focusin` handler: `if (target.dataset.noKeyboard || target.type === 'tel' || target.type === 'number') return;`

**Warning signs:** PIN entry stops working correctly or shows QWERTY keyboard instead of numeric pad.

### Pitfall 2: react-simple-keyboard Input Sync on Multiple Inputs

**What goes wrong:** User types in input A, keyboard buffer shows "hello". User taps input B. Keyboard still shows "hello" — typing adds to "hello" instead of starting fresh.

**Why it happens:** react-simple-keyboard maintains an internal buffer. When input focus changes, the buffer must be explicitly reset.

**How to avoid:** Call `keyboardRef.current.setInput('')` (and update keyboard's `input` prop) whenever `focusin` fires on a new input element. Track `currentInputRef` — when it changes, reset keyboard buffer.

### Pitfall 3: Color Column Missing from API Response

**What goes wrong:** Family member forms load without the color swatches showing the current selection; calendar events have no color.

**Why it happens:** The Fastify schema in `routes/family.js` explicitly enumerates response fields. Adding `color` to the DB without updating the schema means Fastify strips it from the response (fastify-json-schema serialization removes undeclared fields).

**How to avoid:** Update the `response` schema in all three endpoints (GET `/api/family`, POST `/api/family`, PUT `/api/family/:id`) to include `color: { type: 'string', nullable: true }`.

### Pitfall 4: FamilyMemberBadge Test Failure Persists

**What goes wrong:** The existing failing test in `ChoreCard.test.tsx` checks `FamilyMemberBadge` renders with `oklch(var(--chart-1))` color. Phase 6 changes the color system from chart variables to member's hex color. If the badge test isn't updated, the suite continues to fail.

**Why it happens:** Pre-existing test failure (confirmed by running `npm run test:client`). The badge currently uses `colorIndex` prop to compute chart color. Phase 6 changes the prop to `color` (hex string from member record).

**How to avoid:** Update `FamilyMemberBadge` component and its test together in the same task. The test should check `style.backgroundColor` equals the passed hex color string.

### Pitfall 5: Exit Kiosk Fires Before PIN Confirmation Closes

**What goes wrong:** The `pkill chromium` runs while the PIN modal or exit confirmation dialog is still visible, resulting in abrupt termination mid-dialog.

**Why it happens:** Chromium is killed by the server response handler, which fires immediately when the server responds.

**How to avoid:** Add a brief delay before kill, or close the dialog first then call the API. Recommended: close the dialog → await the API call → kill is server-side. The dialog closes client-side before the server fires pkill. A 200ms delay on the server side before exec is also acceptable for robustness.

### Pitfall 6: Sonner Toast Not Mounted in Calendar Error Path

**What goes wrong:** `toast.error(...)` fires in `useCalendarData.ts` but no toast appears.

**Why it happens:** Sonner requires `<Toaster />` to be mounted in the component tree. It IS mounted (established in Phase 2), but if the import path or tree structure has issues, toasts silently fail.

**How to avoid:** Verify `<Toaster />` is present in `App.tsx` or root layout. Sonner 2.x uses `toast` (named import) from `'sonner'` — the same pattern already used in `FamilyList.tsx` (confirmed by code inspection).

---

## Code Examples

### PIN Session Timeout

```typescript
// Source: direct codebase analysis of client/src/hooks/usePinAuth.ts

// Add at hook body start:
const lastAuthTime = useRef<number>(0);

// Replace withPinAuth:
const withPinAuth = useCallback((action: () => Promise<void>) => {
  const elapsed = Date.now() - lastAuthTime.current;
  if (lastAuthTime.current > 0 && elapsed < 60_000) {
    // Within 60s grace period — skip PIN modal, execute directly (D-16, D-17)
    lastAuthTime.current = Date.now(); // Reset timer
    action();
    return;
  }
  setPendingAction(() => action);
  setPinError(null);
  setShowPinModal(true);
}, []);

// In verifyPin, after data.valid is confirmed true (before executing pendingAction):
lastAuthTime.current = Date.now();
```

### Offline Toast in useCalendarData

```typescript
// Source: direct analysis of client/src/hooks/useCalendarData.ts
import { toast } from 'sonner';

// Modified fetchEvents catch block:
} catch {
  toast.error('Calendar unavailable — check your internet connection');
  setError('Unable to load calendar events.');
}
```

### react-simple-keyboard QWERTY Layout

```typescript
// Source: react-simple-keyboard official docs (virtual-keyboard.js.org)
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const layout = {
  default: [
    '1 2 3 4 5 6 7 8 9 0 {bksp}',
    'q w e r t y u i o p',
    'a s d f g h j k l',
    'z x c v b n m {space}',
    '{done}'
  ]
};

const display = {
  '{bksp}': '⌫',
  '{space}': 'Space',
  '{done}': 'Done',
};
```

### SQLite Color Column Migration (idempotent)

```javascript
// Source: direct analysis of server/db.js pattern
const cols = db.pragma('table_info(family_members)');
if (!cols.find(c => c.name === 'color')) {
  db.exec(`ALTER TABLE family_members ADD COLUMN color TEXT`);
}
```

### Color Auto-Assign on POST /api/family

```javascript
// Source: design decision D-10
const PALETTE = [
  '#D50000', '#E67C73', '#F4511E', '#F6BF26',
  '#33B679', '#0B8043', '#039BE5', '#3F51B5'
];

// In POST /api/family handler:
const usedColors = db
  .prepare('SELECT color FROM family_members WHERE color IS NOT NULL')
  .all()
  .map(r => r.color);
const assignedColor = PALETTE.find(c => !usedColors.includes(c)) ?? PALETTE[0];
// Pass assignedColor to INSERT
```

### Exit Kiosk Endpoint

```javascript
// Source: analysis of scripts/restart-kiosk.sh (confirms binary name is 'chromium')
import { exec } from 'child_process';

fastify.post('/api/system/exit-kiosk', async (request, reply) => {
  // Delay execution to allow response to reach client before kill
  setTimeout(() => {
    exec('pkill -SIGTERM chromium', () => {});
  }, 300);
  return { success: true };
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| chart CSS variables for event colors (`--chart-1` etc.) | Direct hex color strings from family_members.color | Phase 6 | Calendar events now reflect family-specific colors instead of sequential chart palette |
| FamilyMemberBadge uses `colorIndex` prop (sequential) | FamilyMemberBadge uses `color` prop (explicit hex) | Phase 6 | Badge always shows the member's chosen color, not their position in list |
| withPinAuth always shows PIN modal | withPinAuth checks 60s grace period before showing modal | Phase 6 | Reduced friction for parent during multi-step admin workflows |

**Deprecated/outdated after this phase:**
- `colorIndex` prop on `FamilyMemberBadge`: Replaced by explicit `color: string` prop
- CalendarSettings "Family Member Colors" section (lines 181-201): Removed — D-11 replaces source-to-member mapping UI with automatic color propagation from member's assigned color
- `--chart-N` CSS variables for event rendering: Replaced by inline `backgroundColor` hex

---

## Open Questions

1. **CalendarSettings "Family Member Colors" section removal scope**
   - What we know: D-11 says "no separate calendar-source-to-color mapping needed in CalendarSettings". The existing CalendarSettings component has a "Family Member Colors" section (lines 181-201 of CalendarSettings.tsx) showing calendar source → member mappings.
   - What's unclear: Does D-11 mean this entire section is removed, or just that it no longer needs a color picker? The section currently shows which sources are associated with which members — that may still be useful read-only information.
   - Recommendation: Remove the color-picker interaction but keep the family member association display as read-only. Confirm with planner.

2. **Keyboard behavior when input is inside a Dialog (modal)**
   - What we know: Several inputs are inside shadcn Dialog components (FamilyFormModal, ChangePinModal). The Dialog uses Radix focus management (`radix-ui` focus trap).
   - What's unclear: Will the keyboard's fixed-bottom overlay be captured by the Dialog's focus trap, preventing keyboard interaction? Radix Dialog locks focus to its content by default.
   - Recommendation: The keyboard must be rendered outside the Dialog in the DOM (at app root level, not inside the dialog tree). The KeyboardProvider approach handles this correctly — keyboard renders at App level, not inside the modal.

3. **FamilyMember type propagation to CalendarEvent color**
   - What we know: CalendarEvent has `familyMemberId` and `familyMemberName` but not `familyMemberColor`. The server JOIN in calendar routes would need to also pull color.
   - What's unclear: The exact SQL join in `server/routes/calendar.js` needs inspection to verify the join is already present and just needs the color column added.
   - Recommendation: Plan should include a task to read and update the calendar events query.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server, build | Yes | 25.8.1 | — |
| npm | Package install | Yes | 11.11.0 | — |
| pkill | Exit kiosk command | Yes | /usr/bin/pkill (dev machine) | Pi has pkill (confirmed: restart script uses it) |
| Chromium | Target of pkill | No (dev only) | — | Dev: test endpoint, Pi: full behavior |
| vitest | Test runner | Yes (installed) | 4.x (in client deps) | — |
| react-simple-keyboard | Virtual keyboard | Not yet installed | 3.8.178 | Custom component |

**Missing dependencies with no fallback:**
- Chromium is not installed on the dev machine — the exit-kiosk endpoint cannot be fully tested locally. The `pkill chromium` command will silently do nothing on dev. This is acceptable — test the endpoint call succeeds (200 response), verify Chromium kill behavior on actual Pi hardware.

**Missing dependencies with fallback:**
- None blocking development.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.x + Testing Library React 16.x |
| Config file | `client/vitest.config.ts` |
| Quick run command | `cd client && npm run test:client` |
| Full suite command | `cd client && npm run test:client` |

### Pre-existing Test Failure (must fix)

**File:** `client/src/components/__tests__/ChoreCard.test.tsx`
**Failing test:** `FamilyMemberBadge > renders initial letter and applies chart color`
**Root cause:** Test checks `toHaveStyle({ backgroundColor: 'var(--chart-1)' })` — jsdom doesn't resolve CSS custom properties, and Phase 6 changes the color system anyway.
**Fix required in Phase 6:** Update test to check `style.backgroundColor` equals the member's hex color string.

### Phase Requirements to Test Map

| Behavior | Test Type | Automated Command | File |
|----------|-----------|-------------------|------|
| PIN session timeout: second action within 60s skips PIN modal | unit | `cd client && npm run test:client` | ❌ Wave 0 — `hooks/__tests__/usePinAuth.test.ts` |
| PIN session timeout: action after 60s shows PIN modal again | unit | `cd client && npm run test:client` | ❌ Wave 0 |
| FamilyMemberBadge renders with explicit hex color prop | unit | `cd client && npm run test:client` | ❌ (existing test needs update) |
| FamilyFormModal shows color swatches | unit | `cd client && npm run test:client` | ❌ Wave 0 |
| Virtual keyboard appears on input focus | unit/integration | `cd client && npm run test:client` | ❌ Wave 0 |
| Virtual keyboard dismisses on tap outside | unit | `cd client && npm run test:client` | ❌ Wave 0 |
| Calendar error triggers sonner toast | unit | `cd client && npm run test:client` | ❌ Wave 0 |
| Nav tab order: Settings is rightmost | unit | `cd client && npm run test:client` | ❌ Wave 0 |
| Exit kiosk endpoint returns 200 | manual/smoke | Manual curl on Pi | — |
| 24-hour stability | manual | Observe on Pi hardware | — |
| Touch interactions on Pi hardware | manual | Physical device testing | — |
| Family usage walkthrough | manual | User acceptance test | — |

### Sampling Rate

- **Per task commit:** `cd client && npm run test:client`
- **Per wave merge:** `cd client && npm run test:client` (full suite must be green)
- **Phase gate:** Full suite green (no failures, todos accepted) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `client/src/hooks/__tests__/usePinAuth.test.ts` — PIN session timeout logic (D-16, D-17, D-18)
- [ ] `client/src/components/__tests__/FamilyFormModal.test.tsx` — color swatch rendering
- [ ] `client/src/components/__tests__/VirtualKeyboard.test.tsx` — keyboard visibility on focus/blur
- [ ] Update `client/src/components/__tests__/ChoreCard.test.tsx` — fix pre-existing FamilyMemberBadge test

*(Existing test infrastructure: vitest.config.ts configured, setupFiles loaded, jsdom environment, @testing-library/react installed — no framework gaps.)*

---

## Project Constraints (from CLAUDE.md)

No CLAUDE.md exists in this project. No additional project-level constraints apply beyond those captured in CONTEXT.md decisions above.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection — `client/src/hooks/usePinAuth.ts`, `server/db.js`, `server/routes/family.js`, `client/src/components/FamilyFormModal.tsx`, `client/src/components/FamilyMemberBadge.tsx`, `client/src/hooks/useCalendarData.ts`, `scripts/restart-kiosk.sh`, `client/src/App.tsx`, `client/src/types/calendar.ts`, `client/src/types/family.ts`
- npm registry (2026-03-23): `react-simple-keyboard@3.8.178`, `sonner@2.0.7`
- Phase 1 canonical plan (01-02-PLAN.md) — Chromium kiosk command patterns, restart-kiosk.sh
- Phase 2 UI-SPEC.md — 44px touch targets, shadcn component patterns, color system
- Phase 2 CONTEXT.md — PIN auth decisions, sonner usage, withPinAuth pattern

### Secondary (MEDIUM confidence)

- react-simple-keyboard docs (virtual-keyboard.js.org) — layout configuration, API surface
- SQLite ALTER TABLE behavior — standard SQLite spec, no custom implementation

### Tertiary (LOW confidence)

- Memory leak monitoring approaches for 24-hour kiosk stability — not researched in depth; the existing 3am daily Chromium restart (Phase 1, INFRA-02) is the established mitigation. No additional client-side memory monitoring is recommended (per Claude's Discretion scope — and "no action needed" is likely the right answer).

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed via npm registry, existing packages verified from package.json
- Architecture: HIGH — all patterns confirmed by direct source file inspection
- Pitfalls: HIGH — identified from actual code behavior (Fastify schema stripping, jsdom CSS variable limitation confirmed by running test suite)
- Test infrastructure: HIGH — vitest.config.ts inspected, test run executed

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (30 days — stable tech, no fast-moving dependencies)
