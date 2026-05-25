import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Booking X'}" <${process.env.EMAIL_FROM_EMAIL || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Gửi email thành công:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Lỗi gửi email:', error.message);

    return {
      success: false,
      error: error.message,
    };
  }
};

export default sendEmail;
