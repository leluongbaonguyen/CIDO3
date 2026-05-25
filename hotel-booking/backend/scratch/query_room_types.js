import { pool } from '../src/config/db.js';

async function run() {
  try {
    const [types] = await pool.query('SELECT * FROM room_types');
    console.log('Room Types:');
    console.log(JSON.stringify(types, null, 2));

    const [rooms] = await pool.query('SELECT room_type_id, COUNT(*) as count FROM rooms GROUP BY room_type_id');
    console.log('Current room counts per type:');
    console.log(rooms);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}
run();
