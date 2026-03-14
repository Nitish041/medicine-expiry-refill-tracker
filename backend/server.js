// ===============================
//  MAIN BACKEND SERVER FILE
//  server.js
// ===============================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Enable JSON parsing
app.use(express.json());

// Allow frontend requests
// Allow localhost or 127.0.0.1 origins (including ports) and requests without an Origin header
const localOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (e.g. curl, some clients)
        if (!origin) return callback(null, true);
        // allow if origin matches localhost or 127.0.0.1 with any port
        if (localOriginRegex.test(origin)) return callback(null, true);
        // otherwise do not allow CORS (respond without CORS headers)
        return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// ------------------------------
// MySQL Connection Pool
// ------------------------------
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.set("pool", pool);

// Print connection message
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log("✔ Connected to MySQL database");
        conn.release();
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
})();

// --------------------------------------
// ROUTES IMPORT
// --------------------------------------
const medicinesRoute = require("./routes/medicines");
const suppliersRoute = require("./routes/suppliers");
const scannerRoute = require("./routes/scanner");
const salesRoute = require("./routes/sales");

// --------------------------------------
// ROUTES SETUP
// --------------------------------------
app.use("/api/medicines", medicinesRoute);
app.use("/api/suppliers", suppliersRoute);
app.use("/api/scanner", scannerRoute);
app.use("/api/sales", salesRoute);

// --------------------------------------
// DEFAULT ROOT CHECK
// --------------------------------------
app.get("/", (req, res) => {
    res.send("Medicine Tracker Backend Running ✔");
});

// --------------------------------------
// START SERVER
// --------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
});
