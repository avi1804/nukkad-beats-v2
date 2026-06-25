import { Router } from 'express';
import { checkout, getUserOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { checkoutSchema } from '../utils/schemas';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.use(authenticate);

router.post('/checkout', validateRequest(checkoutSchema), checkout);
router.get('/my-orders', getUserOrders);
router.get('/:id', getOrderById);

// Admin routes (mounted separately or handled here)
import { adminApiLimiter } from '../middleware/rateLimiter';

export const adminOrderRoutes = Router();
adminOrderRoutes.use(authenticate, requireRole([Role.ADMIN]), adminApiLimiter);
adminOrderRoutes.get('/', getAllOrders);
adminOrderRoutes.patch('/:id/status', updateOrderStatus);

export default router;
