'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { cartService } from '@/services/cart.service';
import { Cart } from '@/types';

export interface AddItemPayload {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextValue {
  cart: Cart | null;
  items: Cart['items'];
  totalItems: number;
  totalAmount: number;
  lastAddedAnimation: number;
  isLoading: boolean;
  addItem: (payload: AddItemPayload) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [lastAddedAnimation, setLastAddedAnimation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      console.error('Gagal memuat cart:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(
    async (payload: AddItemPayload) => {
      await cartService.addToCart(payload);
      await refreshCart();
      setLastAddedAnimation((prev) => prev + 1);
    },
    [refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      await cartService.removeCartItem(itemId);
      await refreshCart();
    },
    [refreshCart]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      await cartService.updateCartItem(itemId, quantity);
      await refreshCart();
    },
    [refreshCart]
  );

  const items = cart?.items ?? [];
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totalItems,
        totalAmount,
        lastAddedAnimation,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}