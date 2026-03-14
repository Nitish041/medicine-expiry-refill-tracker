// backend/routes/reports.js
const express = require('express');
const router = express.Router();

function getPool(req) {
  const p = req.app && req.app.get && req.app.get('pool');
  if (p) return p;
  return require('../db');
}

// GET /api/reports/alerts
// returns combined alert items with an `alert_type` field
router.get('/alerts', async (req, res) => {
  const pool = getPool(req);
  try {
    const [meds] = await pool.query(`
      SELECT m.*, s.name as supplier_name
      FROM medicine m
      LEFT JOIN supplier s ON m.supplier_id = s.supplier_id
    `);

    const today = new Date();
    const alerts = [];

    meds.forEach(m => {
      if (!m.expiry_date) return;

      const exp = new Date(m.expiry_date);
      exp.setHours(0,0,0,0);
      const diffDays = Math.ceil((exp - today) / (1000*60*60*24));

      if (diffDays < 0) {
        alerts.push({ ...m, alert_type: 'expired' });
      } else if (diffDays <= 30) {
        alerts.push({ ...m, alert_type: 'near_expiry' });
      }

      if (m.quantity <= (m.reorder_level || 0)) {
        alerts.push({ ...m, alert_type: 'low_stock' });
      }
    });

    // Optionally dedupe: we can have same medicine show multiple alert types — return as-is so frontend groups
    res.json(alerts);
  } catch (err) {
    console.error('GET /reports/alerts error:', err);
    res.status(500).json({ error: 'Failed to generate alerts' });
  }
});

module.exports = router;
