import crypto from 'crypto';
import { razorpay } from '../config/razorpay';
import { prisma } from '../utils/prisma';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { EmailService } from './EmailService';
import { TelegramService } from './TelegramService';
import { emitEvent } from '../socket/emitter';
import { PAYMENT_STATUS_UPDATED, PAYMENT_VERIFIED, DASHBOARD_STATS_UPDATED, BOOKING_STATUS_UPDATED } from '../socket/events';

export class PaymentService {
  static async createPaymentOrder(amount: number, receiptId: string) {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: receiptId,
    };
    
    return razorpay.orders.create(options);
  }

  static async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      throw new Error('Invalid signature');
    }
    
    return true;
  }

  static async handleBookingPayment(bookingId: string, amount: number) {
    const razorpayOrder = await this.createPaymentOrder(amount, bookingId);
    
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount,
        paymentMethod: PaymentMethod.ONLINE,
        paymentStatus: PaymentStatus.PENDING,
        razorpayOrderId: razorpayOrder.id,
      }
    });

    emitEvent('role:admin', PAYMENT_STATUS_UPDATED, { paymentId: payment.id, bookingId, status: PaymentStatus.PENDING, updatedAt: new Date() });

    return { payment, razorpayOrder };
  }

  static async confirmBookingPayment(paymentId: string, razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
    await this.verifyPayment(razorpayOrderId, razorpayPaymentId, signature);

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        razorpayPaymentId: razorpayPaymentId,
      }
    });

    const updatedBooking = await prisma.booking.update({
      where: { id: updatedPayment.bookingId! },
      data: { paymentStatus: PaymentStatus.PAID },
      include: { user: true }
    });

    // Send emails
    EmailService.sendBookingConfirmation(updatedBooking.user, updatedBooking);
    EmailService.sendPaymentSuccess(updatedBooking.user, updatedPayment.amount, razorpayPaymentId, 'Studio Booking');

    // Send Telegram notification
    TelegramService.sendPaymentSuccessNotification(updatedPayment, 'Studio Booking', updatedBooking.bookingReference, updatedBooking.user);

    // Real-time Socket events
    emitEvent(`user:${updatedBooking.userId}`, PAYMENT_VERIFIED, { paymentId, bookingId: updatedPayment.bookingId, status: PaymentStatus.PAID, updatedAt: new Date() });
    emitEvent('role:admin', PAYMENT_VERIFIED, { paymentId, bookingId: updatedPayment.bookingId, status: PaymentStatus.PAID, updatedAt: new Date() });
    emitEvent(`user:${updatedBooking.userId}`, BOOKING_STATUS_UPDATED, { bookingId: updatedPayment.bookingId, status: PaymentStatus.PAID, updatedAt: new Date() });
    emitEvent('role:admin', BOOKING_STATUS_UPDATED, { bookingId: updatedPayment.bookingId, status: PaymentStatus.PAID, updatedAt: new Date() });
    // Tell dashboard to refresh stats
    emitEvent('role:admin', DASHBOARD_STATS_UPDATED, { timestamp: new Date() });

    return updatedPayment;
  }
}
