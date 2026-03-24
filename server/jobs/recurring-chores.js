import db from '../db.js';
import { shouldGenerateToday } from '../utils/chore-generator.js';
import { startOfDay, addDays, format } from 'date-fns';

/**
 * Generate recurring chore instances across a rolling window:
 *   - Look back up to 7 days (backfills missed/past-dated instances)
 *   - Look ahead up to 14 days (makes future occurrences visible in the calendar)
 *
 * Each instance is stamped with created_at = noon on its *scheduled* date so
 * it appears under the correct day in every view, regardless of when the
 * generator actually ran.
 */
export function generateRecurringChores() {
  const recurring = db.prepare(`
    SELECT * FROM chores
    WHERE is_recurring = 1 AND parent_chore_id IS NULL
  `).all();

  const today = startOfDay(new Date());
  const windowEnd = addDays(today, 14);

  for (const chore of recurring) {
    const config = JSON.parse(chore.recurrence_config);

    // For interval chores without an explicit startDate, treat the template's
    // creation date as the anchor so the schedule is stable.
    const effectiveConfig = { ...config };
    if (effectiveConfig.frequency === 'interval' && !effectiveConfig.startDate) {
      effectiveConfig.startDate = format(new Date(chore.created_at * 1000), 'yyyy-MM-dd');
    }

    // Determine window start: the later of (startDate, today-7)
    const lookbackStart = addDays(today, -7);
    let windowStart = lookbackStart;
    if (effectiveConfig.startDate) {
      const anchor = startOfDay(new Date(effectiveConfig.startDate + 'T12:00:00'));
      if (anchor > lookbackStart) windowStart = anchor;
    }

    // Fetch all existing instance dates for this template (avoids duplicates)
    const existingRows = db.prepare(`
      SELECT DATE(created_at, 'unixepoch', 'localtime') as date
      FROM chores
      WHERE parent_chore_id = ?
    `).all(chore.id);
    const existingDates = new Set(existingRows.map(r => r.date));

    // Walk every date in the window and generate where needed
    let current = windowStart;
    while (current <= windowEnd) {
      const dateStr = format(current, 'yyyy-MM-dd');

      if (!existingDates.has(dateStr) && shouldGenerateToday(effectiveConfig, current, null)) {
        // Stamp the instance at noon on its scheduled date so it sorts correctly
        const scheduledAt = Math.floor(current.getTime() / 1000) + 43200;

        db.prepare(`
          INSERT INTO chores
            (title, description, assigned_to, points, parent_chore_id, is_recurring, recurrence_config, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?)
        `).run(
          chore.title, chore.description, chore.assigned_to, chore.points,
          chore.id, scheduledAt, scheduledAt
        );

        existingDates.add(dateStr);
      }

      current = addDays(current, 1);
    }

    // Auto-complete yesterday's instance if it was left active (daily-ish chores)
    const yesterdayStr = format(addDays(today, -1), 'yyyy-MM-dd');
    const yesterdayIncomplete = db.prepare(`
      SELECT id FROM chores
      WHERE parent_chore_id = ?
        AND status = 'active'
        AND DATE(created_at, 'unixepoch', 'localtime') = ?
    `).get(chore.id, yesterdayStr);

    if (yesterdayIncomplete) {
      db.prepare(`
        UPDATE chores
        SET status = 'auto_completed', completed_by = NULL, completed_at = unixepoch(), updated_at = unixepoch()
        WHERE id = ?
      `).run(yesterdayIncomplete.id);
    }
  }
}
