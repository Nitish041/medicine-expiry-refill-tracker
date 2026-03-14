-- sample_data.sql
USE medicine_tracker;

INSERT INTO Supplier (name, contact, email, address) VALUES
('Alpha Pharma', '9876543210', 'alpha@pharma.com', 'Market Road'),
('Beta Supplies', '9123456780', 'beta@supply.com', 'Industrial Area');

INSERT INTO Medicine (name, batch_no, manufacturer, supplier_id, purchase_date, expiry_date, price, quantity, reorder_level) VALUES
('Paracetamol 500mg', 'P2025A', 'GoodMeds', 1, '2024-11-01', '2026-10-31', 25.00, 100, 20),
('Amoxicillin 250mg', 'A2024B', 'HealCorp', 2, '2024-01-10', '2025-12-15', 45.00, 15, 30),
('Cough Syrup 100ml', 'C2023C', 'CureAll', 1, '2023-10-01', '2024-11-20', 80.00, 5, 10);
