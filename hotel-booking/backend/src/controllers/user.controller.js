import { pool } from '../config/db.js';

export const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.status,
              c.address, c.city, c.country, c.id_number
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, address, city, country, idNumber } = req.body;

    await pool.query(
      `UPDATE users
       SET first_name = ?, last_name = ?, phone = ?
       WHERE id = ?`,
      [firstName, lastName, phone || null, req.user.userId]
    );

    await pool.query(
      `UPDATE customers
       SET address = ?, city = ?, country = ?, id_number = ?
       WHERE user_id = ?`,
      [address || null, city || null, country || null, idNumber || null, req.user.userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const createSupportTicket = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tiêu đề và nội dung hỗ trợ.' });
    }

    const [customerRows] = await pool.query(
      "SELECT id FROM customers WHERE user_id = ? LIMIT 1",
      [req.user.userId]
    );

    if (customerRows.length === 0) {
      return res.status(400).json({ message: 'Tài khoản của bạn không được liên kết với hồ sơ khách hàng.' });
    }

    const customerId = customerRows[0].id;

    const [result] = await pool.query(
      `INSERT INTO support_tickets (customer_id, subject, message, status, create_date)
       VALUES (?, ?, ?, 'OPEN', NOW())`,
      [customerId, subject, message]
    );

    res.status(201).json({
      success: true,
      message: 'Gửi yêu cầu hỗ trợ thành công.',
      ticketId: result.insertId
    });
  } catch (error) {
    next(error);
  }
};

export const getMySupportTickets = async (req, res, next) => {
  try {
    const [customerRows] = await pool.query(
      "SELECT id FROM customers WHERE user_id = ? LIMIT 1",
      [req.user.userId]
    );

    if (customerRows.length === 0) {
      return res.status(200).json([]);
    }

    const customerId = customerRows[0].id;

    const [rows] = await pool.query(
      `SELECT id, subject, message, status, response, create_date, update_date
       FROM support_tickets
       WHERE customer_id = ?
       ORDER BY create_date DESC`,
      [customerId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};
