import { pool } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runInsertAll = async () => {
    try {
        console.log('⏳ Đang nạp dữ liệu mẫu vào tất cả các bảng...');
        const sqlPath = path.join(__dirname, 'sql', 'insert_all.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // pool.query support multipleStatements: true (configured in db.js)
        await pool.query(sql);
        
        console.log('✅ Nạp dữ liệu thành công!');
    } catch (error) {
        console.error('❌ Nạp dữ liệu thất bại:', error.message);
    } finally {
        process.exit();
    }
};

runInsertAll();
