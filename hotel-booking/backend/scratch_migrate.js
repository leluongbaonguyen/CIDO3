import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
dotenv.config({ path: 'd:/CIDO3/hotel-booking-fixed/hotel-booking/backend/.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

async function run() {
  try {
    console.log('Adding response column to support_tickets...');
    await pool.query('ALTER TABLE support_tickets ADD COLUMN response TEXT NULL');
    console.log('Successfully added response column.');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('response column already exists.');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    process.exit();
  }
}

run();
