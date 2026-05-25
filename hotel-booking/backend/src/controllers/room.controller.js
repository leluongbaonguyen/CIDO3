import { pool } from '../config/db.js';

export const listRooms = async (req, res, next) => {
  try {
    let { 
      keyword = '', 
      adults = 1, 
      children = 0, 
      minPrice, 
      maxPrice, 
      checkIn, 
      checkOut,
      roomTypeIds,
      amenityIds
    } = req.query;

    const totalGuests = Number(adults) + Number(children);

    let sql = `
      SELECT r.id, r.room_number, r.floor, r.status,
             rt.id AS room_type_id, rt.name AS room_type_name,
             rt.description, rt.base_price, rt.max_occupancy, rt.photo_urls
      FROM rooms r
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE r.status != 'MAINTENANCE'
    `;

    const params = [];

    // Filter by occupancy
    sql += ' AND rt.max_occupancy >= ?';
    params.push(totalGuests);

    // Filter by dates (Overlap check)
    if (checkIn && checkOut && checkIn !== 'null' && checkOut !== 'null') {
      sql += `
        AND r.id NOT IN (
          SELECT b.room_id
          FROM bookings b
          WHERE b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
            AND b.check_in_date < ?
            AND b.check_out_date > ?
        )
      `;
      params.push(checkOut, checkIn);
    }

    if (keyword) {
      sql += ' AND (r.room_number LIKE ? OR rt.name LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    if (roomTypeIds) {
      const ids = roomTypeIds.split(',').map(id => Number(id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        sql += ` AND rt.id IN (${ids.map(() => '?').join(',')})`;
        params.push(...ids);
      }
    }

    if (amenityIds) {
      const ids = amenityIds.split(',').map(id => Number(id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        sql += ` AND EXISTS (
          SELECT 1 FROM room_type_amenities rta 
          WHERE rta.room_type_id = rt.id 
          AND rta.amenity_id IN (${ids.map(() => '?').join(',')})
          GROUP BY rta.room_type_id
          HAVING COUNT(DISTINCT rta.amenity_id) = ?
        )`;
        params.push(...ids, ids.length);
      }
    }

    if (minPrice) {
      sql += ' AND rt.base_price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND rt.base_price <= ?';
      params.push(Number(maxPrice));
    }

    sql += ' ORDER BY rt.base_price ASC';

    const [rows] = await pool.query(sql, params);
    
    const results = rows.map(room => {
      let nights = 0;
      let totalPrice = 0;
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalPrice = nights * Number(room.base_price);
      }
      return { 
        ...room, 
        nights, 
        totalPrice,
        isAvailable: true // Since we filtered non-available out
      };
    });

    res.json(results);
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
      `SELECT a.id, a.name, a.icon, a.description
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

export const getRoomTypes = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM room_types");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getAmenities = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM amenities");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
