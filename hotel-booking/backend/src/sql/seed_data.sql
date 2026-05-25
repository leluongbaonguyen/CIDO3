USE hotel_booking_db;

-- 1. Xóa dữ liệu cũ
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE reviews;
TRUNCATE TABLE payments;
TRUNCATE TABLE booking_items;
TRUNCATE TABLE bookings;
TRUNCATE TABLE rooms;
TRUNCATE TABLE room_type_amenities;
TRUNCATE TABLE amenities;
TRUNCATE TABLE room_types;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. Thêm Tiện ích (Amenities)
INSERT INTO amenities (name, description) VALUES
('Wifi', 'Wifi tốc độ cao miễn phí'),
('Bể bơi', 'Bể bơi vô cực ngoài trời'),
('Bữa sáng', 'Bữa sáng buffet đa dạng'),
('Gym', 'Phòng tập hiện đại'),
('Spa', 'Dịch vụ Spa cao cấp'),
('Mini Bar', 'Đồ uống nhẹ trong phòng'),
('Điều hòa', 'Hệ thống điều hòa trung tâm'),
('Tivi', 'Smart TV 4K 55 inch');

-- 3. Thêm Loại phòng (Room Types)
INSERT INTO room_types (id, name, description, base_price, max_occupancy, photo_urls) VALUES
(1, 'Standard Room', 'Phòng tiêu chuẩn đầy đủ tiện nghi, phù hợp cho 2 người.', 500000, 2, '/images/img_bb9c76ea50.jpg'),
(2, 'Deluxe Room', 'Phòng sang trọng với view thành phố và nội thất cao cấp.', 850000, 2, '/images/img_76b5d3d850.jpg'),
(3, 'Suite Family', 'Phòng gia đình rộng rãi, 2 giường lớn, view biển.', 1500000, 4, '/images/img_2de9b7b582.jpg'),
(4, 'Penthouse Executive', 'Đẳng cấp thượng lưu với hồ bơi riêng và quản gia.', 5000000, 4, '/images/img_f2813391d9.jpg');

-- 4. Gán tiện ích cho loại phòng
INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES
(1, 1), (1, 7), (1, 8),
(2, 1), (2, 3), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 6), (3, 7), (3, 8),
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8);

-- 5. Tạo 100 Phòng (Rooms) tự động
DELIMITER //
CREATE PROCEDURE SeedRooms()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE floor_num INT;
    DECLARE room_num VARCHAR(10);
    DECLARE type_id INT;
    
    WHILE i <= 100 DO
        SET floor_num = (i - 1) DIV 20 + 1; -- 20 phòng mỗi tầng
        SET room_num = CONCAT(floor_num, LPAD(i % 20 + 1, 2, '0'));
        
        -- Phân bổ loại phòng
        IF i <= 40 THEN SET type_id = 1; -- 40 phòng Standard
        ELSEIF i <= 70 THEN SET type_id = 2; -- 30 phòng Deluxe
        ELSEIF i <= 90 THEN SET type_id = 3; -- 20 phòng Family
        ELSE SET type_id = 4; -- 10 phòng Penthouse
        END IF;
        
        INSERT INTO rooms (room_number, floor, status, room_type_id)
        VALUES (room_num, floor_num, 'AVAILABLE', type_id);
        
        SET i = i + 1;
    END WHILE;
END //
DELIMITER ;
CALL SeedRooms();
DROP PROCEDURE SeedRooms;

-- 6. Thêm một số Booking mẫu để web trông "nhộn nhịp"
INSERT INTO bookings (booking_date, checkin_date, checkout_date, total_guests, status, total_amount, customer_id)
SELECT NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 2, 'CONFIRMED', 1700000, 1
WHERE EXISTS (SELECT 1 FROM customers WHERE id = 1);

INSERT INTO booking_items (booking_id, room_id, price, quantity)
SELECT 1, 1, 850000, 2
WHERE EXISTS (SELECT 1 FROM bookings WHERE id = 1);
