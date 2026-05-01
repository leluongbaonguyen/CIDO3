import { pool } from './config/db.js';

const test = async () => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('✅ Kết nối DB thành công, kết quả:', rows[0].result);
    } catch (error) {
        console.error('❌ Lỗi kết nối DB:', error.message);
        console.log('Mẹo: Kiểm tra DB_PASSWORD trong file .env');
    } finally {
        process.exit();
    }
};

test();
