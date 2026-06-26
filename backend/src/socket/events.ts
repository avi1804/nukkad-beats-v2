/**
 * Socket.IO Event Constants
 * This file contains all the event names used for real-time synchronization.
 * It should be identical on both backend and frontend.
 */

// Orders
export const ORDER_NEW = 'ORDER_NEW';
export const ORDER_STATUS_UPDATED = 'ORDER_STATUS_UPDATED';
export const ORDER_ITEM_STATUS_UPDATED = 'ORDER_ITEM_STATUS_UPDATED';

// Bookings
export const BOOKING_NEW = 'BOOKING_NEW';
export const BOOKING_STATUS_UPDATED = 'BOOKING_STATUS_UPDATED';
export const BOOKING_SLOT_UNAVAILABLE = 'BOOKING_SLOT_UNAVAILABLE';
export const BOOKING_SLOT_AVAILABLE = 'BOOKING_SLOT_AVAILABLE';
export const BOOKING_CANCELLED = 'BOOKING_CANCELLED';

// Payments
export const PAYMENT_STATUS_UPDATED = 'PAYMENT_STATUS_UPDATED';
export const PAYMENT_VERIFIED = 'PAYMENT_VERIFIED';

// Products
export const PRODUCT_ADDED = 'PRODUCT_ADDED';
export const PRODUCT_UPDATED = 'PRODUCT_UPDATED';
export const PRODUCT_DELETED = 'PRODUCT_DELETED';
export const PRODUCT_AVAILABILITY_CHANGED = 'PRODUCT_AVAILABILITY_CHANGED';

// Dashboard
export const DASHBOARD_STATS_UPDATED = 'DASHBOARD_STATS_UPDATED';

// Notifications
export const NOTIFICATION_NEW = 'NOTIFICATION_NEW';

// Auth
export const SESSION_INVALIDATED = 'SESSION_INVALIDATED';

// System
export const CONNECTED = 'CONNECTED';
export const RECONNECTED = 'RECONNECTED';
