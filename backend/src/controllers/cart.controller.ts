import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { CartService } from '../services/CartService';

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const cart = await CartService.getCart(req.user.id);
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const item = await CartService.addToCart(req.user.id, req.body);
    res.status(201).json(item);
  } catch (error: any) {
    if (error.message === 'Product not available') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid cart item ID' });
      return;
    }
    const { quantity } = req.body;
    const item = await CartService.updateCartItem(id, req.user.id, quantity);
    res.status(200).json(item);
  } catch (error: any) {
    if (error.message === 'Cart item not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Quantity must be greater than 0') {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid cart item ID' });
      return;
    }
    await CartService.removeCartItem(id, req.user.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Cart item not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const clearCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    await CartService.clearCart(req.user.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
