import { pool } from '../src/config/db.js';

async function run() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    console.log('🚀 Đang bắt đầu quá trình phân phối 200 phòng...');

    // 1. Lấy tất cả loại phòng
    const [roomTypes] = await connection.query('SELECT id, name FROM room_types ORDER BY id ASC');
    const numTypes = roomTypes.length;
    console.log(`Tìm thấy ${numTypes} loại phòng.`);

    // Tính toán số phòng mỗi loại: 200 phòng / 9 loại = 22 phòng/loại, dư 2 phòng cộng vào các loại cuối
    const targetRoomsPerType = {};
    let totalAssigned = 0;
    roomTypes.forEach((type, idx) => {
      // 7 loại đầu 22 phòng, 2 loại cuối 23 phòng
      const count = idx < 7 ? 22 : 23;
      targetRoomsPerType[type.id] = count;
      totalAssigned += count;
    });

    console.log('Phân bổ chỉ tiêu mỗi loại phòng:', targetRoomsPerType);
    console.log(`Tổng phân bổ: ${totalAssigned} phòng.`);

    // 2. Vô hiệu hóa tạm thời check khóa ngoại để xóa phòng cũ an toàn
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE rooms');
    console.log('Đã dọn dẹp sạch bảng rooms cũ.');

    // 3. Khởi tạo 200 phòng mới với số phòng và tầng đẹp mắt
    const newRoomIds = [];
    let roomIndex = 1;

    for (const type of roomTypes) {
      const countToCreate = targetRoomsPerType[type.id];
      console.log(`Đang tạo ${countToCreate} phòng cho loại phòng: ${type.name} (ID: ${type.id})...`);
      
      for (let i = 0; i < countToCreate; i++) {
        // Chia đều 200 phòng vào 5 tầng (mỗi tầng 40 phòng)
        const floor = Math.ceil(roomIndex / 40);
        const sequenceInFloor = (roomIndex - 1) % 40 + 1;
        const roomNumber = `${floor}${sequenceInFloor.toString().padStart(2, '0')}`;

        const [res] = await connection.query(
          'INSERT INTO rooms (room_number, floor, status, room_type_id) VALUES (?, ?, ?, ?)',
          [roomNumber, floor, 'AVAILABLE', type.id]
        );
        newRoomIds.push(res.insertId);
        roomIndex++;
      }
    }

    console.log(`Đã tạo xong ${newRoomIds.length} phòng mới.`);

    // 4. Cập nhật các liên kết trong booking_items để trỏ về các phòng mới ngẫu nhiên (tránh lỗi khóa ngoại)
    console.log('Đang liên kết lại booking_items với các phòng mới...');
    const [bookingItems] = await connection.query('SELECT id FROM booking_items');
    for (const item of bookingItems) {
      const randomNewRoomId = newRoomIds[Math.floor(Math.random() * newRoomIds.length)];
      await connection.query('UPDATE booking_items SET room_id = ? WHERE id = ?', [randomNewRoomId, item.id]);
    }
    console.log(`Đã liên kết lại ${bookingItems.length} chi tiết đặt phòng.`);

    // 5. Kích hoạt lại check khóa ngoại
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    await connection.commit();
    console.log('✅ HOÀN TẤT THÀNH CÔNG! Đã tạo và phân bổ 200 phòng đều cho 9 loại phòng.');
  } catch (error) {
    await connection.rollback();
    console.error('❌ LỖI KHI TẠO PHÒNG:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

run();
