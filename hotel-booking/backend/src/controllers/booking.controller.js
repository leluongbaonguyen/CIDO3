import { pool } from '../config/db.js';
import { processVoucherAndSendEmail } from '../utils/voucher.js';

const calculateAmount = (basePrice, checkIn, checkOut, totalGuests = 1, discountPercent = 0, memberDiscountPercent = 0) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  let nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (nights <= 0) nights = 1;

  let baseRoomCharge = 0;
  let weekendSurcharge = 0;
  let holidaySurcharge = 0;

  const holidays = ['01/01', '30/04', '01/05', '02/09'];

  for (let i = 0; i < nights; i++) {
    const currentDay = new Date(start);
    currentDay.setDate(start.getDate() + i);

    const dayOfWeek = currentDay.getDay();
    let isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    const dd = String(currentDay.getDate()).padStart(2, '0');
    const mm = String(currentDay.getMonth() + 1).padStart(2, '0');
    const dayMonthStr = `${dd}/${mm}`;
    let isHoliday = holidays.includes(dayMonthStr);

    let nightBase = Number(basePrice);
    baseRoomCharge += nightBase;

    if (isWeekend) {
      weekendSurcharge += nightBase * 0.10;
    }
    if (isHoliday) {
      holidaySurcharge += nightBase * 0.20;
    }
  }

  const extraGuests = Math.max(0, Number(totalGuests) - 2);
  const extraOccupantSurcharge = extraGuests * (Number(basePrice) * 0.15) * nights;

  const subtotal = baseRoomCharge + weekendSurcharge + holidaySurcharge + extraOccupantSurcharge;

  const voucherDiscount = (subtotal * Number(discountPercent)) / 100;
  const memberDiscount = (subtotal * Number(memberDiscountPercent)) / 100;
  const totalDiscount = voucherDiscount + memberDiscount;

  const total = Math.max(subtotal - totalDiscount, 0);

  return {
    nights,
    baseRoomCharge,
    weekendSurcharge,
    holidaySurcharge,
    extraOccupantSurcharge,
    subtotal,
    discountAmount: totalDiscount,
    total
  };
};

export const createBooking = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const fail = async (status, message) => {
      await connection.rollback();
      return res.status(status).json({ message });
    };

    const {
      roomId,
      checkInDate: checkInDateRaw,
      checkOutDate: checkOutDateRaw,
      checkinDate,
      checkoutDate,
      check_in_date,
      check_out_date,
      adults = 1,
      children = 0,
      totalGuests,
      paymentMethod = 'CASH',
      discountCode,
      note,
      notes,
      specialRequests,
      customerId,
      customer_id
    } = req.body;

    const checkInDate = checkInDateRaw || checkinDate || check_in_date;
    const checkOutDate = checkOutDateRaw || checkoutDate || check_out_date;
    const selectedCustomerId = customerId || customer_id;
    const bookingNote = note || notes || specialRequests || null;

    if (!roomId || !checkInDate || !checkOutDate) {
      return fail(400, 'Vui lòng chọn phòng, ngày nhận phòng và ngày trả phòng');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      return fail(400, 'Ngày nhận/trả phòng không hợp lệ');
    }
    if (checkIn < today) {
      return fail(400, 'Ngày nhận phòng không được ở quá khứ');
    }
    if (checkOut <= checkIn) {
      return fail(400, 'Ngày trả phòng phải sau ngày nhận phòng');
    }

    // 1. Nghiệp vụ bắt buộc đăng ký/đăng nhập:
    // - Khách hàng chỉ được đặt bằng hồ sơ customer của chính tài khoản đã đăng ký.
    // - Admin/Staff được tạo đơn cho một customer đã tồn tại trong hệ thống.
    let customerIdForBooking;
    if (req.user) {
      if (req.user.role === 'CUSTOMER') {
        const [customerRows] = await connection.query(
          'SELECT id FROM customers WHERE user_id = ? LIMIT 1',
          [req.user.userId]
        );

        if (customerRows.length === 0) {
          return fail(403, 'Bạn cần đăng ký hồ sơ khách hàng trước khi đặt phòng');
        }
        customerIdForBooking = customerRows[0].id;
      } else if (['ADMIN', 'STAFF'].includes(req.user.role)) {
        if (!selectedCustomerId) {
          return fail(400, 'Admin/Staff phải chọn khách hàng đã đăng ký để tạo đơn đặt phòng');
        }
        const [customerRows] = await connection.query(
          'SELECT id FROM customers WHERE id = ? LIMIT 1',
          [selectedCustomerId]
        );

        if (customerRows.length === 0) {
          return fail(404, 'Không tìm thấy khách hàng đã đăng ký');
        }
        customerIdForBooking = customerRows[0].id;
      } else {
        return fail(403, 'Tài khoản không có quyền đặt phòng');
      }
    } else {
      // Guest booking (not logged in)
      const { email, phone, name } = req.body;
      if (!email || !name || !phone) {
        return fail(400, 'Khách vãng lai cần cung cấp đầy đủ họ tên, số điện thoại và email');
      }

      // Check if user already exists
      const [userRows] = await connection.query(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [email]
      );

      let guestUserId;
      if (userRows.length > 0) {
        guestUserId = userRows[0].id;
        
        // Find or create customer profile
        const [custRows] = await connection.query(
          'SELECT id FROM customers WHERE user_id = ? LIMIT 1',
          [guestUserId]
        );
        if (custRows.length > 0) {
          customerIdForBooking = custRows[0].id;
        } else {
          const [newCust] = await connection.query(
            'INSERT INTO customers (user_id, identity_number, address) VALUES (?, ?, ?)',
            [guestUserId, `ID-${Date.now()}`, 'Khách vãng lai']
          );
          customerIdForBooking = newCust.insertId;
        }
      } else {
        // Create new user dynamically
        const [newUser] = await connection.query(
          `INSERT INTO users (email, password_hash, full_name, phone, role, status)
           VALUES (?, 'NOT_SET_PASSWORD_GUEST', ?, ?, 'CUSTOMER', 'ACTIVE')`,
          [email, name, phone]
        );
        guestUserId = newUser.insertId;

        const [newCust] = await connection.query(
          'INSERT INTO customers (user_id, identity_number, address) VALUES (?, ?, ?)',
          [guestUserId, `ID-${Date.now()}`, 'Khách vãng lai']
        );
        customerIdForBooking = newCust.insertId;
      }
    }

    // 2. Lock room and check status
    const [roomRows] = await connection.query(
      `SELECT r.id, r.status, rt.base_price, rt.max_occupancy
       FROM rooms r
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE r.id = ? FOR UPDATE`,
      [roomId]
    );

    if (roomRows.length === 0) {
      return fail(404, 'Room not found');
    }

    const room = roomRows[0];
    const guestCount = Number(totalGuests) || Number(adults) + Number(children);

    if (room.status === 'MAINTENANCE') {
      return fail(409, 'Phòng đang được bảo trì (MAINTENANCE), không thể đặt phòng');
    }

    if (guestCount > room.max_occupancy) {
      return fail(400, 'Số lượng khách vượt quá sức chứa');
    }

    // 3. Check Overlap: [check_in_date, check_out_date) không được giao nhau.
    const [conflicts] = await connection.query(
      `SELECT id, booking_code FROM bookings
       WHERE room_id = ?
         AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
         AND (expires_at IS NULL OR expires_at > NOW())
         AND check_in_date < ?
         AND check_out_date > ?
       LIMIT 1 FOR UPDATE`,
      [roomId, checkOutDate, checkInDate]
    );

    if (conflicts.length > 0) {
      return fail(409, `Phòng đã được đặt trong thời gian này bởi đơn ${conflicts[0].booking_code}`);
    }

    // 4. Calculate amount
    let discountPercent = 0;
    if (discountCode) {
      const [discountRows] = await connection.query(
        "SELECT percentage FROM discounts WHERE code = ? AND NOW() >= valid_from AND NOW() <= valid_to LIMIT 1",
        [discountCode]
      );
      if (discountRows.length > 0) {
        discountPercent = Number(discountRows[0].percentage);
      }
    }

    let memberDiscountPercent = 0;
    if (req.user) {
      const [userRows] = await connection.query(
        "SELECT full_name, email FROM users WHERE id = ?",
        [req.user.userId]
      );
      if (userRows.length > 0) {
        const userObj = userRows[0];
        if (userObj.full_name?.toUpperCase().includes('VIP') || userObj.email?.toUpperCase().includes('VIP')) {
          memberDiscountPercent = 5;
        }
      }
    }

    const { 
      nights, 
      baseRoomCharge, 
      weekendSurcharge, 
      holidaySurcharge, 
      extraOccupantSurcharge, 
      subtotal, 
      discountAmount, 
      total 
    } = calculateAmount(
      room.base_price, 
      checkInDate, 
      checkOutDate, 
      guestCount, 
      discountPercent, 
      memberDiscountPercent
    );

    // 5. Create Booking
    const bookingCode = `BK${Date.now()}`;
    const qrToken = `QR_CHECKIN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const normalizedPaymentMethod = ['VNPAY', 'QR_CODE', 'BANK_TRANSFER', 'CREDIT_CARD'].includes(paymentMethod)
      ? 'VNPAY'
      : 'CASH';
    const expiresAt = normalizedPaymentMethod === 'VNPAY' ? new Date(Date.now() + 15 * 60 * 1000) : null;

    const initialStatus = normalizedPaymentMethod === 'VNPAY' ? 'CONFIRMED' : 'PENDING';

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings
       (booking_code, customer_id, room_id, check_in_date, check_out_date, adults, children, total_guests, subtotal, weekend_surcharge, holiday_surcharge, extra_occupant_surcharge, discount_amount, total_amount, status, payment_method, note, expires_at, qr_token, discount_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingCode, 
        customerIdForBooking, 
        roomId, 
        checkInDate, 
        checkOutDate, 
        adults, 
        children, 
        guestCount, 
        subtotal, 
        weekendSurcharge, 
        holidaySurcharge, 
        extraOccupantSurcharge, 
        discountAmount, 
        total, 
        initialStatus, 
        normalizedPaymentMethod, 
        bookingNote, 
        expiresAt, 
        qrToken,
        discountCode || null
      ]
    );

    const newBookingId = bookingResult.insertId;

    // Simulate successful payment gateway response for online payments
    if (normalizedPaymentMethod === 'VNPAY') {
      await connection.query(
        `INSERT INTO payments (booking_id, amount, method, status, transaction_code, paid_at)
         VALUES (?, ?, ?, 'SUCCESS', ?, NOW())`,
        [newBookingId, total, normalizedPaymentMethod, `TXN_SIM_${newBookingId}_${Date.now()}`]
      );
    }

    // Query customer name and room name to display in response
    const [detailsRows] = await connection.query(
      `SELECT u.full_name AS customer_name, r.room_number, rt.name AS room_type_name
       FROM customers c
       JOIN users u ON u.id = c.user_id
       CROSS JOIN rooms r
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE c.id = ? AND r.id = ?`,
      [customerIdForBooking, roomId]
    );
    const customerName = detailsRows[0]?.customer_name || 'Khách hàng';
    const roomTypeName = detailsRows[0]?.room_type_name || 'Phòng';
    const roomNumber = detailsRows[0]?.room_number || '';
    const roomName = `${roomTypeName} ${roomNumber}`;

    await connection.commit();

    // Trigger QR generation, PDF creation and Gmail SMTP sending in background
    processVoucherAndSendEmail(newBookingId).catch(err => {
      console.error('Error processing voucher / sending email in background:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Đặt phòng thành công. Voucher đã được gửi qua Gmail.',
      bookingId: newBookingId,
      booking: {
        id: newBookingId,
        bookingCode,
        booking_code: bookingCode,
        customerName,
        customer_name: customerName,
        roomName,
        room_type_name: roomTypeName,
        room_number: roomNumber,
        checkInDate,
        check_in_date: checkInDate,
        checkOutDate,
        check_out_date: checkOutDate,
        qrCodeUrl: `/uploads/qrcodes/QR_${bookingCode}.png`,
        voucherPdfUrl: `/uploads/vouchers/Voucher_${bookingCode}.pdf`,
        qr_token: qrToken,
        qrToken,
        totalAmount: total,
        paymentMethod: normalizedPaymentMethod,
        expiresAt
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const myBookings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, r.room_number, rt.name AS room_type_name, rt.photo_urls,
              IF(rev.id IS NOT NULL, 1, 0) AS is_reviewed,
              rev.rating AS review_rating, rev.comment AS review_comment
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN room_types rt ON rt.id = r.room_type_id
       JOIN customers c ON c.id = b.customer_id
       LEFT JOIN reviews rev ON rev.booking_id = b.id
       WHERE c.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.userId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getBookingDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT b.*, r.room_number, rt.name AS room_type_name, c.user_id
       FROM bookings b
       JOIN rooms r ON r.id = b.room_id
       JOIN room_types rt ON rt.id = r.room_type_id
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];
    if (req.user.role !== 'ADMIN' && req.user.role !== 'STAFF' && booking.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT b.id, b.status, b.check_in_date, c.user_id
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    // Check ownership if customer
    if (req.user.role === 'CUSTOMER' && booking.user_id !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel booking in current status' });
    }

    // Check 24h rule for customers
    if (req.user.role === 'CUSTOMER') {
      const checkIn = new Date(booking.check_in_date).getTime();
      const now = Date.now();
      if (checkIn - now < 24 * 60 * 60 * 1000) {
        return res.status(400).json({ message: 'Không thể hủy trực tiếp khi còn dưới 24h. Vui lòng liên hệ hỗ trợ.' });
      }
    }

    await pool.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [id]);

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    next(error);
  }
};

export const validateVoucher = async (req, res, next) => {
  try {
    const { code } = req.params;
    const [rows] = await pool.query(
      "SELECT percentage, valid_from, valid_to FROM discounts WHERE code = ? LIMIT 1",
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Mã giảm giá không tồn tại.' });
    }

    const discount = rows[0];
    const now = new Date();
    const from = new Date(discount.valid_from);
    const to = new Date(discount.valid_to);

    if (now < from) {
      return res.status(400).json({ valid: false, message: `Mã giảm giá chỉ có hiệu lực từ ngày ${from.toLocaleDateString('vi-VN')}` });
    }

    if (now > to) {
      return res.status(400).json({ valid: false, message: 'Mã giảm giá đã hết hạn.' });
    }

    res.json({
      valid: true,
      percentage: Number(discount.percentage),
      message: `Áp dụng mã giảm giá thành công! Giảm ${Number(discount.percentage)}%`
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đánh giá từ 1 đến 5 sao.' });
    }

    const [bookingRows] = await pool.query(
      `SELECT b.id, b.customer_id, b.status 
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = ? AND c.user_id = ? 
       LIMIT 1`,
      [bookingId, req.user.userId]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({ message: 'Đơn đặt phòng không tồn tại hoặc không thuộc về tài khoản của bạn.' });
    }

    const booking = bookingRows[0];
    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({ message: 'Bạn chỉ có thể đánh giá những đơn đặt phòng đã hoàn tất lưu trú.' });
    }

    const [existingReview] = await pool.query(
      "SELECT id FROM reviews WHERE booking_id = ? LIMIT 1",
      [bookingId]
    );

    if (existingReview.length > 0) {
      return res.status(400).json({ message: 'Đơn đặt phòng này đã được đánh giá trước đó.' });
    }

    await pool.query(
      `INSERT INTO reviews (booking_id, customer_id, rating, comment, is_hidden, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [booking.id, booking.customer_id, rating, comment || '']
    );

    res.status(201).json({
      success: true,
      message: 'Gửi đánh giá thành công! Cảm ơn ý kiến đóng góp của bạn.'
    });
  } catch (error) {
    next(error);
  }
};

