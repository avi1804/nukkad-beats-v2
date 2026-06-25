import { Router } from 'express';
import { createBookingPayment, verifyPayment, webhookHandler } from '../controllers/payment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/booking/create', authenticate, createBookingPayment);
router.post('/verify', authenticate, verifyPayment);
router.post('/webhook', webhookHandler);

export default router;
