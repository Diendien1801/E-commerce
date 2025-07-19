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

async function sendResetPasswordEmail(user) {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${user.resetPasswordToken}`;

  const mailOptions = {
    from: `"Rung Ring" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <p>Dear ${user.name},</p>
      <p>We received a request to reset your account password. Please click the link below to proceed:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in one hour for your security.</p>
      <p>If you did not request a password reset, please disregard this email or contact our support team.</p>
    `
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendResetPasswordEmail };