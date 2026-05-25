import { pool } from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    try {
        console.log('Resetting and creating schema v2...');
        const sqlPath = path.join(__dirname, 'sql', 'schema_v2.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await pool.query(sql);
        
        console.log('✅ Schema v2 created successfully!');
    } catch (error) {
        console.error('❌ Schema creation failed:', error.message);
    } finally {
        process.exit();
    }
};

runMigration();
