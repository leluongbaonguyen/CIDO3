import cron from 'node-cron';
import { pool } from '../config/db.js';

export const initCronJobs = () => {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running cron: Checking for expired bookings...');
    try {
      const [result] = await pool.query(
        "UPDATE bookings SET status = 'EXPIRED' WHERE status = 'PENDING' AND expires_at < NOW()"
      );
      if (result.affectedRows > 0) {
        console.log(`Expired ${result.affectedRows} bookings.`);
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};
