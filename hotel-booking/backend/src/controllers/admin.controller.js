import { pool } from '../config/db.js';
import { generateQRCodeImage, generateVoucherPDF, sendVoucherEmail } from '../utils/voucher.js';

// --- DASHBOARD ---
export const getDashboardStats = async (req, res, next) => {
  try {
    const [revenue] = await pool.query("SELECT SUM(total_amount) as total FROM bookings WHERE status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN')");
    const [bookings] = await pool.query("SELECT COUNT(*) as total FROM bookings");
    const [rooms] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status='AVAILABLE' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status='OCCUPIED' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status='CLEANING' THEN 1 ELSE 0 END) as cleaning,
        SUM(CASE WHEN status='MAINTENANCE' THEN 1 ELSE 0 END) as maintenance
      FROM rooms
    `);
    const [customers] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role='CUSTOMER'");
    
    const [monthlyRevenue] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total_amount) as total
      FROM bookings
      WHERE status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    // 1. Today's stats using robust timezone-immune local date string
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const [todayRevenue] = await pool.query(
      "SELECT SUM(total_amount) as total FROM bookings WHERE status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN') AND DATE(created_at) = ?",
      [todayStr]
    );
    const [todayBookings] = await pool.query(
      "SELECT COUNT(*) as total FROM bookings WHERE DATE(created_at) = ?",
      [todayStr]
    );
    const [todayCustomers] = await pool.query(
      "SELECT COUNT(*) as total FROM users WHERE role='CUSTOMER' AND DATE(created_at) = ?",
      [todayStr]
    );

    // 2. Daily revenue for the last 7 active days ending AT today (filters out future seed data)
    const [dailyRevenue] = await pool.query(`
      SELECT DATE(created_at) as day_date, DATE_FORMAT(created_at, '%d/%m') as day, SUM(total_amount) as total
      FROM bookings
      WHERE status IN ('CONFIRMED', 'COMPLETED', 'CHECKED_IN')
        AND DATE(created_at) <= ?
      GROUP BY day_date, day
      ORDER BY day_date DESC
      LIMIT 7
    `, [todayStr]);

    const totalRoomsCount = Number(rooms[0].total || 0);
    const occupiedCount = Number(rooms[0].occupied || 0);
    const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 0;

    res.json({
      totalRevenue: Number(revenue[0].total || 0),
      totalBookings: Number(bookings[0].total || 0),
      totalRooms: totalRoomsCount,
      occupancyRate,
      roomStats: {
        available: Number(rooms[0].available || 0),
        occupied: occupiedCount,
        cleaning: Number(rooms[0].cleaning || 0),
        maintenance: Number(rooms[0].maintenance || 0)
      },
      totalCustomers: Number(customers[0].total || 0),
      monthlyRevenue: monthlyRevenue.reverse().map(item => ({ ...item, total: Number(item.total) })),
      
      // Today & Daily data additions
      todayRevenue: Number(todayRevenue[0].total || 0),
      todayBookings: Number(todayBookings[0].total || 0),
      todayCustomers: Number(todayCustomers[0].total || 0),
      dailyRevenue: dailyRevenue.reverse().map(item => ({ ...item, total: Number(item.total) }))
    });
  } catch (error) {
    next(error);
  }
};

// --- ROOMS ---
export const listRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;

    let sql = `
      SELECT r.*, rt.name as room_type_name, rt.base_price, rt.max_occupancy
      FROM rooms r 
      JOIN room_types rt ON rt.id = r.room_type_id
      ORDER BY r.floor ASC, r.room_number ASC
    `;
    const [rooms] = await pool.query(sql);

    // Compute displayStatus if dates provided
    const results = await Promise.all(rooms.map(async (room) => {
      let displayStatus = room.status;
      let currentBooking = null;

      if (room.status === 'AVAILABLE') {
        // Check if there is a booking overlapping today or specified dates
        const targetDate = checkIn || new Date().toISOString().split('T')[0];
        const endDate = checkOut || targetDate;

        const [bookings] = await pool.query(`
          SELECT b.id, b.booking_code, b.status, u.full_name as customer_name, b.check_in_date, b.check_out_date
          FROM bookings b
          JOIN customers c ON c.id = b.customer_id
          JOIN users u ON u.id = c.user_id
          WHERE b.room_id = ?
            AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
            AND b.check_in_date <= ?
            AND b.check_out_date > ?
          LIMIT 1
        `, [room.id, endDate, targetDate]);

        if (bookings.length > 0) {
          displayStatus = 'BOOKED';
          currentBooking = bookings[0];
        }
      } else if (room.status === 'OCCUPIED') {
        // Find the booking that is currently checked in
        const [bookings] = await pool.query(`
          SELECT b.id, b.booking_code, b.status, u.full_name as customer_name, b.check_in_date, b.check_out_date
          FROM bookings b
          JOIN customers c ON c.id = b.customer_id
          JOIN users u ON u.id = c.user_id
          WHERE b.room_id = ? AND b.status = 'CHECKED_IN'
          LIMIT 1
        `, [room.id]);
        if (bookings.length > 0) currentBooking = bookings[0];
      }

      return { ...room, displayStatus, currentBooking };
    }));

    res.json(results);
  } catch (error) {
    next(error);
  }
};

export const updateRoomStatus = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE rooms SET status = ? WHERE id = ?', [status, roomId]);
    res.json({ message: 'Room status updated' });
  } catch (error) {
    next(error);
  }
};

// --- BOOKINGS ---
export const getBookingDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [bookings] = await pool.query(`
      SELECT b.*, u.first_name, u.last_name, u.email, u.phone,
             r.room_number, rt.name as room_type_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      WHERE b.id = ?
    `, [id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy booking' });
    }
    
    res.json(bookings[0]);
  } catch (error) {
    next(error);
  }
};

export const listAllBookings = async (req, res, next) => {
  try {
    const {
      status,
      bookingCode,
      customerName,
      search,
      dateFrom,
      dateTo,
      createdFrom,
      createdTo
    } = req.query;

    let sql = `
      SELECT b.*, u.full_name, u.email, u.phone,
             r.room_number, rt.name AS room_type_name,
             c.identity_number, c.address
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      JOIN users u ON u.id = c.user_id
      JOIN rooms r ON r.id = b.room_id
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'ALL') {
      sql += ' AND b.status = ?';
      params.push(status);
    }

    const keyword = search || customerName;
    if (keyword) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR b.booking_code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    if (bookingCode) {
      sql += ' AND b.booking_code LIKE ?';
      params.push(`%${bookingCode}%`);
    }

    // Lọc theo khoảng ngày lưu trú: lấy các booking giao với [dateFrom, dateTo].
    if (dateFrom && dateTo) {
      sql += ' AND b.check_in_date <= ? AND b.check_out_date >= ?';
      params.push(dateTo, dateFrom);
    } else if (dateFrom) {
      sql += ' AND b.check_out_date >= ?';
      params.push(dateFrom);
    } else if (dateTo) {
      sql += ' AND b.check_in_date <= ?';
      params.push(dateTo);
    }

    // Tùy chọn lọc ngày/giờ tạo đơn nếu frontend gửi datetime-local.
    if (createdFrom) {
      sql += ' AND b.created_at >= ?';
      params.push(createdFrom.replace('T', ' '));
    }
    if (createdTo) {
      sql += ' AND b.created_at <= ?';
      params.push(createdTo.replace('T', ' '));
    }

    sql += ' ORDER BY b.created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const confirmBooking = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const fail = async (status, message) => {
      await connection.rollback();
      return res.status(status).json({ message });
    };
    const { id } = req.params;

    const [bookings] = await connection.query(
      `SELECT id, room_id, status, check_in_date, check_out_date
       FROM bookings
       WHERE id = ? FOR UPDATE`,
      [id]
    );

    if (bookings.length === 0) {
      return fail(404, 'Booking not found');
    }

    const booking = bookings[0];
    if (booking.status !== 'PENDING') {
      return fail(400, 'Booking cannot be confirmed because it is not PENDING');
    }

    const [conflicts] = await connection.query(
      `SELECT id, booking_code FROM bookings
       WHERE id <> ?
         AND room_id = ?
         AND status IN ('CONFIRMED', 'CHECKED_IN')
         AND check_in_date < ?
         AND check_out_date > ?
       LIMIT 1 FOR UPDATE`,
      [id, booking.room_id, booking.check_out_date, booking.check_in_date]
    );

    if (conflicts.length > 0) {
      return fail(409, `Không thể xác nhận vì trùng lịch với đơn ${conflicts[0].booking_code}`);
    }

    await connection.query("UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?", [id]);
    await connection.commit();
    res.json({ message: 'Booking confirmed' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const checkIn = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    const [bookings] = await connection.query(
      "SELECT id, room_id, status FROM bookings WHERE id = ? FOR UPDATE",
      [id]
    );

    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });
    const booking = bookings[0];

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({ message: 'Booking must be CONFIRMED to check-in' });
    }

    const [activeOccupant] = await connection.query(
      `SELECT id, booking_code FROM bookings 
       WHERE room_id = ? AND status = 'CHECKED_IN' AND id <> ? LIMIT 1`,
      [booking.room_id, id]
    );

    if (activeOccupant.length > 0) {
      return res.status(400).json({ 
        message: `Phòng này đang được sử dụng thực tế bởi khách của đơn ${activeOccupant[0].booking_code}. Vui lòng thực hiện Check-out cho đơn trước đó trước khi tiến hành Check-in!` 
      });
    }

    await connection.query("UPDATE bookings SET status = 'CHECKED_IN' WHERE id = ?", [id]);
    await connection.query("UPDATE rooms SET status = 'OCCUPIED' WHERE id = ?", [booking.room_id]);

    await connection.commit();
    res.json({ message: 'Checked-in successfully' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const qrCheckIn = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { qrToken: bodyQrToken, qrCode: bodyQrCode, staffId: bodyStaffId, scanTime } = req.body;
    const qrInput = bodyQrToken || bodyQrCode;

    if (!qrInput) {
      return res.status(400).json({ success: false, message: 'Mã QR không được trống.' });
    }

    // 1. Phân tích đầu vào QR để lấy token hoặc ID/Code
    let qrToken = qrInput;
    if (typeof qrToken === 'string') {
      // Hỗ trợ dạng: BOOKINGX_CHECKIN_TOKEN=QR_CHECKIN_9X8A7B6C
      const tokenMatch = qrToken.match(/BOOKINGX_CHECKIN_TOKEN=(.+)/i);
      if (tokenMatch) {
        qrToken = tokenMatch[1];
      }
    }

    let bookingId = null;
    let bookingCode = qrToken;

    // Hỗ trợ dạng BX-15, bx-15
    const bxMatch = qrToken.match(/^BX-(\d+)$/i);
    if (bxMatch) {
      bookingId = parseInt(bxMatch[1], 10);
    }

    // Hỗ trợ dạng BOOKINGX-QR-BK12345
    const bookingxMatch = qrToken.match(/^BOOKINGX-QR-(.+)$/i);
    if (bookingxMatch) {
      bookingCode = bookingxMatch[1];
    }

    // 2. Tìm đơn đặt phòng và thông tin liên quan
    const [bookings] = await connection.query(
      `SELECT b.*, u.full_name, u.email, u.phone,
              r.room_number, r.status AS room_status, rt.name AS room_type_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN users u ON u.id = c.user_id
       JOIN rooms r ON r.id = b.room_id
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE b.qr_token = ? OR b.booking_code = ? OR b.id = ? OR b.booking_code = ? FOR UPDATE`,
      [qrToken, qrToken, bookingId, bookingCode]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Mã QR không tồn tại hoặc không hợp lệ.' });
    }

    const booking = bookings[0];

    // Lấy thông tin nhân viên thực hiện quét
    const staffUserId = req.user?.userId;
    let staffName = 'Nhân viên lễ tân';
    if (staffUserId) {
      const [staffRows] = await connection.query('SELECT full_name FROM users WHERE id = ?', [staffUserId]);
      if (staffRows.length > 0) {
        staffName = staffRows[0].full_name;
      }
    }

    const formatDBDate = (d) => {
      if (!d) return '';
      const dateObj = new Date(d);
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${dayStr}`;
    };

    const formatDBDateTime = (dt) => {
      if (!dt) return '';
      const dateObj = new Date(dt);
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayStr = String(dateObj.getDate()).padStart(2, '0');
      const h = String(dateObj.getHours()).padStart(2, '0');
      const min = String(dateObj.getMinutes()).padStart(2, '0');
      const s = String(dateObj.getSeconds()).padStart(2, '0');
      return `${dayStr}/${m}/${y} ${h}:${min}`;
    };

    // 3. Ngoại lệ: Đơn đã check-in trước đó (Trường hợp 4)
    if (booking.status === 'CHECKED_IN') {
      // Tìm lịch sử quét check-in trước đó
      const [auditRows] = await connection.query(
        `SELECT a.created_at, u.full_name 
         FROM audit_logs a
         JOIN users u ON u.id = a.user_id
         WHERE a.entity = 'bookings' AND a.entity_id = ? AND a.action = 'CHECK_IN_QR'
         ORDER BY a.created_at DESC LIMIT 1`,
        [booking.id]
      );
      
      let checkedInTime = booking.updated_at;
      let checkedInStaff = 'Nhân viên lễ tân';
      
      if (auditRows.length > 0) {
        checkedInTime = auditRows[0].created_at;
        checkedInStaff = auditRows[0].full_name;
      }

      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Đơn đặt phòng này đã được check-in trước đó.',
        checkedInTime,
        checkedInStaff,
        booking: {
          id: booking.id,
          bookingCode: booking.booking_code,
          booking_code: booking.booking_code,
          customerName: booking.full_name,
          customer_name: booking.full_name,
          phone: booking.phone,
          roomName: `${booking.room_type_name} ${booking.room_number}`,
          room_type_name: booking.room_type_name,
          room_number: booking.room_number,
          checkInDate: formatDBDate(booking.check_in_date),
          check_in_date: booking.check_in_date,
          checkOutDate: formatDBDate(booking.check_out_date),
          check_out_date: booking.check_out_date,
          total_amount: booking.total_amount,
          payment_method: booking.payment_method,
          status: booking.status
        }
      });
    }

    // 4. Ngoại lệ: Đơn đã bị hủy (Trường hợp 2)
    if (booking.status === 'CANCELLED') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Đơn đặt phòng đã bị hủy, không thể check-in.' });
    }

    // 5. Ngoại lệ: Đơn chưa thanh toán (Trường hợp 3)
    // Nếu là PENDING và phương thức thanh toán không phải là tiền mặt (CASH), cần kiểm tra thanh toán thành công.
    if (booking.status === 'PENDING' && booking.payment_method !== 'CASH') {
      const [payments] = await connection.query(
        "SELECT status FROM payments WHERE booking_id = ? AND status = 'SUCCESS'",
        [booking.id]
      );
      if (payments.length === 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Đơn đặt phòng chưa hoàn tất thanh toán. Vui lòng xác nhận thanh toán trước khi check-in.'
        });
      }
    }

    // 6. Ngoại lệ: Không đúng ngày nhận phòng (Trường hợp 5)
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    const checkInStr = formatDBDate(booking.check_in_date);
    const checkOutStr = formatDBDate(booking.check_out_date);

    if (todayStr < checkInStr) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Chưa đến ngày nhận phòng. Không thể check-in.' });
    }
    if (todayStr >= checkOutStr) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Đơn đặt phòng đã quá hạn check-in.' });
    }

    // 7. Ngoại lệ: Kiểm tra phòng còn khả dụng (Trường hợp 6)
    if (booking.room_status === 'MAINTENANCE') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Phòng hiện đang bảo trì. Vui lòng đổi phòng cho khách.' });
    }

    // Kiểm tra xem phòng có đang bị trùng lịch hoặc có người khác ở hay không
    const [activeOccupant] = await connection.query(
      `SELECT id, booking_code FROM bookings 
       WHERE room_id = ? AND status = 'CHECKED_IN' AND id <> ? LIMIT 1`,
      [booking.room_id, booking.id]
    );

    if (activeOccupant.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'Phòng hiện không khả dụng, vui lòng kiểm tra lại.' 
      });
    }

    // 8. Cập nhật check-in thành công
    const nowStr = scanTime || new Date().toISOString().slice(0, 19).replace('T', ' ');

    await connection.query("UPDATE bookings SET status = 'CHECKED_IN' WHERE id = ?", [booking.id]);
    await connection.query("UPDATE rooms SET status = 'OCCUPIED' WHERE id = ?", [booking.room_id]);

    // 9. Lưu lịch sử audit
    const logDetails = {
      booking_code: booking.booking_code,
      customer_name: booking.full_name,
      room_number: booking.room_number,
      scan_time: nowStr,
      operator: staffName,
      result: 'Success'
    };

    const auditAction = 'CHECK_IN_QR';
    const auditEntity = 'bookings';
    const oldValJson = JSON.stringify({ status: booking.status });
    const newValJson = JSON.stringify({ status: 'CHECKED_IN', details: logDetails });

    await connection.query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, old_value, new_value, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [staffUserId || null, auditAction, auditEntity, String(booking.id), oldValJson, newValJson, req.ip || '127.0.0.1']
    );

    await connection.commit();

    // 10. Trả về thông tin đầy đủ cho client
    res.json({
      success: true,
      message: 'Check-in thành công',
      booking: {
        id: booking.id,
        bookingCode: booking.booking_code,
        booking_code: booking.booking_code,
        customerName: booking.full_name,
        customer_name: booking.full_name,
        phone: booking.phone,
        roomName: `${booking.room_type_name} ${booking.room_number}`,
        room_type_name: booking.room_type_name,
        room_number: booking.room_number,
        checkInDate: formatDBDate(booking.check_in_date),
        check_in_date: booking.check_in_date,
        checkOutDate: formatDBDate(booking.check_out_date),
        check_out_date: booking.check_out_date,
        total_amount: booking.total_amount,
        payment_method: booking.payment_method,
        status: 'CHECKED_IN',
        scan_time: nowStr,
        staff_name: staffName
      }
    });

  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const checkOut = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { nextStatus = 'CLEANING' } = req.body;

    const [bookings] = await connection.query(
      "SELECT id, room_id, status FROM bookings WHERE id = ? FOR UPDATE",
      [id]
    );

    if (bookings.length === 0) return res.status(404).json({ message: 'Booking not found' });
    const booking = bookings[0];

    if (booking.status !== 'CHECKED_IN') {
      return res.status(400).json({ message: 'Booking must be CHECKED_IN to check-out' });
    }

    await connection.query("UPDATE bookings SET status = 'COMPLETED' WHERE id = ?", [id]);
    await connection.query("UPDATE rooms SET status = ? WHERE id = ?", [nextStatus, booking.room_id]);

    await connection.commit();
    res.json({ message: 'Checked-out successfully' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

// --- OTHER CRUDs (Simplified for brevity, but matching schema) ---
export const createRoom = async (req, res, next) => {
  try {
    const { room_number, floor, room_type_id, status } = req.body;
    await pool.query(
      "INSERT INTO rooms (room_number, floor, room_type_id, status) VALUES (?, ?, ?, ?)",
      [room_number, floor, room_type_id, status || 'AVAILABLE']
    );
    res.status(201).json({ message: 'Room created' });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { room_number, floor, room_type_id, status } = req.body;
    await pool.query(
      "UPDATE rooms SET room_number = ?, floor = ?, room_type_id = ?, status = ? WHERE id = ?",
      [room_number, floor, room_type_id, status, roomId]
    );
    res.json({ message: 'Room updated' });
  } catch (error) {
    next(error);
  }
};
export const listEmployees = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.full_name, u.email, u.role, u.status, u.phone,
             SUBSTRING_INDEX(u.full_name, ' ', 1) AS first_name,
             TRIM(SUBSTRING(u.full_name, LENGTH(SUBSTRING_INDEX(u.full_name, ' ', 1)) + 1)) AS last_name,
             e.position, e.salary, e.hire_date, e.department
      FROM users u
      JOIN employees e ON e.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { first_name, last_name, email, phone, role, position, department, password, status } = req.body;
    const { hashPassword } = await import('../utils/hash.js');
    const hashed = await hashPassword(password || 'password123');

    await connection.beginTransaction();

    const [userRes] = await connection.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashed, `${last_name} ${first_name}`, phone || null, role || 'STAFF', status || 'ACTIVE']
    );

    const userId = userRes.insertId;

    await connection.query(
      `INSERT INTO employees (user_id, position, salary, hire_date, department)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      [userId, position || '', 10000000.00, department || '']
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, role, position, department, status, password } = req.body;

    await connection.beginTransaction();

    if (password) {
      const { hashPassword } = await import('../utils/hash.js');
      const hashed = await hashPassword(password);
      await connection.query(
        `UPDATE users SET email = ?, password_hash = ?, full_name = ?, phone = ?, role = ?, status = ? WHERE id = ?`,
        [email, hashed, `${last_name} ${first_name}`, phone || null, role, status, id]
      );
    } else {
      await connection.query(
        `UPDATE users SET email = ?, full_name = ?, phone = ?, role = ?, status = ? WHERE id = ?`,
        [email, `${last_name} ${first_name}`, phone || null, role, status, id]
      );
    }

    await connection.query(
      `UPDATE employees SET position = ?, department = ? WHERE user_id = ?`,
      [position || '', department || '', id]
    );

    await connection.commit();
    connection.release();

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    await connection.rollback();
    connection.release();
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
            [name, description, base_price, max_occupancy, typeof photo_urls === 'string' ? photo_urls : JSON.stringify(photo_urls)]
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
      [name, description, base_price, max_occupancy, typeof photo_urls === 'string' ? photo_urls : JSON.stringify(photo_urls), id]
    );
    res.json({ message: 'Room type updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteRoomType = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if any room is using this room type
    const [roomsUsing] = await pool.query(
      "SELECT id, room_number FROM rooms WHERE room_type_id = ? LIMIT 1",
      [id]
    );

    if (roomsUsing.length > 0) {
      return res.status(400).json({
        message: `Hạng phòng đang được sử dụng bởi phòng ${roomsUsing[0].room_number}. Không thể xóa cứng.`
      });
    }

    await pool.query("DELETE FROM room_types WHERE id = ?", [id]);
    res.json({ message: 'Room type deleted successfully' });
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
    const { name, icon, description, status = 'ACTIVE' } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên tiện nghi không được để trống.' });
    }

    const [existing] = await pool.query("SELECT id FROM amenities WHERE name = ?", [name]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Tên tiện nghi đã tồn tại trong hệ thống.' });
    }

    await pool.query(
      "INSERT INTO amenities (name, icon, description, status) VALUES (?, ?, ?, ?)",
      [name, icon || 'fa-star', description || '', status]
    );

    res.status(201).json({ message: 'Thêm tiện nghi thành công.' });
  } catch (error) {
    next(error);
  }
};

export const updateAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, icon, description, status = 'ACTIVE' } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Tên tiện nghi không được để trống.' });
    }

    const [existing] = await pool.query("SELECT id FROM amenities WHERE name = ? AND id <> ?", [name, id]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Tên tiện nghi đã tồn tại trong hệ thống.' });
    }

    await pool.query(
      "UPDATE amenities SET name = ?, icon = ?, description = ?, status = ? WHERE id = ?",
      [name, icon, description, status, id]
    );

    res.json({ message: 'Cập nhật tiện nghi thành công.' });
  } catch (error) {
    next(error);
  }
};

export const deleteAmenity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [relations] = await pool.query(
      "SELECT 1 FROM room_type_amenities WHERE amenity_id = ? LIMIT 1",
      [id]
    );
    if (relations.length > 0) {
      await pool.query("UPDATE amenities SET status = 'INACTIVE' WHERE id = ?", [id]);
      return res.json({ 
        message: 'Tiện nghi đang được sử dụng bởi các hạng phòng. Đã chuyển trạng thái sang Ngừng sử dụng.',
        softDeleted: true 
      });
    }
    await pool.query("DELETE FROM amenities WHERE id = ?", [id]);
    res.json({ message: 'Xóa tiện nghi thành công.' });
  } catch (error) {
    next(error);
  }
};


export const listCustomers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id,
             u.id AS user_id,
             u.full_name,
             SUBSTRING_INDEX(u.full_name, ' ', 1) AS first_name,
             TRIM(SUBSTRING(u.full_name, LENGTH(SUBSTRING_INDEX(u.full_name, ' ', 1)) + 1)) AS last_name,
             u.email,
             u.phone,
             u.status,
             u.created_at AS create_date,
             c.identity_number AS id_number,
             c.address,
             c.address AS city
      FROM customers c
      JOIN users u ON u.id = c.user_id
      WHERE u.role = 'CUSTOMER'
      ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['ACTIVE', 'LOCKED', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ message: 'Invalid user status' });
    }
    await pool.query('UPDATE users SET status = ? WHERE id = ? AND role = \'CUSTOMER\'', [status, id]);
    res.json({ message: 'User status updated' });
  } catch (error) {
    next(error);
  }
};

export const listSupportTickets = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.subject, s.message, s.status, s.response, s.create_date,
             u.full_name AS customer_name, u.email
      FROM support_tickets s
      JOIN customers c ON c.id = s.customer_id
      JOIN users u ON u.id = c.user_id
      ORDER BY s.create_date DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const listReviews = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.is_hidden, r.created_at AS create_date,
             SUBSTRING_INDEX(u.full_name, ' ', 1) AS first_name,
             TRIM(SUBSTRING(u.full_name, LENGTH(SUBSTRING_INDEX(u.full_name, ' ', 1)) + 1)) AS last_name,
             rt.name AS room_type_name
      FROM reviews r
      JOIN customers c ON c.id = r.customer_id
      JOIN users u ON u.id = c.user_id
      JOIN bookings b ON b.id = r.booking_id
      JOIN rooms rm ON rm.id = b.room_id
      JOIN room_types rt ON rt.id = rm.room_type_id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const toggleReviewVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isHidden } = req.body;
    await pool.query('UPDATE reviews SET is_hidden = ? WHERE id = ?', [isHidden ? 1 : 0, id]);
    res.json({ message: isHidden ? 'Review hidden successfully' : 'Review approved/shown successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateSupportTicketStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;
    if (!['OPEN', 'PENDING', 'CLOSED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid ticket status' });
    }
    await pool.query('UPDATE support_tickets SET status = ?, response = ? WHERE id = ?', [status, response || null, id]);
    res.json({ message: 'Ticket status and response updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const resendVoucher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Fetch complete details of booking
    const [rows] = await pool.query(`
      SELECT b.id, b.booking_code, b.check_in_date, b.check_out_date, b.total_amount, b.status, b.payment_method, b.qr_token,
             u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             r.room_number, rt.name AS room_type_name
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      JOIN users u ON u.id = c.user_id
      JOIN rooms r ON r.id = b.room_id
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE b.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Đơn đặt phòng không tồn tại.' });
    }

    const booking = rows[0];

    if (!booking.customer_email) {
      return res.status(400).json({ success: false, message: 'Khách hàng không có email nhận voucher.' });
    }

    // 2. Generate QR code image
    const qrResult = await generateQRCodeImage(booking.qr_token, booking.booking_code);

    // 3. Generate Voucher PDF
    const pdfResult = await generateVoucherPDF(booking, qrResult.filePath);

    // Save to database
    await pool.query(
      'UPDATE bookings SET qr_image_url = ?, voucher_pdf_url = ? WHERE id = ?',
      [qrResult.relativeUrl, pdfResult.relativeUrl, id]
    );

    // 4. Send email via SMTP
    try {
      await sendVoucherEmail(booking, pdfResult.filePath);

      await pool.query(
        `UPDATE bookings 
         SET voucher_sent = true, voucher_sent_at = NOW(), email_status = 'SENT', email_error = NULL 
         WHERE id = ?`,
        [id]
      );

      res.json({ success: true, message: 'Đã gửi lại Voucher PDF qua Gmail thành công.' });
    } catch (emailErr) {
      console.error('SMTP send error:', emailErr);

      await pool.query(
        `UPDATE bookings 
         SET voucher_sent = false, email_status = 'FAILED', email_error = ? 
         WHERE id = ?`,
        [emailErr.message || String(emailErr), id]
      );

      return res.json({ 
        success: true, 
        message: 'Voucher PDF đã được tạo thành công! (Lưu ý: Không gửi được email do cấu hình SMTP chưa đúng)',
        emailFailed: true 
      });
    }
  } catch (error) {
    next(error);
  }
};
