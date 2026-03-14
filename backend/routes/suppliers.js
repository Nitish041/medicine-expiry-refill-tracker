// backend/routes/suppliers.js
const express = require('express');
const router = express.Router();

function getPool(req) {
  return req.app.get('pool');
}

// GET all suppliers
router.get('/', async (req, res) => {
  const pool = getPool(req);
  try {
    const [rows] = await pool.query('SELECT * FROM supplier ORDER BY supplier_id DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /suppliers error:', err);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// GET single supplier
router.get('/:id', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM supplier WHERE supplier_id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Supplier not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /suppliers/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// CREATE supplier
router.post('/', async (req, res) => {
  const pool = getPool(req);
  const { name, contact, email, address } = req.body;

  if (!name) return res.status(400).json({ error: 'Supplier name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO supplier (name, contact, email, address) VALUES (?, ?, ?, ?)',
      [name, contact || null, email || null, address || null]
    );
    res.json({ message: 'Supplier added', supplier_id: result.insertId });
  } catch (err) {
    console.error('POST /suppliers error:', err);
    res.status(500).json({ error: 'Failed to add supplier' });
  }
});

// UPDATE supplier
router.put('/:id', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;
  const { name, contact, email, address } = req.body;

  if (!name) return res.status(400).json({ error: 'Supplier name is required' });

  try {
    const [result] = await pool.query(
      'UPDATE supplier SET name = ?, contact = ?, email = ?, address = ? WHERE supplier_id = ?',
      [name, contact || null, email || null, address || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier updated' });
  } catch (err) {
    console.error('PUT /suppliers/:id error:', err);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// DELETE supplier
// Behavior: set supplier_id = NULL on medicines that reference this supplier, then delete supplier
router.delete('/:id', async (req, res) => {
  const pool = getPool(req);
  const id = req.params.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // remove supplier link from medicines (safe)
    await conn.query('UPDATE medicine SET supplier_id = NULL WHERE supplier_id = ?', [id]);

    // delete supplier
    const [result] = await conn.query('DELETE FROM supplier WHERE supplier_id = ?', [id]);
    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Supplier not found' });
    }

    await conn.commit();
    res.json({ message: 'Supplier deleted and medicines unlinked' });
  } catch (err) {
    await conn.rollback();
    console.error('DELETE /suppliers/:id error:', err);
    res.status(500).json({ error: 'Failed to delete supplier' });
  } finally {
    conn.release();
  }
});

module.exports = router;
