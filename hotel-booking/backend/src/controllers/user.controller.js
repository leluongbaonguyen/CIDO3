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
