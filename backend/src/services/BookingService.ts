import { Booking, BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { BookingSlotService } from './BookingSlotService';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './EmailService';
import { WhatsAppService } from './WhatsAppService';
import { emitEvent } from '../socket/emitter';
import { BOOKING_NEW, BOOKING_STATUS_UPDATED, BOOKING_SLOT_UNAVAILABLE, BOOKING_SLOT_AVAILABLE, BOOKING_CANCELLED, NOTIFICATION_NEW } from '../socket/events';

export class BookingService {
  static async createBooking(userId: string, data: any): Promise<Booking> {
    const bookingDate = new Date(data.bookingDate);
    if (bookingDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Booking date cannot be in the past');
    }

    if (data.startTime >= data.endTime) {
      throw new Error('Start time must be before end time');
    }

    const studio = await prisma.studio.findUnique({ where: { id: data.studioId } });
    if (!studio) {
      throw new Error('Studio not found');
    }

    if (data.guestCount > studio.capacity) {
      throw new Error(`Guest count exceeds studio capacity of ${studio.capacity}`);
    }

    const isAvailable = await BookingSlotService.checkAvailability(
      data.studioId,
      data.bookingDate,
      data.startTime,
      data.endTime
    );

    if (!isAvailable) {
      throw new Error('The selected time slot is already booked');
    }

    // Calculate total amount
    const startHour = parseInt(data.startTime.split(':')[0]);
    const endHour = parseInt(data.endTime.split(':')[0]);
    const hours = endHour - startHour;
    const totalAmount = studio.pricePerHour * hours;

    const bookingReference = `BKG-${uuidv4().substring(0, 8).toUpperCase()}`;
    const paymentStatus = data.paymentMethod === PaymentMethod.OFFLINE ? PaymentStatus.PENDING_CONFIRMATION : PaymentStatus.PENDING;

    // Transaction to create booking and slot
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          userId,
          studioId: data.studioId,
          bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          guestCount: data.guestCount,
          notes: data.notes,
          paymentMethod: data.paymentMethod,
          totalAmount,
          bookingReference,
          paymentStatus
        },
        include: { user: true, studio: true }
      }),
      prisma.bookingSlot.create({
        data: {
          studioId: data.studioId,
          date: bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          isBooked: true
        }
      })
    ]);

    // Emit real-time events
    emitEvent('role:admin', BOOKING_NEW, booking);
    emitEvent('global', BOOKING_SLOT_UNAVAILABLE, { slotId: booking.id, studioId: data.studioId, date: bookingDate });
    emitEvent(`user:${userId}`, NOTIFICATION_NEW, { userId, title: 'Booking Confirmed', message: 'Your studio booking has been confirmed.', type: 'success', link: '/my-bookings' });

    // Send emails (non-blocking)
    EmailService.sendBookingConfirmation(booking.user, booking);
    EmailService.sendAdminNotification('New Studio Booking', {
      'Customer': booking.user.fullName,
      'Studio': booking.studio.name,
      'Date': new Date(booking.bookingDate).toLocaleDateString(),
      'Amount': `₹${booking.totalAmount}`
    });

    // Send WhatsApp notifications (non-blocking)
    WhatsAppService.sendStudioBookingNotification(booking, booking.user);
    if (booking.paymentMethod === PaymentMethod.OFFLINE) {
      WhatsAppService.sendOfflinePaymentRequest('Studio Booking', booking.bookingReference, booking.totalAmount, booking.user);
    }

    return booking;
  }

  static async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    const updated = await prisma.booking.update({
      where: { id },
      data: { bookingStatus: status },
      include: { user: true }
    });

    emitEvent(`user:${updated.userId}`, BOOKING_STATUS_UPDATED, { bookingId: id, status, updatedAt: new Date() });
    emitEvent('role:admin', BOOKING_STATUS_UPDATED, { bookingId: id, status, updatedAt: new Date() });
    emitEvent(`user:${updated.userId}`, NOTIFICATION_NEW, { userId: updated.userId, title: 'Booking Update', message: `Your booking status changed to ${status}.`, type: 'info' });

    return updated;
  }

  static async cancelBooking(id: string): Promise<Booking> {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new Error('Booking not found');
    }

    const cancelledBooking = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { bookingStatus: BookingStatus.CANCELLED }
      });

      // Find and release slot
      await tx.bookingSlot.deleteMany({
        where: {
          studioId: booking.studioId,
          date: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          isBooked: true
        }
      });

      return updatedBooking;
    });

    // Real-time events
    emitEvent(`user:${booking.userId}`, BOOKING_CANCELLED, { bookingId: id, status: BookingStatus.CANCELLED });
    emitEvent('role:admin', BOOKING_CANCELLED, { bookingId: id, status: BookingStatus.CANCELLED });
    emitEvent('global', BOOKING_SLOT_AVAILABLE, { slotId: id, studioId: booking.studioId, date: booking.bookingDate });
    
    return cancelledBooking;
  }

  static async getUserBookings(userId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { userId },
      include: { studio: true },
      orderBy: { bookingDate: 'desc' }
    });
  }

  static async getBookingById(id: string): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { 
        studio: true, 
        payment: true, 
        user: { select: { fullName: true, email: true, phone: true } },
        orders: { include: { items: { include: { product: true } } } }
      }
    });
    if (!booking) {
      throw new Error('Booking not found');
    }
    return booking;
  }

  // --- Admin Methods ---

  static async getAllBookings(): Promise<Booking[]> {
    return prisma.booking.findMany({
      include: { 
        studio: true, 
        user: { select: { fullName: true, email: true, phone: true } },
        payment: true,
        orders: { include: { items: { include: { product: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getBookingByReferenceAdmin(bookingReference: string): Promise<Booking> {
    const booking = await prisma.booking.findUnique({
      where: { bookingReference },
      include: { 
        studio: true, 
        user: { select: { fullName: true, email: true, phone: true } },
        payment: true,
        orders: { include: { items: { include: { product: true } } } }
      }
    });
    if (!booking) {
      throw new Error('Booking not found with reference: ' + bookingReference);
    }
    return booking;
  }

  static async createManualBooking(_adminId: string, data: any): Promise<Booking> {
    const bookingDate = new Date(data.bookingDate);
    if (bookingDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error('Booking date cannot be in the past');
    }

    if (data.startTime >= data.endTime) {
      throw new Error('Start time must be before end time');
    }

    const studio = await prisma.studio.findUnique({ where: { id: data.studioId } });
    if (!studio) {
      throw new Error('Studio not found');
    }

    if (data.guestCount > studio.capacity) {
      throw new Error(`Guest count exceeds studio capacity of ${studio.capacity}`);
    }

    const isAvailable = await BookingSlotService.checkAvailability(
      data.studioId,
      data.bookingDate,
      data.startTime,
      data.endTime
    );

    if (!isAvailable) {
      throw new Error('The selected time slot is already booked');
    }

    // Handle user creation / lookup
    let userId = data.userId;
    if (!userId) {
      let email = data.email;
      if (!email) {
        email = `guest-${uuidv4().substring(0, 8)}@walkin.nukkadbeats.com`;
      }
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
         user = await prisma.user.create({
           data: {
             fullName: data.customerName || 'Guest',
             email,
             phone: data.phone || null,
             role: 'USER',
             isVerified: false
           }
         });
      }
      userId = user.id;
    }

    // Calculate total amount if not provided
    let totalAmount = data.totalAmount;
    if (totalAmount === undefined || totalAmount === null) {
      const startHour = parseInt(data.startTime.split(':')[0]);
      const endHour = parseInt(data.endTime.split(':')[0]);
      const hours = endHour - startHour;
      totalAmount = studio.pricePerHour * hours;
    }

    const bookingReference = `BKG-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Transaction to create booking and slot
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          userId,
          studioId: data.studioId,
          bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          guestCount: parseInt(data.guestCount),
          notes: data.notes,
          paymentMethod: data.paymentMethod || PaymentMethod.OFFLINE,
          paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
          totalAmount: parseFloat(totalAmount),
          bookingReference,
          bookingSource: 'ADMIN_MANUAL' as any
        },
        include: { user: true, studio: true }
      }),
      prisma.bookingSlot.create({
        data: {
          studioId: data.studioId,
          date: bookingDate,
          startTime: data.startTime,
          endTime: data.endTime,
          isBooked: true
        }
      })
    ]);

    // Real-time events
    emitEvent('global', BOOKING_SLOT_UNAVAILABLE, { slotId: booking.id, studioId: data.studioId, date: bookingDate });
    emitEvent('role:admin', BOOKING_NEW, booking);
    if (booking.user.role === 'USER') {
      emitEvent(`user:${booking.userId}`, BOOKING_NEW, booking);
      emitEvent(`user:${booking.userId}`, NOTIFICATION_NEW, { userId: booking.userId, title: 'Booking Created', message: 'An admin has created a booking for you.', type: 'info', link: '/my-bookings' });
    }


    if (booking.user.phone) {
      WhatsAppService.sendStudioBookingNotification(booking, booking.user);
    }
    
    return booking;
  }

  static async updateBookingAdmin(id: string, data: any): Promise<Booking> {
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) throw new Error('Booking not found');

    const updated = await prisma.$transaction(async (tx) => {
      // If date/time changed, we need to update the slot
      if ((data.bookingDate && new Date(data.bookingDate).getTime() !== existing.bookingDate.getTime()) ||
          (data.startTime && data.startTime !== existing.startTime) ||
          (data.endTime && data.endTime !== existing.endTime) ||
          (data.studioId && data.studioId !== existing.studioId)) {
        
        // Release old slot
        await tx.bookingSlot.deleteMany({
          where: {
            studioId: existing.studioId,
            date: existing.bookingDate,
            startTime: existing.startTime,
            endTime: existing.endTime,
            isBooked: true
          }
        });

        const newStudioId = data.studioId || existing.studioId;
        const newDate = data.bookingDate ? new Date(data.bookingDate) : existing.bookingDate;
        const newStart = data.startTime || existing.startTime;
        const newEnd = data.endTime || existing.endTime;

        // Check availability
        const isAvailable = await tx.bookingSlot.findFirst({
          where: {
            studioId: newStudioId,
            date: newDate,
            startTime: { lt: newEnd },
            endTime: { gt: newStart },
            isBooked: true
          }
        });

        if (isAvailable) {
          throw new Error('The selected time slot is already booked');
        }

        // Create new slot
        await tx.bookingSlot.create({
          data: {
            studioId: newStudioId,
            date: newDate,
            startTime: newStart,
            endTime: newEnd,
            isBooked: true
          }
        });
      }

      // Update booking
      return tx.booking.update({
        where: { id },
        data: {
          ...data,
          bookingDate: data.bookingDate ? new Date(data.bookingDate) : undefined
        },
        include: { studio: true, user: { select: { fullName: true, email: true, phone: true } } }
      });
    });

    // Real-time events
    emitEvent('global', BOOKING_SLOT_UNAVAILABLE, { slotId: id, studioId: updated.studioId, date: updated.bookingDate }); // Re-emit to refresh clients
    emitEvent('role:admin', BOOKING_STATUS_UPDATED, { bookingId: id, status: updated.bookingStatus, updatedAt: new Date() });
    emitEvent(`user:${updated.userId}`, BOOKING_STATUS_UPDATED, { bookingId: id, status: updated.bookingStatus, updatedAt: new Date() });

    return updated;
  }

  static async deleteBooking(id: string): Promise<void> {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new Error('Booking not found');

    await prisma.$transaction(async (tx) => {
      // Release slot
      await tx.bookingSlot.deleteMany({
        where: {
          studioId: booking.studioId,
          date: booking.bookingDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
        }
      });
      // Delete booking
      await tx.booking.delete({ where: { id } });
    });

    emitEvent('global', BOOKING_SLOT_AVAILABLE, { slotId: id, studioId: booking.studioId, date: booking.bookingDate });
    emitEvent('role:admin', BOOKING_CANCELLED, { bookingId: id, status: 'DELETED' });
    emitEvent(`user:${booking.userId}`, BOOKING_CANCELLED, { bookingId: id, status: 'DELETED' });
  }
}
