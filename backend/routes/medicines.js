const express = require("express");
const router = express.Router();

// Get MySQL pool from server.js
function getPool(req) {
return req.app.get("pool");
}

// ===============================
// GET ALL MEDICINES
// ===============================
router.get("/", async (req, res) => {
const pool = getPool(req);

try {
const [rows] = await pool.query(`       SELECT m.*, s.name AS supplier_name
      FROM medicine m
      LEFT JOIN supplier s ON m.supplier_id = s.supplier_id
      ORDER BY m.medicine_id DESC
    `);

```
res.json(rows);
```

} catch (err) {
console.error("GET /medicines error:", err);
res.status(500).json({ error: "Failed to fetch medicines" });
}
});

// ===============================
// ADD MEDICINE
// ===============================
router.post("/", async (req, res) => {
const pool = getPool(req);

const {
name,
batch_number,
manufacturer,
barcode,
supplier_id,
purchase_date,
expiry_date,
price,
quantity,
reorder_level
} = req.body;

// Validation (supplier_id removed so your form works)
if (
!name ||
!batch_number ||
!manufacturer ||
!purchase_date ||
!expiry_date ||
!price ||
!quantity
) {
return res.status(400).json({ error: "Missing required fields" });
}

try {
const [result] = await pool.query(
`INSERT INTO medicine
      (name, batch_number, manufacturer, barcode, supplier_id, purchase_date, expiry_date, price, quantity, reorder_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
[
name,
batch_number,
manufacturer,
barcode || null,
supplier_id || null,
purchase_date,
expiry_date,
price,
quantity,
reorder_level || 0
]
);

```
res.json({
  message: "Medicine added",
  medicine_id: result.insertId
});
```

} catch (err) {
console.error("POST /medicines error:", err);
res.status(500).json({ error: "Failed to add medicine" });
}
});

// ===============================
// UPDATE MEDICINE
// ===============================
router.put("/:id", async (req, res) => {
const pool = getPool(req);
const id = req.params.id;

const {
name,
batch_number,
manufacturer,
barcode,
expiry_date,
price,
quantity,
reorder_level,
supplier_id
} = req.body;

try {
const [result] = await pool.query(
`UPDATE medicine SET
        name = ?,
        batch_number = ?,
        manufacturer = ?,
        barcode = ?,
        expiry_date = ?,
        price = ?,
        quantity = ?,
        reorder_level = ?,
        supplier_id = ?
      WHERE medicine_id = ?`,
[
name,
batch_number,
manufacturer,
barcode || null,
expiry_date,
price,
quantity,
reorder_level || 0,
supplier_id || null,
id
]
);

```
if (result.affectedRows === 0) {
  return res.status(404).json({ error: "Medicine not found" });
}

res.json({ message: "Medicine updated" });
```

} catch (err) {
console.error("PUT /medicines/:id error:", err);
res.status(500).json({ error: "Failed to update medicine" });
}
});

// ===============================
// DELETE MEDICINE
// ===============================
router.delete("/:id", async (req, res) => {
const pool = getPool(req);
const id = req.params.id;

try {
const [result] = await pool.query(
"DELETE FROM medicine WHERE medicine_id = ?",
[id]
);

```
if (result.affectedRows === 0) {
  return res.status(404).json({ error: "Medicine not found" });
}

res.json({ message: "Medicine deleted" });
```

} catch (err) {
console.error("DELETE /medicines/:id error:", err);
res.status(500).json({ error: "Failed to delete medicine" });
}
});

module.exports = router;
