import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[\W_]/, 'Password must contain at least one special character')
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const bookingSchema = z.object({
  studioId: z.string().uuid('Invalid studio ID'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  guestCount: z.number().int().positive('Guest count must be positive'),
  notes: z.string().optional()
});

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryId: z.string().uuid('Invalid category ID'),
  price: z.number().positive('Price must be positive'),
  description: z.string().optional(),
  isAvailable: z.boolean().optional()
});

export const cartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive')
});

export const checkoutSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod)
});

export const contactInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});
