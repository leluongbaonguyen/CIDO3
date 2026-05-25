import { pool } from '../src/config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function listTables() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    let output = '=== TABLES IN DATABASE ===\n';
    
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [columns] = await pool.query(`SHOW COLUMNS FROM ${tableName}`);
      output += `\nTable: ${tableName}\n`;
      columns.forEach(col => {
        output += `  - ${col.Field}: ${col.Type} (Null: ${col.Null}, Key: ${col.Key}, Default: ${col.Default})\n`;
      });
    }
    
    fs.writeFileSync(path.join(__dirname, 'db_structure.txt'), output);
    console.log('✅ Structure written to scratch/db_structure.txt');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

listTables();
