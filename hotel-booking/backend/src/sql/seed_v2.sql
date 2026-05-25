USE hotel_booking_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE payments;
TRUNCATE TABLE bookings;
TRUNCATE TABLE rooms;
TRUNCATE TABLE room_type_amenities;
TRUNCATE TABLE amenities;
TRUNCATE TABLE room_types;
TRUNCATE TABLE employees;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Users & Profiles
-- Passwords are '123456' hashed with bcrypt (example hash)
-- $2b$10$w09ZlM6.lE6V6fE.F6F6.eS8m6m6m6m6m6m6m6m6m6m6m6m6m6m6m
-- (Note: In reality, we should use a proper hash, but for seeding we can use these placeholders)
INSERT INTO users (email, password_hash, full_name, phone, role, status) VALUES
('admin@xtravel.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'Admin XTravel', '0901234567', 'ADMIN', 'ACTIVE'),
('staff@xtravel.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'Staff Nguyen', '0901234568', 'STAFF', 'ACTIVE'),
('customer@gmail.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'John Doe', '0901234569', 'CUSTOMER', 'ACTIVE');

INSERT INTO customers (user_id, identity_number, address) VALUES
(3, '123456789012', '123 Street, HCM City');

INSERT INTO employees (user_id, position, salary, hire_date) VALUES
(2, 'Receptionist', 10000000, '2024-01-01');

-- 2. Room Types
INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls) VALUES
('Standard Room', 'A cozy room with basic amenities.', 500000, 2, '["https://images.unsplash.com/photo-1598928506311-c55ded91a20c"]'),
('Deluxe Room', 'Spacious room with a great view and premium furniture.', 1200000, 3, '["https://images.unsplash.com/photo-1566665797739-1674de7a421a"]'),
('Suite', 'Luxury suite with living area and king-size bed.', 2500000, 4, '["https://images.unsplash.com/photo-1590490360182-c33d57733427"]');

-- 3. Amenities
INSERT INTO amenities (name, icon, description) VALUES
('Free WiFi', 'wifi', 'High-speed wireless internet'),
('Air Conditioning', 'ac_unit', 'Central air conditioning'),
('Mini Bar', 'local_bar', 'Small fridge with drinks and snacks'),
('TV', 'tv', 'Flat screen TV with cable channels'),
('Breakfast Included', 'restaurant', 'Complimentary morning buffet');

-- 4. Room Type Amenities
INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5);

-- 5. Rooms
INSERT INTO rooms (room_number, floor, room_type_id, status) VALUES
('101', 1, 1, 'AVAILABLE'),
('102', 1, 1, 'AVAILABLE'),
('201', 2, 2, 'AVAILABLE'),
('202', 2, 2, 'AVAILABLE'),
('301', 3, 3, 'AVAILABLE');

-- 6. Sample Booking (Confirmed)
INSERT INTO bookings (booking_code, customer_id, room_id, check_in_date, check_out_date, adults, children, total_guests, total_amount, status, payment_method) VALUES
('BK20260512001', 1, 3, '2026-05-20', '2026-05-22', 2, 0, 2, 2400000, 'CONFIRMED', 'VNPAY');
