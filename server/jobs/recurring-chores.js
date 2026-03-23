import db from '../db.js';
import { shouldGenerateToday } from '../utils/chore-generator.js';

export function generateRecurringChores() {
  // Get all recurring template chores (parent_chore_id IS NULL and is_recurring = 1)
  const recurring = db.prepare(`
    SELECT * FROM chores
    WHERE is_recurring = 1 AND parent_chore_id IS NULL
  `).all();

  const today = new Date();

  for (const chore of recurring) {
    const config = JSON.parse(chore.recurrence_config);

    // Find most recent generated instance
    const lastInstance = db.prepare(`
      SELECT created_at FROM chores
      WHERE parent_chore_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(chore.id);

    if (!shouldGenerateToday(config, today, lastInstance?.created_at)) continue;

    // Check if instance already exists for today
    const existingToday = db.prepare(`
      SELECT id FROM chores
      WHERE parent_chore_id = ?
        AND DATE(created_at, 'unixepoch', 'localtime') = DATE('now', 'localtime')
    `).get(chore.id);

    if (existingToday) continue;

    // Auto-complete yesterday's instance if incomplete (D-23, D-25)
    const yesterdayIncomplete = db.prepare(`
      SELECT id FROM chores
      WHERE parent_chore_id = ?
        AND status = 'active'
        AND DATE(created_at, 'unixepoch', 'localtime') = DATE('now', 'localtime', '-1 day')
    `).get(chore.id);

    if (yesterdayIncomplete) {
      db.prepare(`
        UPDATE chores
        SET status = 'auto_completed', completed_by = NULL, completed_at = unixepoch(), updated_at = unixepoch()
        WHERE id = ?
      `).run(yesterdayIncomplete.id);
    }

    // Generate new instance for today
    db.prepare(`
      INSERT INTO chores (title, description, assigned_to, points, parent_chore_id, is_recurring, recurrence_config)
      VALUES (?, ?, ?, ?, ?, 0, NULL)
    `).run(chore.title, chore.description, chore.assigned_to, chore.points, chore.id);
  }
}
