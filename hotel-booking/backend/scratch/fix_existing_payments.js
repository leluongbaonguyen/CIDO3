import { pool } from '../src/config/db.js';

async function fix() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get all pending online bookings
    const [pendingBookings] = await connection.query(
      "SELECT id, total_amount, payment_method FROM bookings WHERE status = 'PENDING' AND payment_method = 'VNPAY'"
    );

    console.log(`Found ${pendingBookings.length} pending online bookings to update.`);

    for (const b of pendingBookings) {
      // Set status to CONFIRMED
      await connection.query(
        "UPDATE bookings SET status = 'CONFIRMED' WHERE id = ?",
        [b.id]
      );

      // Check if payment already exists
      const [existingPayments] = await connection.query(
        "SELECT id FROM payments WHERE booking_id = ?",
        [b.id]
      );

      if (existingPayments.length === 0) {
        // Insert simulated successful payment record
        await connection.query(
          `INSERT INTO payments (booking_id, amount, method, status, transaction_code, paid_at)
           VALUES (?, ?, ?, 'SUCCESS', ?, NOW())`,
          [b.id, b.total_amount, b.payment_method, `TXN_SIM_FIX_${b.id}_${Date.now()}`]
        );
        console.log(`- Created success payment for booking ID ${b.id}`);
      }
    }

    await connection.commit();
    console.log('✅ All existing pending online bookings have been successfully confirmed and marked as paid.');
  } catch (err) {
    await connection.rollback();
    console.error('❌ Failed to fix existing bookings:', err);
  } finally {
    connection.release();
    process.exit();
  }
}

fix();
