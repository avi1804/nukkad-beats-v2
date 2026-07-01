import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { PaymentStatus, Role } from '@prisma/client';
import { EmailService } from '../services/EmailService';
import { WhatsAppService } from '../services/WhatsAppService';
import { TelegramService } from '../services/TelegramService';
import { emitEvent } from '../socket/emitter';
import { PAYMENT_STATUS_UPDATED, PAYMENT_VERIFIED, DASHBOARD_STATS_UPDATED, BOOKING_STATUS_UPDATED, ORDER_STATUS_UPDATED } from '../socket/events';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    // Basic Counts
    const totalBookings = await prisma.booking.count();
    const totalOrders = await prisma.order.count();
    const registeredUsers = await prisma.user.count({ where: { role: Role.USER } });
    
    // Revenue calculations (using Booking and Order tables)
    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: PaymentStatus.PAID },
      select: { totalAmount: true, createdAt: true }
    });

    const paidOrders = await prisma.order.findMany({
      where: { paymentStatus: PaymentStatus.PAID },
      select: { totalAmount: true, createdAt: true }
    });

    let studioRevenue = 0;
    let cafeRevenue = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    paidBookings.forEach(b => {
      studioRevenue += b.totalAmount;
      const txDate = new Date(b.createdAt);
      if (txDate >= todayStart) todayRevenue += b.totalAmount;
      if (txDate >= monthStart) monthlyRevenue += b.totalAmount;
    });

    paidOrders.forEach(o => {
      cafeRevenue += o.totalAmount;
      const txDate = new Date(o.createdAt);
      if (txDate >= todayStart) todayRevenue += o.totalAmount;
      if (txDate >= monthStart) monthlyRevenue += o.totalAmount;
    });

    const totalRevenue = studioRevenue + cafeRevenue;

    // Pending Payments
    const pendingBookings = await prisma.booking.count({
      where: { paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PENDING_CONFIRMATION] } }
    });
    const pendingOrders = await prisma.order.count({
      where: { paymentStatus: { in: [PaymentStatus.PENDING, PaymentStatus.PENDING_CONFIRMATION] } }
    });

    res.json({
      success: true,
      data: {
        totalRevenue,
        studioRevenue,
        cafeRevenue,
        todayRevenue,
        monthlyRevenue,
        totalBookings,
        totalOrders,
        registeredUsers,
        pendingOfflinePayments: pendingBookings + pendingOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard stats' });
  }
};

export const getDashboardCharts = async (_req: Request, res: Response) => {
  try {
    const days = 7;
    const chartData = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      
      const dayBookings = await prisma.booking.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: date, lt: nextDate }
        },
        select: { totalAmount: true }
      });

      const dayOrders = await prisma.order.findMany({
        where: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { gte: date, lt: nextDate }
        },
        select: { totalAmount: true }
      });

      let studio = dayBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      let cafe = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      chartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        studio,
        cafe,
        total: studio + cafe
      });
    }

    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch chart data' });
  }
};

// --- Payment Verification Endpoints ---

export const updatePaymentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const type = req.params.type as string;
    const id = req.params.id as string;
    const action = req.params.action as string; // action: verify, reject, pending
    
    let newPaymentStatus: PaymentStatus;
    if (action === 'verify') newPaymentStatus = PaymentStatus.PAID;
    else if (action === 'reject') newPaymentStatus = PaymentStatus.FAILED;
    else if (action === 'pending') newPaymentStatus = PaymentStatus.PENDING;
    else return res.status(400).json({ success: false, error: 'Invalid action' });

    if (type === 'booking') {
      const booking = await prisma.booking.findUnique({ where: { id } });
      if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
      
      let newBookingStatus = booking.bookingStatus;
      if (action === 'verify') newBookingStatus = 'CONFIRMED';
      
      const updated = await prisma.booking.update({
        where: { id },
        data: { paymentStatus: newPaymentStatus, bookingStatus: newBookingStatus },
        include: { user: true, studio: true }
      });

      if (action === 'verify') {
        try {
          await prisma.notification.create({
            data: {
              userId: updated.userId,
              title: 'Payment Verified',
              message: `Your payment for Studio Booking ${updated.bookingReference} has been verified successfully.`
            }
          });
          // Send WhatsApp and Email using existing services (best-effort, no await)
          if ((updated as any).user.phone) {
            WhatsAppService.sendStudioBookingNotification(updated as any, (updated as any).user).catch(console.error);
          }
          TelegramService.sendStudioBookingNotification(updated as any, (updated as any).user).catch(console.error);
          EmailService.sendBookingConfirmation((updated as any).user, updated as any).catch(console.error);
        } catch (e) {
          console.error("Failed to send verification notifications:", e);
        }
      }

      // Real-time Socket events
      if (action === 'verify') {
        emitEvent(`user:${updated.userId}`, PAYMENT_VERIFIED, { bookingId: id, status: newPaymentStatus, updatedAt: new Date() });
        emitEvent('role:admin', DASHBOARD_STATS_UPDATED, { timestamp: new Date() });
      } else {
        emitEvent(`user:${updated.userId}`, PAYMENT_STATUS_UPDATED, { bookingId: id, status: newPaymentStatus, updatedAt: new Date() });
      }
      emitEvent(`user:${updated.userId}`, BOOKING_STATUS_UPDATED, { bookingId: id, status: newBookingStatus, updatedAt: new Date() });
      emitEvent('role:admin', BOOKING_STATUS_UPDATED, { bookingId: id, status: newBookingStatus, updatedAt: new Date() });

      return res.json({ success: true, data: updated });
    } else if (type === 'order') {
      const order = await prisma.order.findUnique({ where: { id } });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      
      let newOrderStatus = order.orderStatus;
      if (action === 'verify' && newOrderStatus === 'PENDING') newOrderStatus = 'PREPARING';
      
      const updated = await prisma.order.update({
        where: { id },
        data: { paymentStatus: newPaymentStatus, orderStatus: newOrderStatus },
        include: { user: true }
      });

      if (action === 'verify') {
        try {
          await prisma.notification.create({
            data: {
              userId: updated.userId,
              title: 'Payment Verified',
              message: `Your payment for Cafe Order ORD-${updated.id.substring(updated.id.length - 6).toUpperCase()} has been verified successfully.`
            }
          });
          EmailService.sendOrderStatus((updated as any).user, updated as any, 'PREPARING').catch(console.error);
        } catch (e) {
          console.error("Failed to send verification notifications:", e);
        }
      }

      // Real-time Socket events
      if (action === 'verify') {
        emitEvent(`user:${updated.userId}`, PAYMENT_VERIFIED, { orderId: id, status: newPaymentStatus, updatedAt: new Date() });
        emitEvent('role:admin', DASHBOARD_STATS_UPDATED, { timestamp: new Date() });
      } else {
        emitEvent(`user:${updated.userId}`, PAYMENT_STATUS_UPDATED, { orderId: id, status: newPaymentStatus, updatedAt: new Date() });
      }
      emitEvent(`user:${updated.userId}`, ORDER_STATUS_UPDATED, { orderId: id, status: newOrderStatus, updatedAt: new Date() });
      emitEvent('role:admin', ORDER_STATUS_UPDATED, { orderId: id, status: newOrderStatus, updatedAt: new Date() });

      return res.json({ success: true, data: updated });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid type' });
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
};
