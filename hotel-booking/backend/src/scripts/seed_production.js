import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Nguyen@1904',
    database: process.env.DB_NAME || 'hotel_booking_db',
    multipleStatements: true
  });

  console.log('🌟 --- PHỤC HỒI VÀ KHỞI TẠO DỮ LIỆU HỆ THỐNG --- 🌟');

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    const tables = [
      'payments', 'booking_items', 'bookings', 'maintenance_records', 
      'rooms', 'room_type_amenities', 'amenities', 'room_types', 
      'customers', 'employee_roles', 'employees', 'users', 'roles'
    ];
    
    for (const table of tables) {
      try {
        await connection.query(`TRUNCATE TABLE ${table}`);
      } catch (e) {
        console.log(`Bỏ qua bảng ${table} nếu không tồn tại.`);
      }
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 1. Khởi tạo Roles
    console.log('1. Đang khởi tạo vai trò hệ thống...');
    await connection.query("INSERT INTO roles (name, permissions) VALUES ('ADMIN', '{\"all\": true}'), ('STAFF', '{\"bookings\": true, \"rooms\": true}'), ('CUSTOMER', '{\"profile\": true, \"my_bookings\": true}')");
    const [roles] = await connection.query("SELECT id, name FROM roles");
    const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.name]: r.id }), {});

    // 2. Khởi tạo Amenities (Tiện ích)
    console.log('2. Đang tạo danh sách tiện ích...');
    const amenities = [
      ['Wifi Tốc Độ Cao', 'Free high-speed internet', 'wifi'],
      ['Hồ Bơi Vô Cực', 'Infinity swimming pool', 'pool'],
      ['Buffet Sáng', 'Daily breakfast buffet', 'breakfast'],
      ['Phòng Gym', 'Modern fitness center', 'fitness_center'],
      ['Dịch Vụ Spa', 'Luxury spa and wellness', 'spa'],
      ['Mini Bar', 'In-room mini bar service', 'local_bar'],
      ['Điều Hòa Trung Tâm', 'Central air conditioning', 'ac_unit'],
      ['Smart TV 4K', '55-inch Smart TV', 'tv'],
      ['Bồn Tắm Jacuzzi', 'Luxury Jacuzzi bath', 'hot_tub'],
      ['Dịch Vụ Quản Gia', 'Private butler service', 'person']
    ];
    const amenityIds = [];
    for (const [name, desc, icon] of amenities) {
      const [res] = await connection.query("INSERT INTO amenities (name, description, icon) VALUES (?, ?, ?)", [name, desc, icon]);
      amenityIds.push(res.insertId);
    }

    // 3. Khởi tạo Room Types (Loại phòng) với hình ảnh Local
    console.log('3. Đang thiết lập các loại phòng với hình ảnh Local...');
    const roomTypes = [
      [
        'Superior City View', 
        'Phòng tiêu chuẩn với tầm nhìn thành phố sôi động, thiết kế hiện đại và tinh tế.', 
        1200000, 2, 
        JSON.stringify(['/images/rooms/std-1.jpg', '/images/rooms/std-2.jpg'])
      ],
      [
        'Deluxe Ocean Front', 
        'Không gian sang trọng trực diện biển Mỹ Khê với ban công riêng và nội thất cao cấp.', 
        2500000, 2, 
        JSON.stringify(['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg'])
      ],
      [
        'Grand Suite Family', 
        'Căn hộ 2 phòng ngủ cao cấp dành cho gia đình, không gian rộng rãi và đầy đủ tiện nghi.', 
        4800000, 4, 
        JSON.stringify(['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg'])
      ],
      [
        'Royal Penthouse', 
        'Đỉnh cao xa hoa với hồ bơi riêng, phòng khách và dịch vụ quản gia riêng biệt 24/7.', 
        15000000, 4, 
        JSON.stringify(['/images/rooms/penthouse-1.jpg', '/images/rooms/pool-view.jpg'])
      ]
    ];
    const typeIds = [];
    for (let i = 0; i < roomTypes.length; i++) {
      const [res] = await connection.query(
        "INSERT INTO room_types (name, description, base_price, max_occupancy, photo_urls) VALUES (?, ?, ?, ?, ?)",
        roomTypes[i]
      );
      typeIds.push(res.insertId);
      // Gán tiện ích cho từng loại phòng
      const sliceSize = i === 0 ? 3 : (i === 1 ? 5 : (i === 2 ? 8 : 10));
      const roomAmenities = amenityIds.slice(0, sliceSize);
      for (const aId of roomAmenities) {
        await connection.query("INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)", [res.insertId, aId]);
      }
    }

    // 4. Khởi tạo 150 Phòng và ảnh chi tiết cho từng phòng
    console.log('4. Đang tạo dữ liệu 150 phòng và hình ảnh chi tiết...');
    const roomImagesPool = {
      [typeIds[0]]: ['/images/rooms/std-1.jpg', '/images/rooms/std-2.jpg', '/images/rooms/ocean-view.jpg'],
      [typeIds[1]]: ['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg', '/images/rooms/ocean-view.jpg'],
      [typeIds[2]]: ['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg', '/images/rooms/pool-view.jpg'],
      [typeIds[3]]: ['/images/rooms/penthouse-1.jpg', '/images/rooms/pool-view.jpg', '/images/rooms/ocean-view.jpg']
    };

    let roomCount = 0;
    for (let floor = 2; floor <= 10; floor++) {
      let roomsOnFloor = 0;
      let typeId = 0;
      if (floor <= 6) { roomsOnFloor = 20; typeId = typeIds[0]; }
      else if (floor <= 8) { roomsOnFloor = 15; typeId = typeIds[1]; }
      else if (floor === 9) { roomsOnFloor = 15; typeId = typeIds[2]; }
      else if (floor === 10) { roomsOnFloor = 5; typeId = typeIds[3]; }

      for (let r = 1; r <= roomsOnFloor; r++) {
        const roomNum = `${floor}${r.toString().padStart(2, '0')}`;
        const [rRes] = await connection.query(
          "INSERT INTO rooms (room_number, floor, status, notes, room_type_id) VALUES (?, ?, 'AVAILABLE', 'Ready for guest', ?)",
          [roomNum, floor, typeId]
        );
        const roomId = rRes.insertId;
        
        // Thêm ảnh vào bảng room_images cho từng phòng
        const images = roomImagesPool[typeId];
        for (const imgPath of images) {
          await connection.query("INSERT INTO room_images (room_id, image_url) VALUES (?, ?)", [roomId, imgPath]);
        }
        
        roomCount++;
      }
    }
    console.log(`   - Đã tạo thành công ${roomCount} phòng với ảnh chi tiết.`);

    // 5. Khởi tạo 1 ADMIN với Avatar Local
    console.log('5. Đang tạo tài khoản Quản trị viên...');
    const [adminRes] = await connection.query(
      "INSERT INTO users (email, password, first_name, last_name, phone, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        'admin@luxuryhotel.vn', 
        hashedPassword, 
        'Huy', 'Nguyễn Quang', 
        '0905123456', 
        'ADMIN', 
        '/images/avatars/admin.jpg'
      ]
    );
    await connection.query(
      "INSERT INTO employees (user_id, position, department, hire_date) VALUES (?, ?, ?, ?)",
      [adminRes.insertId, 'Tổng Giám Đốc', 'Management', new Date()]
    );

    // 6. Khởi tạo 20 NHÂN VIÊN với Avatar Local
    console.log('6. Đang tạo dữ liệu 20 nhân viên với hình ảnh Local...');
    const staffData = [
      ['Nguyễn Văn An', 'Reception', 'Lễ tân', 'staff-m.jpg'],
      ['Trần Thị Bình', 'Reception', 'Lễ tân', 'staff-f.jpg'],
      ['Lê Văn Cường', 'Reception', 'Lễ tân', 'staff-m.jpg'],
      ['Phạm Thị Dung', 'Reception', 'Trưởng ca Lễ tân', 'staff-f.jpg'],
      ['Hoàng Văn Em', 'Accounting', 'Kế toán trưởng', 'staff-m.jpg'],
      ['Võ Thị Phương', 'Accounting', 'Kế toán tổng hợp', 'staff-f.jpg'],
      ['Đặng Văn Giang', 'Accounting', 'Kế toán nội bộ', 'staff-m.jpg'],
      ['Bùi Thị Hạnh', 'Management', 'Trợ lý Giám đốc', 'staff-f.jpg'],
      ['Đỗ Văn Hùng', 'Other', 'Bảo vệ trưởng', 'staff-m.jpg'],
      ['Ngô Thị Lan', 'Other', 'Trưởng bộ phận Buồng phòng', 'staff-f.jpg'],
      ['Lý Văn Minh', 'Other', 'Nhân viên Kỹ thuật', 'staff-m.jpg'],
      ['Chu Thị Nga', 'Other', 'Nhân viên Buồng phòng', 'staff-f.jpg'],
      ['Phan Văn Phúc', 'Other', 'Nhân viên Bellboy', 'staff-m.jpg'],
      ['Tạ Thị Quỳnh', 'Other', 'Nhân viên Spa', 'staff-f.jpg'],
      ['Hà Văn Sơn', 'Other', 'Đầu bếp trưởng', 'staff-m.jpg'],
      ['Lương Thị Tươi', 'Other', 'Nhân viên Nhà hàng', 'staff-f.jpg'],
      ['Trương Văn Uy', 'Other', 'Bảo vệ', 'staff-m.jpg'],
      ['Vũ Thị Vân', 'Other', 'Nhân viên Vệ sinh', 'staff-f.jpg'],
      ['Diệp Văn Xinh', 'Other', 'Nhân viên Cảnh quan', 'staff-m.jpg'],
      ['Mai Thị Yến', 'Other', 'Nhân viên CSKH', 'staff-f.jpg']
    ];

    for (let i = 0; i < staffData.length; i++) {
      const [name, dept, pos, avatarFile] = staffData[i];
      const names = name.split(' ');
      const firstName = names[names.length - 1];
      const lastName = names.slice(0, names.length - 1).join(' ');
      const email = `staff${i + 1}@luxuryhotel.vn`;
      
      const [uRes] = await connection.query(
        "INSERT INTO users (email, password, first_name, last_name, phone, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          email, 
          hashedPassword, 
          firstName, lastName, 
          `09120000${(i + 1).toString().padStart(2, '0')}`, 
          'EMPLOYEE', 
          `/images/avatars/${avatarFile}`
        ]
      );
      
      await connection.query(
        "INSERT INTO employees (user_id, position, department, hire_date) VALUES (?, ?, ?, ?)",
        [uRes.insertId, pos, dept, new Date()]
      );
    }

    // 7. Thêm dữ liệu bổ sung để hệ thống trông thật hơn (Khách hàng & Booking mẫu)
    console.log('7. Đang tạo dữ liệu khách hàng và lịch sử đặt phòng...');
    
    // Tạo 1 khách hàng cố định cho Quick Login
    const [fixedCust] = await connection.query(
      "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
      ['customer1@luxuryhotel.vn', hashedPassword, 'Guest', 'BookingX', 'CUSTOMER']
    );
    await connection.query(
      "INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, 'Vietnam', ?)",
      [fixedCust.insertId, '123 Luxury Way', 'Da Nang', '123456789']
    );

    const customers = [
      ['Nguyễn Thành Long', 'Hà Nội', '001090123456'],
      ['Trần Bảo Ngọc', 'TP Hồ Chí Minh', '079090987654'],
      ['Lê Minh Triết', 'Đà Nẵng', '048090112233'],
      ['Phạm Thu Hà', 'Cần Thơ', '092090445566'],
      ['Hoàng Quốc Khánh', 'Hải Phòng', '031090778899']
    ];

    for (const [name, city, idNum] of customers) {
      const names = name.split(' ');
      const firstName = names[names.length - 1];
      const lastName = names.slice(0, names.length - 1).join(' ');
      
      const [uRes] = await connection.query(
        "INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)",
        [`${firstName.toLowerCase()}.${Date.now()}@gmail.com`, hashedPassword, firstName, lastName, 'CUSTOMER']
      );
      
      await connection.query(
        "INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, 'Vietnam', ?)",
        [uRes.insertId, `Đường số ${Math.floor(Math.random() * 100)}`, city, idNum]
      );
    }

    // 8. Tạo dữ liệu Đơn đặt phòng mẫu
    console.log('8. Đang tạo các đơn đặt phòng mẫu để hiển thị Dashboard...');
    const [allCustomers] = await connection.query("SELECT id FROM customers");
    const [allRooms] = await connection.query("SELECT r.id, rt.base_price FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id LIMIT 10");
    
    for (let i = 0; i < 12; i++) {
        const cust = allCustomers[i % allCustomers.length];
        const room = allRooms[i % allRooms.length];
        const status = i < 4 ? 'COMPLETED' : (i < 9 ? 'CONFIRMED' : 'PENDING');
        
        const checkin = new Date();
        checkin.setDate(checkin.getDate() + (i - 6) * 4); // Trải dài từ quá khứ đến tương lai
        const checkout = new Date(checkin);
        checkout.setDate(checkout.getDate() + Math.floor(Math.random() * 3) + 1);
        
        const nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        const total = Number(room.base_price) * nights;
        
        const [bRes] = await connection.query(
            `INSERT INTO bookings (booking_date, checkin_date, checkout_date, total_guests, status, total_amount, customer_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [new Date(checkin.getTime() - 86400000 * 5), checkin, checkout, 2, status, total, cust.id]
        );
        
        await connection.query(
            "INSERT INTO booking_items (booking_id, room_id, price, quantity) VALUES (?, ?, ?, ?)",
            [bRes.insertId, room.id, room.base_price, 1]
        );

        if (status !== 'PENDING') {
            await connection.query(
                `INSERT INTO payments (booking_id, amount, payment_method, status, payment_date, transaction_id) 
                 VALUES (?, ?, 'TRANSFER', 'SUCCESS', ?, ?)`,
                [bRes.insertId, total, checkin, `TXN-${Date.now()}-${i}`]
            );
        }
    }

    console.log('✅ --- TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC KHỞI TẠO THÀNH CÔNG --- ✅');
    console.log('Thông tin đăng nhập Admin:');
    console.log('- Email: admin@luxuryhotel.vn');
    console.log('- Password: admin123');

  } catch (err) {
    console.error('❌ Lỗi trong quá trình tạo dữ liệu:', err);
  } finally {
    await connection.end();
  }
}

seed();
