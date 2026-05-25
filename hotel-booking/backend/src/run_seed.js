import { pool } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSeed = async () => {
    try {
        console.log('Seeding data v2...');
        const sqlPath = path.join(__dirname, 'sql', 'seed_v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        
        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    } finally {
        process.exit();
    }
};

runSeed();
