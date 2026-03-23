import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || join(dataDir, 'familywall.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Schema initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch())
  );

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

  CREATE INDEX IF NOT EXISTS idx_family_name ON family_members(name);
  CREATE INDEX IF NOT EXISTS idx_chores_status ON chores(status);
  CREATE INDEX IF NOT EXISTS idx_chores_assigned_to ON chores(assigned_to);
  CREATE INDEX IF NOT EXISTS idx_chores_created_at ON chores(created_at);
  CREATE INDEX IF NOT EXISTS idx_chores_recurring ON chores(is_recurring);
`);

// Seed default PIN (1234) if no PIN exists yet (per D-01)
const existingPin = db.prepare('SELECT value FROM settings WHERE key = ?').get('parental_pin');
if (!existingPin) {
  const defaultHash = bcrypt.hashSync('1234', 13);
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES ('parental_pin', ?, unixepoch())`
  ).run(defaultHash);
}

export default db;
