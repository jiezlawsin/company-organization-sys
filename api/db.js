const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    firstName TEXT,
    lastName TEXT,
    position TEXT,
    streetNumber TEXT,
    addressLine1 TEXT,
    addressLine2 TEXT,
    city TEXT,
    country TEXT,
    reportsTo TEXT,
    companyId TEXT,
    FOREIGN KEY(companyId) REFERENCES companies(id)
  )`);
});

module.exports = db;