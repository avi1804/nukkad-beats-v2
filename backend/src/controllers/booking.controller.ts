import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { BookingService } from '../services/BookingService';
import { BookingSlotService } from '../services/BookingSlotService';

export const createBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const booking = await BookingService.createBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === 'The selected time slot is already booked') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const getUserBookings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const bookings = await BookingService.getUserBookings(req.user.id);
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid booking ID' });
      return;
    }
    
    const booking = await BookingService.getBookingById(id);
    if (!req.user || (booking.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      res.status(403).json({ error: 'Unauthorized access to booking' });
      return;
    }
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const cancelBooking = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid booking ID' });
      return;
    }
    
    const booking = await BookingService.getBookingById(id);
    if (!req.user || (booking.userId !== req.user.id && req.user.role !== 'ADMIN')) {
      res.status(403).json({ error: 'Unauthorized access to booking' });
      return;
    }
    const cancelledBooking = await BookingService.cancelBooking(id);
    res.status(200).json(cancelledBooking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const checkAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid studio ID' });
      return;
    }
    
    const { date, startTime, endTime } = req.query;
    
    if (!date || !startTime || !endTime) {
      res.status(400).json({ error: 'Missing required query parameters' });
      return;
    }
    
    const isAvailable = await BookingSlotService.checkAvailability(
      id,
      date as string,
      startTime as string,
      endTime as string
    );
    
    res.status(200).json({ isAvailable });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookedSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid studio ID' });
      return;
    }
    
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ error: 'Missing date query parameter' });
      return;
    }
    
    const bookedSlots = await BookingSlotService.getBookedSlots(id, date as string);
    res.status(200).json(bookedSlots);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Admin Controllers ---

export const getAllBookingsAdmin = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookings = await BookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookingByReferenceAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ref = req.params.ref;
    if (!ref || Array.isArray(ref)) {
      res.status(400).json({ error: 'Invalid booking reference' });
      return;
    }
    const booking = await BookingService.getBookingByReferenceAdmin(ref as string);
    res.status(200).json(booking);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const createManualBookingAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const booking = await BookingService.createManualBooking(req.user.id, req.body);
    res.status(201).json(booking);
  } catch (error: any) {
    if (error.message === 'The selected time slot is already booked') {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const updateBookingAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid booking ID' });
      return;
    }
    const updatedBooking = await BookingService.updateBookingAdmin(id as string, req.body);
    res.status(200).json(updatedBooking);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteBookingAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid booking ID' });
      return;
    }
    await BookingService.deleteBooking(id as string);
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
