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

  CREATE INDEX IF NOT EXISTS idx_family_name ON family_members(name);
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
