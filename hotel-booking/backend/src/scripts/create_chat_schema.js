import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Nguyen@1904',
    database: process.env.DB_NAME || 'hotel_booking_db'
  });

  console.log('Connecting to database...');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_code VARCHAR(50) NOT NULL UNIQUE,
      customer_id INT DEFAULT NULL,
      assigned_staff_id INT DEFAULT NULL,
      status ENUM('WAITING', 'PROCESSING', 'CUSTOMER_WAITING', 'RESPONDED', 'COMPLETED', 'CLOSED', 'TRANSFER_ADMIN') DEFAULT 'WAITING',
      priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
      related_booking_id INT DEFAULT NULL,
      subject VARCHAR(255) DEFAULT NULL,
      last_message TEXT DEFAULT NULL,
      last_message_at TIMESTAMP DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      closed_at TIMESTAMP DEFAULT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_staff_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (related_booking_id) REFERENCES bookings(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      conversation_id INT NOT NULL,
      sender_id INT DEFAULT NULL,
      sender_role ENUM('GUEST', 'CUSTOMER', 'STAFF', 'ADMIN') NOT NULL,
      message_type ENUM('TEXT', 'IMAGE', 'SYSTEM') DEFAULT 'TEXT',
      message_content TEXT NOT NULL,
      attachment_url VARCHAR(255) DEFAULT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('✅ Chat schema created successfully!');
  await connection.end();
}

createSchema().catch(console.error);
