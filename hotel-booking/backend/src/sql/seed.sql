USE hotel_booking_db;

INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls)
VALUES
('Standard', 'Phòng tiêu chuẩn, phù hợp 2 khách', 500000, 2, '/images/img_76b5d3d850.jpg'),
('Deluxe', 'Phòng cao cấp, có ban công', 900000, 3, '/images/img_8e148fc578.jpg'),
('Suite', 'Phòng suite rộng rãi, view đẹp', 1500000, 4, '/images/img_f2813391d9.jpg');

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
