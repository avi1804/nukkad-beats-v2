import { Product } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { emitEvent } from '../socket/emitter';
import { PRODUCT_ADDED, PRODUCT_UPDATED, PRODUCT_DELETED, PRODUCT_AVAILABILITY_CHANGED } from '../socket/events';

export class ProductService {
  static async getAllProducts(categoryId?: string) {
    const products = await prisma.product.findMany({
      where: {
        isAvailable: true,
        ...(categoryId ? { categoryId } : {})
      },
      include: {
        category: true
      }
    });

    // Group products by category
    const groupedProducts = products.reduce((acc, product) => {
      const categoryName = product.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(product);
      return acc;
    }, {} as Record<string, typeof products>);

    return groupedProducts;
  }

  static async getCategories() {
    return prisma.category.findMany();
  }

  static async getProductById(id: string): Promise<Product> {
    const product = await prisma.product.findFirst({
      where: { id, isAvailable: true },
      include: { category: true }
    });

    if (!product) {
      throw new Error('Product not found or unavailable');
    }

    return product;
  }

  // Admin methods
  static async createProduct(data: any): Promise<Product> {
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        description: data.description,
        isAvailable: data.isAvailable ?? true,
        image: data.image
      }
    });

    emitEvent('global', PRODUCT_ADDED, newProduct);
    return newProduct;
  }

  static async updateProduct(id: string, data: any): Promise<Product> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data
    });

    emitEvent('global', PRODUCT_UPDATED, updatedProduct);
    return updatedProduct;
  }

  static async deleteProduct(id: string): Promise<void> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    // User wants to forcefully delete. Manually remove from carts and order items to prevent FK constraints.
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    
    await prisma.product.delete({
      where: { id }
    });

    emitEvent('global', PRODUCT_DELETED, { productId: id });
  }

  static async toggleAvailability(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { isAvailable: !product.isAvailable }
    });

    emitEvent('global', PRODUCT_AVAILABILITY_CHANGED, { productId: id, isAvailable: updatedProduct.isAvailable });
    return updatedProduct;
  }

  static async getAllProductsAdmin(): Promise<Product[]> {
    return prisma.product.findMany({
      include: { category: true }
    });
  }
}
