import { pool } from '../src/config/db.js';

async function query() {
  try {
    const [rows] = await pool.query('SELECT id, booking_code, qr_token, status, payment_method, room_id FROM bookings ORDER BY id DESC LIMIT 5');
    console.log('Recent Bookings:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Query failed:', err);
  } finally {
    process.exit();
  }
}

query();
