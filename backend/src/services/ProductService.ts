import { Product } from '@prisma/client';
import { prisma } from '../utils/prisma';

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
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        description: data.description,
        isAvailable: data.isAvailable ?? true,
        image: data.image
      }
    });
  }

  static async updateProduct(id: string, data: any): Promise<Product> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data
    });
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
  }

  static async toggleAvailability(id: string): Promise<Product> {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }

    return prisma.product.update({
      where: { id },
      data: { isAvailable: !product.isAvailable }
    });
  }

  static async getAllProductsAdmin(): Promise<Product[]> {
    return prisma.product.findMany({
      include: { category: true }
    });
  }
}
