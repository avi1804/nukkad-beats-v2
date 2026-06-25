import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// CSRF token interceptor could go here if CSRF protection was implemented via headers
// Optional: Handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If we get an unauthorized error (like expired token), log the user out
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Booking APIs
export const bookingApi = {
  checkAvailability: async (studioId: string, date: string, startTime: string, endTime: string) => {
    return api.get(`/bookings/studios/${studioId}/availability`, {
      params: { date, startTime, endTime }
    });
  },
  getBookedSlots: async (studioId: string, date: string) => {
    return api.get(`/studios/${studioId}/booked-slots`, {
      params: { date }
    });
  },
  createBooking: async (data: any) => {
    return api.post('/bookings', data);
  }
};

// Cart APIs
export const cartApi = {
  getCart: async () => {
    return api.get('/cart');
  },
  addToCart: async (data: { productId: string; quantity: number }) => {
    return api.post('/cart/items', data);
  },
  updateCartItem: async (cartItemId: string, quantity: number) => {
    return api.put(`/cart/items/${cartItemId}`, { quantity });
  },
  removeCartItem: async (cartItemId: string) => {
    return api.delete(`/cart/items/${cartItemId}`);
  },
  clearCart: async () => {
    return api.delete('/cart');
  }
};

// Order APIs
export const orderApi = {
  checkout: async (data: { paymentMethod: string; bookingId?: string }) => {
    return api.post('/orders/checkout', data);
  },
  getUserOrders: async () => {
    return api.get('/orders/my-orders');
  },
  getOrderById: async (orderId: string) => {
    return api.get(`/orders/${orderId}`);
  }
};

// Product APIs
export const productApi = {
  getProducts: async () => {
    return api.get('/products');
  }
};

// Admin APIs
export const adminApi = {
  updatePaymentStatus: async (type: string, id: string, action: string) => {
    return api.put(`/admin/payments/${type}/${id}/${action}`);
  }
};

