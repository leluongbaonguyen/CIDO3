import { pool } from '../src/config/db.js';

async function test(queryParams) {
  try {
    let { 
      keyword = '', 
      adults = 2, 
      children = 0, 
      minPrice, 
      maxPrice, 
      checkIn, 
      checkOut,
      roomTypeIds,
      amenityIds
    } = queryParams;

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
    if (checkIn && checkOut) {
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

    sql += ' ORDER BY rt.base_price ASC';

    const [rows] = await pool.query(sql, params);
    console.log(`\n--- Kết quả truy vấn cho:`, queryParams);
    console.log(`Số phòng tìm thấy: ${rows.length}`);
    if (rows.length > 0) {
      console.log('Mẫu 3 phòng đầu tiên:');
      console.log(rows.slice(0, 3).map(r => ({ id: r.id, number: r.room_number, type_id: r.room_type_id, type_name: r.room_type_name })));
    }
  } catch (error) {
    console.error(error);
  }
}

async function run() {
  // Test 1: Không có filter loại phòng
  await test({ adults: 2 });

  // Test 2: Filter loại phòng '6,7,8'
  await test({ adults: 2, roomTypeIds: '6,7,8' });

  process.exit();
}
run();
