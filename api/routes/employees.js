const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get employees by company
router.get('/company/:companyId', (req, res) => {
  db.all('SELECT * FROM employees WHERE companyId = ?', [req.params.companyId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Add employee
router.post('/', (req, res) => {
  const {
    firstName, lastName, position, streetNumber, addressLine1, addressLine2,
    city, country, reportsTo, companyId
  } = req.body;
  const id = uuidv4();
  db.run(
    `INSERT INTO employees (id, firstName, lastName, position, streetNumber, addressLine1, addressLine2, city, country, reportsTo, companyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, firstName, lastName, position, streetNumber, addressLine1, addressLine2, city, country, reportsTo, companyId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, ...req.body });
    }
  );
});

// Update employee
router.put('/:id', (req, res) => {
  const {
    firstName, lastName, position, streetNumber, addressLine1, addressLine2,
    city, country, reportsTo, companyId
  } = req.body;
  db.run(
    `UPDATE employees SET firstName=?, lastName=?, position=?, streetNumber=?, addressLine1=?, addressLine2=?, city=?, country=?, reportsTo=?, companyId=? WHERE id=?`,
    [firstName, lastName, position, streetNumber, addressLine1, addressLine2, city, country, reportsTo, companyId, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: req.params.id, ...req.body });
    }
  );
});

// Delete employee
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

module.exports = router;