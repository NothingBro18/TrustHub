const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
  Boolean(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_FROM);

const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured()) {
    const error = new Error('Email delivery is not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS, and EMAIL_FROM.');
    error.statusCode = 503;
    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
};

module.exports = { isEmailConfigured, sendEmail };
