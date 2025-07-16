const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendVerificationEmail(user) {
  const verifyUrl = `${process.env.BASE_URL}/api/auth/verify?token=${user.verificationToken}`;
  const mailOptions = {
    from: `"Rung Ring" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Email Verification',
    html: `<p>Dear ${user.name},</p>
           <p>Thank you for registering an account with us. To complete your registration, please verify your email address by clicking the button below:</p>
           <a href="${verifyUrl}">Verify Email</a>`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
