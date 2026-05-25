import { pool } from '../src/config/db.js';

async function run() {
  try {
    console.log('🔄 Đang đồng bộ hóa room_id giữa bảng bookings và booking_items...');
    
    // Thực hiện truy vấn JOIN cập nhật room_id trong bookings bằng room_id trong booking_items
    const [res] = await pool.query(`
      UPDATE bookings b
      JOIN booking_items bi ON bi.booking_id = b.id
      SET b.room_id = bi.room_id
    `);
    
    console.log(`Đồng bộ thành công! Số dòng bị ảnh hưởng: ${res.affectedRows}`);
  } catch (error) {
    console.error('❌ Lỗi đồng bộ:', error);
  } finally {
    process.exit();
  }
}
run();
