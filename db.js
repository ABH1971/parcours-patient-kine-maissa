const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'cabinet.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    token TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    rdv_date TEXT,
    status TEXT NOT NULL DEFAULT 'en_attente',
    form_data TEXT,
    synthese TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    submitted_at TEXT
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mimetype TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (token) REFERENCES patients(token)
  );
`);

module.exports = db;
