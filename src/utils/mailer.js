// Sends OTP email using Gmail SMTP
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"TwagiyeNow" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Reset Code',
    html: `
      <h2>Password Reset</h2>
      <p>Your verification code is:</p>
      <h1 style="letter-spacing:8px">${otp}</h1>
      <p>This code expires in <b>10 minutes</b>.</p>
    `,
  });
};

module.exports = sendOtpEmail;
