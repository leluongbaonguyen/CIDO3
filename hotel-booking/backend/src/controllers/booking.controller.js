import { pool } from '../config/db.js';

const diffNights = (checkin, checkout) => {
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / oneDay));
};

export const createBooking = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { roomId, checkinDate, checkoutDate, totalGuests, specialRequests, discountCode } = req.body;

    if (!roomId || !checkinDate || !checkoutDate || !totalGuests) {
      return res.status(400).json({ message: 'Missing booking data' });
    }

    const [customerRows] = await connection.query(
      'SELECT id FROM customers WHERE user_id = ? LIMIT 1',
      [req.user.userId]
    );

    if (customerRows.length === 0) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    const customerId = customerRows[0].id;

    const [roomRows] = await connection.query(
      `SELECT r.id, r.status, rt.base_price, rt.max_occupancy
       FROM rooms r
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE r.id = ?
       LIMIT 1`,
      [roomId]
    );

    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const room = roomRows[0];

    if (room.status === 'MAINTENANCE') {
      return res.status(400).json({ message: 'Room is under maintenance' });
    }

    if (Number(totalGuests) > Number(room.max_occupancy)) {
      return res.status(400).json({ message: 'Guest count exceeds room capacity' });
    }

    const [conflicts] = await connection.query(
      `SELECT b.id
       FROM booking_items bi
       JOIN bookings b ON b.id = bi.booking_id
       WHERE bi.room_id = ?
         AND b.status IN ('PENDING', 'CONFIRMED')
         AND NOT (b.checkout_date <= ? OR b.checkin_date >= ?)
       LIMIT 1`,
      [roomId, checkinDate, checkoutDate]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Room is not available in selected dates' });
    }

    let discountId = null;
    let discountPercentage = 0;

    if (discountCode) {
      const [discountRows] = await connection.query(
        `SELECT id, percentage
         FROM discounts
         WHERE code = ? AND NOW() BETWEEN valid_from AND valid_to
         LIMIT 1`,
        [discountCode]
      );
      if (discountRows.length > 0) {
        discountId = discountRows[0].id;
        discountPercentage = Number(discountRows[0].percentage || 0);
      }
    }

    const nights = diffNights(checkinDate, checkoutDate);
    const subTotal = Number(room.base_price) * nights;
    const totalAmount = subTotal - (subTotal * discountPercentage) / 100;

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings
       (checkin_date, checkout_date, total_guests, special_requests, status, booking_source, total_amount, customer_id, discount_id, booking_date)
       VALUES (?, ?, ?, ?, 'PENDING', 'WEBSITE', ?, ?, ?, NOW())`,
      [checkinDate, checkoutDate, totalGuests, specialRequests || null, totalAmount, customerId, discountId]
    );

    await connection.query(
      `INSERT INTO booking_items (booking_id, room_id, price, quantity)
       VALUES (?, ?, ?, ?)`,
      [bookingResult.insertId, roomId, room.base_price, nights]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: bookingResult.insertId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const payBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod } = req.body;

    const [rows] = await pool.query(
      `SELECT b.id, b.total_amount, b.status
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = ? AND c.user_id = ?
       LIMIT 1`,
      [bookingId, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot pay cancelled booking' });
    }

    await pool.query(
      `INSERT INTO payments (payment_method, transaction_id, status, booking_id, amount, payment_date)
       VALUES (?, ?, 'SUCCESS', ?, ?, NOW())`,
      [paymentMethod || 'BANK_TRANSFER', `TXN-${Date.now()}`, bookingId, booking.total_amount]
    );

    await pool.query(
      `UPDATE bookings
       SET status = 'CONFIRMED'
       WHERE id = ?`,
      [bookingId]
    );

    res.json({ message: 'Payment success' });
  } catch (error) {
    next(error);
  }
};

export const myBookings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.booking_date, b.checkin_date, b.checkout_date, b.total_guests,
              b.special_requests, b.status, b.total_amount,
              r.room_number, rt.name AS room_type_name
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       JOIN booking_items bi ON bi.booking_id = b.id
       JOIN rooms r ON r.id = bi.room_id
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE c.user_id = ?
       ORDER BY b.create_date DESC`,
      [req.user.userId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const [rows] = await pool.query(
      `SELECT b.id, b.status
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = ? AND c.user_id = ?
       LIMIT 1`,
      [bookingId, req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Business Logic: Only allow cancellation if more than 24h before check-in
    const checkinTime = new Date(booking.checkin_date).getTime();
    const now = new Date().getTime();
    const hoursLeft = (checkinTime - now) / (1000 * 60 * 60);

    if (hoursLeft < 24 && booking.status !== 'PENDING') {
      return res.status(400).json({ 
        message: 'Cannot cancel booking within 24 hours of check-in. Please contact support.' 
      });
    }

    await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [bookingId]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
