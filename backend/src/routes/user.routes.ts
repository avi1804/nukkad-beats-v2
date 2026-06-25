import { Router } from 'express';
import { 
  getProfile, updateProfile, 
  getPreferences, updatePreferences, 
  updatePassword, 
  getSessions, revokeSession, 
  deleteAccount,
  getAllUsersAdmin,
  updateUserStatusAdmin
} from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().regex(/^\+?[0-9\s]{10,15}$/, 'Invalid phone number format').optional(),
  profileImage: z.string().url().optional()
});

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, validateRequest(updateProfileSchema), updateProfile);
router.delete('/profile', authenticate, deleteAccount);

router.get('/preferences', authenticate, getPreferences);
router.put('/preferences', authenticate, updatePreferences);

router.put('/password', authenticate, updatePassword);

router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:sessionId', authenticate, revokeSession);

import { adminApiLimiter } from '../middleware/rateLimiter';

export const adminUserRoutes = Router();
adminUserRoutes.use(authenticate, requireRole([Role.ADMIN]), adminApiLimiter);
adminUserRoutes.get('/', getAllUsersAdmin);
adminUserRoutes.patch('/:id/status', updateUserStatusAdmin);

export default router;
