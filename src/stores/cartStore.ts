
import { create } from 'zustand';
import { CartItem, Product, ProductSize, ProductExtra } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size?: ProductSize, extras?: ProductExtra[]) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const calculateItemPrice = (product: Product, size?: ProductSize, extras?: ProductExtra[]) => {
  let price = product.price;
  if (size) price += size.price;
  if (extras) price += extras.reduce((sum, extra) => sum + extra.price, 0);
  return price;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (product, size, extras = []) => {
    const itemId = `${product.id}-${size?.id || 'no-size'}-${extras.map(e => e.id).join(',')}`;
    const totalPrice = calculateItemPrice(product, size, extras);
    
    set((state) => {
      const existingItem = state.items.find(item => item.id === itemId);
      
      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        items: [...state.items, {
          id: itemId,
          product,
          quantity: 1,
          selectedSize: size,
          selectedExtras: extras,
          totalPrice
        }]
      };
    });
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId)
    }));
  },
  
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  },
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));
