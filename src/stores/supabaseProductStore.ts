
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

interface SupabaseProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  updateProductAvailability: (productId: string, available: boolean) => Promise<{ success: boolean; error?: string }>;
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

      const formattedProducts: Product[] = data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: Number(product.price),
        category: product.category as any,
        image: product.image || '/placeholder.svg',
        available: product.available || false,
        sizes: product.sizes ? JSON.parse(product.sizes as string) : [],
        extras: product.extras ? JSON.parse(product.extras as string) : []
      }));

      set({ products: formattedProducts, loading: false });
    } catch (err) {
      console.error('Error fetching products:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Erro ao carregar produtos',
        loading: false 
      });
    }
  },

  updateProductAvailability: async (productId: string, available: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) throw error;

      // Atualizar estado local imediatamente
      set(state => ({
        products: state.products.map(product => 
          product.id === productId 
            ? { ...product, available }
            : product
        )
      }));

      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
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
        (payload) => {
          console.log('Product change detected:', payload);
          get().fetchProducts();
        }
      )
      .subscribe();

    // Armazenar referência do channel para cleanup
    (window as any).productsChannel = channel;
  },

  unsubscribeFromChanges: () => {
    if ((window as any).productsChannel) {
      supabase.removeChannel((window as any).productsChannel);
      (window as any).productsChannel = null;
    }
  }
}));
