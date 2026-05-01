import { pool } from './src/config/db.js';

const dump = async () => {
    try {
        console.log('--- USERS ---');
        const [users] = await pool.query('SELECT id, email, role FROM users');
        console.table(users);

        console.log('--- CUSTOMERS ---');
        const [customers] = await pool.query('SELECT id, user_id FROM customers');
        console.table(customers);

        console.log('--- BOOKINGS ---');
        const [bookings] = await pool.query('SELECT id, customer_id FROM bookings LIMIT 5');
        console.table(bookings);

        console.log('--- TEST JOIN ---');
        const [joined] = await pool.query(`
            SELECT b.id as booking_id, c.id as customer_id, u.id as user_id
            FROM bookings b
            JOIN customers c ON c.id = b.customer_id
            JOIN users u ON u.id = c.user_id
        `);
        console.log('Joined rows:', joined.length);
        if (joined.length === 0) {
            console.log('❌ JOIN FAILED TO RETURN ROWS');
            // Check why
            const [b_count] = await pool.query('SELECT COUNT(*) as count FROM bookings');
            const [c_count] = await pool.query('SELECT COUNT(*) as count FROM customers');
            console.log(`Bookings: ${b_count[0].count}, Customers: ${c_count[0].count}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
};

dump();
