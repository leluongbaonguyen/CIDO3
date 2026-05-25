import { pool } from '../src/config/db.js';

async function migrate() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM bookings');
    const hasQrToken = columns.some(col => col.Field === 'qr_token');
    
    if (!hasQrToken) {
      console.log('Adding qr_token column...');
      await pool.query('ALTER TABLE bookings ADD COLUMN qr_token VARCHAR(255) NULL UNIQUE');
      console.log('✅ Column qr_token added successfully.');
    } else {
      console.log('✅ Column qr_token already exists.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
