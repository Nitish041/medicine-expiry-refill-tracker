// backend/routes/scanner.js
const express = require('express');
const router = express.Router();

function getPool(req) {
  const p = req.app && req.app.get && req.app.get('pool');
  if (p) return p;
  return require('../db'); // fallback
}

// GET /api/scanner/lookup?barcode=...
// Returns an array (0 or 1 item) to keep parity with existing /medicines API
router.get('/lookup', async (req, res) => {
  const pool = getPool(req);
  const { barcode } = req.query;
  if (!barcode) return res.status(400).json({ error: 'barcode required' });

  try {
    const [rows] = await pool.query(
      `SELECT m.*, s.name AS supplier_name
       FROM medicine m
       LEFT JOIN supplier s ON m.supplier_id = s.supplier_id
       WHERE m.barcode = ? LIMIT 1`,
      [barcode]
    );
    return res.json(rows); // empty array if not found
  } catch (err) {
    console.error('GET /api/scanner/lookup error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Optional: search endpoint used by scanner manual entry
// GET /api/scanner/search?q=...
router.get('/search', async (req, res) => {
  const pool = getPool(req);
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q query required' });

  try {
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `SELECT m.*, s.name AS supplier_name
       FROM medicine m
       LEFT JOIN supplier s ON m.supplier_id = s.supplier_id
       WHERE m.name LIKE ? OR m.barcode LIKE ? OR m.batch_no LIKE ?
       LIMIT 30`,
      [like, like, like]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/scanner/search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
