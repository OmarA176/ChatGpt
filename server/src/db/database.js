import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.resolve('server/data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'expiry-radar.db'));
db.pragma('journal_mode = WAL');

export const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('fridge','pantry','pharmacy')),
      expiry_date TEXT NOT NULL,
      barcode TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','finished','expired')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS shopping_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      source_item_id INTEGER,
      reason TEXT NOT NULL CHECK(reason IN ('expired','finished')),
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      inventory_item_id INTEGER NOT NULL,
      channel TEXT NOT NULL CHECK(channel IN ('browser','email')),
      message TEXT NOT NULL,
      sent_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, inventory_item_id, channel),
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(inventory_item_id) REFERENCES inventory_items(id)
    );
  `);
};

export default db;
