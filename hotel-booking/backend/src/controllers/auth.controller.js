import { pool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const {
      fullName,
      email,
      phone,
      password,
      address,
      identityNumber
    } = req.body;

    if (!fullName || !email || !password) {
      connection.release();
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [exists] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await hashPassword(password);

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')`,
      [email, hashed, fullName, phone || null]
    );

    const userId = result.insertId;

    await connection.query(
      `INSERT INTO customers (user_id, address, identity_number)
       VALUES (?, ?, ?)`,
      [userId, address || '', identityNumber || `ID-${Date.now()}`]
    );

    await connection.commit();
    connection.release();

    const token = signToken({ userId, role: 'CUSTOMER' });

    res.status(201).json({
      message: 'Register success',
      token,
      user: {
        id: userId,
        email,
        fullName,
        role: 'CUSTOMER'
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const matched = await comparePassword(password, user.password_hash);
    if (!matched) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      message: 'Login success',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.role,
              c.address, c.identity_number
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    const fullName = user.full_name || '';
    const parts = fullName.trim().split(' ');
    const firstName = parts.length > 1 ? parts.pop() : fullName;
    const lastName = parts.join(' ');

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      firstName,
      lastName,
      phone: user.phone,
      role: user.role,
      customerDetails: {
        address: user.address,
        identityNumber: user.identity_number
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const {
      firstName,
      lastName,
      phone,
      address,
      identityNumber
    } = req.body;

    const userId = req.user.userId;
    const fullName = `${lastName} ${firstName}`.trim();

    await connection.beginTransaction();

    // 1. Update users table
    await connection.query(
      `UPDATE users 
       SET full_name = ?, phone = ? 
       WHERE id = ?`,
      [fullName, phone || null, userId]
    );

    // 2. Check if customer record exists, if not insert, else update
    const [custExists] = await connection.query(
      'SELECT id FROM customers WHERE user_id = ?',
      [userId]
    );

    if (custExists.length > 0) {
      await connection.query(
        `UPDATE customers 
         SET address = ?, identity_number = ? 
         WHERE user_id = ?`,
        [address || '', identityNumber || '', userId]
      );
    } else {
      await connection.query(
        `INSERT INTO customers (user_id, address, identity_number) 
         VALUES (?, ?, ?)`,
        [userId, address || '', identityNumber || `ID-${Date.now()}`]
      );
    }

    await connection.commit();
    connection.release();

    res.json({
      message: 'Profile updated successfully',
      fullName,
      firstName,
      lastName,
      phone
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
    }
    
    res.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const hashed = await hashPassword(newPassword);
    
    const [result] = await pool.query('UPDATE users SET password_hash = ? WHERE email = ?', [hashed, email]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không thể cập nhật mật khẩu.' });
    }
    
    res.json({ message: 'Mật khẩu đã được thay đổi thành công.' });
  } catch (error) {
    next(error);
  }
};
