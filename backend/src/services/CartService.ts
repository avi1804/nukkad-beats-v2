import { CartItem } from '@prisma/client';
import { prisma } from '../utils/prisma';

export class CartService {
  static async getCart(userId: string) {
    // First ensure cart exists
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: { product: true }
          }
        }
      });
    }

    const subtotal = cart.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const tax = 0; // No extra tax
    const total = subtotal;

    return {
      items: cart.items,
      summary: {
        subtotal,
        tax,
        total
      }
    };
  }

  static async addToCart(userId: string, data: any): Promise<CartItem> {
    const { productId, quantity } = data;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product || !product.isAvailable) {
      throw new Error('Product not available');
    }

    // Ensure cart exists
    let cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    }

    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      }
    });
  }

  static async updateCartItem(id: string, userId: string, quantity: number): Promise<CartItem> {
    // Find cart for user
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, cartId: cart.id }
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    return prisma.cartItem.update({
      where: { id },
      data: { quantity }
    });
  }

  static async removeCartItem(id: string, userId: string): Promise<void> {
    // Find cart for user
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const item = await prisma.cartItem.findFirst({
      where: { id, cartId: cart.id }
    });

    if (!item) {
      throw new Error('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id }
    });
  }

  static async clearCart(userId: string): Promise<void> {
    const cart = await prisma.cart.findUnique({
      where: { userId }
    });

    if (!cart) {
      return;
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }
}
