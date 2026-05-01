import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashPassword } from '../utils/hash.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedMaster() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        console.log('🌟 STARTING MASTER SEED PROCESS...');

        // 0. Ensure Support Table exists
        await connection.query(`
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255),
                email VARCHAR(255),
                subject VARCHAR(255),
                message TEXT,
                status ENUM('OPEN', 'CLOSED') DEFAULT 'OPEN',
                create_date DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 1. Clean data
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Check and add icon column to amenities if missing
        const [columns] = await connection.query("SHOW COLUMNS FROM amenities LIKE 'icon'");
        if (columns.length === 0) {
            await connection.query("ALTER TABLE amenities ADD COLUMN icon VARCHAR(255) NULL");
        }

        const tables = ['support_tickets', 'audit_logs', 'reviews', 'payments', 'booking_items', 'bookings', 'rooms', 'room_type_amenities', 'amenities', 'room_types', 'employees', 'customers', 'users', 'roles'];
        for (const table of tables) {
            console.log(`Truncating ${table}...`);
            await connection.query(`TRUNCATE TABLE ${table}`);
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. Roles
        console.log('Seeding Roles...');
        await connection.query("INSERT INTO roles (name, permissions) VALUES (?, ?), (?, ?), (?, ?)", [
            'ADMIN', JSON.stringify(['ALL']),
            'EMPLOYEE', JSON.stringify(['MANAGE_BOOKINGS', 'VIEW_ROOMS']),
            'CUSTOMER', JSON.stringify(['BOOK_ROOM', 'VIEW_PROFILE'])
        ]);

        const hashedPw = await hashPassword('password123');

        // 3. Users (Admin & Staff)
        console.log('Seeding Users (Staff)...');
        const [adminUser] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)", ['admin@xtravel.com', hashedPw, 'Bảo Nguyên', 'Lê', 'ADMIN', 'ACTIVE']);
        await connection.query("INSERT INTO employees (user_id, position, department, hire_date) VALUES (?, ?, ?, ?)", [adminUser.insertId, 'Tổng quản lý', 'Management', new Date()]);

        const staffData = [
            ['Thị Tuyết', 'Nguyễn', 'staff1@xtravel.com', 'Lễ tân trưởng', 'Reception'],
            ['Minh Khang', 'Trần', 'staff2@xtravel.com', 'Kế toán trưởng', 'Accounting'],
            ['Hồng Ngọc', 'Lê', 'staff3@xtravel.com', 'Quản lý buồng phòng', 'Other']
        ];
        for (const [fname, lname, email, pos, dept] of staffData) {
            const [u] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)", [email, hashedPw, fname, lname, 'EMPLOYEE', 'ACTIVE']);
            await connection.query("INSERT INTO employees (user_id, position, department, hire_date) VALUES (?, ?, ?, ?)", [u.insertId, pos, dept, new Date()]);
        }

        // 4. Customers
        console.log('Seeding Customers...');
        const customerIds = [];
        const customerData = [
            ['Thành Công', 'Trần', 'customer@gmail.com', '0905111222', 'Đà Nẵng'],
            ['Minh Anh', 'Nguyễn', 'minhanh@gmail.com', '0914333444', 'Hà Nội'],
            ['Hải Đăng', 'Lê', 'haidang@gmail.com', '0988555666', 'Sài Gòn'],
            ['Thanh Thảo', 'Vũ', 'thao@gmail.com', '0932777888', 'Huế'],
            ['Hoàng Nam', 'Phạm', 'nam@gmail.com', '0909999000', 'Cần Thơ']
        ];
        for (const [fname, lname, email, phone, city] of customerData) {
            const [u] = await connection.query("INSERT INTO users (email, password, first_name, last_name, role, status, phone) VALUES (?, ?, ?, ?, ?, ?, ?)", [email, hashedPw, fname, lname, 'CUSTOMER', 'ACTIVE', phone]);
            const [c] = await connection.query("INSERT INTO customers (user_id, address, city, country, id_number) VALUES (?, ?, ?, ?, ?)", [u.insertId, '123 Luxury St', city, 'Vietnam', `ID-${u.insertId}`]);
            customerIds.push(c.insertId);
        }

        // 5. Amenities
        console.log('Seeding Amenities...');
        const amenList = [['Hồ bơi riêng', 'fa-swimming-pool'], ['View Biển', 'fa-water'], ['Ban công', 'fa-door-open'], ['Bồn tắm Jacuzzi', 'fa-bath'], ['High-speed Wifi', 'fa-wifi'], ['Luxury Spa', 'fa-spa']];
        const amenIds = [];
        for (const [name, icon] of amenList) {
            const [res] = await connection.query("INSERT INTO amenities (name, icon, description) VALUES (?, ?, ?)", [name, icon, name]);
            amenIds.push(res.insertId);
        }

        // 6. Room Types
        console.log('Seeding Room Types...');
        const typeData = [
            ['Deluxe Collection', 1800000, 2, 'Heritage view, cozy design', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6'],
            ['Executive Suite', 3500000, 4, 'Panoramic sea view, private balcony', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a'],
            ['Penthouse', 12000000, 6, 'Private pool, butler service', 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'],
            ['Family Villa', 8500000, 8, 'Spacious villa for large families', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b']
        ];
        const typeIds = [];
        for (const [name, price, max, desc, img] of typeData) {
            const [res] = await connection.query("INSERT INTO room_types (name, base_price, max_occupancy, description, photo_urls) VALUES (?, ?, ?, ?, ?)", [name, price, max, desc, img]);
            typeIds.push(res.insertId);
            // Link amenities
            for (let i = 0; i < 3; i++) {
                await connection.query("INSERT INTO room_type_amenities (room_type_id, amenity_id) VALUES (?, ?)", [res.insertId, amenIds[i]]);
            }
        }

        // 7. Rooms (40 rooms total)
        console.log('Seeding Rooms...');
        for (let i = 0; i < typeIds.length; i++) {
            for (let r = 1; r <= 10; r++) {
                const floor = i + 1;
                const num = `${floor}${String(r).padStart(2, '0')}`;
                await connection.query("INSERT INTO rooms (room_number, floor, status, room_type_id) VALUES (?, ?, ?, ?)", [num, floor, 'AVAILABLE', typeIds[i]]);
            }
        }

        // 8. Bookings & Payments & Reviews
        console.log('Seeding Bookings...');
        const roomIds = (await connection.query("SELECT id FROM rooms"))[0].map(r => r.id);
        for (let i = 0; i < 20; i++) {
            const cId = customerIds[i % customerIds.length];
            const rId = roomIds[i % roomIds.length];
            const checkin = new Date();
            checkin.setDate(checkin.getDate() - (i * 5));
            const checkout = new Date(checkin);
            checkout.setDate(checkout.getDate() + 3);
            
            const [b] = await connection.query(
                "INSERT INTO bookings (customer_id, checkin_date, checkout_date, total_guests, status, total_amount, booking_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [cId, checkin, checkout, 2, 'COMPLETED', 3000000, checkin]
            );
            await connection.query("INSERT INTO booking_items (booking_id, room_id, price, quantity) VALUES (?, ?, ?, ?)", [b.insertId, rId, 1000000, 1]);
            await connection.query("INSERT INTO payments (booking_id, amount, payment_method, status, payment_date, transaction_id) VALUES (?, ?, ?, ?, ?, ?)", 
                [b.insertId, 3000000, 'VNPAY', 'SUCCESS', checkin, `TRX-${b.insertId}`]);
            await connection.query("INSERT INTO reviews (booking_id, customer_id, rating, comment, review_date) VALUES (?, ?, ?, ?, ?)",
                [b.insertId, cId, 5, 'Dịch vụ tuyệt vời, phòng rất đẹp!', checkin]);
        }

        // 9. Support Tickets
        console.log('Seeding Support Tickets...');
        await connection.query("INSERT INTO support_tickets (customer_name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)", 
            ['Lê Bảo Nguyên', 'nguyen@gmail.com', 'Lỗi thanh toán', 'Tôi đã thanh toán nhưng chưa nhận được mail', 'OPEN']);
        await connection.query("INSERT INTO support_tickets (customer_name, email, subject, message, status) VALUES (?, ?, ?, ?, ?)", 
            ['Trần Huy', 'huy@gmail.com', 'Yêu cầu đặc biệt', 'Tôi muốn đặt hoa hồng trong phòng', 'CLOSED']);

        await connection.commit();
        console.log('✅ MASTER SEED COMPLETED SUCCESSFULLY');
    } catch (error) {
        await connection.rollback();
        console.error('❌ SEED FAILED:', error);
    } finally {
        connection.release();
        await pool.end();
    }
}

seedMaster();
