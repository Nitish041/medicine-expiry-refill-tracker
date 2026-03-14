#!/usr/bin/env node
/**
 * Seed Data Script
 * Run with: node scripts/seed-data.js
 * This populates the database with sample data
 */

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

async function seedData() {
  const conn = await pool.getConnection();
  
  try {
    console.log('\n📊 Starting database seed...\n');

    // Sample suppliers
    const suppliers = [
      { name: 'PharmaCorp Ltd', contact: '+91-9876543210', email: 'sales@pharmcorp.com', address: '123 Medical Street' },
      { name: 'HealthCare Imports', contact: '+91-9123456789', email: 'info@healthcareimports.com', address: '456 Pharmacy Road' },
      { name: 'MediGlobal Solutions', contact: '+91-8765432109', email: 'contact@mediglobal.com', address: '789 Health Avenue' },
    ];

    console.log('Adding suppliers...');
    for (const sup of suppliers) {
      await conn.query(
        'INSERT INTO Supplier (name, contact, email, address) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
        [sup.name, sup.contact, sup.email, sup.address]
      );
    }
    console.log('✓ Suppliers added\n');

    // Sample medicines
    const medicines = [
      {
        name: 'Paracetamol 500mg',
        batch_no: 'PARA-2024-001',
        manufacturer: 'Sun Pharma',
        supplier_id: 1,
        purchase_date: '2024-01-15',
        expiry_date: '2026-12-31',
        price: 5.50,
        quantity: 500,
        reorder_level: 50
      },
      {
        name: 'Amoxicillin 250mg',
        batch_no: 'AMOX-2024-002',
        manufacturer: 'Cipla',
        supplier_id: 2,
        purchase_date: '2024-02-10',
        expiry_date: '2025-08-15',
        price: 12.00,
        quantity: 200,
        reorder_level: 30
      },
      {
        name: 'Aspirin 75mg',
        batch_no: 'ASPR-2024-003',
        manufacturer: 'Bayer',
        supplier_id: 1,
        purchase_date: '2024-03-05',
        expiry_date: '2026-06-30',
        price: 8.50,
        quantity: 300,
        reorder_level: 40
      },
      {
        name: 'Metformin 500mg',
        batch_no: 'MET-2024-004',
        manufacturer: 'GSK',
        supplier_id: 3,
        purchase_date: '2024-01-20',
        expiry_date: '2025-12-15',
        price: 15.00,
        quantity: 150,
        reorder_level: 25
      },
      {
        name: 'Omeprazole 20mg',
        batch_no: 'OMEP-2024-005',
        manufacturer: 'Lupin',
        supplier_id: 2,
        purchase_date: '2024-02-25',
        expiry_date: '2026-02-28',
        price: 10.50,
        quantity: 250,
        reorder_level: 35
      },
      {
        name: 'Vitamin C 1000mg',
        batch_no: 'VIT-C-2024-006',
        manufacturer: 'Nature\'s Bounty',
        supplier_id: 1,
        purchase_date: '2024-04-01',
        expiry_date: '2027-03-31',
        price: 6.00,
        quantity: 400,
        reorder_level: 60
      },
      {
        name: 'Ibuprofen 400mg',
        batch_no: 'IBU-2024-007',
        manufacturer: 'Pharma Plus',
        supplier_id: 3,
        purchase_date: '2024-03-10',
        expiry_date: '2025-11-30',
        price: 9.50,
        quantity: 180,
        reorder_level: 30
      },
      {
        name: 'Loratadine 10mg',
        batch_no: 'LORA-2024-008',
        manufacturer: 'Intas',
        supplier_id: 2,
        purchase_date: '2024-04-15',
        expiry_date: '2026-04-14',
        price: 11.00,
        quantity: 220,
        reorder_level: 35
      },
    ];

    console.log('Adding medicines...');
    for (const med of medicines) {
      await conn.query(
        `INSERT INTO Medicine (name, batch_no, manufacturer, supplier_id, purchase_date, expiry_date, price, quantity, reorder_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=name`,
        [med.name, med.batch_no, med.manufacturer, med.supplier_id, med.purchase_date, med.expiry_date, med.price, med.quantity, med.reorder_level]
      );
    }
    console.log('✓ Medicines added\n');

    console.log('✅ Database seeding complete!\n');
    console.log('Sample data added:');
    console.log('  - 3 Suppliers');
    console.log('  - 8 Medicines\n');

  } catch (err) {
    console.error('\n❌ Error seeding database:', err.message);
    process.exit(1);
  } finally {
    await conn.release();
    await pool.end();
  }
}

seedData();
