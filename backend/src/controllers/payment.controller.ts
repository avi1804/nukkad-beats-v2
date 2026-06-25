import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PaymentService } from '../services/PaymentService';

export const createBookingPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount } = req.body;
    const result = await PaymentService.handleBookingPayment(bookingId, amount);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, razorpayOrderId, razorpayPaymentId, signature } = req.body;
    const payment = await PaymentService.confirmBookingPayment(
      paymentId, 
      razorpayOrderId, 
      razorpayPaymentId, 
      signature
    );
    res.status(200).json(payment);
  } catch (error: any) {
    if (error.message === 'Invalid signature') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const webhookHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    // Basic Razorpay webhook handler placeholder
    // const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    // Signature validation omitted for brevity
    
    const event = req.body.event;
    if (event === 'payment.captured') {
      // Handle async payment capture confirmation
    }
    
    res.status(200).send('OK');
  } catch (error: any) {
    res.status(500).json({ error: 'Webhook processing error' });
  }
};
