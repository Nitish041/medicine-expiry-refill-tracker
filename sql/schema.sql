-- schema.sql
CREATE DATABASE IF NOT EXISTS medicine_tracker;
USE medicine_tracker;

-- Supplier
CREATE TABLE IF NOT EXISTS Supplier (
  supplier_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact VARCHAR(50),
  email VARCHAR(100),
  address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicine
CREATE TABLE IF NOT EXISTS Medicine (
  medicine_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  batch_no VARCHAR(50),
  manufacturer VARCHAR(150),
  supplier_id INT,
  purchase_date DATE,
  expiry_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  status ENUM('active','expired','near-expiry') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL
);

-- Orders and order details
CREATE TABLE IF NOT EXISTS OrderTable (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT,
  order_date DATE DEFAULT CURRENT_DATE,
  total_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('placed','received','cancelled') DEFAULT 'placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS OrderDetail (
  order_detail_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  medicine_id INT,
  unit_price DECIMAL(10,2),
  quantity INT,
  subtotal DECIMAL(12,2),
  FOREIGN KEY (order_id) REFERENCES OrderTable(order_id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
);

-- Refill suggestions
CREATE TABLE IF NOT EXISTS Refill (
  refill_id INT AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT,
  suggested_quantity INT,
  suggested_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('open','ordered','closed') DEFAULT 'open',
  FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id) ON DELETE CASCADE
);

CREATE INDEX idx_medicine_name ON Medicine(name);
