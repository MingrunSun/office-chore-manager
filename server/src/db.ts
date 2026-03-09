import { Database } from 'node-sqlite3-wasm';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'chores.db');

const db = new Database(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS members (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS chores (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT NOT NULL,
    description    TEXT,
    member_id      INTEGER REFERENCES members(id) ON DELETE SET NULL,
    due_time       TEXT,
    is_recurring   INTEGER NOT NULL DEFAULT 0,
    recur_freq     TEXT,
    recur_interval INTEGER DEFAULT 1,
    recur_days     TEXT,
    recur_start    TEXT,
    recur_end      TEXT,
    due_date       TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS completions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    chore_id      INTEGER NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
    instance_date TEXT NOT NULL,
    completed_by  INTEGER REFERENCES members(id) ON DELETE SET NULL,
    completed_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(chore_id, instance_date)
  )
`);

export default db;
