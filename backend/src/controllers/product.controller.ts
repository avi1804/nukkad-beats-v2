import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.query;
    const products = await ProductService.getAllProducts(categoryId as string);
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await ProductService.getCategories();
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    const product = await ProductService.getProductById(id);
    res.status(200).json(product);
  } catch (error: any) {
    if (error.message === 'Product not found or unavailable') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin handlers
export const getAllProductsAdmin = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await ProductService.getAllProductsAdmin();
    res.status(200).json(products);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const product = await ProductService.updateProduct(id, req.body);
    res.status(200).json(product);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    await ProductService.deleteProduct(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Product not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.startsWith('Cannot delete product')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const toggleAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    const product = await ProductService.toggleAvailability(id);
    res.status(200).json(product);
  } catch (error: any) {
    if (error.message === 'Product not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
