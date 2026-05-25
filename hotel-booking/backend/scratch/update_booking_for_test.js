import { pool } from '../src/config/db.js';

async function update() {
  try {
    await pool.query(`
      UPDATE bookings 
      SET status = 'CONFIRMED', 
          payment_method = 'CASH', 
          qr_token = 'QR_CHECKIN_TEST12345',
          check_in_date = CURDATE(),
          check_out_date = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
      WHERE id = 128
    `);
    
    // Also make sure room status is not checked in
    await pool.query(`UPDATE rooms SET status = 'AVAILABLE' WHERE id = 1`);
    
    console.log('✅ Booking 128 updated for testing check-in.');
  } catch (err) {
    console.error('Update failed:', err);
  } finally {
    process.exit();
  }
}

update();
