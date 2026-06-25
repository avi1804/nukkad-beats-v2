import { Router } from 'express';
import { 
  createBooking, 
  getUserBookings, 
  getBookingById, 
  cancelBooking,
  getAllBookingsAdmin,
  updateBookingAdmin,
  deleteBookingAdmin,
  getBookingByReferenceAdmin,
  createManualBookingAdmin
} from '../controllers/booking.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { bookingSchema } from '../utils/schemas';
import { Role } from '@prisma/client';
import { bookingLimiter, adminApiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', authenticate, bookingLimiter, validateRequest(bookingSchema), createBooking);
router.get('/my-bookings', authenticate, getUserBookings);
router.get('/:id', authenticate, getBookingById);
router.post('/:id/cancel', authenticate, cancelBooking);

export const adminBookingRoutes = Router();
adminBookingRoutes.use(authenticate, requireRole([Role.ADMIN]), adminApiLimiter);
adminBookingRoutes.post('/manual', createManualBookingAdmin);
adminBookingRoutes.get('/', getAllBookingsAdmin);
adminBookingRoutes.get('/reference/:ref', getBookingByReferenceAdmin);
adminBookingRoutes.put('/:id', updateBookingAdmin);
adminBookingRoutes.delete('/:id', deleteBookingAdmin);

export default router;
