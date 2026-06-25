const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env' });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify(function (error, success) {
  if (error) {
    console.log('? Connection Error:', error);
  } else {
    console.log('? Server is ready to take our messages');
  }
});
