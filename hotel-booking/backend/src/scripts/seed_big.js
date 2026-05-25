import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: 'Nguyen@1904',
    database: 'hotel_booking_db',
    multipleStatements: true
  });

  console.log('🚀 --- START ENHANCED SEEDING --- 🚀');

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Adjust schema for luxury prices
    await connection.query("ALTER TABLE bookings MODIFY total_amount DECIMAL(15,2)");
    await connection.query("ALTER TABLE booking_items MODIFY price DECIMAL(15,2)");
    await connection.query("ALTER TABLE payments MODIFY amount DECIMAL(15,2)");
    await connection.query("ALTER TABLE room_types MODIFY base_price DECIMAL(15,2)");

    const tables = ['payments', 'booking_items', 'bookings', 'maintenance_records', 'rooms', 'room_type_amenities', 'amenities', 'room_types', 'customers', 'employees', 'users'];
    for (const table of tables) await connection.query(`TRUNCATE TABLE ${table}`);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Seed Amenities
    console.log('Seeding Amenities...');
    const amenityList = [
      ['Wifi Siêu Tốc', 'High-speed Wifi', 'fa-wifi'],
      ['Hồ bơi riêng', 'Private Pool', 'fa-swimming-pool'],
      ['Ăn sáng Michelin', 'Michelin Breakfast', 'fa-utensils'],
      ['Phòng Gym 24/7', 'Pro Fitness Gym', 'fa-dumbbell'],
      ['Spa Trị Liệu', 'Luxury Spa & Wellness', 'fa-spa'],
      ['Mini Bar Cao Cấp', 'Premium Mini Bar', 'fa-cocktail'],
      ['View Biển Panorama', 'Ocean View', 'fa-mountain'],
      ['Bồn tắm Jacuzzi', 'Jacuzzi Bath', 'fa-bath'],
      ['Dịch vụ Quản gia', 'Personal Butler', 'fa-concierge-bell']
    ];
    const amenityIds = [];
    for (const [name, desc, icon] of amenityList) {
      const [res] = await connection.query("INSERT INTO amenities (name, description, icon) VALUES (?, ?, ?)", [name, desc, icon]);
      amenityIds.push(res.insertId);
    }

    // 2. Seed Room Types
    console.log('Seeding Room Types...');
    const roomTypesData = [
      ['Standard Heritage', 'Phòng tiêu chuẩn với thiết kế cổ điển, đầy đủ tiện nghi.', 850000, 2, '/images/img_76b5d3d850.jpg'],
      ['Deluxe Ocean View', 'Tầm nhìn tuyệt đẹp ra biển Mỹ Khê, ban công rộng rãi.', 1800000, 2, '/images/img_2de9b7b582.jpg'],
      ['Executive Suite', 'Không gian sang trọng với phòng khách riêng biệt.', 3500000, 3, '/images/img_bb9c76ea50.jpg'],
      ['Family Luxury Villa', 'Villa nguyên căn với hồ bơi riêng, phù hợp cho gia đình.', 8500000, 6, '/images/img_01433d0418.jpg'],
      ['Presidential Penthouse', 'Đỉnh cao của sự xa hoa tại tầng cao nhất.', 25000000, 4, '/images/img_edcdf83a2f.jpg']
    ];

    const typeIds = [];
    for (const type of roomTypesData) {
      const [result] = await connection.query(
        'INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls) VALUES (?, ?, ?, ?, ?)',
        type
      );
      const typeId = result.insertId;
      typeIds.push(typeId);

      // Map random amenities to room types
      const randomAmenities = amenityIds.sort(() => 0.5 - Math.random()).slice(0, 5);
      for (const aId of randomAmenities) {
        await connection.query("INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)", [typeId, aId]);
      }
    }

    // 3. Seed 100 Rooms
    console.log('Seeding 100 Rooms...');
    const roomIds = [];
    for (let i = 1; i <= 100; i++) {
      const floor = Math.floor((i - 1) / 10) + 1;
      const roomNum = floor * 100 + (i % 10 === 0 ? 10 : i % 10);
      const typeId = typeIds[Math.floor((i - 1) / 20)]; // Grouped by type
      const [res] = await connection.query(
        'INSERT INTO rooms (room_number, floor, status, notes, room_type_id) VALUES (?, ?, ?, ?, ?)',
        [roomNum.toString(), floor, 'AVAILABLE', 'Cleaned and ready', typeId]
      );
      roomIds.push({ id: res.insertId, typeId, price: roomTypesData[Math.floor((i - 1) / 20)][2] });
    }

    // 4. Seed Users & Customers
    console.log('Seeding Users & Customers...');
    const customerIds = [];
    for (let i = 1; i <= 50; i++) {
      const [userResult] = await connection.query(
        'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
        [`customer${i}@bookingx.com`, hashedPassword, `Customer`, `${i}`, `090${1000000 + i}`, 'CUSTOMER']
      );
      const userId = userResult.insertId;
      const [cusResult] = await connection.query(
        'INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, ?, ?)',
        [userId, `${i} Luxury Ave`, 'Da Nang', 'Vietnam', `ID${2000000 + i}`]
      );
      customerIds.push(cusResult.insertId);
    }

    // 5. Seed Admin & Staff
    console.log('Seeding Staff...');
    await connection.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['admin@bookingx.com', hashedPassword, 'Admin', 'BookingX', '000000000', 'ADMIN']
    );
    await connection.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      ['staff1@bookingx.com', hashedPassword, 'Staff', 'One', '011111111', 'EMPLOYEE']
    );

    // 6. Seed 150 Historical Bookings (Last 6 Months)
    console.log('Seeding 150 Historical Bookings...');
    for (let i = 1; i <= 150; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const room = roomIds[Math.floor(Math.random() * roomIds.length)];
      
      const dateOffset = Math.floor(Math.random() * 180) - 170; // From 170 days ago
      const checkin = new Date();
      checkin.setDate(checkin.getDate() + dateOffset);
      const checkout = new Date(checkin);
      checkout.setDate(checkout.getDate() + Math.floor(Math.random() * 4) + 1);

      const status = dateOffset < 0 ? 'COMPLETED' : 'CONFIRMED';
      const totalAmount = room.price * Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

      const [bRes] = await connection.query(
        "INSERT INTO bookings (customer_id, checkin_date, checkout_date, total_amount, status, create_date, booking_date, total_guests) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [customerId, checkin, checkout, totalAmount, status, checkin, checkin, 2]
      );

      await connection.query(
        "INSERT INTO booking_items (booking_id, room_id, price, quantity) VALUES (?, ?, ?, ?)",
        [bRes.insertId, room.id, room.price, 1]
      );

      if (status === 'COMPLETED') {
        await connection.query(
          "INSERT INTO payments (booking_id, amount, payment_method, status, payment_date, transaction_id) VALUES (?, ?, ?, ?, ?, ?)",
          [bRes.insertId, totalAmount, 'VNPAY', 'SUCCESS', checkin, `TXN-SEED-${i}-${Date.now()}`]
        );
      }
    }

    console.log('✅ --- ENHANCED SEEDING COMPLETED --- ✅');
  } catch (err) {
    console.error('❌ Error seeding data:', err);
  } finally {
    await connection.end();
  }
}

seed();
