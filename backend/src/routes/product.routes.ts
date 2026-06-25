import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  getCategories,
  getAllProductsAdmin, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  toggleAvailability 
} from '../controllers/product.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { productSchema } from '../utils/schemas';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin routes (mounted at /api/admin/products in index.ts)
// Wait, I will mount these routes at /api/products, so let's separate them
// Actually, it's better to mount public and admin routes separately in index.ts or handle it here
import { adminApiLimiter } from '../middleware/rateLimiter';

export const adminProductRoutes = Router();
adminProductRoutes.use(authenticate, requireRole([Role.ADMIN]), adminApiLimiter);
adminProductRoutes.get('/', getAllProductsAdmin);
adminProductRoutes.post('/', validateRequest(productSchema), createProduct);
adminProductRoutes.put('/:id', updateProduct); // Can add specific schema for partial update
adminProductRoutes.delete('/:id', deleteProduct);
adminProductRoutes.patch('/:id/toggle-availability', toggleAvailability);

export default router;
