import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { OrderService } from '../services/OrderService';
import { OrderStatus } from '@prisma/client';

export const checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const order = await OrderService.checkout(req.user.id, req.body);
    res.status(201).json(order);
  } catch (error: any) {
    if (error.message === 'Cart is empty') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const orders = await OrderService.getUserOrders(req.user.id);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }
    
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const order = await OrderService.getOrderById(id);
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Unauthorized access to order' });
      return;
    }
    res.status(200).json(order);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin controllers
export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await OrderService.getAllOrders();
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }
    const { status } = req.body;
    
    if (!Object.values(OrderStatus).includes(status)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }
    
    const order = await OrderService.updateOrderStatus(id, status as OrderStatus);
    res.status(200).json(order);
  } catch (error: any) {
    if (error.message === 'Order not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
