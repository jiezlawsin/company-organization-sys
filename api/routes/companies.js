const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

router.get('/', (req, res) => {
  db.all('SELECT * FROM companies', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM companies WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Company not found' });
    res.json(row);
  });
});

router.post('/', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  db.run('INSERT INTO companies (id, name) VALUES (?, ?)', [id, name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id, name });
  });
});

router.put('/:id', (req, res) => {
  const { name } = req.body;
  const companyId = req.params.id;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Company name is required' });
  }

  db.get('SELECT id FROM companies WHERE LOWER(name) = LOWER(?) AND id != ?', [name.trim(), companyId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      return res.status(409).json({ error: 'Company name already exists' });
    }
    db.run('UPDATE companies SET name = ? WHERE id = ?', [name.trim(), companyId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json({ id: companyId, name: name.trim() });
    });
  });
});

router.delete('/:id', (req, res) => {
  const companyId = req.params.id;
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM employees WHERE companyId = ?', [companyId], function (err) {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: err.message });
      }

      const deletedEmployees = this.changes;
      db.run('DELETE FROM companies WHERE id = ?', [companyId], function (err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }

        if (this.changes === 0) {
          db.run('ROLLBACK');
          return res.status(404).json({ error: 'Company not found' });
        }

        db.run('COMMIT');
        res.json({
          success: true,
          deletedEmployees: deletedEmployees,
          message: `Company deleted successfully. ${deletedEmployees} employee(s) also deleted.`
        });
      });
    });
  });
});

module.exports = router;