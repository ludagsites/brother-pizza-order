
import { create } from 'zustand';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

interface ProductStore {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleAvailability: (id: string) => void;
  getProductsByCategory: (category: string) => Product[];
  getAvailableProducts: () => Product[];
  getUnavailableProducts: () => Product[];
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: initialProducts,

  addProduct: (productData) => set((state) => ({
    products: [
      ...state.products,
      {
        ...productData,
        id: Math.random().toString(36).substr(2, 9)
      }
    ]
  })),

  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(product =>
      product.id === id ? { ...product, ...updates } : product
    )
  })),

  deleteProduct: (id) => set((state) => ({
    products: state.products.filter(product => product.id !== id)
  })),

  toggleAvailability: (id) => set((state) => ({
    products: state.products.map(product =>
      product.id === id ? { ...product, available: !product.available } : product
    )
  })),

  getProductsByCategory: (category) => {
    return get().products.filter(product => product.category === category);
  },

  getAvailableProducts: () => {
    return get().products.filter(product => product.available);
  },

  getUnavailableProducts: () => {
    return get().products.filter(product => !product.available);
  }
}));
