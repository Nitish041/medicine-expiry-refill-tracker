// backend/routes/order.js
const express = require('express');
const router = express.Router();

function getPool(req) {
  const p = req.app && req.app.get && req.app.get('pool');
  if (p) return p;
  return require('../db');
}

/**
 * POST /api/order
 * Body: {
 *   supplier_id,
 *   expected_date, // optional YYYY-MM-DD
 *   items: [ { medicine_id, quantity, unit_price } ]
 * }
 */
router.post('/', async (req, res) => {
  const pool = getPool(req);
  const { supplier_id, expected_date = null, items } = req.body;

  if (!supplier_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'supplier_id and items required' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [ordRes] = await conn.query(
      'INSERT INTO ordertable (supplier_id, expected_date, total_amount, status) VALUES (?, ?, 0, "placed")',
      [supplier_id, expected_date]
    );
    const orderId = ordRes.insertId;
    let total = 0;

    for (const it of items) {
      const unitPrice = parseFloat(it.unit_price || 0);
      const qty = parseInt(it.quantity, 10);
      const subtotal = unitPrice * qty;
      total += subtotal;

      await conn.query(
        'INSERT INTO orderdetail (order_id, medicine_id, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, it.medicine_id, unitPrice, qty, subtotal]
      );
    }

    await conn.query('UPDATE ordertable SET total_amount = ? WHERE order_id = ?', [total, orderId]);

    await conn.commit();
    res.json({ ok: true, orderId, total });
  } catch (err) {
    await conn.rollback();
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message || 'Failed to create order' });
  } finally {
    conn.release();
  }
});

// GET all orders (with details)
router.get('/', async (req, res) => {
  const pool = getPool(req);
  try {
    const [orders] = await pool.query('SELECT o.*, s.name as supplier_name FROM ordertable o LEFT JOIN supplier s ON o.supplier_id = s.supplier_id ORDER BY o.order_id DESC');
    res.json(orders);
  } catch (err) {
    console.error('GET /api/order error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET order details
router.get('/:id', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;
  try {
    const [orders] = await pool.query('SELECT * FROM ordertable WHERE order_id = ?', [id]);
    if (!orders.length) return res.status(404).json({ error: 'Order not found' });

    const [details] = await pool.query('SELECT od.*, m.name FROM orderdetail od LEFT JOIN medicine m ON od.medicine_id = m.medicine_id WHERE od.order_id = ?', [id]);

    res.json({ order: orders[0], details });
  } catch (err) {
    console.error('GET /api/order/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status (e.g., placed -> received)
router.put('/:id/status', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;
  const { status } = req.body;

  if (!status) return res.status(400).json({ error: 'status required' });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // When status becomes 'received' -> increase medicine qty accordingly and insert StockHistory
    if (status === 'received') {
      const [details] = await conn.query('SELECT * FROM orderdetail WHERE order_id = ?', [id]);
      for (const d of details) {
        // update medicine quantity
        await conn.query('UPDATE medicine SET quantity = quantity + ? WHERE medicine_id = ?', [d.quantity, d.medicine_id]);
        // stock history
        await conn.query('INSERT INTO StockHistory (medicine_id, change_type, change_qty, note, changed_by) VALUES (?, "refill_receive", ?, ?, ?)', [d.medicine_id, d.quantity, `Order ${id}`, 'system']);
      }
    }

    await conn.query('UPDATE ordertable SET status = ? WHERE order_id = ?', [status, id]);

    await conn.commit();
    res.json({ message: 'Order status updated' });
  } catch (err) {
    await conn.rollback();
    console.error('PUT /api/order/:id/status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    conn.release();
  }
});

module.exports = router;
