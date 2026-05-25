-- XTravel Hotel Booking - SQL insert statements for all tables
-- Based on the active database schema (v2)

USE hotel_booking_db;

-- Reset existing data (Temporary disable foreign keys)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE audit_logs;
TRUNCATE TABLE chat_messages;
TRUNCATE TABLE chat_conversations;
TRUNCATE TABLE support_tickets;
TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE booking_items;
TRUNCATE TABLE bookings;
TRUNCATE TABLE maintenance_records;
TRUNCATE TABLE room_images;
TRUNCATE TABLE rooms;
TRUNCATE TABLE seasonal_rates;
TRUNCATE TABLE room_type_amenities;
TRUNCATE TABLE amenities;
TRUNCATE TABLE room_types;
TRUNCATE TABLE employee_roles;
TRUNCATE TABLE employees;
TRUNCATE TABLE roles;
TRUNCATE TABLE customers;
TRUNCATE TABLE users;
TRUNCATE TABLE discounts;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------
-- 1. Table: roles
-- ---------------------------------------------------------
INSERT INTO roles (id, name, permissions) VALUES
(1, 'ADMIN', '{"all": true}'),
(2, 'STAFF', '{"bookings": true, "rooms": true, "chats": true}'),
(3, 'CUSTOMER', '{"profile": true, "my_bookings": true}');

-- ---------------------------------------------------------
-- 2. Table: users
-- ---------------------------------------------------------
-- Password is 'admin123' / '123456' hashed with bcrypt:
-- $2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(1, 'admin@xtravel.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'Lê Bảo Nguyên', '0901234567', 'ADMIN', 'ACTIVE'),
(2, 'staff@xtravel.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'Trần Văn Huy', '0901234568', 'STAFF', 'ACTIVE'),
(3, 'customer@gmail.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'Nguyễn Văn Thắng', '0901234569', 'CUSTOMER', 'ACTIVE'),
(4, 'customer2@gmail.com', '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.', 'Phạm Thị Mai', '0901234570', 'CUSTOMER', 'ACTIVE');

-- ---------------------------------------------------------
-- 3. Table: customers
-- ---------------------------------------------------------
INSERT INTO customers (id, user_id, identity_number, address) VALUES
(1, 3, '123456789', '123 Võ Nguyên Giáp, Đà Nẵng'),
(2, 4, '987654321', '456 Trần Hưng Đạo, TP. Hồ Chí Minh');

-- ---------------------------------------------------------
-- 4. Table: employees
-- ---------------------------------------------------------
INSERT INTO employees (id, user_id, position, salary, hire_date, department) VALUES
(1, 1, 'Tổng Quản Lý', 25000000.00, '2024-01-01', 'Management'),
(2, 2, 'Lễ Tân', 10000000.00, '2024-06-01', 'Reception');

-- ---------------------------------------------------------
-- 5. Table: employee_roles
-- ---------------------------------------------------------
INSERT INTO employee_roles (id, employee_id, role_id) VALUES
(1, 1, 1),
(2, 2, 2);

-- ---------------------------------------------------------
-- 6. Table: amenities
-- ---------------------------------------------------------
INSERT INTO amenities (id, name, icon, description, status) VALUES
(1, 'Free Wifi', 'wifi', 'Wifi tốc độ cao miễn phí', 'ACTIVE'),
(2, 'Bể bơi', 'pool', 'Bể bơi vô cực ngoài trời', 'ACTIVE'),
(3, 'Bữa sáng', 'restaurant', 'Bữa sáng buffet đa dạng', 'ACTIVE'),
(4, 'Gym', 'fitness_center', 'Phòng tập hiện đại', 'ACTIVE'),
(5, 'Spa', 'spa', 'Dịch vụ Spa cao cấp', 'ACTIVE'),
(6, 'Mini Bar', 'local_bar', 'Đồ uống nhẹ trong phòng', 'ACTIVE'),
(7, 'Điều hòa', 'ac_unit', 'Hệ thống điều hòa trung tâm', 'ACTIVE'),
(8, 'Tivi', 'tv', 'Smart TV 4K 55 inch', 'ACTIVE');

-- ---------------------------------------------------------
-- 7. Table: room_types
-- ---------------------------------------------------------
INSERT INTO room_types (id, name, description, base_price, max_occupancy, photo_urls) VALUES
(1, 'Standard Room', 'Phòng tiêu chuẩn đầy đủ tiện nghi, phù hợp cho 2 người.', 500000.00, 2, '["/images/img_bb9c76ea50.jpg"]'),
(2, 'Deluxe Room', 'Phòng sang trọng với view thành phố và nội thất cao cấp.', 850000.00, 2, '["/images/img_76b5d3d850.jpg"]'),
(3, 'Suite Family', 'Phòng gia đình rộng rãi, 2 giường lớn, view biển.', 1500000.00, 4, '["/images/img_2de9b7b582.jpg"]'),
(4, 'Penthouse Executive', 'Đẳng cấp thượng lưu với hồ bơi riêng và quản gia.', 5000000.00, 4, '["/images/img_f2813391d9.jpg"]');

-- ---------------------------------------------------------
-- 8. Table: room_type_amenities
-- ---------------------------------------------------------
INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES
(1, 1), (1, 7), (1, 8),
(2, 1), (2, 3), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 7), (3, 8),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8);

-- ---------------------------------------------------------
-- 9. Table: rooms
-- ---------------------------------------------------------
INSERT INTO rooms (id, room_number, floor, room_type_id, status) VALUES
(1, '101', 1, 1, 'AVAILABLE'),
(2, '102', 1, 1, 'AVAILABLE'),
(3, '201', 2, 2, 'AVAILABLE'),
(4, '202', 2, 2, 'CLEANING'),
(5, '301', 3, 3, 'AVAILABLE'),
(6, '302', 3, 3, 'OCCUPIED'),
(7, '401', 4, 4, 'AVAILABLE'),
(8, '402', 4, 4, 'MAINTENANCE');

-- ---------------------------------------------------------
-- 10. Table: room_images
-- ---------------------------------------------------------
INSERT INTO room_images (id, image_url, room_id) VALUES
(1, '/images/rooms/101_1.jpg', 1),
(2, '/images/rooms/101_2.jpg', 1),
(3, '/images/rooms/201_1.jpg', 3),
(4, '/images/rooms/301_1.jpg', 5);

-- ---------------------------------------------------------
-- 11. Table: discounts
-- ---------------------------------------------------------
INSERT INTO discounts (id, code, description, percentage, valid_from, valid_to) VALUES
(1, 'WELCOME10', 'Giảm 10% cho khách hàng mới đăng ký', 10.00, '2026-01-01 00:00:00.000', '2027-01-01 00:00:00.000'),
(2, 'XTRAVEL20', 'Giảm 20% đợt khuyến mãi mùa hè', 20.00, '2026-05-01 00:00:00.000', '2026-09-01 00:00:00.000');

-- ---------------------------------------------------------
-- 12. Table: seasonal_rates
-- ---------------------------------------------------------
INSERT INTO seasonal_rates (id, start_date, end_date, multiplier, season_name, room_type_id) VALUES
(1, '2026-06-01 00:00:00.000', '2026-08-31 23:59:59.999', 1.20, 'Mùa du lịch hè', 1),
(2, '2026-06-01 00:00:00.000', '2026-08-31 23:59:59.999', 1.25, 'Mùa du lịch hè', 2),
(3, '2026-12-24 00:00:00.000', '2027-01-05 23:59:59.999', 1.50, 'Lễ Tết và Giáng Sinh', 3);

-- ---------------------------------------------------------
-- 13. Table: bookings
-- ---------------------------------------------------------
INSERT INTO bookings (
  id, booking_code, customer_id, room_id, check_in_date, check_out_date, 
  adults, children, total_guests, total_amount, discount_code, status, 
  payment_method, note, expires_at, qr_token, qr_image_url, voucher_pdf_url, 
  voucher_sent, voucher_sent_at, email_status, email_error, subtotal, 
  weekend_surcharge, holiday_surcharge, extra_occupant_surcharge, discount_amount
) VALUES
(
  1, 'BK20260525001', 1, 3, '2026-06-10', '2026-06-12', 
  2, 0, 2, 1700000.00, NULL, 'CONFIRMED', 
  'VNPAY', 'Không hút thuốc, phòng tầng cao', '2026-05-26 18:00:00', 'qr-token-sample-123456', 
  '/uploads/qrcodes/BK20260525001.png', '/uploads/vouchers/BK20260525001.pdf', 
  1, '2026-05-25 18:00:00', 'SENT', NULL, 1700000.00, 
  0.00, 0.00, 0.00, 0.00
),
(
  2, 'BK20260525002', 2, 5, '2026-07-01', '2026-07-05', 
  3, 1, 4, 5400000.00, 'WELCOME10', 'PENDING', 
  'CASH', 'Cần cũi em bé', '2026-05-26 18:00:00', 'qr-token-sample-789012', 
  '/uploads/qrcodes/BK20260525002.png', NULL, 
  0, NULL, 'NOT_SENT', NULL, 6000000.00, 
  0.00, 0.00, 0.00, 600000.00
),
(
  3, 'BK20260520001', 1, 1, '2026-05-20', '2026-05-22', 
  2, 0, 2, 1000000.00, NULL, 'COMPLETED', 
  'VNPAY', NULL, '2026-05-21 00:00:00', 'qr-token-sample-completed', 
  '/uploads/qrcodes/BK20260520001.png', '/uploads/vouchers/BK20260520001.pdf', 
  1, '2026-05-20 10:00:00', 'SENT', NULL, 1000000.00, 
  0.00, 0.00, 0.00, 0.00
);

-- ---------------------------------------------------------
-- 14. Table: booking_items
-- ---------------------------------------------------------
INSERT INTO booking_items (id, booking_id, room_id, price, quantity) VALUES
(1, 1, 3, 850000.00, 2),
(2, 2, 5, 1500000.00, 4),
(3, 3, 1, 500000.00, 2);

-- ---------------------------------------------------------
-- 15. Table: payments
-- ---------------------------------------------------------
INSERT INTO payments (id, booking_id, amount, method, status, transaction_code, paid_at) VALUES
(1, 1, 1700000.00, 'VNPAY', 'SUCCESS', 'VNPAY12345678', '2026-05-25 17:30:00'),
(2, 2, 5400000.00, 'CASH', 'PENDING', NULL, NULL),
(3, 3, 1000000.00, 'VNPAY', 'SUCCESS', 'VNPAY98765432', '2026-05-20 10:15:00');

-- ---------------------------------------------------------
-- 16. Table: reviews
-- ---------------------------------------------------------
INSERT INTO reviews (id, booking_id, customer_id, rating, comment, is_hidden) VALUES
(1, 3, 1, 5, 'Phòng sạch sẽ, phục vụ rất chu đáo. Bữa sáng rất ngon!', 0);

-- ---------------------------------------------------------
-- 17. Table: maintenance_records
-- ---------------------------------------------------------
INSERT INTO maintenance_records (id, description, start_date, end_date, status, cost, notes, room_id) VALUES
(1, 'Sửa điều hòa rò rỉ nước', '2026-05-24 08:00:00.000', '2026-05-25 12:00:00.000', 'Completed', 350000.00, 'Thay gas và vệ sinh lưới lọc', 4),
(2, 'Sơn lại tường phòng và kiểm tra ổ khóa', '2026-05-25 09:00:00.000', '2026-05-27 18:00:00.000', 'In_Progress', 1200000.00, 'Cần thay mới ổ khóa cửa thông minh', 8);

-- ---------------------------------------------------------
-- 18. Table: support_tickets
-- ---------------------------------------------------------
INSERT INTO support_tickets (id, customer_id, subject, message, status, response) VALUES
(1, 1, 'Hỏi về chính sách hủy phòng', 'Tôi muốn hỏi nếu hủy phòng trước 3 ngày thì có được hoàn tiền không?', 'CLOSED', 'Chào quý khách, nếu quý khách hủy trước 3 ngày sẽ được hoàn 100% tiền cọc. Xin cảm ơn!'),
(2, 2, 'Yêu cầu xuất hóa đơn VAT', 'Tôi đã đặt phòng BK20260525002 và muốn xuất hóa đơn VAT cho công ty.', 'OPEN', NULL);

-- ---------------------------------------------------------
-- 19. Table: chat_conversations
-- ---------------------------------------------------------
INSERT INTO chat_conversations (id, conversation_code, customer_id, assigned_staff_id, status, priority, related_booking_id, subject, last_message, last_message_at) VALUES
(1, 'CONV-1001', 1, 2, 'CLOSED', 'LOW', 1, 'Hỗ trợ đặt phòng', 'Cảm ơn bạn đã giải đáp.', '2026-05-25 17:45:00'),
(2, 'CONV-1002', 2, NULL, 'WAITING', 'MEDIUM', 2, 'Yêu cầu phòng Suite', 'Tôi muốn nâng cấp lên hạng Suite', '2026-05-25 17:50:00');

-- ---------------------------------------------------------
-- 20. Table: chat_messages
-- ---------------------------------------------------------
INSERT INTO chat_messages (id, conversation_id, sender_id, sender_role, message_type, message_content, attachment_url, is_read) VALUES
(1, 1, 3, 'CUSTOMER', 'TEXT', 'Xin chào, tôi cần hỗ trợ kiểm tra thông tin đặt phòng', NULL, 1),
(2, 1, 2, 'STAFF', 'TEXT', 'Chào anh Thắng, tôi có thể giúp gì cho anh?', NULL, 1),
(3, 1, 3, 'CUSTOMER', 'TEXT', 'Cảm ơn bạn đã giải đáp.', NULL, 1),
(4, 2, 4, 'CUSTOMER', 'TEXT', 'Tôi muốn nâng cấp lên hạng Suite', NULL, 0);

-- ---------------------------------------------------------
-- 21. Table: audit_logs
-- ---------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, entity, entity_id, old_value, new_value, ip_address) VALUES
(1, 1, 'UPDATE', 'rooms', '4', '{"status": "AVAILABLE"}', '{"status": "CLEANING"}', '127.0.0.1'),
(2, 2, 'CREATE', 'bookings', '1', NULL, '{"booking_code": "BK20260525001", "total_amount": 1700000}', '192.168.1.15');
