import { pool } from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { signToken } from '../utils/jwt.js';

export const register = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      address,
      city,
      country,
      idNumber
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (exists.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashed = await hashPassword(password);

    const [result] = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, status)
       VALUES (?, ?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')`,
      [email, hashed, firstName, lastName, phone || null]
    );

    const userId = result.insertId;

    await pool.query(
      `INSERT INTO customers (user_id, address, city, country, id_number)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, address || '', city || '', country || '', idNumber || `ID-${Date.now()}`]
    );

    const token = signToken({ userId, role: 'CUSTOMER' });

    res.status(201).json({
      message: 'Register success',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'CUSTOMER'
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (rows.length === 0) {
      console.log('Login failed: Email not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const matched = await comparePassword(password, user.password);
    if (!matched) {
      console.log('Login failed: Password mismatch for:', email);
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
        firstName: user.first_name,
        lastName: user.last_name,
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
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role,
              c.address, c.city, c.country, c.id_number
       FROM users u
       LEFT JOIN customers c ON c.user_id = u.id
       WHERE u.id = ? LIMIT 1`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      customerDetails: {
        address: user.address,
        city: user.city,
        country: user.country,
        idNumber: user.id_number
      }
    });
  } catch (error) {
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
    
    // Trong thực tế sẽ gửi email chứa token. 
    // Ở đây ta giả lập bằng cách trả về thông báo thành công.
    res.json({ message: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    const hashed = await hashPassword(newPassword);
    
    const [result] = await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không thể cập nhật mật khẩu.' });
    }
    
    res.json({ message: 'Mật khẩu đã được thay đổi thành công.' });
  } catch (error) {
    next(error);
  }
};
