import { pool } from '../src/config/db.js';

async function run() {
  try {
    const [bookings] = await pool.query('SELECT id, room_id, check_in_date, check_out_date, status FROM bookings LIMIT 5');
    console.log('Bookings Sample:');
    console.log(bookings);

    const [items] = await pool.query('SELECT id, booking_id, room_id FROM booking_items LIMIT 5');
    console.log('Booking Items Sample:');
    console.log(items);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}
run();
