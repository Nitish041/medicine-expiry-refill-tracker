// backend/routes/refill.js
const express = require('express');
const router = express.Router();

function getPool(req) {
  const p = req.app && req.app.get && req.app.get('pool');
  if (p) return p;
  return require('../db');
}

// GET /api/refill  — list refill suggestions (open & history)
router.get('/', async (req, res) => {
  const pool = getPool(req);
  try {
    const [rows] = await pool.query(
      `SELECT r.*, m.name as medicine_name, m.batch_no, s.name as supplier_name
       FROM refill r
       LEFT JOIN medicine m ON r.medicine_id = m.medicine_id
       LEFT JOIN supplier s ON m.supplier_id = s.supplier_id
       ORDER BY r.refill_id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /refill error:', err);
    res.status(500).json({ error: 'Failed to fetch refills' });
  }
});

// POST /api/refill  — create suggestion manually
// body: { medicine_id, suggested_quantity }
router.post('/', async (req, res) => {
  const pool = getPool(req);
  const { medicine_id, suggested_quantity } = req.body;
  if (!medicine_id || !suggested_quantity) return res.status(400).json({ error: 'medicine_id and suggested_quantity required' });

  try {
    const [r] = await pool.query('INSERT INTO refill (medicine_id, suggested_quantity, suggested_date, status) VALUES (?, ?, CURDATE(), "open")', [medicine_id, suggested_quantity]);
    res.json({ message: 'Refill suggestion created', refill_id: r.insertId });
  } catch (err) {
    console.error('POST /refill error:', err);
    res.status(500).json({ error: 'Failed to create refill' });
  }
});

// PUT /api/refill/:id  — update status or suggested_quantity
router.put('/:id', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;
  const { status, suggested_quantity } = req.body;

  if (!status && typeof suggested_quantity === 'undefined') {
    return res.status(400).json({ error: 'status or suggested_quantity required' });
  }

  try {
    const updates = [];
    const params = [];
    if (typeof suggested_quantity !== 'undefined') { updates.push('suggested_quantity = ?'); params.push(suggested_quantity); }
    if (status) { updates.push('status = ?'); params.push(status); }
    params.push(id);

    const sql = `UPDATE refill SET ${updates.join(', ')} WHERE refill_id = ?`;
    const [r] = await pool.query(sql, params);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Refill not found' });
    res.json({ message: 'Refill updated' });
  } catch (err) {
    console.error('PUT /refill/:id error:', err);
    res.status(500).json({ error: 'Failed to update refill' });
  }
});

// DELETE /api/refill/:id
router.delete('/:id', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;
  try {
    const [r] = await pool.query('DELETE FROM refill WHERE refill_id = ?', [id]);
    if (r.affectedRows === 0) return res.status(404).json({ error: 'Refill not found' });
    res.json({ message: 'Refill deleted' });
  } catch (err) {
    console.error('DELETE /refill/:id error:', err);
    res.status(500).json({ error: 'Failed to delete refill' });
  }
});

module.exports = router;
