// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'medicine_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Try a test connection and give a friendly log if credentials are missing/invalid.
(async function testConnection(){
  try {
    const conn = await pool.getConnection();
    conn.release();
    // console.log('DB pool connected'); // quiet success
  } catch (err) {
    console.error('\n====================================================');
    console.error('  FATAL: Cannot connect to MySQL database');
    console.error('====================================================\n');
    console.error('MySQL error:', err && err.message ? err.message : err);
    console.error('\nWhat you should do:');
    console.error('  1) Create a file named `.env` inside the `backend` folder.');
    console.error('     You can copy `./.env.example` and edit it. Example contents:');
    console.error('       DB_HOST=localhost');
    console.error("       DB_USER=mt_user_or_root");
    console.error('       DB_PASS=your_db_password');
    console.error('       DB_NAME=medicine_tracker');
    console.error('       PORT=3000\n');
    console.error('  2) If you do not have the database or an application user, create them using MySQL:');
    console.error('     # open MySQL shell (you may need to supply the root password)');
    console.error('     mysql -u root -p');
    console.error('     # then in mysql:');
    console.error("     CREATE DATABASE IF NOT EXISTS medicine_tracker;\n");
    console.error("     CREATE USER 'mt_user'@'localhost' IDENTIFIED BY 'strongpassword';");
    console.error("     GRANT ALL PRIVILEGES ON medicine_tracker.* TO 'mt_user'@'localhost';");
    console.error('     FLUSH PRIVILEGES;\n');
    console.error('  3) Put the username/password into `backend/.env` and restart the server:');
    console.error('       npm run dev\n');
    console.error('If you already have credentials, double-check DB_USER/DB_PASS and that the MySQL server is running.');
    console.error('\nExiting server startup until the DB connection is fixed.');
    console.error('====================================================\n');
    process.exit(1);
  }
})();

module.exports = pool;
