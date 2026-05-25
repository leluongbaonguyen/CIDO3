import { pool } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const runSqlFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(`Running ${filePath}...`);
  try {
    await pool.query(sql);
    console.log('Success!');
  } catch (error) {
    console.error(`Error running ${filePath}:`, error.message);
  } finally {
    process.exit();
  }
};

const file = process.argv[2] || '../sql/seed_v2.sql';
runSqlFile(path.resolve(__dirname, file));
