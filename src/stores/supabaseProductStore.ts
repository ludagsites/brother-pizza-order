import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface SupabaseProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  updateProductAvailability: (
    productId: string,
    available: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  subscribeToChanges: () => void;
  unsubscribeFromChanges: () => void;
}

export const useSupabaseProductStore = create<SupabaseProductStore>((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      const formattedProducts: Product[] = data.map((product: any) => {
        let sizes = [];
        let extras = [];

        try {
          if (product.sizes && typeof product.sizes === 'string') {
            sizes = JSON.parse(product.sizes);
          }
        } catch (e) {
          console.warn(`Erro ao parsear sizes do produto ${product.name}:`, e);
        }

        try {
          if (product.extras && typeof product.extras === 'string') {
            extras = JSON.parse(product.extras);
          }
        } catch (e) {
          console.warn(`Erro ao parsear extras do produto ${product.name}:`, e);
        }

        return {
          id: product.id,
          name: product.name,
          description: product.description || '',
          price: Number(product.price),
          category: product.category,
          image: product.image || '/placeholder.svg',
          available: product.available ?? false,
          sizes,
          extras
        };
      });

      set({ products: formattedProducts, loading: false });
    } catch (err) {
      console.error('Erro ao buscar produtos:', err);
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar produtos',
        loading: false
      });
    }
  },

  updateProductAvailability: async (productId, available) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) throw error;

      set((state) => ({
        products: state.products.map((product) =>
          product.id === productId ? { ...product, available } : product
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Erro ao atualizar produto'
      };
    }
  },

  subscribeToChanges: () => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          get().fetchProducts();
        }
      )
      .subscribe();

    (window as any).productsChannel = channel;
  },

  unsubscribeFromChanges: () => {
    if ((window as any).productsChannel) {
      supabase.removeChannel((window as any).productsChannel);
      (window as any).productsChannel = null;
    }
  }
}));
