-- Migration Script v2: XTravel - Hotel Booking System
-- Based on: TÀI LIỆU NGHIỆP VỤ & KỸ THUẬT CHI TIẾT HỆ THỐNG XTRAVEL

USE hotel_booking_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Update users table
ALTER TABLE users 
  ADD COLUMN full_name VARCHAR(255) AFTER id,
  MODIFY COLUMN role ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
  MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- Migrating names
UPDATE users SET full_name = CONCAT(first_name, ' ', last_name) WHERE full_name IS NULL;

ALTER TABLE users 
  DROP COLUMN first_name,
  DROP COLUMN last_name;

-- 2. Update customers table (mostly same, add identity_number if missing or rename id_number)
ALTER TABLE customers 
  CHANGE COLUMN id_number identity_number VARCHAR(255) NOT NULL UNIQUE;

-- 3. Update employees table
ALTER TABLE employees 
  ADD COLUMN salary DECIMAL(15,2) DEFAULT 0 AFTER position;

-- 4. Update room_types
-- Current has photo_urls as VARCHAR(255), document says Array/String JSON
ALTER TABLE room_types 
  MODIFY COLUMN photo_urls TEXT NULL;

-- 5. Update rooms table
-- Status: AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE
ALTER TABLE rooms 
  MODIFY COLUMN status ENUM('AVAILABLE', 'OCCUPIED', 'CLEANING', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE';

-- 6. Update bookings table
ALTER TABLE bookings 
  ADD COLUMN booking_code VARCHAR(255) UNIQUE AFTER id,
  ADD COLUMN room_id INT AFTER customer_id,
  ADD COLUMN adults INT DEFAULT 1 AFTER room_id,
  ADD COLUMN children INT DEFAULT 0 AFTER adults,
  ADD COLUMN payment_method ENUM('CASH', 'VNPAY') DEFAULT 'CASH' AFTER total_amount,
  ADD COLUMN note TEXT AFTER payment_method,
  ADD COLUMN expires_at DATETIME(3) NULL AFTER note,
  CHANGE COLUMN checkin_date check_in_date DATETIME(3) NOT NULL,
  CHANGE COLUMN checkout_date check_out_date DATETIME(3) NOT NULL,
  MODIFY COLUMN status ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING';

-- Migrate room_id from booking_items if any (assuming 1 room per booking for simplicity as per new spec)
UPDATE bookings b 
JOIN booking_items bi ON b.id = bi.booking_id 
SET b.room_id = bi.room_id;

ALTER TABLE bookings 
  ADD CONSTRAINT fk_booking_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;

-- 7. Update payments table
ALTER TABLE payments 
  ADD COLUMN transaction_code VARCHAR(255) AFTER transaction_id,
  CHANGE COLUMN payment_method method ENUM('CASH', 'VNPAY') NOT NULL,
  MODIFY COLUMN status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
  CHANGE COLUMN payment_date paid_at DATETIME(3);

-- 8. Update reviews table
-- Document says rating 1 to 5, current has it.

-- 9. Update audit_logs table
ALTER TABLE audit_logs 
  ADD COLUMN entity_id_str VARCHAR(255) AFTER entity_id,
  ADD COLUMN old_value JSON NULL AFTER entity_id_str,
  ADD COLUMN new_value JSON NULL AFTER old_value,
  ADD COLUMN ip_address VARCHAR(255) AFTER new_value;

SET FOREIGN_KEY_CHECKS = 1;
