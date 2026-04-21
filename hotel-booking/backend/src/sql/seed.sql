USE hotel_booking_db;

INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls)
VALUES
('Standard', 'Phòng tiêu chuẩn, phù hợp 2 khách', 500000, 2, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'),
('Deluxe', 'Phòng cao cấp, có ban công', 900000, 3, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
('Suite', 'Phòng suite rộng rãi, view đẹp', 1500000, 4, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461');

INSERT INTO rooms (room_number, floor, status, notes, room_type_id)
VALUES
('101', 1, 'AVAILABLE', 'Gần sảnh', 1),
('102', 1, 'AVAILABLE', 'Yên tĩnh', 1),
('201', 2, 'AVAILABLE', 'Có ban công', 2),
('202', 2, 'MAINTENANCE', 'Đang bảo trì điều hòa', 2),
('301', 3, 'AVAILABLE', 'View thành phố', 3);

INSERT INTO discounts (code, percentage, valid_from, valid_to)
VALUES
('WELCOME10', 10, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));
