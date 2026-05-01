-- SQL Setup Script for XTRAVEL Hotel Booking System
-- Includes Table Creation and Full Data Seeding

CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- 1. DROP EXISTING TABLES (Clean start)
-- ---------------------------------------------------------
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS maintenance_records;
DROP TABLE IF EXISTS booking_items;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS discounts;
DROP TABLE IF EXISTS room_images;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS seasonal_rates;
DROP TABLE IF EXISTS room_type_amenities;
DROP TABLE IF EXISTS room_types;
DROP TABLE IF EXISTS amenities;
DROP TABLE IF EXISTS employee_roles;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- 2. CREATE TABLES
-- ---------------------------------------------------------

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) UNIQUE,
  role ENUM('ADMIN', 'EMPLOYEE', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  avatar VARCHAR(255) NULL,
  status ENUM('ACTIVE', 'LOCKED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL DEFAULT 'Vietnam',
  id_number VARCHAR(255) NOT NULL UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  permissions JSON NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Employees
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  position VARCHAR(255) NOT NULL,
  department ENUM('Reception', 'Accounting', 'Management', 'Other') NOT NULL,
  hire_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Employee Roles mapping
CREATE TABLE employee_roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  role_id INT NOT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Amenities
CREATE TABLE amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon VARCHAR(255) NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Room Types
CREATE TABLE room_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
  max_occupancy INT NOT NULL CHECK (max_occupancy > 0),
  photo_urls JSON NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Room Type Amenities mapping
CREATE TABLE room_type_amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT NOT NULL,
  amenity_id INT NOT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);

-- Seasonal Rates
CREATE TABLE seasonal_rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  start_date DATETIME(3) NOT NULL,
  end_date DATETIME(3) NOT NULL,
  multiplier DECIMAL(5,2) NOT NULL CHECK (multiplier > 0),
  season_name VARCHAR(255) NOT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  room_type_id INT NOT NULL,
  CHECK (end_date > start_date),
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

-- Rooms
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_number VARCHAR(255) NOT NULL UNIQUE,
  floor SMALLINT NOT NULL,
  status ENUM('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
  notes TEXT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  room_type_id INT NOT NULL,
  FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE CASCADE
);

-- Room Images
CREATE TABLE room_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  image_url TEXT NOT NULL,
  room_id INT NOT NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Discounts
CREATE TABLE discounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  percentage DECIMAL(5,2) NOT NULL,
  valid_from DATETIME(3) NOT NULL,
  valid_to DATETIME(3) NOT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

-- Bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_date DATETIME(3) NOT NULL,
  checkin_date DATETIME(3) NOT NULL,
  checkout_date DATETIME(3) NOT NULL,
  total_guests SMALLINT NOT NULL,
  special_requests TEXT NULL,
  status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
  booking_source ENUM('WEBSITE', 'DIRECT', 'AGENT') NOT NULL DEFAULT 'WEBSITE',
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  customer_id INT NOT NULL,
  discount_id INT NULL,
  CHECK (checkout_date > checkin_date),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (discount_id) REFERENCES discounts(id) ON DELETE SET NULL
);

-- Booking Items
CREATE TABLE booking_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  room_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE RESTRICT
);

-- Maintenance Records
CREATE TABLE maintenance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  description TEXT NOT NULL,
  start_date DATETIME(3) NOT NULL,
  end_date DATETIME(3) NOT NULL,
  status ENUM('In_Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'In_Progress',
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  room_id INT NOT NULL,
  CHECK (end_date >= start_date),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_date DATETIME(3) NOT NULL,
  payment_method ENUM('CASH', 'CARD', 'TRANSFER', 'VNPAY') NOT NULL,
  transaction_id VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('SUCCESS', 'PENDING', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  review_date DATETIME(3) NOT NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  update_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  customer_id INT NOT NULL,
  booking_id INT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Audit Logs
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(255) NOT NULL,
  entity VARCHAR(255) NOT NULL,
  entity_id INT NOT NULL,
  user_id INT NOT NULL,
  user_type ENUM('Admin', 'Employee', 'Customer') NOT NULL,
  details JSON NULL,
  create_date DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- 3. INSERT DATA
-- ---------------------------------------------------------

-- 3.1 Roles
INSERT INTO roles (name, permissions) VALUES
('ADMIN', '{"all": true}'),
('STAFF', '{"bookings": true, "rooms": true}'),
('CUSTOMER', '{"profile": true, "my_bookings": true}');

-- 3.2 Users (Password is 'admin123' hashed)
INSERT INTO users (id, email, password, first_name, last_name, role, status) VALUES
(1, 'admin@xtravel.com', '$2y$10$769649557696495576964uH5H6G7G8G9G0G1G2G3G4G5G6G7G8', 'Bảo Nguyên', 'Lê', 'ADMIN', 'ACTIVE'),
(2, 'staff@xtravel.com', '$2y$10$769649557696495576964uH5H6G7G8G9G0G1G2G3G4G5G6G7G8', 'Huy', 'Trần', 'EMPLOYEE', 'ACTIVE'),
(3, 'customer@gmail.com', '$2y$10$769649557696495576964uH5H6G7G8G9G0G1G2G3G4G5G6G7G8', 'Thắng', 'Nguyễn', 'CUSTOMER', 'ACTIVE');

-- 3.3 Employees
INSERT INTO employees (user_id, position, department) VALUES
(1, 'General Manager', 'Management'),
(2, 'Receptionist', 'Reception');

-- 3.4 Customers
INSERT INTO customers (user_id, address, city, id_number) VALUES
(3, '123 Vo Nguyen Giap', 'Da Nang', '123456789');

-- 3.5 Amenities
INSERT INTO amenities (name, description, icon) VALUES
('Wifi', 'Wifi tốc độ cao miễn phí', 'wifi'),
('Bể bơi', 'Bể bơi vô cực ngoài trời', 'pool'),
('Bữa sáng', 'Bữa sáng buffet đa dạng', 'breakfast'),
('Gym', 'Phòng tập hiện đại', 'fitness_center'),
('Spa', 'Dịch vụ Spa cao cấp', 'spa'),
('Mini Bar', 'Đồ uống nhẹ trong phòng', 'local_bar'),
('Điều hòa', 'Hệ thống điều hòa trung tâm', 'ac_unit'),
('Tivi', 'Smart TV 4K 55 inch', 'tv');

-- 3.6 Room Types
INSERT INTO room_types (id, name, description, base_price, max_occupancy, photo_urls) VALUES
(1, 'Standard Room', 'Phòng tiêu chuẩn đầy đủ tiện nghi, phù hợp cho 2 người.', 500000, 2, '["/images/img_bb9c76ea50.jpg"]'),
(2, 'Deluxe Room', 'Phòng sang trọng với view thành phố và nội thất cao cấp.', 850000, 2, '["/images/img_76b5d3d850.jpg"]'),
(3, 'Suite Family', 'Phòng gia đình rộng rãi, 2 giường lớn, view biển.', 1500000, 4, '["/images/img_2de9b7b582.jpg"]'),
(4, 'Penthouse Executive', 'Đẳng cấp thượng lưu với hồ bơi riêng và quản gia.', 5000000, 4, '["/images/img_f2813391d9.jpg"]');

-- 3.7 Room Type Amenities mapping
INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES
(1, 1), (1, 7), (1, 8),
(2, 1), (2, 3), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 7), (3, 8),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8);

-- 3.8 Seed 100 Rooms using a procedure
DELIMITER //
CREATE PROCEDURE SeedRooms()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE floor_num INT;
    DECLARE room_num VARCHAR(10);
    DECLARE type_id INT;
    
    WHILE i <= 100 DO
        SET floor_num = (i - 1) DIV 20 + 1; -- 20 rooms per floor
        SET room_num = CONCAT(floor_num, LPAD(i % 20 + 1, 2, '0'));
        
        IF i <= 40 THEN SET type_id = 1; -- 40 Standard
        ELSEIF i <= 70 THEN SET type_id = 2; -- 30 Deluxe
        ELSEIF i <= 90 THEN SET type_id = 3; -- 20 Family
        ELSE SET type_id = 4; -- 10 Penthouse
        END IF;
        
        INSERT INTO rooms (room_number, floor, status, room_type_id)
        VALUES (room_num, floor_num, 'AVAILABLE', type_id);
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;
CALL SeedRooms();
DROP PROCEDURE SeedRooms;

-- 3.9 Discounts
INSERT INTO discounts (code, percentage, valid_from, valid_to) VALUES
('WELCOME10', 10, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
('XTRAVEL20', 20, NOW(), DATE_ADD(NOW(), INTERVAL 6 MONTH));

-- 3.10 Sample Bookings
INSERT INTO bookings (booking_date, checkin_date, checkout_date, total_guests, status, total_amount, customer_id, booking_source)
VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 'CONFIRMED', 1700000, 1, 'WEBSITE');

INSERT INTO booking_items (booking_id, room_id, price, quantity)
VALUES (1, 1, 850000, 2);

INSERT INTO payments (payment_date, payment_method, transaction_id, status, booking_id, amount)
VALUES (NOW(), 'VNPAY', 'TRANS_SAMPLE_001', 'SUCCESS', 1, 1700000);

SET FOREIGN_KEY_CHECKS = 1;
