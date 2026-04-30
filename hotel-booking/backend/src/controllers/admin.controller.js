import { pool } from '../config/db.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const [revenue] = await pool.query("SELECT SUM(total_amount) as total FROM bookings WHERE status = 'CONFIRMED' OR status = 'COMPLETED'");
    const [bookings] = await pool.query("SELECT COUNT(*) as total FROM bookings");
    const [rooms] = await pool.query("SELECT COUNT(*) as total, SUM(CASE WHEN status='AVAILABLE' THEN 1 ELSE 0 END) as available FROM rooms");
    
    res.json({
      totalRevenue: revenue[0].total || 0,
      totalBookings: bookings[0].total || 0,
      occupancyRate: Math.round(((rooms[0].total - rooms[0].available) / rooms[0].total) * 100) || 0,
      recentBookings: [] // Can join for more details if needed
    });
  } catch (error) {
    next(error);
  }
};

export const listAllBookings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.booking_date, b.checkin_date, b.checkout_date, b.status, b.total_amount,
              u.first_name, u.last_name, u.email,
              r.room_number, rt.name AS room_type_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN users u ON u.id = c.user_id
       LEFT JOIN booking_items bi ON bi.booking_id = b.id
       LEFT JOIN rooms r ON r.id = bi.room_id
       LEFT JOIN room_types rt ON rt.id = r.room_type_id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    res.json({ message: 'Booking status updated' });
  } catch (error) {
    next(error);
  }
};

export const listRooms = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, rt.name as room_type_name, rt.base_price 
      FROM rooms r 
      JOIN room_types rt ON rt.id = r.room_type_id
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
    res.status(201).json({ message: 'Room created' });
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
    res.json({ message: 'Room updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    await pool.query('DELETE FROM rooms WHERE id = ?', [roomId]);
    res.json({ message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, CONCAT(u.first_name, ' ', u.last_name) as name, u.email, u.phone, u.status, c.city as location
      FROM users u
      JOIN customers c ON c.user_id = u.id
      WHERE u.role = 'CUSTOMER'
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const listEmployees = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, CONCAT(first_name, ' ', last_name) as name, email, role, status, created_at as joinDate
      FROM users
      WHERE role IN ('ADMIN', 'STAFF')
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const listRoles = async (req, res, next) => {
  try {
    // Mocking roles as they are usually defined in logic, but could be a table
    res.json([
      { id: 1, name: 'ADMIN', description: 'Toàn quyền hệ thống', permissions: ['ALL'] },
      { id: 2, name: 'STAFF', description: 'Quản lý vận hành', permissions: ['ROOMS', 'BOOKINGS'] }
    ]);
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

export const listReviews = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.*, u.first_name, u.last_name 
      FROM reviews r
      JOIN users u ON u.id = r.user_id
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const listSupport = async (req, res, next) => {
  try {
    // Support usually is a messaging or ticket table
    res.json([
      { id: 1, customer: 'Lê Nguyên', subject: 'Lỗi thanh toán', status: 'OPEN', date: '2026-04-30' }
    ]);
  } catch (error) {
    next(error);
  }
};
