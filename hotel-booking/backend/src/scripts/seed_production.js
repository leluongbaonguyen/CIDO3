import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const hash123456 = '$2a$10$/jW71v.YymxUyJDUmrjdXOiGpKWZdVCLXyf8S9rrDrbWMQrj4e3H.'; // '123456'

const vnNames = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Chiến", "Phạm Minh Duy", "Hoàng Thu Giang",
  "Vũ Việt Hùng", "Phan Thanh Hà", "Đỗ Quang Hải", "Bùi Thị Hoa", "Ngô Xuân Huy",
  "Dương Hồng Hạnh", "Lý Gia Kiệt", "Võ Minh Khang", "Đặng Tuấn Lâm", "Đỗ Thị Mai",
  "Trịnh Văn Nam", "Nguyễn Thanh Ngân", "Phạm Hồng Phong", "Tống Gia Phúc", "Trần Minh Quân",
  "Lê Thu Sơn", "Nguyễn Hoài Thương", "Vũ Quốc Trung", "Phan Minh Trí", "Đinh Hữu Tài",
  "Nguyễn Ngọc Tú", "Vương Quốc Uy", "Lê Thị Vân", "Phạm Huy Vũ", "Bùi Hoàng Việt",
  "Nguyễn Tấn Đạt", "Trần Hữu Điền", "Phạm Văn Đông", "Lê Thị Hồng", "Hoàng Ngọc Khanh",
  "Phan Văn Lợi", "Nguyễn Mỹ Linh", "Vũ Hữu Nam", "Đỗ Xuân Trường", "Trần Kim Oanh",
  "Lê Văn Thắng", "Nguyễn Đình Trọng", "Trần Văn Vũ", "Phạm Minh Hoàng", "Đặng Thị Tuyết",
  "Nguyễn Huy Khánh", "Lê Thị Thu", "Vũ Văn Quyết", "Phan Thị Diễm", "Trần Văn Cường"
];

const provinces = [
  "Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Nha Trang", "Phú Quốc", "Hải Phòng",
  "Cần Thơ", "Huế", "Quảng Ninh", "Vũng Tàu", "Đà Lạt", "Sa Pa"
];

async function seed() {
  console.log('Connecting to database...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Nguyen@1904',
    database: process.env.DB_NAME || 'hotel_booking_db',
    multipleStatements: true
  });

  console.log('🚀 --- START REALISTIC PRODUCTION SEEDING --- 🚀');

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['audit_logs', 'reviews', 'payments', 'bookings', 'room_type_amenities', 'amenities', 'rooms', 'room_types', 'employees', 'customers', 'users'];
    for (const table of tables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Seed Core Admin and Staff Users
    console.log('Seeding core administrative accounts...');
    const [adminUser] = await connection.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin@xtravel.com', hash123456, 'Admin XTravel', '0901234567', 'ADMIN', 'ACTIVE']
    );

    const [staffUser] = await connection.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['staff@xtravel.com', hash123456, 'Staff Nguyen', '0901234568', 'STAFF', 'ACTIVE']
    );

    await connection.query(
      `INSERT INTO employees (user_id, position, salary, hire_date)
       VALUES (?, ?, ?, ?)`,
      [staffUser.insertId, 'Receptionist', 10500000.00, '2025-01-15']
    );

    // 2. Seed 50 realistic Vietnamese Customer Users & Profiles
    console.log('Seeding 50 real Vietnamese customer accounts...');
    const customerIds = [];
    for (let i = 0; i < 50; i++) {
      const name = vnNames[i];
      const normalizedEmail = `khachhang${i + 1}@gmail.com`;
      const phone = `09${Math.floor(10000000 + Math.random() * 89999999)}`;
      const identityNumber = `0${Math.floor(300000000000 + Math.random() * 699999999999)}`;
      const city = provinces[Math.floor(Math.random() * provinces.length)];
      const address = `${Math.floor(12 + Math.random() * 200)} Đường Lê Lợi, Quận Hải Châu, ${city}`;

      const [uRes] = await connection.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, status)
         VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')`,
        [normalizedEmail, hash123456, name, phone]
      );

      const [cRes] = await connection.query(
        `INSERT INTO customers (user_id, identity_number, address)
         VALUES (?, ?, ?)`,
        [uRes.insertId, identityNumber, address]
      );
      customerIds.push(cRes.insertId);
    }

    // 3. Seed Luxury Room Types
    console.log('Seeding luxury room types...');
    const roomTypesData = [
      {
        name: 'Standard Heritage',
        description: 'Hạng phòng cổ điển mang đậm thiết kế di sản văn hóa Việt Nam. Không gian ấm cúng, sang trọng, đầy đủ tiện nghi cao cấp.',
        base_price: 850000.00,
        max_occupancy: 2,
        photo_urls: ['/images/rooms/std-1.jpg', '/images/rooms/std-2.jpg']
      },
      {
        name: 'Deluxe Ocean View',
        description: 'Tầm nhìn panorama hướng thẳng ra đại dương bao la. Ban công đón gió biển cực chill, nội thất gỗ tự nhiên cao cấp.',
        base_price: 1800000.00,
        max_occupancy: 3,
        photo_urls: ['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg']
      },
      {
        name: 'Executive Suite',
        description: 'Biểu tượng của sự xa hoa đỉnh cao. Phòng khách biệt lập, quầy bar cá nhân, bồn tắm nằm đá cẩm thạch và quản gia phục vụ 24/7.',
        base_price: 3500000.00,
        max_occupancy: 4,
        photo_urls: ['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg']
      },
      {
        name: 'Grand Ocean Panorama',
        description: 'Sự kết hợp tuyệt mỹ giữa không gian mở kịch trần và thiên nhiên hoang sơ. Vách kính chịu lực cho tầm nhìn 360 độ ra vịnh biển xanh mát.',
        base_price: 2500000.00,
        max_occupancy: 3,
        photo_urls: ['/images/rooms/ocean-view.jpg', '/images/rooms/deluxe-2.jpg']
      },
      {
        name: 'Royal President Suite',
        description: 'Biệt thự hoàng gia với hồ bơi vô cực riêng biệt, phòng ăn lớn cho 8 khách, hầm rượu vang mini nhập khẩu và quản gia chuyên trách.',
        base_price: 15000000.00,
        max_occupancy: 6,
        photo_urls: ['/images/rooms/penthouse-1.jpg', '/images/rooms/suite-2.jpg']
      },
      {
        name: 'Garden Pool Villa',
        description: 'Biệt thự ẩn mình giữa khu vườn nhiệt đới xanh mướt. Có lối đi riêng ra bãi cát trắng, bể bơi tràn viền và sàn tắm nắng riêng tư.',
        base_price: 7500000.00,
        max_occupancy: 4,
        photo_urls: ['/images/rooms/pool-view.jpg', '/images/rooms/suite-1.jpg']
      },
      {
        name: 'Signature Penthouse',
        description: 'Căn hộ thông tầng siêu sang tọa lạc tại tầng thượng cao nhất. Tích hợp rạp chiếu phim gia đình, phòng xông hơi và bồn Jacuzzi ngoài trời.',
        base_price: 12000000.00,
        max_occupancy: 4,
        photo_urls: ['/images/rooms/penthouse-2.jpg', '/images/rooms/suite-2.jpg']
      },
      {
        name: 'Deluxe Pool Access',
        description: 'Tiện nghi đẳng cấp với ban công kết nối trực tiếp với dòng sông lười của resort. Chỉ một bước chân là bạn đã hòa mình vào làn nước xanh.',
        base_price: 2200000.00,
        max_occupancy: 2,
        photo_urls: ['/images/rooms/pool-view.jpg', '/images/rooms/deluxe-2.jpg']
      },
      {
        name: 'Family Oasis Suite',
        description: 'Không gian lý tưởng cho cả gia đình lớn. Gồm hai phòng ngủ Master biệt lập, khu vui chơi sắc màu cho bé và gian bếp ấm cúng tiện nghi.',
        base_price: 4800000.00,
        max_occupancy: 5,
        photo_urls: ['/images/rooms/std-2.jpg', '/images/rooms/deluxe-1.jpg']
      }
    ];

    const typeIds = [];
    for (const rt of roomTypesData) {
      const [rtRes] = await connection.query(
        `INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls)
         VALUES (?, ?, ?, ?, ?)`,
        [rt.name, rt.description, rt.base_price, rt.max_occupancy, JSON.stringify(rt.photo_urls)]
      );
      typeIds.push({ id: rtRes.insertId, price: rt.base_price });
    }

    // 4. Seed Amenities & Link to Room Types
    console.log('Seeding amenities and relationships...');
    const amenitiesData = [
      { name: 'Wifi Tốc Độ Cao', icon: 'fa-wifi', description: 'Đường truyền cáp quang băng thông rộng 1Gbps' },
      { name: 'Bể Bơi Vô Cực', icon: 'fa-swimming-pool', description: 'Quyền sử dụng hồ bơi nước ấm vô cực hướng biển' },
      { name: 'Ăn Sáng Buffet', icon: 'fa-utensils', description: 'Bữa sáng buffet chuẩn 5 sao quốc tế' },
      { name: 'Mini Bar Cao Cấp', icon: 'fa-cocktail', description: 'Đầy đủ rượu ngoại nhập khẩu và nước uống miễn phí' },
      { name: 'Phòng Spa Cao Cấp', icon: 'fa-spa', description: 'Liệu trình massage thư giãn bằng tinh dầu thảo mộc' }
    ];

    const amenityIds = [];
    for (const am of amenitiesData) {
      const [amRes] = await connection.query(
        `INSERT INTO amenities (name, icon, description)
         VALUES (?, ?, ?)`,
        [am.name, am.icon, am.description]
      );
      amenityIds.push(amRes.insertId);
    }

    // Link amenities to room types
    for (const type of typeIds) {
      await connection.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)`, [type.id, amenityIds[0]]);
      await connection.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)`, [type.id, amenityIds[2]]);
      if (type.price > 1000000) {
        await connection.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)`, [type.id, amenityIds[1]]);
        await connection.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)`, [type.id, amenityIds[3]]);
        await connection.query(`INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)`, [type.id, amenityIds[4]]);
      }
    }

    // 5. Seed 30 Rooms
    console.log('Seeding 30 real Rooms across 3 floors...');
    const rooms = [];
    for (let floor = 1; floor <= 3; floor++) {
      for (let roomIndex = 1; roomIndex <= 10; roomIndex++) {
        const roomNumber = `${floor}${roomIndex < 10 ? '0' + roomIndex : roomIndex}`;
        let typeId = typeIds[0].id; // Standard by default
        let status = 'AVAILABLE';
        if (floor === 2) typeId = typeIds[1].id; // Deluxe
        if (floor === 3) typeId = typeIds[2].id; // Suite

        if (roomNumber === '105' || roomNumber === '208') status = 'CLEANING';
        if (['102', '106', '202', '205', '207', '302', '304', '307', '309'].includes(roomNumber)) status = 'OCCUPIED';
        if (roomNumber === '305' || roomNumber === '109') status = 'MAINTENANCE';

        const [rRes] = await connection.query(
          `INSERT INTO rooms (room_number, floor, room_type_id, status)
           VALUES (?, ?, ?, ?)`,
          [roomNumber, floor, typeId, status]
        );

        rooms.push({
          id: rRes.insertId,
          roomNumber,
          typeId,
          price: floor === 1 ? typeIds[0].price : (floor === 2 ? typeIds[1].price : typeIds[2].price)
        });
      }
    }

    // 6. Seed 120 Historical, Live and Future Bookings
    console.log('Generating 120 high-fidelity bookings & financial records...');
    const bookingStatuses = ['COMPLETED', 'CONFIRMED', 'PENDING', 'CANCELLED'];
    const paymentMethods = ['VNPAY', 'CASH'];

    for (let i = 1; i <= 120; i++) {
      const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
      const room = rooms[Math.floor(Math.random() * rooms.length)];
      const isHistorical = i <= 95;

      let checkIn = new Date();
      let checkOut = new Date();
      let status = 'CONFIRMED';

      if (isHistorical) {
        const dateOffset = Math.floor(Math.random() * 150) + 10;
        checkIn.setDate(checkIn.getDate() - dateOffset);
        checkOut.setDate(checkIn.getDate() + Math.floor(1 + Math.random() * 4));
        status = 'COMPLETED';
      } else {
        const dateOffset = Math.floor(Math.random() * 30) - 5;
        checkIn.setDate(checkIn.getDate() + dateOffset);
        checkOut.setDate(checkIn.getDate() + Math.floor(1 + Math.random() * 4));

        if (dateOffset < 0) {
          status = 'CHECKED_IN';
        } else if (i % 8 === 0) {
          status = 'PENDING';
        } else if (i % 12 === 0) {
          status = 'CANCELLED';
        } else {
          status = 'CONFIRMED';
        }
      }

      const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
      const totalAmount = room.price * totalNights;
      const bookingCode = `BK${checkIn.getFullYear()}${(checkIn.getMonth() + 1).toString().padStart(2, '0')}${checkIn.getDate().toString().padStart(2, '0')}${i.toString().padStart(4, '0')}`;
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const [bRes] = await connection.query(
        `INSERT INTO bookings (booking_code, customer_id, room_id, check_in_date, check_out_date, adults, children, total_guests, total_amount, status, payment_method, note, created_at)
         VALUES (?, ?, ?, ?, ?, 2, 0, 2, ?, ?, ?, ?, ?)`,
        [
          bookingCode,
          customerId,
          room.id,
          checkIn.toISOString().split('T')[0],
          checkOut.toISOString().split('T')[0],
          totalAmount,
          status,
          method,
          `Khách hàng yêu cầu check-in sớm nếu phòng sẵn sàng.`,
          checkIn
        ]
      );

      const bookingId = bRes.insertId;

      // Seed Payments
      if (status === 'COMPLETED' || status === 'CHECKED_IN' || (status === 'CONFIRMED' && Math.random() > 0.3)) {
        await connection.query(
          `INSERT INTO payments (booking_id, amount, method, status, transaction_code, paid_at)
           VALUES (?, ?, ?, 'SUCCESS', ?, ?)`,
          [
            bookingId,
            totalAmount,
            method,
            `TXN-${bookingCode}`,
            checkIn
          ]
        );
      } else if (status === 'PENDING') {
        await connection.query(
          `INSERT INTO payments (booking_id, amount, method, status, transaction_code, paid_at)
           VALUES (?, ?, ?, 'PENDING', NULL, NULL)`,
          [
            bookingId,
            totalAmount,
            method
          ]
        );
      }

      // Seed Reviews for completed bookings
      if (status === 'COMPLETED' && Math.random() > 0.4) {
        const ratings = [4, 5, 5, 4, 3, 5];
        const rating = ratings[Math.floor(Math.random() * ratings.length)];
        const comments = [
          "Trải nghiệm tuyệt vời! Phòng ốc cực kỳ sạch sẽ, view đại dương tuyệt đẹp.",
          "Dịch vụ xuất sắc, nhân viên thân thiện và nhiệt tình hỗ trợ check-in sớm.",
          "Kỳ nghỉ dưỡng tuyệt vời cho gia đình tôi. Hồ bơi nước ấm siêu đẹp.",
          "Chất lượng dịch vụ hoàn hảo, ăn sáng rất ngon và đa dạng món.",
          "Không gian yên tĩnh, thư thái. Rất thích hợp để nghỉ dưỡng tái tạo năng lượng.",
          "Rất hài lòng về phòng nghỉ Heritage. Sẽ quay lại vào lần sau!"
        ];
        const comment = comments[Math.floor(Math.random() * comments.length)];

        await connection.query(
          `INSERT INTO reviews (booking_id, customer_id, rating, comment)
           VALUES (?, ?, ?, ?)`,
          [bookingId, customerId, rating, comment]
        );
      }
    }

    console.log('✅ --- ENHANCED REALISTIC SEEDING COMPLETED SUCCESSFULLY --- ✅');
  } catch (err) {
    console.error('❌ Error during enhanced seeding:', err);
  } finally {
    await connection.end();
  }
}

seed();
