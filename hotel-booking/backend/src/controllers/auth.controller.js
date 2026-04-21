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
      [userId, address || null, city || null, country || null, idNumber || null]
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
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const matched = await comparePassword(password, user.password);
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
