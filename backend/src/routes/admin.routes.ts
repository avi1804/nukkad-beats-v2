import { Router } from 'express';
import { getDashboardStats, getDashboardCharts, updatePaymentStatus } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { adminApiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All admin routes must be protected
router.use(authenticate, requireRole([Role.ADMIN]), adminApiLimiter);

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/charts', getDashboardCharts);
router.put('/payments/:type/:id/:action', updatePaymentStatus);

export default router;
