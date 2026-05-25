import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const vietnameseSubjects = [
  "Hỏi đổi ngày nhận phòng cho đơn đặt phòng",
  "Yêu cầu hủy phòng và làm thủ tục hoàn trả tiền cọc",
  "Xác nhận chuyển tiền thanh toán qua ngân hàng",
  "Tư vấn tiện ích hạng phòng Signature Penthouse",
  "Dịch vụ đưa đón sân bay Đà Nẵng",
  "Hỏi về buffet sáng và nhà hàng fine dining",
  "Hỗ trợ xuất hóa đơn VAT cho công ty",
  "Phòng Deluxe Ocean View có ban công không?",
  "Chính sách hủy đơn phòng ngày lễ Tết",
  "Đăng ký thẻ thành viên VIP của resort",
  "Yêu cầu kê thêm giường phụ (extra bed)",
  "Hỏi về dịch vụ spa & massage trị liệu",
  "Tổ chức sự kiện kỷ niệm ngày cưới ngoài bãi biển",
  "Hỗ trợ thanh toán thẻ VISA/Mastercard bị lỗi",
  "Yêu cầu chuẩn bị hoa hồng và rượu vang setup trăng mật"
];

const customerDialogues = [
  "Xin chào, tôi muốn hỏi xem phòng Deluxe Ocean View hướng biển trực diện hay xéo thế ạ?",
  "Chào lễ tân, tôi đã chuyển khoản thanh toán cho đơn đặt phòng của tôi rồi nhé. Nhờ kiểm tra giúp.",
  "Dạ cho hỏi resort mình có dịch vụ đón sân bay miễn phí không ạ? Tôi bay lúc 14h chiều mai.",
  "Tôi muốn đổi ngày nhận phòng từ 25 sang 28 tháng này có được không? Đơn phòng mã BK12345.",
  "Chào bạn, phòng Penthouse của bên mình có hồ bơi riêng biệt không hay dùng chung thế?",
  "Tôi bị lỗi thanh toán thẻ tín dụng khi đặt phòng trên web. Có thể chuyển khoản ngân hàng không?",
  "Cho tôi hỏi buffet sáng bắt đầu từ mấy giờ và ở nhà hàng nào ạ?",
  "Tôi đặt phòng honeymoon, bên mình có hỗ trợ set up hoa và bánh kem nhỏ không ạ?",
  "Chào bạn, tôi muốn hủy phòng vì gia đình có việc đột xuất. Xin hỏi chính sách hoàn tiền thế nào?",
  "Cho mình hỏi hồ bơi vô cực mở cửa đến mấy giờ tối vậy bạn ơi?"
];

const staffDialogues = [
  "BOOKING X xin kính chào Quý khách! Phòng Deluxe Ocean View bên em có ban công ngắm trực diện biển 100% cực đẹp ạ.",
  "Dạ em đã nhận được yêu cầu của Quý khách. Xin vui lòng đợi trong giây lát để em check giao dịch chuyển khoản trên hệ thống ạ.",
  "Chào anh/chị, resort có dịch vụ xe shuttle đón tiễn sân bay theo khung giờ ạ. Anh/chị cho em xin mã chuyến bay để em xếp xe nhé.",
  "Dạ đối với yêu cầu đổi ngày đặt phòng, em đang kiểm tra quỹ phòng trống vào ngày 28. Anh/chị đợi em 1 phút nhé.",
  "Dạ hạng Signature Penthouse bên em có hồ bơi tràn viền hoàn toàn riêng tư trên sân thượng ạ, tầm nhìn panorama ôm trọn vịnh biển.",
  "Dạ hoàn toàn được ạ. Quý khách có thể chuyển khoản vào số tài khoản chính thức của resort kèm nội dung là Mã Đơn Phòng nha.",
  "Dạ buffet sáng phục vụ từ 6:00 đến 10:30 tại Nhà hàng Coral sang trọng tầng G ạ. Quý khách chỉ cần đọc số phòng khi vào cửa.",
  "Dạ bên em có gói setup Honeymoon miễn phí gồm thiên nga xếp bằng khăn và cánh hoa hồng. Bánh kem nhỏ có phụ phí nhẹ ạ.",
  "Dạ em rất tiếc về sự cố của gia đình mình. Em sẽ kiểm tra điều khoản đơn phòng của anh/chị xem có thuộc diện hoàn hủy miễn phí không ạ.",
  "Dạ hồ bơi vô cực bên em mở cửa từ 5:30 sáng đến 21:00 tối hàng ngày ạ. Có cứu hộ túc trực suốt thời gian hoạt động."
];

async function seedChats() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Nguyen@1904',
    database: process.env.DB_NAME || 'hotel_booking_db'
  });

  console.log('Fetching customers and bookings...');
  const [customers] = await connection.query('SELECT id, user_id FROM customers');
  const [bookings] = await connection.query('SELECT id, customer_id, booking_code FROM bookings');
  const [employees] = await connection.query('SELECT id FROM employees');

  if (customers.length === 0) {
    console.log('⚠️ No customers found in database. Please run seed_production first.');
    await connection.end();
    return;
  }

  console.log(`Found ${customers.length} customers, ${bookings.length} bookings, and ${employees.length} employees.`);
  
  // Clear old chat logs to have clean realistic seed data
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE chat_messages');
  await connection.query('TRUNCATE chat_conversations');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  
  console.log('Seeding 60 chats...');

  const statuses = ['WAITING', 'PROCESSING', 'CUSTOMER_WAITING', 'RESPONDED', 'COMPLETED', 'CLOSED', 'TRANSFER_ADMIN'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];

  for (let i = 1; i <= 60; i++) {
    // Pick customer (or NULL for 15% of conversations to represent guest sessions)
    const isGuest = Math.random() < 0.15;
    const customer = isGuest ? null : customers[Math.floor(Math.random() * customers.length)];
    
    // Pick related booking if customer selected
    let relatedBookingId = null;
    let subjectExtra = '';
    if (customer) {
      const customerBookings = bookings.filter(b => b.customer_id === customer.id);
      if (customerBookings.length > 0 && Math.random() < 0.7) {
        const booking = customerBookings[Math.floor(Math.random() * customerBookings.length)];
        relatedBookingId = booking.id;
        subjectExtra = ` [Đơn ${booking.booking_code}]`;
      }
    }

    // Set conversation metadata
    const conversationCode = `CHAT-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const assignedStaffId = (status !== 'WAITING' && employees.length > 0) 
      ? employees[Math.floor(Math.random() * employees.length)].id 
      : null;

    const baseSubject = vietnameseSubjects[Math.floor(Math.random() * vietnameseSubjects.length)];
    const subject = `${baseSubject}${subjectExtra}`;

    // Insert conversation
    const [convResult] = await connection.query(`
      INSERT INTO chat_conversations (conversation_code, customer_id, assigned_staff_id, status, priority, related_booking_id, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [conversationCode, customer ? customer.id : null, assignedStaffId, status, priority, relatedBookingId, subject]);

    const convId = convResult.insertId;

    // Generate random back-and-forth dialogue
    const msgCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 messages
    let lastMsgText = '';

    for (let m = 0; m < msgCount; m++) {
      const isStaffSender = m % 2 === 1;
      const senderRole = isStaffSender 
        ? (Math.random() < 0.2 ? 'ADMIN' : 'STAFF') 
        : (customer ? 'CUSTOMER' : 'GUEST');
      const senderId = isStaffSender ? assignedStaffId : (customer ? customer.id : null);
      
      const contentPool = isStaffSender ? staffDialogues : customerDialogues;
      const messageContent = contentPool[Math.floor(Math.random() * contentPool.length)];
      lastMsgText = messageContent;

      const createdTime = new Date(Date.now() - (60 - i) * 3600 * 1000 + m * 300 * 1000); // spread over several days

      await connection.query(`
        INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message_type, message_content, created_at)
        VALUES (?, ?, ?, 'TEXT', ?, ?)
      `, [convId, senderId, senderRole, messageContent, createdTime]);
    }

    // Update conversation's last message cache
    const lastMsgTime = new Date(Date.now() - (60 - i) * 3600 * 1000 + msgCount * 300 * 1000);
    const closedAt = status === 'CLOSED' ? lastMsgTime : null;

    await connection.query(`
      UPDATE chat_conversations 
      SET last_message = ?, last_message_at = ?, closed_at = ?
      WHERE id = ?
    `, [lastMsgText, lastMsgTime, closedAt, convId]);
  }

  console.log('✅ Successfully seeded 60 realistic support chats and logs!');
  await connection.end();
}

seedChats().catch(console.error);
