import { pool } from '../config/db.js';

export const listRooms = async (req, res, next) => {
  try {
    const { keyword = '', roomTypeId, guests, minPrice, maxPrice, checkin, checkout } = req.query;

    let sql = `
      SELECT r.id, r.room_number, r.floor, r.status, r.notes,
             rt.id AS room_type_id, rt.name AS room_type_name,
             rt.description, rt.base_price, rt.max_occupancy, rt.photo_urls
      FROM rooms r
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE 1=1
    `;

    const params = [];

    if (keyword) {
      sql += ' AND (r.room_number LIKE ? OR rt.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (roomTypeId) {
      sql += ' AND rt.id = ?';
      params.push(roomTypeId);
    }

    if (guests) {
      sql += ' AND rt.max_occupancy >= ?';
      params.push(Number(guests));
    }

    if (minPrice) {
      sql += ' AND rt.base_price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND rt.base_price <= ?';
      params.push(Number(maxPrice));
    }

    sql += " AND r.status <> 'MAINTENANCE'";

    if (checkin && checkout) {
      sql += `
        AND r.id NOT IN (
          SELECT bi.room_id
          FROM booking_items bi
          JOIN bookings b ON b.id = bi.booking_id
          WHERE b.status IN ('PENDING', 'CONFIRMED')
            AND NOT (b.checkout_date <= ? OR b.checkin_date >= ?)
        )
      `;
      params.push(checkin, checkout);
    }

    sql += ' ORDER BY rt.base_price ASC';

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getRoomDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rooms] = await pool.query(
      `SELECT r.*, rt.name AS room_type_name, rt.description, rt.base_price, rt.max_occupancy, rt.photo_urls
       FROM rooms r
       JOIN room_types rt ON rt.id = r.room_type_id
       WHERE r.id = ?
       LIMIT 1`,
      [id]
    );

    if (rooms.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const [amenities] = await pool.query(
      `SELECT a.id, a.name, a.description
       FROM room_type_amenities rta
       JOIN amenities a ON a.id = rta.amenity_id
       WHERE rta.room_type_id = ?`,
      [rooms[0].room_type_id]
    );

    res.json({ ...rooms[0], amenities });
  } catch (error) {
    next(error);
  }
};
