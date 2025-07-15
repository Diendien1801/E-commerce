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
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: 'Email Verification',
    html: `<p>Hello ${user.name},</p>
           <p>Please verify your email by clicking the link below:</p>
           <a href="${verifyUrl}">Verify Email</a>`,
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };
