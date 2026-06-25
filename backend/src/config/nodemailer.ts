import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection
if (process.env.NODE_ENV !== 'test') {
  try {
    transporter.verify((error, _success) => {
      if (error) {
        console.error('SMTP Connection Error: Please check your EMAIL_USER and EMAIL_PASSWORD (must use App Password for Gmail).');
      } else {
        console.log('✅ SMTP server is ready to send messages');
      }
    });
  } catch (error) {
    console.error('Failed to verify SMTP connection:', error);
  }
}
