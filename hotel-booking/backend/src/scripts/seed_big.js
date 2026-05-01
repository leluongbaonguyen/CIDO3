import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const setupConn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Nguyen@1904',
    multipleStatements: true
  });
  
  console.log('--- INITIALIZING DATABASE SCHEMA ---');
  const schemaPath = path.join(__dirname, '../sql/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await setupConn.query(schemaSql);
  await setupConn.end();

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Nguyen@1904',
    database: 'hotel_booking_db'
  });

  console.log('--- START SEEDING BIG DATA ---');

  try {
    // 1. Clear existing data (Careful! This is for seeding fresh)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE booking_items');
    await connection.query('TRUNCATE TABLE bookings');
    await connection.query('TRUNCATE TABLE maintenance_records');
    await connection.query('TRUNCATE TABLE rooms');
    await connection.query('TRUNCATE TABLE room_types');
    await connection.query('TRUNCATE TABLE customers');
    await connection.query('TRUNCATE TABLE employees');
    await connection.query('TRUNCATE TABLE users');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 2. Seed Room Types
    console.log('Seeding Room Types...');
    const roomTypes = [
      ['Standard Room', 'Phòng tiêu chuẩn tiện nghi, tối ưu cho khách công tác.', 850000, 2, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
      ['Deluxe Ocean View', 'Tầm nhìn tuyệt đẹp ra biển Mỹ Khê, ban công rộng rãi.', 1800000, 2, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
      ['Executive Suite', 'Không gian sang trọng với phòng khách riêng biệt.', 3500000, 3, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
      ['Family Villa', 'Villa nguyên căn với hồ bơi riêng, phù hợp cho cả gia đình.', 7500000, 6, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
      ['Presidential Penthouse', 'Đỉnh cao của sự xa hoa, tọa lạc tại tầng cao nhất.', 15000000, 4, 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800']
    ];

    const typeIds = [];
    for (const type of roomTypes) {
      const [result] = await connection.query(
        'INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls) VALUES (?, ?, ?, ?, ?)',
        type
      );
      typeIds.push(result.insertId);
    }

    // 3. Seed 200 Rooms
    console.log('Seeding 200 Rooms...');
    const roomEntries = [];
    for (let i = 1; i <= 200; i++) {
      const floor = Math.floor((i - 1) / 20) + 1;
      const roomNum = floor * 100 + (i % 20 === 0 ? 20 : i % 20);
      const typeId = typeIds[Math.floor(Math.random() * typeIds.length)];
      roomEntries.push([roomNum.toString(), floor, 'AVAILABLE', '', typeId]);
    }
    await connection.query(
      'INSERT INTO rooms (room_number, floor, status, notes, room_type_id) VALUES ?',
      [roomEntries]
    );

    // 4. Seed 100 Customers
    console.log('Seeding 100 Customers...');
    for (let i = 1; i <= 100; i++) {
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [`customer${i}@example.com`, hashedPassword, `Customer`, `Name ${i}`, `090${1000000 + i}`, 'CUSTOMER']
      );
      const userId = userResult.insertId;
      await connection.query(
        'INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, ?, ?)',
        [userId, `${i} Le Loi St`, 'Da Nang', 'Vietnam', `ID${2000000 + i}`]
      );
    }

    // 5. Seed 20 Employees
    console.log('Seeding 20 Employees...');
    const depts = ['Reception', 'Accounting', 'Management', 'Other'];
    for (let i = 1; i <= 20; i++) {
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [`staff${i}@example.com`, hashedPassword, `Staff`, `Member ${i}`, `080${1000000 + i}`, 'EMPLOYEE']
      );
      const userId = userResult.insertId;
      await connection.query(
        'INSERT INTO employees (user_id, position, department, hire_date) VALUES (?, ?, ?, ?)',
        [userId, 'Staff', depts[i % 4], new Date()]
      );
    }

    // 6. Seed 1 Admin
    console.log('Seeding Admin...');
    await connection.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@xtravel.com', hashedPassword, 'Admin', 'XTravel', '000000000', 'ADMIN']
    );

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    await connection.end();
  }
}

seed();
