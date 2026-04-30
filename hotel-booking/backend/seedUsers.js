import * as dotenv from 'dotenv';
dotenv.config();

import { pool } from './src/config/db.js';
import { hashPassword } from './src/utils/hash.js';

async function seed() {
  try {
    const adminEmail = 'admin@xtravel.com';
    const staffEmail = 'staff@xtravel.com';
    const customerEmail = 'customer@gmail.com';

    const adminHash = await hashPassword('admin123');
    const staffHash = await hashPassword('staff123');
    const customerHash = await hashPassword('customer123');

    // Admin
    await pool.query('INSERT IGNORE INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)', 
      [adminEmail, adminHash, 'Admin', 'System', 'ADMIN', 'ACTIVE']
    );

    // Staff
    await pool.query('INSERT IGNORE INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)', 
      [staffEmail, staffHash, 'Staff', '1', 'STAFF', 'ACTIVE']
    );

    // Customer
    await pool.query('INSERT IGNORE INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)', 
      [customerEmail, customerHash, 'Khách hàng', 'Test', 'CUSTOMER', 'ACTIVE']
    );

    console.log('Seed users successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed users failed:', error);
    process.exit(1);
  }
}

seed();
