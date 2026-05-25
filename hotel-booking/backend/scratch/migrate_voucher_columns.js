import { pool } from '../src/config/db.js';

async function migrate() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM bookings');
    const columnNames = columns.map(col => col.Field);

    const columnsToAdd = [
      { name: 'qr_image_url', sql: 'ALTER TABLE bookings ADD COLUMN qr_image_url VARCHAR(255) NULL' },
      { name: 'voucher_pdf_url', sql: 'ALTER TABLE bookings ADD COLUMN voucher_pdf_url VARCHAR(255) NULL' },
      { name: 'voucher_sent', sql: 'ALTER TABLE bookings ADD COLUMN voucher_sent BOOLEAN DEFAULT FALSE' },
      { name: 'voucher_sent_at', sql: 'ALTER TABLE bookings ADD COLUMN voucher_sent_at TIMESTAMP NULL DEFAULT NULL' },
      { name: 'email_status', sql: "ALTER TABLE bookings ADD COLUMN email_status ENUM('NOT_SENT', 'SENT', 'FAILED') DEFAULT 'NOT_SENT'" },
      { name: 'email_error', sql: 'ALTER TABLE bookings ADD COLUMN email_error TEXT NULL' }
    ];

    for (const col of columnsToAdd) {
      if (!columnNames.includes(col.name)) {
        console.log(`Adding ${col.name} column...`);
        await pool.query(col.sql);
        console.log(`✅ Column ${col.name} added successfully.`);
      } else {
        console.log(`✅ Column ${col.name} already exists.`);
      }
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

migrate();
