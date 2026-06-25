import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { cartItemSchema } from '../utils/schemas';
import { z } from 'zod';

const router = Router();

// All cart routes require authentication
router.use(authenticate);

const updateCartSchema = z.object({
  quantity: z.number().int().positive('Quantity must be positive')
});

router.get('/', getCart);
router.post('/items', validateRequest(cartItemSchema), addToCart);
router.put('/items/:id', validateRequest(updateCartSchema), updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);

export default router;
