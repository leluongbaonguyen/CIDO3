import { pool } from '../config/db.js';

export const listAllBookings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.booking_date, b.checkin_date, b.checkout_date, b.status, b.total_amount,
              u.first_name, u.last_name, u.email,
              r.room_number, rt.name AS room_type_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN users u ON u.id = c.user_id
       JOIN booking_items bi ON bi.booking_id = b.id
       JOIN rooms r ON r.id = bi.room_id
       JOIN room_types rt ON rt.id = r.room_type_id
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

export const createRoom = async (req, res, next) => {
  try {
    const { roomNumber, floor, status, notes, roomTypeId } = req.body;

    await pool.query(
      `INSERT INTO rooms (room_number, floor, status, notes, room_type_id)
       VALUES (?, ?, ?, ?, ?)`,
      [roomNumber, floor, status || 'AVAILABLE', notes || null, roomTypeId]
    );

    res.status(201).json({ message: 'Room created' });
  } catch (error) {
    next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { roomNumber, floor, status, notes, roomTypeId } = req.body;

    await pool.query(
      `UPDATE rooms
       SET room_number = ?, floor = ?, status = ?, notes = ?, room_type_id = ?
       WHERE id = ?`,
      [roomNumber, floor, status, notes || null, roomTypeId, roomId]
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
