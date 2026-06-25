import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, cartApi } from "../lib/api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
}

export interface CartItem {
  id?: string; // CartItem ID from backend if synced
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Sync
  syncWithServer: () => Promise<void>;
  
  // Getters
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setCartOpen: (isOpen) => set({ isOpen }),

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item?.product?.id === product.id
          );

          if (existingItemIndex >= 0) {
            // Update existing item quantity
            const newItems = [...state.items];
            newItems[existingItemIndex].quantity += quantity;
            return { items: newItems, isOpen: true };
          } else {
            // Add new item
            return {
              items: [...state.items, { product, quantity }],
              isOpen: true,
            };
          }
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item?.product?.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item?.product?.id !== productId),
            };
          }

          return {
            items: state.items.map((item) =>
              item?.product?.id === productId ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => set({ items: [] }),

      syncWithServer: async () => {
        // Called after a user logs in to sync local cart with the backend cart
        try {
          const localItems = get().items;
          
          // If we have local items, push them to the server first
          for (const item of localItems) {
            if (!item?.product?.id) continue;
            // Skip items that already have an 'id' - they came from the server
            // and we don't want to re-add them and multiply their quantities
            if (item.id) continue; 
            
            try {
              // We assume addToCart will sum up quantities if it already exists on server
              await cartApi.addToCart({
                productId: item.product.id,
                quantity: item.quantity,
              });
            } catch (err) {
              console.error("Failed to sync item to server:", item?.product?.name, err);
            }
          }

          // Then fetch the definitive server cart
          const { data } = await cartApi.getCart();
          if (data && data.items) {
            // Map backend cart items back to the local store
            const serverItems: CartItem[] = data.items.map((item: any) => ({
              id: item.id,
              product: {
                id: item.product.id,
                name: item.product.name,
                description: item.product.description,
                price: item.product.price,
                image: item.product.image,
                categoryId: item.product.categoryId,
              },
              quantity: item.quantity,
            }));

            set({ items: serverItems });
          }
        } catch (error) {
          console.error("Failed to sync cart with server:", error);
        }
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          if (!item?.product) return total;
          const price = item.product.price || 0;
          const quantity = item.quantity || 0;
          return total + price * quantity;
        }, 0);
      },

      getTotalItems: () => {
        return get().items.reduce((count, item) => {
          if (!item?.product) return count;
          const quantity = item.quantity || 0;
          return count + quantity;
        }, 0);
      },
    }),
    {
      name: "nukkad-cart-storage",
      partialize: (state) => ({ items: state.items }), // Only persist items, not isOpen state
    }
  )
);
