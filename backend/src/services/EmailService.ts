import { transporter } from '../config/nodemailer';
import { User } from '@prisma/client';
import { EmailTemplates } from '../utils/EmailTemplates';
import QRCode from 'qrcode';

export class EmailService {
  private static readonly from = process.env.EMAIL_FROM_ADDRESS || 'NUKKAD BEATS <nukkadbeatsofficial@gmail.com>';
  private static readonly adminEmail = process.env.EMAIL_USER || process.env.EMAIL_FROM_ADDRESS || 'admin@nukkadbeats.com';

  private static async sendMailSafely(to: string, subject: string, html: string) {
    try {
      if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your-email')) {
        console.log('[DEV SKIP] Email not configured. Would have sent:', subject);
        return null;
      }
      const info = await transporter.sendMail({
        from: this.from,
        to,
        subject,
        html
      });
      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      // We catch the error so it never blocks the main execution flow
      return null;
    }
  }

  static async sendWelcomeEmail(user: Partial<User>) {
    const html = EmailTemplates.getWelcome(user);
    return this.sendMailSafely(user.email!, '🎉 Welcome to NUKKAD BEATS', html);
  }

  static async sendBookingConfirmation(user: Partial<User>, booking: any) {
    try {
      // Generate QR Code data URL
      const qrData = booking.bookingReference;
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        color: {
          dark: '#0D0B12',
          light: '#FFFFFF'
        },
        margin: 2
      });

      const html = EmailTemplates.getBookingConfirmation(user, booking, qrCodeDataUrl);
      return this.sendMailSafely(user.email!, '🎤 Your NUKKAD BEATS Booking is Confirmed!', html);
    } catch (error) {
      console.error('Failed to generate QR or send booking email:', error);
      return null;
    }
  }

  static async sendOrderConfirmation(user: Partial<User>, order: any) {
    const html = EmailTemplates.getOrderConfirmation(user, order);
    return this.sendMailSafely(user.email!, '🍔 Your NUKKAD BEATS Café Order is Confirmed!', html);
  }

  static async sendOrderStatus(user: Partial<User>, order: any, status: string) {
    const html = EmailTemplates.getOrderStatus(user, order, status);
    return this.sendMailSafely(user.email!, `Update on your Order: ${order.orderReference}`, html);
  }

  static async sendPaymentSuccess(user: Partial<User>, amount: number, transactionId: string, serviceName: string) {
    const html = EmailTemplates.getPaymentSuccess(user, amount, transactionId, serviceName);
    return this.sendMailSafely(user.email!, '✅ Payment Successful – NUKKAD BEATS', html);
  }

  static async sendPasswordResetOTP(user: Partial<User>, otp: string) {
    const html = EmailTemplates.getPasswordResetOTP(user, otp);
    return this.sendMailSafely(user.email!, 'NUKKAD BEATS Password Reset Code', html);
  }

  static async sendPasswordResetConfirmation(user: Partial<User>) {
    const html = EmailTemplates.getPasswordResetConfirmation(user);
    return this.sendMailSafely(user.email!, 'Your Password Has Been Changed', html);
  }

  static async sendAdminNotification(title: string, details: Record<string, any>) {
    const html = EmailTemplates.getAdminNotification(title, details);
    return this.sendMailSafely(this.adminEmail, `🚨 Admin Alert: ${title}`, html);
  }
}
