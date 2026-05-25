-- XTravel Hotel Booking - Schema v2
-- Based on TÀI LIỆU NGHIỆP VỤ & KỸ THUẬT CHI TIẾT

CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS room_type_amenities;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- 4.1. Bảng users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4.2. Bảng customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  identity_number VARCHAR(50) UNIQUE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4.3. Bảng employees
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  position VARCHAR(100),
  salary DECIMAL(15,2),
  hire_date DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4.4. Bảng room_types
CREATE TABLE room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(15,2) NOT NULL DEFAULT 0,
  max_occupancy INT NOT NULL DEFAULT 1,
  photo_urls JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4.5. Bảng rooms
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(50) NOT NULL UNIQUE,
  floor INT,
  room_type_id INT NOT NULL,
  status ENUM('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

-- 4.6. Bảng amenities
CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100),
  description TEXT
);

-- 4.7. Bảng room_type_amenities
CREATE TABLE room_type_amenities (
  room_type_id INT NOT NULL,
  amenity_id INT NOT NULL,
  PRIMARY KEY (room_type_id, amenity_id),
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- 4.8. Bảng bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  room_id INT NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT NOT NULL DEFAULT 0,
  total_guests INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_code VARCHAR(50),
  status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  payment_method ENUM('CASH', 'VNPAY') NOT NULL,
  note TEXT,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 4.9. Bảng payments
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  method ENUM('CASH', 'VNPAY') NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  transaction_code VARCHAR(255),
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 4.10. Bảng reviews
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- 4.11. Bảng audit_logs
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(50),
  old_value JSON,
  new_value JSON,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
