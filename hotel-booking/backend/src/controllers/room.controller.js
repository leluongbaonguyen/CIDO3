import { pool } from '../config/db.js';

export const listRooms = async (req, res, next) => {
  try {
    let { 
      keyword = '', 
      roomTypeId, 
      adults = 2, 
      children = 0, 
      rooms = 1,
      minPrice, 
      maxPrice, 
      checkin, 
      checkout,
      roomTypeIds,
      amenityIds
    } = req.query;

    // Normalize keys (support both checkin/checkout and checkIn/checkOut)
    if (!checkin && req.query.checkIn) checkin = req.query.checkIn;
    if (!checkout && req.query.checkOut) checkout = req.query.checkOut;

    const totalGuests = Number(adults) + Number(children);

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
        // Lọc các loại phòng có chứa TẤT CẢ các tiện nghi được chọn
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

    // Mỗi phòng phải chứa được số khách trung bình (nếu đặt nhiều phòng)
    // Hoặc đơn giản là kiểm tra xem có phòng nào đáp ứng được không.
    // Theo nghiệp vụ: adults + children <= rooms * max_occupancy
    // Tuy nhiên, query này trả về danh sách CÁC PHÒNG có thể chọn.
    // Nên ta lọc các phòng có occupancy >= (totalGuests / rooms) 
    const requiredCapacity = Math.ceil(totalGuests / Number(rooms));
    sql += ' AND rt.max_occupancy >= ?';
    params.push(requiredCapacity);

    if (minPrice) {
      sql += ' AND rt.base_price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND rt.base_price <= ?';
      params.push(Number(maxPrice));
    }

    sql += " AND r.status = 'AVAILABLE'";

    if (checkin && checkout) {
      sql += `
        AND r.id NOT IN (
          SELECT bi.room_id
          FROM booking_items bi
          JOIN bookings b ON b.id = bi.booking_id
          WHERE b.status IN ('PENDING', 'CONFIRMED')
            AND (b.checkin_date < ? AND b.checkout_date > ?)
        )
      `;
      params.push(checkout, checkin);
    }

    sql += ' ORDER BY rt.base_price ASC';

    const [rows] = await pool.query(sql, params);
    
    // Tính toán số đêm và giá tổng (nếu có ngày)
    const results = rows.map(room => {
      let nights = 0;
      let totalPrice = 0;
      if (checkin && checkout) {
        const start = new Date(checkin);
        const end = new Date(checkout);
        nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        totalPrice = nights * Number(room.base_price);
      }
      return { ...room, nights, totalPrice };
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
