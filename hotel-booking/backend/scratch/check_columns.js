import { pool } from '../src/config/db.js';

async function run() {
  try {
    const [bookingsCols] = await pool.query('DESCRIBE bookings');
    console.log('Bookings columns:');
    console.log(bookingsCols.map(c => c.Field));

    const [bookingItemsCols] = await pool.query('DESCRIBE booking_items');
    console.log('Booking_items columns:');
    console.log(bookingItemsCols.map(c => c.Field));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}
run();
