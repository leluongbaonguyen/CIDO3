import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { pool } from '../config/db.js';
import sendEmail from './sendEmail.js';

// Resolve __dirname since we're using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to format dates
const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/**
 * Ensure upload folders exist
 */
const ensureDirectories = () => {
  const rootDir = path.resolve(__dirname, '../../'); // Points to backend folder root
  const uploadDir = path.join(rootDir, 'uploads');
  const qrDir = path.join(uploadDir, 'qrcodes');
  const voucherDir = path.join(uploadDir, 'vouchers');

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });
  if (!fs.existsSync(voucherDir)) fs.mkdirSync(voucherDir, { recursive: true });

  return { qrDir, voucherDir };
};

/**
 * Generate QR code image file
 */
export const generateQRCodeImage = async (qrToken, bookingCode) => {
  const { qrDir } = ensureDirectories();
  const fileName = `QR_${bookingCode}.png`;
  const filePath = path.join(qrDir, fileName);
  
  // Format matching checkout page representation
  const qrData = `BOOKINGX_CHECKIN_TOKEN=${qrToken}`;
  
  await QRCode.toFile(filePath, qrData, {
    color: {
      dark: '#1e293b',  // Dark slate
      light: '#ffffff'  // White background
    },
    width: 300,
    margin: 1
  });

  return {
    filePath,
    relativeUrl: `/uploads/qrcodes/${fileName}`
  };
};

/**
 * Generate premium PDF voucher
 */
export const generateVoucherPDF = async (booking, qrImagePath) => {
  const { voucherDir } = ensureDirectories();
  const fileName = `Voucher_${booking.booking_code}.pdf`;
  const filePath = path.join(voucherDir, fileName);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Draw background wrapper card style
      doc.rect(20, 20, 555, 802)
         .lineWidth(1)
         .strokeColor('#e2e8f0')
         .stroke();

      // Top Luxury Header Band
      doc.rect(20, 20, 555, 100)
         .fillColor('#1e293b') // Dark Slate
         .fill();

      // Logo and Title
      doc.fillColor('#c4a661') // Gold
         .fontSize(30)
         .font('Helvetica-Bold')
         .text('X - TRAVEL', 40, 42, { characterSpacing: 2 });

      doc.fillColor('#ffffff')
         .fontSize(10)
         .font('Helvetica')
         .text('LUXURY HOTEL & RESORT', 40, 78, { characterSpacing: 3 });

      // Booking Reference on Header Right
      doc.fillColor('#c4a661')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('BOOKING REFERENCE', 400, 45, { align: 'right' });

      doc.fillColor('#ffffff')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text(`${booking.booking_code}`, 400, 60, { align: 'right' });

      // Title header
      doc.fillColor('#1e293b')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('OFFICIAL RESERVATION VOUCHER', 40, 150, { align: 'center', characterSpacing: 1 });

      // Small golden line divider
      doc.moveTo(220, 175)
         .lineTo(375, 175)
         .lineWidth(2)
         .strokeColor('#c4a661')
         .stroke();

      // Guest Details Section
      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('KHACH HANG / GUEST', 50, 200);

      doc.fillColor('#1e293b')
         .fontSize(15)
         .font('Helvetica-Bold')
         .text(booking.customer_name || 'Khach Hang', 50, 215);

      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('LIEN HE / CONTACT', 320, 200);

      doc.fillColor('#1e293b')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(`Email: ${booking.customer_email || 'N/A'}`, 320, 215)
         .text(`Phone: ${booking.customer_phone || 'N/A'}`, 320, 230);

      // Room & Dates Section
      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('HANG PHONG / ROOM TYPE', 50, 265);

      doc.fillColor('#1e293b')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(booking.room_type_name || 'Standard Room', 50, 280);

      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('SO PHONG / ROOM NO.', 320, 265);

      doc.fillColor('#1e293b')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text(booking.room_number ? `Room ${booking.room_number}` : 'Assigned on arrival', 320, 280);

      // Date grid card
      doc.rect(50, 315, 495, 80)
         .fillColor('#f8fafc')
         .strokeColor('#cbd5e1')
         .lineWidth(1)
         .fillAndStroke();

      // Check-in
      doc.fillColor('#94a3b8')
         .fontSize(8)
         .font('Helvetica-Bold')
         .text('NHAN PHONG / CHECK-IN', 70, 330);

      doc.fillColor('#1e293b')
         .fontSize(15)
         .font('Helvetica-Bold')
         .text(formatDate(booking.check_in_date), 70, 345);

      doc.fillColor('#64748b')
         .fontSize(8)
         .font('Helvetica')
         .text('Tu 14:00 (From 2:00 PM)', 70, 365);

      // Vertical Divider
      doc.moveTo(297, 325)
         .lineTo(297, 385)
         .strokeColor('#cbd5e1')
         .stroke();

      // Check-out
      doc.fillColor('#94a3b8')
         .fontSize(8)
         .font('Helvetica-Bold')
         .text('TRA PHONG / CHECK-OUT', 320, 330);

      doc.fillColor('#1e293b')
         .fontSize(15)
         .font('Helvetica-Bold')
         .text(formatDate(booking.check_out_date), 320, 345);

      doc.fillColor('#64748b')
         .fontSize(8)
         .font('Helvetica')
         .text('Truoc 12:00 (Before 12:00 PM)', 320, 365);

      // Financial Details
      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('TRANG THAI / STATUS', 50, 420);

      const isPaid = booking.payment_status === 'SUCCESS' || booking.payment_method === 'VNPAY' || booking.status === 'CONFIRMED';
      doc.fillColor(isPaid ? '#10b981' : '#e11d48')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text(isPaid ? 'DA XAC NHAN / CONFIRMED' : 'CHO THANH TOAN / PENDING', 50, 435);

      doc.fillColor('#94a3b8')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('TONG TIEN / TOTAL AMOUNT', 320, 420);

      doc.fillColor('#c4a661')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(`${Number(booking.total_amount || 0).toLocaleString()} VND`, 320, 435);

      // QR Code Placement Frame
      doc.rect(197, 490, 200, 200)
         .strokeColor('#e2e8f0')
         .lineWidth(1)
         .stroke();

      if (qrImagePath && fs.existsSync(qrImagePath)) {
        doc.image(qrImagePath, 202, 495, { width: 190, height: 190 });
      }

      // Usage instructions
      doc.fillColor('#64748b')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('HUONG DAN SU DUNG VOUCHER / CHECK-IN INSTRUCTIONS', 40, 720, { align: 'center' });

      doc.fillColor('#94a3b8')
         .fontSize(8)
         .font('Helvetica')
         .text('Vui long xuat trinh ma QR nay tai quay le tan de lam thu tuc check-in.', 40, 738, { align: 'center' })
         .text('Please present this QR code at the reception desk to perform the check-in procedure.', 40, 750, { align: 'center' });

      // Footer
      doc.fillColor('#94a3b8')
         .fontSize(7)
         .font('Helvetica-Bold')
         .text('X-TRAVEL RESORT • VO NGUYEN GIAP, SON TRA, DA NANG • CONTACT@XTRAVEL.COM', 40, 785, { align: 'center', characterSpacing: 0.5 });

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          filePath,
          relativeUrl: `/uploads/vouchers/${fileName}`
        });
      });

      writeStream.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};

export const sendVoucherEmail = async (booking, pdfPath) => {
  const bookingCode = booking.booking_code;
  const customerName = booking.customer_name || 'Quý khách';
  const roomName = booking.room_type_name ? `${booking.room_type_name} ${booking.room_number || ''}`.trim() : "Đang cập nhật";
  const checkInDate = formatDate(booking.check_in_date);
  const checkOutDate = formatDate(booking.check_out_date);
  const totalPrice = Number(booking.total_amount || 0).toLocaleString();

  const subject = `[Booking X] Voucher đặt phòng của quý khách - ${bookingCode}`;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Booking X Luxury Hotel</h2>

      <p>Xin chào <b>${customerName}</b>,</p>

      <p>Cảm ơn quý khách đã đặt phòng tại Booking X.</p>

      <h3>Thông tin đặt phòng</h3>

      <table style="border-collapse: collapse; width: 100%;">
        <tr>
          <td><b>Mã đơn:</b></td>
          <td>${bookingCode}</td>
        </tr>
        <tr>
          <td><b>Phòng:</b></td>
          <td>${roomName}</td>
        </tr>
        <tr>
          <td><b>Ngày nhận phòng:</b></td>
          <td>${checkInDate}</td>
        </tr>
        <tr>
          <td><b>Ngày trả phòng:</b></td>
          <td>${checkOutDate}</td>
        </tr>
        <tr>
          <td><b>Tổng tiền:</b></td>
          <td>${totalPrice} VNĐ</td>
        </tr>
      </table>

      <p>
        Voucher PDF đã được đính kèm trong email này.
        Khi đến khách sạn, vui lòng mở voucher và đưa mã QR cho nhân viên lễ tân để check-in.
      </p>

      <p>Trân trọng,<br/>Booking X Luxury Hotel Booking</p>
    </div>
  `;

  const result = await sendEmail({
    to: booking.customer_email,
    subject,
    html,
    attachments: [
      {
        filename: `Voucher_${bookingCode}.pdf`,
        path: pdfPath,
      },
    ],
  });

  if (!result.success) {
    throw new Error(result.error || 'SMTP delivery failed');
  }

  return result;
};

/**
 * Main orchestration entrypoint to generate QR, PDF and trigger email sending flow.
 * Handles database logging as well.
 */
export const processVoucherAndSendEmail = async (bookingId) => {
  try {
    // 1. Fetch complete details of booking
    const [rows] = await pool.query(`
      SELECT b.id, b.booking_code, b.check_in_date, b.check_out_date, b.total_amount, b.status, b.payment_method, b.qr_token,
             u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
             r.room_number, rt.name AS room_type_name
      FROM bookings b
      JOIN customers c ON c.id = b.customer_id
      JOIN users u ON u.id = c.user_id
      JOIN rooms r ON r.id = b.room_id
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE b.id = ?
    `, [bookingId]);

    if (rows.length === 0) {
      console.error(`Booking with ID ${bookingId} not found.`);
      return;
    }

    const booking = rows[0];

    // Check if customer email exists
    if (!booking.customer_email) {
      console.log(`Skipping voucher email for booking ${booking.booking_code} as customer has no email.`);
      return;
    }

    // 2. Generate QR Code image
    const qrResult = await generateQRCodeImage(booking.qr_token, booking.booking_code);

    // 3. Generate Voucher PDF
    const pdfResult = await generateVoucherPDF(booking, qrResult.filePath);

    // Save generated paths to database
    await pool.query(
      'UPDATE bookings SET qr_image_url = ?, voucher_pdf_url = ? WHERE id = ?',
      [qrResult.relativeUrl, pdfResult.relativeUrl, bookingId]
    );

    // 4. Send email via SMTP
    try {
      await sendVoucherEmail(booking, pdfResult.filePath);

      // Update success status in DB
      await pool.query(
        `UPDATE bookings 
         SET voucher_sent = true, voucher_sent_at = NOW(), email_status = 'SENT', email_error = NULL 
         WHERE id = ?`,
        [bookingId]
      );
      console.log(`✅ Voucher email sent successfully for booking ${booking.booking_code}`);
    } catch (emailErr) {
      console.error(`❌ Failed to send voucher email for ${booking.booking_code}:`, emailErr);
      
      // Update failure status in DB
      await pool.query(
        `UPDATE bookings 
         SET voucher_sent = false, email_status = 'FAILED', email_error = ? 
         WHERE id = ?`,
        [emailErr.message || String(emailErr), bookingId]
      );
    }
  } catch (err) {
    console.error('Error executing voucher/email flow:', err);
  }
};
