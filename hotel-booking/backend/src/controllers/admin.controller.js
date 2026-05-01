import { pool } from '../config/db.js';

// --- BẢNG ĐIỀU KHIỂN (DASHBOARD) ---
export const getDashboardStats = async (req, res, next) => {
  try {
    const [revenue] = await pool.query("SELECT SUM(total_amount) as total FROM bookings WHERE status IN ('CONFIRMED', 'COMPLETED')");
    const [bookings] = await pool.query("SELECT COUNT(*) as total FROM bookings");
    const [rooms] = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status='AVAILABLE' THEN 1 ELSE 0 END) as available FROM rooms");
    const [customers] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role='CUSTOMER'");
    
    // Thống kê doanh thu theo tháng (6 tháng gần nhất)
    const [monthlyRevenue] = await pool.query(`
      SELECT DATE_FORMAT(booking_date, '%Y-%m') as month, SUM(total_amount) as total
      FROM bookings
      WHERE status IN ('CONFIRMED', 'COMPLETED')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    const totalRevenue = Number(revenue[0].total || 0);
    const totalBookings = Number(bookings[0].total || 0);
    const totalRooms = Number(rooms[0].total || 0);
    const totalRoomsAvailable = Number(rooms[0].available || 0);
    const occupancyRate = rooms[0].total > 0 ? Math.round(((Number(rooms[0].total) - Number(rooms[0].available)) / Number(rooms[0].total)) * 100) : 0;
    const totalCustomers = Number(customers[0].total || 0);

    console.log('Dashboard Stats Query Result:', { totalRevenue, totalBookings, totalRooms, totalCustomers });

    res.json({
      totalRevenue: totalRevenue,
      totalBookings: totalBookings,
      totalRooms: totalRooms,
      totalRoomsAvailable: totalRoomsAvailable,
      occupancyRate: occupancyRate,
      totalCustomers: totalCustomers,
      monthlyRevenue: monthlyRevenue.reverse().map(item => ({ ...item, total: Number(item.total) }))
    });
  } catch (error) {
    next(error);
  }
};

// --- QUẢN LÝ ĐẶT PHÒNG (BOOKINGS) ---
export const listAllBookings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, u.first_name, u.last_name, u.email, u.phone,
             r.room_number, rt.name AS room_type_name
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      JOIN users u ON u.id = c.user_id
      LEFT JOIN booking_items bi ON bi.booking_id = b.id
      LEFT JOIN rooms r ON r.id = bi.room_id
      LEFT JOIN room_types rt ON rt.id = r.room_type_id
      ORDER BY b.create_date DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { customer_id, room_id, checkin_date, checkout_date, total_guests, status, payment_method } = req.body;
        
        const start = new Date(checkin_date);
        const end = new Date(checkout_date);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

        const [room] = await pool.query("SELECT rt.base_price FROM rooms r JOIN room_types rt ON rt.id = r.room_type_id WHERE r.id = ?", [room_id]);
        const total_amount = room[0].base_price * nights;

        const [booking] = await connection.query(
            "INSERT INTO bookings (customer_id, checkin_date, checkout_date, total_amount, status, booking_date, total_guests) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [customer_id, checkin_date, checkout_date, total_amount, status || 'CONFIRMED', new Date(), total_guests]
        );

        await connection.query(
            "INSERT INTO booking_items (booking_id, room_id, price, quantity) VALUES (?, ?, ?, ?)",
            [booking.insertId, room_id, room[0].base_price, 1]
        );

        if (status === 'CONFIRMED' || status === 'COMPLETED') {
            await connection.query("UPDATE rooms SET status = 'OCCUPIED' WHERE id = ?", [room_id]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Booking created successfully', bookingId: booking.insertId });
    } catch (error) {
        await connection.rollback();
        next(error);
    } finally {
        connection.release();
    }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    if (status === 'COMPLETED') {
        const [items] = await pool.query('SELECT room_id FROM booking_items WHERE booking_id = ?', [bookingId]);
        if (items.length > 0) await pool.query('UPDATE rooms SET status = "AVAILABLE" WHERE id = ?', [items[0].room_id]);
    }
    res.json({ message: `Booking status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

// --- QUẢN LÝ PHÒNG (ROOMS) ---
export const listRooms = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, rt.name as room_type_name, rt.base_price, rt.max_occupancy
      FROM rooms r 
      JOIN room_types rt ON rt.id = r.room_type_id
      ORDER BY r.floor ASC, r.room_number ASC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { room_number, floor, status, notes, room_type_id } = req.body;
    await pool.query(
      `INSERT INTO rooms (room_number, floor, status, notes, room_type_id) VALUES (?, ?, ?, ?, ?)`,
      [room_number, floor, status || 'AVAILABLE', notes || null, room_type_id]
    );
    res.status(201).json({ message: 'Room created successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { room_number, floor, status, notes, room_type_id } = req.body;
    await pool.query(
      `UPDATE rooms SET room_number = ?, floor = ?, status = ?, notes = ?, room_type_id = ? WHERE id = ?`,
      [room_number, floor, status, notes || null, room_type_id, roomId]
    );
    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    // Kiểm tra xem phòng có đang được đặt không trước khi xóa
    const [active] = await pool.query("SELECT id FROM booking_items WHERE room_id = ?", [roomId]);
    if (active.length > 0) {
        return res.status(400).json({ message: 'Cannot delete room with existing bookings' });
    }
    await pool.query('DELETE FROM rooms WHERE id = ?', [roomId]);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

// --- QUẢN LÝ NGƯỜI DÙNG (USERS & RBAC) ---
export const listCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.status, u.create_date,
             c.address, c.city, c.id_number
      FROM users u
      JOIN customers c ON c.user_id = u.id
      WHERE u.role = 'CUSTOMER'
      ORDER BY u.create_date DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const listEmployees = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.status, u.phone,
             e.position, e.department, e.hire_date
      FROM users u
      JOIN employees e ON e.user_id = u.id
      WHERE u.role IN ('ADMIN', 'EMPLOYEE')
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
    try {
        const { email, first_name, last_name, phone, role, password, position, department } = req.body;
        const [user] = await pool.query(
            "INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
            [email, password, first_name, last_name, phone, role]
        );
        await pool.query(
            "INSERT INTO employees (user_id, position, department) VALUES (?, ?, ?)",
            [user.insertId, position, department]
        );
        res.status(201).json({ message: 'Employee created' });
    } catch (error) {
        next(error);
    }
};

export const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone, role, position, department, status } = req.body;
        await pool.query(
            "UPDATE users SET first_name = ?, last_name = ?, phone = ?, role = ?, status = ? WHERE id = ?",
            [first_name, last_name, phone, role, status, id]
        );
        await pool.query(
            "UPDATE employees SET position = ?, department = ? WHERE user_id = ?",
            [position, department, id]
        );
        res.json({ message: 'Employee updated' });
    } catch (error) {
        next(error);
    }
};

export const listRoles = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM roles");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
        res.json({ message: 'User status updated' });
    } catch (error) {
        next(error);
    }
};

export const listRoomTypes = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM room_types");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createRoomType = async (req, res, next) => {
    try {
        const { name, description, base_price, max_occupancy, photo_urls } = req.body;
        await pool.query(
            "INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls) VALUES (?, ?, ?, ?, ?)",
            [name, description, base_price, max_occupancy, photo_urls]
        );
        res.status(201).json({ message: 'Room type created' });
    } catch (error) {
        next(error);
    }
};

export const updateRoomType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, base_price, max_occupancy, photo_urls } = req.body;
        await pool.query(
            "UPDATE room_types SET name = ?, description = ?, base_price = ?, max_occupancy = ?, photo_urls = ? WHERE id = ?",
            [name, description, base_price, max_occupancy, photo_urls, id]
        );
        res.json({ message: 'Room type updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteRoomType = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM room_types WHERE id = ?", [id]);
        res.json({ message: 'Room type deleted' });
    } catch (error) {
        next(error);
    }
};

export const listAmenities = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM amenities");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createAmenity = async (req, res, next) => {
    try {
        const { name, description, icon } = req.body;
        await pool.query("INSERT INTO amenities (name, description, icon) VALUES (?, ?, ?)", [name, description, icon]);
        res.status(201).json({ message: 'Amenity created' });
    } catch (error) {
        next(error);
    }
};

export const updateAmenity = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, icon } = req.body;
        await pool.query("UPDATE amenities SET name = ?, description = ?, icon = ? WHERE id = ?", [name, description, icon, id]);
        res.json({ message: 'Amenity updated' });
    } catch (error) {
        next(error);
    }
};

export const deleteAmenity = async (req, res, next) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM amenities WHERE id = ?", [id]);
        res.json({ message: 'Amenity deleted' });
    } catch (error) {
        next(error);
    }
};

// --- QUẢN LÝ ĐÁNH GIÁ (REVIEWS) ---
export const listReviews = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.first_name, u.last_name, rt.name as room_type_name
      FROM reviews r
      JOIN customers c ON c.id = r.customer_id
      JOIN users u ON u.id = c.user_id
      JOIN bookings b ON b.id = r.booking_id
      JOIN booking_items bi ON bi.booking_id = b.id
      JOIN rooms rm ON rm.id = bi.room_id
      JOIN room_types rt ON rt.id = rm.room_type_id
      ORDER BY r.create_date DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
        res.json({ message: 'Review deleted' });
    } catch (error) {
        next(error);
    }
};

// --- HỖ TRỢ KHÁCH HÀNG (SUPPORT) ---
export const listSupport = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM support_tickets ORDER BY create_date DESC");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const seedData = async (req, res, next) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log('🚀 Bắt đầu nạp dữ liệu chuẩn XTRAVEL...');

        // 1. Dọn dẹp dữ liệu cũ
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = ['audit_logs', 'reviews', 'payments', 'booking_items', 'bookings', 'rooms', 'room_type_amenities', 'amenities', 'room_types', 'employees', 'customers', 'users'];
        for (const table of tables) await connection.query(`TRUNCATE TABLE ${table}`);
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Tạo tài khoản mẫu (Password: password123)
        const hashedPw = hashPassword('password123');
        
        // Admin
        const [adminRes] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)", ['admin@bookingx.com', hashedPw, 'Bảo Nguyên', 'Lê', 'ADMIN', 'ACTIVE']);
        await connection.query("INSERT INTO employees (user_id, position, department) VALUES (?, ?, ?)", [adminRes.insertId, 'Tổng quản lý', 'Hội đồng quản trị']);

        // Staff
        const [staffRes] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)", ['staff1@bookingx.com', hashedPw, 'Thị Tuyết', 'Nguyễn', 'EMPLOYEE', 'ACTIVE']);
        await connection.query("INSERT INTO employees (user_id, position, department) VALUES (?, ?, ?)", [staffRes.insertId, 'Lễ tân trưởng', 'Tiền sảnh']);

        // Customer
        const [cusRes] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)", ['customer1@bookingx.com', hashedPw, 'Thành Công', 'Trần', 'CUSTOMER', 'ACTIVE', '0905123456']);
        await connection.query("INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, ?, ?)", [cusRes.insertId, 'Hải Châu, Đà Nẵng', 'Đà Nẵng', 'Vietnam', 'ID999999']);

        // 3. Tạo Tiện nghi (Amenities)
        const amenityList = [
            ['Wifi miễn phí', 'fa-wifi'], ['Bể bơi vô cực', 'fa-swimming-pool'], ['Bữa sáng buffet', 'fa-utensils'],
            ['Phòng Gym', 'fa-dumbbell'], ['Dịch vụ Spa', 'fa-spa'], ['Mini Bar', 'fa-cocktail'],
            ['Điều hòa', 'fa-snowflake'], ['Tivi 4K', 'fa-tv'], ['Bồn tắm', 'fa-bath']
        ];
        const amenityIds = [];
        for (const [name, icon] of amenityList) {
            const [res] = await connection.query("INSERT INTO amenities (name, icon) VALUES (?, ?)", [name, icon]);
            amenityIds.push(res.insertId);
        }

        // 4. Tạo Loại phòng (Room Types)
        const types = [
            { 
                name: 'Standard Heritage', 
                price: 800000, 
                max: 2, 
                desc: 'Phòng tiêu chuẩn với thiết kế cổ điển, đầy đủ tiện nghi cho khách du lịch cá nhân.',
                imgs: ['/images/img_078b9e82eb.jpg', '/images/img_078b9e82eb.jpg']
            },
            { 
                name: 'Deluxe Ocean View', 
                price: 1800000, 
                max: 2, 
                desc: 'Tầm nhìn panorama hướng biển, không gian sang trọng và lãng mạn.',
                imgs: ['/images/img_76b5d3d850.jpg', '/images/img_2de9b7b582.jpg']
            },
            { 
                name: 'Executive Family Suite', 
                price: 3500000, 
                max: 4, 
                desc: 'Căn hộ thu nhỏ với 2 phòng ngủ, lý tưởng cho gia đình nghỉ dưỡng.',
                imgs: ['/images/img_bb9c76ea50.jpg', '/images/img_f2813391d9.jpg']
            },
            { 
                name: 'Penthouse Presidential', 
                price: 12000000, 
                max: 6, 
                desc: 'Đỉnh cao của sự xa hoa tại tầng thượng với hồ bơi riêng và quản gia 24/7.',
                imgs: ['/images/img_edcdf83a2f.jpg', '/images/img_8ef95747bf.jpg']
            }
        ];

        for (let i = 0; i < types.length; i++) {
            const t = types[i];
            const [rtRes] = await connection.query(
                "INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls) VALUES (?, ?, ?, ?, ?)", 
                [t.name, t.desc, t.price, t.max, t.imgs.join(',')]
            );
            
            // Gán tiện nghi ngẫu nhiên
            for (let j = 0; j < 5; j++) {
                const aId = amenityIds[Math.floor(Math.random() * amenityIds.length)];
                await connection.query("INSERT IGNORE INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)", [rtRes.insertId, aId]);
            }

            // 5. Tạo 100 Phòng (mỗi loại 25 phòng)
            for (let r = 1; r <= 25; r++) {
                const floor = i + 1;
                const roomNum = `${floor}${String(r).padStart(2, '0')}`;
                await connection.query("INSERT INTO rooms (room_number, floor, status, room_type_id) VALUES (?, ?, ?, ?)", [roomNum, floor, 'AVAILABLE', rtRes.insertId]);
            }
        }

        // 6. Tạo 20 Khách hàng mẫu
        const customersData = [
            ['Minh', 'Hoàng', 'hoangminh@gmail.com', '0905123456', 'Hải Châu, Đà Nẵng'],
            ['Thanh', 'Hương', 'huongthanh@gmail.com', '0914223344', 'Sơn Trà, Đà Nẵng'],
            ['Tuấn', 'Anh', 'anh_tuan@yahoo.com', '0988556677', 'Hoàn Kiếm, Hà Nội'],
            ['Ngọc', 'Lan', 'lanngoc@gmail.com', '0935112233', 'Quận 1, TP.HCM'],
            ['Quốc', 'Bảo', 'baoquoc@gmail.com', '0901223344', 'Thanh Khê, Đà Nẵng'],
            ['Thị', 'Mai', 'mai_thi@gmail.com', '0912334455', 'Hòa Vang, Đà Nẵng'],
            ['Duy', 'Mạnh', 'manhduy@gmail.com', '0987654321', 'Ba Đình, Hà Nội'],
            ['Khánh', 'Linh', 'linhkhanh@gmail.com', '0905998877', 'Ngũ Hành Sơn, Đà Nẵng'],
            ['Minh', 'Trí', 'triminh@gmail.com', '0932112233', 'Quận 3, TP.HCM'],
            ['Phương', 'Thảo', 'thaophuong@gmail.com', '0911223344', 'Cẩm Lệ, Đà Nẵng']
        ];
        const customerIds = [cusRes.insertId];
        for (const [fname, lname, email, phone, addr] of customersData) {
            const [u] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)", [email, hashedPw, fname, lname, 'CUSTOMER', 'ACTIVE', phone]);
            const [c] = await connection.query("INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, ?, ?)", [u.insertId, addr, 'Đà Nẵng', 'Vietnam', `ID-${Date.now()}-${Math.random()}`]);
            customerIds.push(c.insertId);
        }

        // 7. Tạo 60 Đơn đặt phòng (Bookings) mẫu trong 6 tháng qua
        const statuses = ['COMPLETED', 'CONFIRMED', 'PENDING', 'CANCELLED'];
        const roomsRes = await connection.query("SELECT id, room_type_id FROM rooms");
        const allRooms = roomsRes[0];

        for (let i = 0; i < 60; i++) {
            const cId = customerIds[Math.floor(Math.random() * customerIds.length)];
            const room = allRooms[Math.floor(Math.random() * allRooms.length)];
            const rt = types.find(t => t.name === (i % 4 === 0 ? 'Standard Heritage' : (i % 4 === 1 ? 'Deluxe Ocean View' : (i % 4 === 2 ? 'Executive Family Suite' : 'Penthouse Presidential'))));
            
            // Random ngày trong khoảng 180 ngày qua đến 30 ngày tới
            const dateOffset = Math.floor(Math.random() * 210) - 180;
            const checkin = new Date();
            checkin.setDate(checkin.getDate() + dateOffset);
            const checkout = new Date(checkin);
            checkout.setDate(checkout.getDate() + Math.floor(Math.random() * 5) + 1);

            const status = dateOffset < 0 ? 'COMPLETED' : statuses[Math.floor(Math.random() * 3)];
            const total = (rt?.price || 1000000) * Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
            const guests = Math.floor(Math.random() * (rt?.max || 2)) + 1;

            const [bRes] = await connection.query(
                "INSERT INTO bookings (customer_id, checkin_date, checkout_date, total_amount, status, create_date, booking_date, total_guests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [cId, checkin, checkout, total, status, checkin, checkin, guests]
            );

            await connection.query("INSERT INTO booking_items (booking_id, room_id, price, quantity) VALUES (?, ?, ?, ?)", [bRes.insertId, room.id, rt?.price || 1000000, 1]);

            if (status === 'COMPLETED') {
                await connection.query("INSERT INTO payments (booking_id, amount, payment_method, status, payment_date, transaction_id) VALUES (?, ?, ?, ?, ?, ?)", 
                    [bRes.insertId, total, 'VNPAY', 'SUCCESS', checkin, `TXN-${Date.now()}-${i}`]);
                
                // Thêm đánh giá ngẫu nhiên
                if (Math.random() > 0.5) {
                    const comments = [
                        'Dịch vụ tuyệt vời, phòng sạch sẽ và view rất đẹp!',
                        'Nhân viên thân thiện, đồ ăn sáng ngon.',
                        'Kỳ nghỉ đáng nhớ, tôi sẽ quay lại.',
                        'Phòng hơi ồn một chút nhưng bù lại vị trí rất tốt.',
                        'Đẳng cấp 5 sao thực sự, penthouse quá xịn!'
                    ];
                    await connection.query(
                        "INSERT INTO reviews (booking_id, customer_id, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)",
                        [bRes.insertId, cId, Math.floor(Math.random() * 2) + 4, comments[Math.floor(Math.random() * comments.length)], checkin]
                    );
                }
            }
        }

        await connection.commit();
        res.json({ 
            message: '🚀 Hệ thống BOOKING X đã được nạp dữ liệu thành công!',
            accounts: {
                admin: 'admin@bookingx.com / password123',
                staff: 'staff1@bookingx.com / password123',
                customer: 'customer1@bookingx.com / password123'
            },
            details: 'Đã tạo 100 phòng, 20 khách hàng và 60 đơn đặt phòng mẫu (6 tháng qua).'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Seed error:', error);
        res.status(500).json({ message: 'Lỗi nạp dữ liệu: ' + error.message });
    } finally {
        connection.release();
    }
};
