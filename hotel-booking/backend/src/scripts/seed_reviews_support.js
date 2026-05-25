import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

const reviewsPool = [
  { rating: 5, comment: "Dịch vụ xuất sắc! Hồ bơi vô cực ngắm hoàng hôn siêu đẹp, buffet sáng đa dạng món Việt và Âu." },
  { rating: 5, comment: "Phòng Heritage trang trí cực kỳ tinh tế, mang đậm bản sắc văn hóa Việt. Nhân viên FO hỗ trợ nồng hậu." },
  { rating: 4, comment: "Không gian nghỉ dưỡng yên tĩnh, trong lành. Phòng ốc sạch sẽ, bồn tắm Jacuzzi thư giãn rất tốt." },
  { rating: 5, comment: "Kỳ nghỉ gia đình trọn vẹn tại Ocean View. Các bé nhà mình rất thích khu vui chơi và bãi biển riêng của resort." },
  { rating: 4, comment: "Khách sạn sang trọng, vị trí trung tâm thuận tiện. Dịch vụ Spa thảo mộc chất lượng rất cao." },
  { rating: 5, comment: "Một trải nghiệm tuyệt vời tuyệt đối! Quản gia phục vụ chu đáo 24/7, phòng Suite xứng tầm đẳng cấp." },
  { rating: 3, comment: "Phòng ốc đẹp nhưng giờ cao điểm buffet sáng hơi đông và phải chờ bàn một chút. Nhân viên phục vụ nhiệt tình bù lại." },
  { rating: 5, comment: "Rất hài lòng về chất lượng phục vụ và vệ sinh phòng. Sẽ chắc chắn quay lại XTravel vào mùa hè năm sau!" }
];

const supportPool = [
  { subject: "Yêu cầu kê thêm giường phụ (Extra Bed)", message: "Đoàn nhà mình đi 3 người lớn ở phòng Deluxe nên muốn đăng ký thêm một giường phụ. Nhờ resort báo giá và chuẩn bị giúp trước khi nhận phòng.", status: "OPEN" },
  { subject: "Đặt dịch vụ đưa đón sân bay", message: "Nhóm mình gồm 4 người sẽ hạ cánh tại sân bay Đà Nẵng lúc 14:30 ngày mai. Nhờ khách sạn bố trí xe đón khách về resort giúp.", status: "CLOSED" },
  { subject: "Yêu cầu xuất hóa đơn GTGT (VAT)", message: "Mình muốn xuất hóa đơn VAT công ty cho đơn đặt phòng vừa qua. Đã gửi đầy đủ thông tin mã số thuế qua email, nhờ kiểm tra xuất giúp mình.", status: "CLOSED" },
  { subject: "Tư vấn tiệc tối lãng mạn trên bãi biển", message: "Chào khách sạn, mình muốn tạo bất ngờ cho vợ nhân ngày kỷ niệm 5 năm ngày cưới bằng một bàn tiệc tối ngoài bãi biển. Nhờ bộ phận nhà hàng tư vấn gói giúp mình.", status: "OPEN" },
  { subject: "Thất lạc đồ đạc cá nhân sau khi trả phòng", message: "Mình vừa check-out phòng 203 sáng nay và nghi để quên một chiếc kính mát hiệu Rayban trong hộc tủ tivi. Nhờ buồng phòng kiểm tra và phản hồi lại sớm.", status: "OPEN" },
  { subject: "Yêu cầu setup bánh kem sinh nhật", message: "Ngày mai là sinh nhật của bạn đi cùng phòng với mình. Mình muốn đặt một chiếc bánh kem nhỏ và một bó hoa hồng tươi mang lên phòng lúc 20:00 tối mai.", status: "OPEN" },
  { subject: "Hỏi về chính sách mang theo thú cưng", message: "Chào lễ tân, mình định mang theo một bé cún nhỏ nặng 3kg khi lưu trú. Không biết resort mình có chính sách hỗ trợ cho pet lưu trú không ạ?", status: "CLOSED" }
];

async function run() {
  console.log('Connecting to database to seed reviews and support tickets...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Nguyen@1904',
    database: process.env.DB_NAME || 'hotel_booking_db'
  });

  try {
    // 1. Fetch completed bookings to write reviews for
    console.log('Querying completed bookings from database...');
    const [bookings] = await connection.query(
      `SELECT id, customer_id FROM bookings WHERE status = 'COMPLETED'`
    );

    if (bookings.length === 0) {
      console.log('⚠️ No completed bookings found. Please seed bookings first.');
    } else {
      console.log(`Cleaning existing reviews...`);
      await connection.query('DELETE FROM reviews');

      console.log(`Writing reviews for ${bookings.length} completed bookings...`);
      for (const b of bookings) {
        const review = reviewsPool[Math.floor(Math.random() * reviewsPool.length)];
        await connection.query(
          `INSERT INTO reviews (booking_id, customer_id, rating, comment)
           VALUES (?, ?, ?, ?)`,
          [b.id, b.customer_id, review.rating, review.comment]
        );
      }
      console.log('✅ Successfully seeded reviews.');
    }

    // 2. Fetch customers to write support tickets for
    console.log('Querying customers from database...');
    const [customers] = await connection.query(`SELECT id FROM customers`);

    if (customers.length === 0) {
      console.log('⚠️ No customers found in database. Cannot seed support tickets.');
    } else {
      console.log(`Cleaning existing support tickets...`);
      await connection.query('DELETE FROM support_tickets');

      console.log(`Writing ${supportPool.length} realistic support tickets linked to existing customers...`);
      for (let i = 0; i < supportPool.length; i++) {
        const ticket = supportPool[i];
        const customer = customers[i % customers.length];
        
        await connection.query(
          `INSERT INTO support_tickets (customer_id, subject, message, status, create_date)
           VALUES (?, ?, ?, ?, NOW() - INTERVAL ? DAY)`,
          [customer.id, ticket.subject, ticket.message, ticket.status, Math.floor(Math.random() * 5)]
        );
      }
      console.log('✅ Successfully seeded support tickets.');
    }

    console.log('🚀 --- SEEDING COMPLETED SUCCESSFULLY --- 🚀');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await connection.end();
  }
}

run();
