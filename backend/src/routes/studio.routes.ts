import { Router } from 'express';
import { 
  getActiveStudios, 
  getStudioById, 
  updateStudio,
  getAllStudiosAdmin,
  createStudio,
  deleteStudio 
} from '../controllers/studio.controller';
import { checkAvailability, getBookedSlots } from '../controllers/booking.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const updateStudioSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  pricePerHour: z.number().positive().optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional()
});

router.get('/', getActiveStudios);
router.get('/:id', getStudioById);
router.get('/:id/availability', checkAvailability);
router.get('/:id/booked-slots', getBookedSlots);

import { adminApiLimiter } from '../middleware/rateLimiter';

export const adminStudioRoutes = Router();
adminStudioRoutes.use(authenticate, requireRole([Role.ADMIN]), adminApiLimiter);
adminStudioRoutes.get('/', getAllStudiosAdmin);
adminStudioRoutes.post('/', createStudio);
adminStudioRoutes.put('/:id', validateRequest(updateStudioSchema), updateStudio);
adminStudioRoutes.delete('/:id', deleteStudio);

export default router;
