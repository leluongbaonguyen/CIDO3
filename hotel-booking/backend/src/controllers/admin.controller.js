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

    res.json({
      totalRevenue: revenue[0].total || 0,
      totalBookings: bookings[0].total || 0,
      occupancyRate: rooms[0].total > 0 ? Math.round(((rooms[0].total - rooms[0].available) / rooms[0].total) * 100) : 0,
      totalCustomers: customers[0].total || 0,
      monthlyRevenue: monthlyRevenue.reverse()
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
      ORDER BY b.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // PENDING, CONFIRMED, CANCELLED, COMPLETED
    
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    
    // Nếu hoàn tất, trả phòng về trạng thái AVAILABLE
    if (status === 'COMPLETED') {
        const [items] = await pool.query('SELECT room_id FROM booking_items WHERE booking_id = ?', [bookingId]);
        if (items.length > 0) {
            await pool.query('UPDATE rooms SET status = "AVAILABLE" WHERE id = ?', [items[0].room_id]);
        }
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
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.status,
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

export const listAmenities = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM amenities");
    res.json(rows);
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
    // Trong thực tế sẽ có bảng support_tickets, tạm thời trả về mock data chi tiết
    res.json([
      { id: 1, customerName: 'Lê Bảo Nguyên', email: 'nguyen@gmail.com', subject: 'Lỗi thanh toán VNPay', message: 'Tôi đã thanh toán nhưng hệ thống chưa cập nhật', status: 'OPEN', date: '2026-04-30' },
      { id: 2, customerName: 'Trần Huy', email: 'huy@gmail.com', subject: 'Yêu cầu thêm tiện ích', message: 'Tôi muốn đặt thêm dịch vụ Spa', status: 'CLOSED', date: '2026-04-29' }
    ]);
  } catch (error) {
    next(error);
  }
};
