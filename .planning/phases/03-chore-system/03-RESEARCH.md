# Phase 3: Chore System - Research

**Researched:** 2026-03-22
**Domain:** Offline-first chore management, recurring task generation, one-tap completion UI, server-side cron scheduling
**Confidence:** HIGH

## Summary

Phase 3 implements a comprehensive chore management system with offline-first architecture, automatic recurring task generation, and touch-optimized completion workflows. The phase builds on Phase 2's established patterns (React hooks, Fastify REST API, SQLite with better-sqlite3, PIN authentication) while adding new technical domains: server-side cron scheduling for recurring chore generation, daily/weekly view filtering with date-fns, long-press gestures for "who completed this" overrides, and undo toast notifications.

The core technical challenge is recurring chore generation via server-side cron jobs that run at midnight daily. The user decisions specify node-cron for scheduling, storing recurrence patterns in JSON TEXT columns, and auto-completing missed recurring chores when new instances generate. Daily and weekly view modes require date filtering against unix timestamps using SQLite date functions. The completion interaction uses a 48px checkbox with default-to-assignee behavior and long-press override for "someone else did it" tracking.

All existing stack choices from Phase 2 remain current and well-suited. New additions: node-cron 4.2.1 (published 2026-03-18) for midnight cron jobs, date-fns 4.1.0 (published 2025-08-03) for week boundary calculations, shadcn checkbox component for 48px touch targets, and sonner toast notifications (already installed) for undo functionality.

**Primary recommendation:** Use node-cron with single daily job at 12:01am, store recurrence_config as TEXT with JSON, filter views using SQLite's unixepoch() date functions, implement long-press with custom hook (300-1000ms threshold), and provide 5-second undo toast with action button.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CHOR-01 | User can create chore with title and assignee | React modal form + Fastify POST /api/chores + SQLite INSERT with assignee foreign key |
| CHOR-02 | User can assign chore to specific family member | Family member picker in chore form + assigned_to column (FK to family_members) |
| CHOR-03 | User can mark chore as complete with single tap | 48px shadcn checkbox + PUT /api/chores/:id/complete + status='completed' |
| CHOR-04 | User can delete chore (with parental PIN) | Reuse PIN modal pattern from Phase 2 + DELETE /api/chores/:id |
| CHOR-05 | User can view chores grouped by family member | CONTEXT.md D-07 overrides this: single unified list, color-coded by assignee |
| CHOR-06 | Chore completion checkboxes are 48px minimum size | shadcn checkbox with min-h-12 (48px) wrapper + touch target CSS |
| CHOR-07 | Completed chores fade out or move to completed section | Separate expandable "Completed" section (D-13) with collapse/expand animation |
| CHOR-08 | User can set chore as recurring (daily or weekly) | is_recurring flag + recurrence_config JSON TEXT column in chores table |
| CHOR-09 | Recurring chores auto-generate at configured time | node-cron job at 12:01am (D-22) generates new instances + auto-completes missed |
| CHOR-10 | Chore system works offline (local data storage) | SQLite local DB + React state + no external API dependencies |
| CHOR-11 | User can see completed chore count per family member | Aggregate query COUNT(*) WHERE status='completed' GROUP BY assigned_to |
| CHOR-12 | User sees visual feedback when completing chore | Checkbox animation + fade-out transition + sonner toast with 5s undo (D-18, D-19) |
</phase_requirements>

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Chore Data Model:**
- D-01: Chore fields: title (required), assignee (family_member_id), description (optional text), points (integer for future incentive system)
- D-02: Recurring pattern: single row with is_recurring flag + recurrence_config JSON (stores frequency, days, interval)
- D-03: Completed chores stay in database with completed_at timestamp (not deleted)
- D-04: Status enum: 'active', 'completed', 'auto_completed' (for missed recurring chores)
- D-05: Track completed_by (family_member_id, nullable) separate from assigned_to
- D-06: completed_by defaults to assignee for normal completion flow (no extra step)

**Layout & Display:**
- D-07: Single unified chore list (not grouped by family member)
- D-08: Color-code chores by assignee using auto-assigned palette colors (blue, green, purple, orange)
- D-09: Show family member icon alongside each chore (configurable color in future v2)
- D-10: Global "Add Chore" button at top (PIN-protected, matches Phase 2 pattern)
- D-11: Sort chores by points descending (high-value chores first)
- D-12: Two view modes: Daily (today's chores only) and Weekly (this week's chores)
- D-13: Completed chores live in separate expandable "Completed" section (collapsed by default, hidden from main view)
- D-14: Completed section hidden entirely when no completed chores exist

**Completion Interaction:**
- D-15: 48px checkbox on chore card for completion (meets CHOR-06 touch target requirement)
- D-16: Normal tap defaults to assignee completing (smooth UX for common case)
- D-17: Long-press checkbox (1 second hold) opens "Who completed this?" family picker for override
- D-18: Visual feedback: checkbox animation + fade-out + toast notification (reuses sonner from Phase 2)
- D-19: 5-second undo toast after completion with "Undo" button (catches accidental taps)

**Recurring Chore Mechanics:**
- D-20: Frequency options: Daily, Weekly (all 7 days), Custom days (select Mon/Wed/Fri etc.), Interval-based (every N days)
- D-21: Setup via toggle in Add/Edit Chore form (not separate templates section)
- D-22: New recurring instances generate via Node.js server cron at midnight (12:01am daily)
- D-23: When new instance generates, auto-complete yesterday's if incomplete: status='auto_completed', completed_by=NULL
- D-24: Weekly summary report view for parents to review completion history (checkmark=done, X=missed)
- D-25: Missed chores marked with status='auto_completed' + completed_by=NULL (distinct from normal completion)

**Empty States:**
- D-26: No chores yet: just show "Add Chore" button (minimal, no special empty state messaging)
- D-27: All chores completed (daily view): celebration message "All done for today!" for positive reinforcement
- D-28: No chores this week (weekly view): empty state message with week date range
- D-29: Completed section hidden when empty (appears once first chore is completed)

### Claude's Discretion

- Exact celebration message wording and animation
- Checkbox animation timing and style
- Color palette exact shades (blue/green/purple/orange family)
- Family member icon design (avatar initials, emoji, or symbol)
- Weekly summary report layout and design
- Toast notification duration and positioning
- Loading skeleton for chore list initial load

### Deferred Ideas (OUT OF SCOPE)

None. Points redemption UI and incentive rewards system explicitly noted for future phase/v2.

</user_constraints>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.0.0 | UI component framework | Already installed from Phase 2, hooks API standard |
| fastify | 5.0.0 | REST API server | Already installed from Phase 2, JSON Schema validation |
| better-sqlite3 | 11.0.0 | SQLite database driver | Already installed from Phase 2, synchronous API |
| node-cron | 4.2.1 | Server-side cron scheduling | Simplest cron library for Node.js, no setup required, 3M weekly downloads |
| date-fns | 4.1.0 | Date manipulation utilities | Modular, tree-shakeable, TypeScript-native, industry standard for date filtering |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Toast notifications | Already installed from Phase 2, reuse for undo functionality |
| shadcn checkbox | via CLI | Touch-optimized checkbox | 48px minimum touch target requirement (CHOR-06) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| node-cron | cron package | cron has more features (timezone handling) but adds complexity - node-cron simpler for single daily job |
| node-cron | Croner | Croner is more modern (TypeScript-native, better DST handling) but node-cron sufficient for midnight-only scheduling |
| date-fns | luxon | luxon has better timezone support but heavier (60KB vs 20KB) - overkill for local-only date filtering |
| TEXT JSON | JSONB BLOB | JSONB is 5-10% smaller and 2x faster to parse (SQLite 3.45+) but TEXT JSON is more debuggable and sufficient for low-frequency queries |

**Installation:**
```bash
# In server/ directory
npm install node-cron date-fns

# In client/ directory
npm install date-fns
npx shadcn add checkbox
```

**Version verification:** Verified 2026-03-22.
- node-cron: 4.2.1 (published 2026-03-18) - current
- date-fns: 4.1.0 (published 2025-08-03) - current, stable
- sonner: 2.0.7 (already installed, current)
- shadcn checkbox: CLI-managed, auto-versioned

## Architecture Patterns

### Recommended Project Structure
```
server/
├── index.js                    # Fastify app + cron initialization
├── db.js                      # SQLite schema (add chores table)
├── routes/
│   ├── family.js              # Existing from Phase 2
│   ├── auth.js                # Existing from Phase 2
│   └── chores.js              # NEW: GET/POST/PUT/DELETE /api/chores
├── jobs/
│   └── recurring-chores.js    # NEW: Midnight cron job logic
└── utils/
    └── chore-generator.js     # NEW: Recurrence pattern parsing + instance generation

client/src/
├── App.tsx                    # Add chore system routes/views
├── components/
│   ├── ui/
│   │   ├── checkbox.tsx       # NEW: shadcn checkbox component
│   │   ├── sonner.tsx         # Existing from Phase 2
│   │   └── ...                # Other shadcn components
│   ├── PinModal.tsx           # Existing from Phase 2
│   ├── ChoreList.tsx          # NEW: Main chore list view
│   ├── ChoreCard.tsx          # NEW: Individual chore display with checkbox
│   ├── ChoreFormModal.tsx     # NEW: Add/Edit chore form with recurring options
│   ├── RecurrenceConfig.tsx   # NEW: Recurrence pattern picker UI
│   └── CompletedSection.tsx   # NEW: Expandable completed chores section
├── hooks/
│   ├── useChoreData.ts        # NEW: Custom hook for chore CRUD + completion
│   ├── useLongPress.ts        # NEW: Custom hook for long-press detection
│   └── useFamilyData.ts       # Existing from Phase 2
├── types/
│   ├── chore.ts               # NEW: TypeScript interfaces for chores
│   └── family.ts              # Existing from Phase 2
└── utils/
    └── date-filters.ts        # NEW: Helper functions for daily/weekly filtering
```

### Pattern 1: Chore Table Schema with Recurring Support
**What:** SQLite table with recurrence_config as TEXT JSON column
**When to use:** Database initialization on server startup
**Example:**
```javascript
// server/db.js - Add to existing schema initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS chores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to INTEGER NOT NULL,
    completed_by INTEGER,
    points INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('active', 'completed', 'auto_completed')) DEFAULT 'active',
    is_recurring INTEGER DEFAULT 0,
    recurrence_config TEXT,
    parent_chore_id INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    completed_at INTEGER,
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (assigned_to) REFERENCES family_members(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES family_members(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_chore_id) REFERENCES chores(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_chores_status ON chores(status);
  CREATE INDEX IF NOT EXISTS idx_chores_assigned_to ON chores(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_chores_created_at ON chores(created_at);
  CREATE INDEX IF NOT EXISTS idx_chores_recurring ON chores(is_recurring);
`);
```

**recurrence_config JSON structure:**
```json
{
  "frequency": "daily" | "weekly" | "custom" | "interval",
  "days": [0, 1, 2, 3, 4, 5, 6],
  "interval": 3
}
```

### Pattern 2: Server-Side Cron Job for Recurring Chores
**What:** node-cron job runs at 12:01am daily to generate new instances
**When to use:** Server startup, runs continuously
**Example:**
```javascript
// server/index.js
import cron from 'node-cron';
import { generateRecurringChores } from './jobs/recurring-chores.js';

// Start Fastify server
const server = fastify();
await server.listen({ port: 3000, host: '0.0.0.0' });

// Initialize cron job (runs at 12:01am daily)
cron.schedule('1 0 * * *', async () => {
  try {
    console.log('Running recurring chore generation...');
    await generateRecurringChores();
  } catch (err) {
    console.error('Recurring chore generation failed:', err);
  }
}, {
  timezone: 'America/Los_Angeles' // Adjust to device timezone
});
```

```javascript
// server/jobs/recurring-chores.js
import db from '../db.js';
import { shouldGenerateToday } from '../utils/chore-generator.js';

export async function generateRecurringChores() {
  const recurring = db.prepare(`
    SELECT * FROM chores
    WHERE is_recurring = 1
      AND (parent_chore_id IS NULL OR parent_chore_id = id)
  `).all();

  const today = new Date();

  for (const chore of recurring) {
    const config = JSON.parse(chore.recurrence_config);

    if (!shouldGenerateToday(config, today)) continue;

    // Check if instance already exists for today
    const existingToday = db.prepare(`
      SELECT id FROM chores
      WHERE parent_chore_id = ?
        AND DATE(created_at, 'unixepoch') = DATE('now')
    `).get(chore.id);

    if (existingToday) continue; // Already generated

    // Auto-complete yesterday's instance if incomplete (D-23)
    const yesterday = db.prepare(`
      SELECT id FROM chores
      WHERE parent_chore_id = ?
        AND status = 'active'
        AND DATE(created_at, 'unixepoch') = DATE('now', '-1 day')
    `).get(chore.id);

    if (yesterday) {
      db.prepare(`
        UPDATE chores
        SET status = 'auto_completed', completed_by = NULL, completed_at = unixepoch()
        WHERE id = ?
      `).run(yesterday.id);
    }

    // Generate new instance for today
    db.prepare(`
      INSERT INTO chores (title, description, assigned_to, points, parent_chore_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(chore.title, chore.description, chore.assigned_to, chore.points, chore.id);
  }
}
```

```javascript
// server/utils/chore-generator.js
export function shouldGenerateToday(config, date) {
  const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday

  switch (config.frequency) {
    case 'daily':
      return true;
    case 'weekly':
      return config.days.includes(dayOfWeek);
    case 'custom':
      return config.days.includes(dayOfWeek);
    case 'interval':
      // Check if today is N days after last generation
      // Requires tracking last_generated_at in chores table
      return true; // Simplified - implement full logic in planning
    default:
      return false;
  }
}
```

### Pattern 3: Daily/Weekly View Filtering with SQLite Date Functions
**What:** Filter chores by today or this week using unixepoch() date functions
**When to use:** GET /api/chores with view query parameter
**Example:**
```javascript
// server/routes/chores.js
fastify.get('/api/chores', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        view: { type: 'string', enum: ['daily', 'weekly'] }
      }
    }
  }
}, async (request, reply) => {
  const { view } = request.query;

  let whereClause = `status IN ('active', 'completed')`;

  if (view === 'daily') {
    // Filter to chores created today
    whereClause += ` AND DATE(created_at, 'unixepoch') = DATE('now')`;
  } else if (view === 'weekly') {
    // Filter to chores created this week (Sunday-Saturday)
    whereClause += ` AND created_at BETWEEN
      unixepoch(DATE('now', 'weekday 0', '-7 days'))
      AND unixepoch(DATE('now', 'weekday 0'))`;
  }

  const chores = db.prepare(`
    SELECT c.*,
           a.name as assignee_name,
           cb.name as completed_by_name
    FROM chores c
    JOIN family_members a ON c.assigned_to = a.id
    LEFT JOIN family_members cb ON c.completed_by = cb.id
    WHERE ${whereClause}
    ORDER BY
      CASE WHEN status = 'active' THEN 0 ELSE 1 END,
      points DESC,
      created_at DESC
  `).all();

  return chores;
});
```

### Pattern 4: Chore Completion with Default-to-Assignee
**What:** PUT endpoint defaults completed_by to assigned_to, allows override
**When to use:** Normal tap completion (default) or long-press completion (override)
**Example:**
```javascript
// server/routes/chores.js
fastify.put('/api/chores/:id/complete', {
  schema: {
    params: {
      type: 'object',
      properties: { id: { type: 'integer' } }
    },
    body: {
      type: 'object',
      properties: {
        completed_by: { type: 'integer' } // Optional - defaults to assigned_to
      }
    }
  }
}, async (request, reply) => {
  const { id } = request.params;
  const { completed_by } = request.body;

  const chore = db.prepare('SELECT assigned_to FROM chores WHERE id = ?').get(id);
  if (!chore) return reply.code(404).send({ error: 'Chore not found' });

  const completedBy = completed_by || chore.assigned_to; // D-06: Default to assignee

  db.prepare(`
    UPDATE chores
    SET status = 'completed',
        completed_by = ?,
        completed_at = unixepoch(),
        updated_at = unixepoch()
    WHERE id = ?
  `).run(completedBy, id);

  return { id, status: 'completed', completed_by: completedBy };
});
```

### Pattern 5: Undo Completion with Toast Action
**What:** Client-side undo state with 5-second toast, revert via API
**When to use:** After chore completion (D-19)
**Example:**
```typescript
// client/src/hooks/useChoreData.ts
import { toast } from 'sonner';

export function useChoreData() {
  // ... existing state and fetch logic

  const completeChore = async (id: number, completedBy?: number) => {
    const res = await fetch(`/api/chores/${id}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed_by: completedBy })
    });
    if (!res.ok) throw new Error('Failed to complete chore');

    await fetchChores(); // Refresh list

    // Show 5-second undo toast (D-19)
    toast.success('Chore completed', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: async () => {
          await undoComplete(id);
        }
      }
    });
  };

  const undoComplete = async (id: number) => {
    const res = await fetch(`/api/chores/${id}/undo`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to undo');
    await fetchChores();
    toast.info('Completion undone');
  };

  return { completeChore, undoComplete, /* ... */ };
}
```

### Pattern 6: Long-Press Detection for Completion Override
**What:** Custom hook detects 1-second hold, opens family picker modal
**When to use:** Checkbox long-press for "who completed this" override (D-17)
**Example:**
```typescript
// client/src/hooks/useLongPress.ts
import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  threshold?: number; // milliseconds
}

export function useLongPress({ onLongPress, onClick, threshold = 1000 }: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout>();
  const isLongPressRef = useRef(false);

  const handleTouchStart = useCallback(() => {
    isLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, threshold);
  }, [onLongPress, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isLongPressRef.current && onClick) {
      onClick(); // Normal tap - default completion
    }
  }, [onClick]);

  const handleTouchCancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onMouseDown: handleTouchStart, // Desktop testing support
    onMouseUp: handleTouchEnd,
    onMouseLeave: handleTouchCancel
  };
}
```

```typescript
// client/src/components/ChoreCard.tsx
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useLongPress } from '@/hooks/useLongPress';

export function ChoreCard({ chore, onComplete }: ChoreCardProps) {
  const [showPicker, setShowPicker] = useState(false);

  const longPressHandlers = useLongPress({
    onClick: () => onComplete(chore.id), // D-16: Default to assignee
    onLongPress: () => setShowPicker(true), // D-17: Override picker
    threshold: 1000
  });

  return (
    <div className="flex items-center gap-4">
      <div {...longPressHandlers} className="min-w-12 min-h-12">
        <Checkbox checked={chore.status !== 'active'} />
      </div>
      <div>{chore.title}</div>

      {showPicker && (
        <FamilyPickerModal
          onSelect={(memberId) => {
            onComplete(chore.id, memberId); // Override completed_by
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}
```

### Anti-Patterns to Avoid
- **Client-side cron scheduling:** Never run cron jobs in browser - server must generate recurring chores even when kiosk is off
- **Deleting completed chores:** Always preserve with completed_at timestamp (D-03) for history/analytics
- **Grouping by family member (per D-07):** CONTEXT.md explicitly overrides CHOR-05 requirement - use single unified list with color-coding
- **Storing recurrence as separate template table:** Single row with is_recurring flag (D-02) simpler than template pattern
- **Long-press threshold < 300ms or > 1500ms:** Too short causes accidental triggers, too long frustrates users - 1000ms is optimal (D-17)
- **Undo toast without action button:** Accessibility requirement - users need tappable "Undo" button, not swipe-to-dismiss

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cron scheduling | Custom setTimeout loops | node-cron | Timezone handling, DST transitions, process restart recovery |
| Date math (week boundaries) | Manual day arithmetic | date-fns startOfWeek/endOfWeek | Locale-aware, handles edge cases (year boundaries, leap years) |
| Recurrence pattern parsing | String parsing logic | JSON TEXT storage + frequency enum | Extensible, debuggable, supports complex patterns without regex |
| Long-press detection | Custom touch event timers | Reusable useLongPress hook | Cross-device compatibility (touch + mouse), cancel on move/leave |
| Toast undo actions | setTimeout + state management | sonner with action prop | Accessibility (screen reader announcements), consistent UX, auto-dismiss |

**Key insight:** Recurring task generation has edge cases (DST, leap years, timezone changes) that make custom cron implementations brittle. Use battle-tested libraries for scheduling and date math.

## Common Pitfalls

### Pitfall 1: Cron Job Doesn't Run After Server Restart
**What goes wrong:** Cron job only initializes once on startup - if server crashes or restarts mid-day, job is lost
**Why it happens:** node-cron doesn't persist scheduled jobs across restarts
**How to avoid:** Initialize cron job immediately after Fastify server starts (in server/index.js main function), not in route registration
**Warning signs:** Recurring chores stop generating after PM2 restart or deployment

### Pitfall 2: Timezone Mismatch Between Server and Database
**What goes wrong:** SQLite DATE('now') uses UTC, but cron runs in server timezone - chores generate at wrong time
**Why it happens:** Assuming SQLite and node-cron share the same "now" without explicit timezone coordination
**How to avoid:** Use node-cron timezone option matching device timezone, store unix timestamps (not dates) in SQLite, convert with 'unixepoch' modifier
**Warning signs:** Chores appear to generate at incorrect hours (e.g., 12:01am UTC instead of local midnight)

### Pitfall 3: Long-Press Fires on Scroll/Drag
**What goes wrong:** User scrolls chore list, accidentally triggers long-press on checkbox
**Why it happens:** Touch events fire onTouchStart without checking for touchmove before threshold
**How to avoid:** Add touchmove listener that cancels timer if finger moves > 10px from start position
**Warning signs:** Users report "completion picker keeps popping up when I scroll"

### Pitfall 4: Undo Toast Disappears Before User Can Tap
**What goes wrong:** 5-second toast auto-dismisses while user is reaching to tap "Undo"
**Why it happens:** Default toast duration too short for touch targets farther from completion checkbox
**How to avoid:** Use 5-6 second duration for action toasts (research recommendation), position toast near completion action
**Warning signs:** Users saying "I tried to undo but the button disappeared"

### Pitfall 5: Recurrence Config JSON Invalid After Manual Edit
**What goes wrong:** Database corruption if recurrence_config TEXT contains invalid JSON
**Why it happens:** Direct SQLite edits or missing validation on API endpoints
**How to avoid:** Validate JSON.parse() in API route schema validation, use TEXT CHECK constraint with JSON validity function (SQLite 3.38+)
**Warning signs:** Server crashes with JSON.parse() errors when loading recurring chores

### Pitfall 6: Daily View Shows Yesterday's Chores After Midnight
**What goes wrong:** User sees yesterday's chores in "Daily" view between 12:00am-12:01am
**Why it happens:** Race condition - chores created yesterday still match DATE('now') if viewed before cron job runs at 12:01am
**How to avoid:** Filter daily view to chores created >= start of today AND < start of tomorrow, not just DATE('now')
**Warning signs:** Users report "old chores briefly appear at midnight"

### Pitfall 7: Completed Section Empty Despite Completed Chores
**What goes wrong:** Completed section stays hidden even after completing chores in daily view
**Why it happens:** Query filters by DATE('now') which excludes yesterday's completed chores
**How to avoid:** Completed section should show ALL completed chores regardless of date, or explicitly filter by view date range
**Warning signs:** Users complete chores but see "no completed chores" message

## Code Examples

Verified patterns from official sources and current best practices:

### node-cron Scheduling
```javascript
// Source: node-cron documentation (npmjs.com/package/node-cron)
import cron from 'node-cron';

// Run at 12:01am every day in device timezone
cron.schedule('1 0 * * *', () => {
  console.log('Running midnight task');
}, {
  timezone: 'America/Los_Angeles' // Adjust to device timezone
});
```

### SQLite Date Filtering with Unix Timestamps
```sql
-- Source: SQLite official documentation (sqlite.org/lang_datefunc.html)

-- Filter to today's chores
WHERE DATE(created_at, 'unixepoch') = DATE('now')

-- Filter to this week (Sunday-Saturday)
WHERE created_at BETWEEN
  unixepoch(DATE('now', 'weekday 0', '-7 days'))
  AND unixepoch(DATE('now', 'weekday 0'))

-- Get current unix timestamp
SELECT unixepoch('now')
```

### date-fns Week Boundary Calculation
```typescript
// Source: date-fns documentation (date-fns.org)
import { startOfWeek, endOfWeek, format } from 'date-fns';

const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Sunday
const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 }); // Saturday

console.log(format(weekStart, 'yyyy-MM-dd')); // e.g., "2026-03-22"
console.log(format(weekEnd, 'yyyy-MM-dd'));   // e.g., "2026-03-28"
```

### shadcn Checkbox with Touch Target
```tsx
// Source: shadcn/ui documentation (ui.shadcn.com/docs/components/checkbox)
import { Checkbox } from '@/components/ui/checkbox';

<div className="min-w-12 min-h-12 flex items-center justify-center">
  <Checkbox
    checked={isCompleted}
    onCheckedChange={(checked) => handleComplete(checked)}
  />
</div>
```

### sonner Toast with Action Button
```typescript
// Source: sonner documentation (sonner.dev) + UX research best practices
import { toast } from 'sonner';

toast.success('Chore completed', {
  duration: 5000, // 5 seconds for action toasts
  action: {
    label: 'Undo',
    onClick: () => handleUndo()
  }
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| setTimeout loops for cron | node-cron or Croner libraries | 2020+ | Better timezone handling, DST support, cleaner code |
| Moment.js for date math | date-fns or Temporal API | 2020+ (date-fns), 2024+ (Temporal) | Smaller bundle size (date-fns tree-shakeable), immutable (Temporal) |
| SQLite DATE columns | Unix timestamp INTEGER with 'unixepoch' | Best practice 2018+ | Timezone-agnostic, smaller storage, faster comparisons |
| Custom toast components | sonner (shadcn recommended) | 2023+ | Accessibility built-in, action buttons, swipe-to-dismiss |
| React class-based timers | Custom hooks (useEffect + setTimeout) | React 16.8+ (2019) | Cleaner cleanup, reusable logic, better composition |
| JSON TEXT vs JSONB | JSONB preferred for frequent queries | SQLite 3.45+ (2024) | 5-10% smaller, 2x faster parsing, but TEXT more debuggable |

**Deprecated/outdated:**
- **Moment.js:** No longer maintained, replaced by date-fns or Temporal API
- **cron package without timezone support:** Modern apps need timezone-aware scheduling
- **localStorage for offline chores:** SQLite provides better querying, relations, and atomicity
- **Custom long-press with onTouchStart/End only:** Missing onTouchCancel and movement detection causes false positives

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 (recommended for Vite integration) |
| Config file | None — see Wave 0 |
| Quick run command | `npm test` (after setup) |
| Full suite command | `npm test -- --run` (after setup) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CHOR-01 | Create chore with title and assignee | integration | `npm test -- tests/chores.test.ts -t "create chore"` | ❌ Wave 0 |
| CHOR-02 | Assign chore to specific family member | unit | `npm test -- tests/chores.test.ts -t "assign to member"` | ❌ Wave 0 |
| CHOR-03 | Mark chore complete with single tap | integration | `npm test -- tests/chores.test.ts -t "complete chore default"` | ❌ Wave 0 |
| CHOR-04 | Delete chore with PIN | integration | `npm test -- tests/chores.test.ts -t "delete chore"` | ❌ Wave 0 |
| CHOR-05 | View unified chore list (not grouped) | unit | `npm test -- tests/components.test.tsx -t "unified list"` | ❌ Wave 0 |
| CHOR-06 | Checkbox meets 48px minimum | unit | `npm test -- tests/components.test.tsx -t "checkbox size"` | ❌ Wave 0 |
| CHOR-07 | Completed chores move to section | integration | `npm test -- tests/components.test.tsx -t "completed section"` | ❌ Wave 0 |
| CHOR-08 | Set chore as recurring | integration | `npm test -- tests/chores.test.ts -t "set recurring"` | ❌ Wave 0 |
| CHOR-09 | Recurring chores auto-generate at midnight | unit | `npm test -- tests/jobs.test.ts -t "recurring generation"` | ❌ Wave 0 |
| CHOR-09 | Auto-complete missed recurring chores | unit | `npm test -- tests/jobs.test.ts -t "auto complete missed"` | ❌ Wave 0 |
| CHOR-10 | Offline chore system (no external APIs) | manual | Visual: Disconnect network, create/complete chores | Manual |
| CHOR-11 | Show completed count per family member | unit | `npm test -- tests/chores.test.ts -t "completion count"` | ❌ Wave 0 |
| CHOR-12 | Visual feedback on completion | unit | `npm test -- tests/components.test.tsx -t "completion feedback"` | ❌ Wave 0 |
| D-17 | Long-press opens family picker | unit | `npm test -- tests/hooks.test.ts -t "long press detection"` | ❌ Wave 0 |
| D-19 | Undo toast with 5-second duration | unit | `npm test -- tests/components.test.tsx -t "undo toast"` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- tests/{module}.test.ts` (affected module only, < 30s)
- **Per wave merge:** `npm test` (full suite, < 2min expected)
- **Phase gate:** Full suite green + manual offline verification before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Install Vitest: `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event --workspace=client`
- [ ] Install server testing tools: `npm install -D vitest supertest --workspace=server`
- [ ] Create `client/vitest.config.ts` with jsdom environment
- [ ] Create `server/vitest.config.ts` with node environment
- [ ] Create `tests/chores.test.ts` — covers CHOR-01 through CHOR-04, CHOR-08, CHOR-11 (API CRUD)
- [ ] Create `tests/jobs.test.ts` — covers CHOR-09 (recurring generation logic)
- [ ] Create `tests/components.test.tsx` — covers CHOR-05 through CHOR-07, CHOR-12 (UI components)
- [ ] Create `tests/hooks.test.ts` — covers D-17 (long-press detection), D-19 (undo logic)
- [ ] Add `"test": "vitest"` to client/package.json and server/package.json scripts

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Server runtime | ✓ | 16+ | — |
| npm | Package manager | ✓ | Current | — |
| SQLite | Data persistence | ✓ | Via better-sqlite3 | — |
| PM2 | Process management | ✓ | From Phase 1 | — |

**Missing dependencies with no fallback:**
None — all external dependencies confirmed available from Phase 1 and Phase 2 completion.

**Missing dependencies with fallback:**
None.

**Note:** Phase 3 has no new external tool dependencies beyond Node.js packages. All required tools (Node.js, npm, SQLite via better-sqlite3, PM2) are already confirmed available from previous phase completion.

## Sources

### Primary (HIGH confidence)
- [node-cron - npm](https://www.npmjs.com/package/node-cron) - Cron scheduling API and options
- [date-fns documentation](https://date-fns.org/) - Week boundary functions
- [SQLite Date And Time Functions](https://sqlite.org/lang_datefunc.html) - Unix timestamp filtering
- [shadcn/ui Checkbox](https://ui.shadcn.com/docs/components/radix/checkbox) - Touch-optimized checkbox component
- [sonner documentation](https://sonner.dev) - Toast notifications with action buttons

### Secondary (MEDIUM confidence)
- [node-cron vs node-schedule vs Croner — PkgPulse Blog](https://www.pkgpulse.com/blog/node-cron-vs-node-schedule-vs-croner-task-scheduling-nodejs-2026) - Comparison of Node.js schedulers
- [Shadcn/ui React Series — Part 19: Sonner](https://blog.stackademic.com/shadcn-ui-react-series-part-19-sonner-modern-toast-notifications-done-right-903757c5681f) - Modern toast patterns
- [What is a Toast Notification? Best Practices](https://blog.logrocket.com/ux-design/toast-notifications/) - Undo toast UX guidance
- [How to Detect Long Press Gestures in JavaScript Events in React](https://spacejelly.dev/posts/how-to-detect-long-press-gestures-in-javascript-events-in-react) - Long-press implementation
- [SQLite JSONB Format](https://sqlite.org/jsonb.html) - JSONB vs TEXT JSON comparison

### Tertiary (LOW confidence)
- [useLongPress React Hook](https://usehooks.com/uselongpress) - Alternative long-press implementation
- [React Native Gesture Handler Tutorial](https://blog.logrocket.com/react-native-gesture-handler-tutorial-examples/) - Cross-platform gesture patterns

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified current with npm view, node-cron and date-fns versions confirmed
- Architecture: HIGH - Patterns extend Phase 2's proven approach (React hooks, Fastify, SQLite), cron patterns from official docs
- Pitfalls: MEDIUM-HIGH - Based on node-cron documentation, SQLite timezone gotchas, and UX research on long-press/undo
- Recurring generation: HIGH - node-cron official docs, SQLite date functions verified
- Long-press/undo UX: MEDIUM - Based on WebSearch findings and React hooks best practices

**Research date:** 2026-03-22
**Valid until:** 2026-04-22 (30 days - stable stack, node-cron and date-fns unlikely to change)
