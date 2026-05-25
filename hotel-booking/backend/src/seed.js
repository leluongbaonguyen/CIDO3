import { pool } from './config/db.js';
import bcrypt from 'bcryptjs';

const seed = async () => {
  console.log('🚀 Đang bắt đầu nạp dữ liệu mẫu...');
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Xóa sạch dữ liệu cũ (Theo thứ tự khóa ngoại)
    console.log('--- Đang dọn dẹp database...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE audit_logs');
    await connection.query('TRUNCATE TABLE reviews');
    await connection.query('TRUNCATE TABLE payments');
    await connection.query('TRUNCATE TABLE booking_items');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE rooms');
    await connection.query('TRUNCATE TABLE room_type_amenities');
    await connection.query('TRUNCATE TABLE amenities');
    await connection.query('TRUNCATE TABLE room_types');
    await connection.query('TRUNCATE TABLE employees');
    await connection.query('TRUNCATE TABLE customers');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Nạp Người dùng (Users)
    console.log('--- Đang tạo tài khoản người dùng...');
    const hashedPw = await bcrypt.hash('admin123', 10);
    
    // Admin & Staff
    const [adminRes] = await connection.query(
      "INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)",
      ['admin@xtravel.com', hashedPw, 'Bảo Nguyên', 'Lê', 'ADMIN', 'ACTIVE']
    );
    const [staffRes] = await connection.query(
      "INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)",
      ['staff@xtravel.com', hashedPw, 'Huy', 'Trần', 'EMPLOYEE', 'ACTIVE']
    );
    
    await connection.query("INSERT INTO employees (user_id, position, department) VALUES (?, ?, ?)", [adminRes.insertId, 'Tổng quản lý', 'Điều hành']);
    await connection.query("INSERT INTO employees (user_id, position, department) VALUES (?, ?, ?)", [staffRes.insertId, 'Lễ tân', 'Tiền sảnh']);

    // Customers
    const cities = ['Đà Nẵng', 'Hà Nội', 'Hồ Chí Minh', 'Cần Thơ', 'Hải Phòng'];
    const customerIds = [];
    for (let i = 1; i <= 20; i++) {
        const [u] = await connection.query(
            "INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)",
            [`customer${i}@gmail.com`, hashedPw, `Khách`, `Thứ ${i}`, 'CUSTOMER', 'ACTIVE']
        );
        const [c] = await connection.query(
            "INSERT INTO customers (user_id, address, city, id_number) VALUES (?, ?, ?, ?)",
            [u.insertId, `${i} Đường ABC`, cities[i % 5], `048092000${i.toString().padStart(2, '0')}`]
        );
        customerIds.push(c.insertId);
    }

    // 3. Tiện ích (Amenities)
    console.log('--- Đang tạo tiện ích...');
    const [wifi] = await connection.query("INSERT INTO amenities (name, description) VALUES ('Wifi', 'Tốc độ cao')");
    const [pool] = await connection.query("INSERT INTO amenities (name, description) VALUES ('Bể bơi', 'Vô cực')");
    const [gym] = await connection.query("INSERT INTO amenities (name, description) VALUES ('Gym', 'Phòng tập hiện đại')");
    const [breakfast] = await connection.query("INSERT INTO amenities (name, description) VALUES ('Bữa sáng', 'Buffet quốc tế')");

    // 4. Loại phòng (Room Types)
    console.log('--- Đang tạo loại phòng...');
    const types = [
        { id: 1, name: 'Standard Room', price: 500000, max: 2, img: '/images/img_078b9e82eb.jpg' },
        { id: 2, name: 'Deluxe Room', price: 1200000, max: 2, img: '/images/img_76b5d3d850.jpg' },
        { id: 3, name: 'Family Suite', price: 2500000, max: 4, img: '/images/img_2de9b7b582.jpg' },
        { id: 4, name: 'Penthouse', price: 8000000, max: 6, img: '/images/img_f2813391d9.jpg' }
    ];

    for (const t of types) {
        await connection.query(
            "INSERT INTO room_types (id, name, description, base_price, max_occupancy, photo_urls) VALUES (?, ?, ?, ?, ?, ?)",
            [t.id, t.name, `Phòng nghỉ dưỡng cao cấp hạng ${t.name}`, t.price, t.max, JSON.stringify([t.img])]
        );
        // Link amenities
        await connection.query("INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)", [t.id, wifi.insertId]);
        if (t.id > 1) await connection.query("INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)", [t.id, pool.insertId]);
    }

    // 5. Tạo 100 Phòng (Rooms)
    console.log('--- Đang tạo 100 phòng vật lý...');
    const roomIds = [];
    for (let i = 1; i <= 100; i++) {
        const floor = Math.ceil(i / 20);
        const roomNum = `${floor}${String(i % 20 || 20).padStart(2, '0')}`;
        let typeId = 1;
        if (i > 40) typeId = 2;
        if (i > 70) typeId = 3;
        if (i > 90) typeId = 4;

        const [r] = await connection.query(
            "INSERT INTO rooms (room_number, floor, status, room_type_id) VALUES (?, ?, ?, ?)",
            [roomNum, floor, 'AVAILABLE', typeId]
        );
        roomIds.push(r.insertId);
    }

    // 6. Tạo đơn đặt phòng (Bookings) - 50 đơn ngẫu nhiên
    console.log('--- Đang tạo 50 đơn đặt phòng mẫu...');
    const statuses = ['CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'];
    for (let i = 0; i < 50; i++) {
        const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
        const roomId = roomIds[Math.floor(Math.random() * roomIds.length)];
        const status = statuses[i % 4];
        
        // Tạo ngày trong 3 tháng qua
        const date = new Date();
        date.setMonth(date.getMonth() - Math.floor(Math.random() * 4));
        
        const [b] = await connection.query(
            "INSERT INTO bookings (booking_date, checkin_date, checkout_date, total_guests, status, total_amount, customer_id, booking_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [date, date, new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000), 2, status, 2500000, customerId, 'WEBSITE']
        );
        
        await connection.query("INSERT INTO booking_items (booking_id, room_id, price, quantity) VALUES (?, ?, ?, ?)", [b.insertId, roomId, 1250000, 2]);

        if (status === 'CONFIRMED' || status === 'COMPLETED') {
            await connection.query(
                "INSERT INTO payments (payment_date, payment_method, transaction_id, status, booking_id, amount) VALUES (?, ?, ?, ?, ?, ?)",
                [date, 'VNPAY', `TRANS_${b.insertId}_${Date.now()}`, 'SUCCESS', b.insertId, 2500000]
            );
            
            // Nếu đã xong, thêm đánh giá
            if (status === 'COMPLETED') {
                await connection.query(
                    "INSERT INTO reviews (rating, comment, customer_id, booking_id) VALUES (?, ?, ?, ?)",
                    [5, 'Dịch vụ rất tuyệt vời, tôi sẽ quay lại!', customerId, b.insertId]
                );
            }
        }
    }

    await connection.commit();
    console.log('✅ HOÀN TẤT! Dữ liệu đã được nạp thành công.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ LỖI TRONG QUÁ TRÌNH NẠP DỮ LIỆU:', error);
  } finally {
    connection.release();
    process.exit();
  }
};

seed();
