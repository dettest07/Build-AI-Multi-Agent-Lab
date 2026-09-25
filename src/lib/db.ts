/**
 * SQLite helpers for contact + guestbook.
 * Lab 05 (OpenCode) implements persistence. Stubs return null until finishe.
 */
import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type GuestbookEntry = {
  id: number;
  name: string;
  message: string;
  created_at: string;
};

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const dir = process.env.DATA_DIR || join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  db = new Database(join(dir, 'site.sqlite'));
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}

/** Thrown on invalid input — callers must map this to HTTP 400 with a safe message. */
export class ValidationError extends Error {
  constructor(field: string, reason: string) {
    super(`invalid input: ${field} ${reason}`);
    this.name = 'ValidationError';
  }
}

/** Trim + type/length check. Throws ValidationError — never echoes user values. */
function clean(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string') throw new ValidationError(field, 'must be a string');
  const v = value.trim();
  if (v.length === 0) throw new ValidationError(field, 'must not be empty');
  if (v.length > max) throw new ValidationError(field, `too long (max ${max})`);
  return v;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate + insert a contact message, return the persisted row. */
export function insertContact(input: {
  name: string;
  email: string;
  message: string;
}): ContactMessage {
  const name = clean(input?.name, 'name', 80);
  const email = clean(input?.email, 'email', 120);
  const message = clean(input?.message, 'message', 1950);
  if (!EMAIL_RE.test(email)) throw new ValidationError('email', 'invalid format');

  const d = getDb();
  const result = d
    .prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
    .run(name, email, message);
  const row = d
    .prepare('SELECT id, name, email, message, created_at FROM contact_messages WHERE id = ?')
    .get(Number(result.lastInsertRowid));
  if (!row) throw new Error('insert failed');
  return row as ContactMessage;
}

/** List guestbook entries, newest first. */
export function listGuestbook(): GuestbookEntry[] {
  return getDb()
    .prepare('SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC')
    .all() as GuestbookEntry[];
}

/** Validate + insert a guestbook entry, return the persisted row. */
export function insertGuestbook(input: {
  name: string;
  message: string;
}): GuestbookEntry {
  const name = clean(input?.name, 'name', 80);
  const message = clean(input?.message, 'message', 500);

  const d = getDb();
  const result = d
    .prepare('INSERT INTO guestbook (name, message) VALUES (?, ?)')
    .run(name, message);
  const row = d
    .prepare('SELECT id, name, message, created_at FROM guestbook WHERE id = ?')
    .get(Number(result.lastInsertRowid));
  if (!row) throw new Error('insert failed');
  return row as GuestbookEntry;
}
