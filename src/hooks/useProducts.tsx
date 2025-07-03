
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
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

      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const updateProductAvailability = async (productId: string, available: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ available, updated_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) throw error;

      // Atualizar estado local
      setProducts(prev => 
        prev.map(product => 
          product.id === productId 
            ? { ...product, available }
            : product
        )
      );

      return { success: true };
    } catch (err) {
      console.error('Error updating product:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erro ao atualizar produto' 
      };
    }
  };

  useEffect(() => {
    fetchProducts();

    // Configurar listening em tempo real para produtos
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          console.log('Product change detected, refetching...');
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    products,
    loading,
    error,
    updateProductAvailability,
    refetch: fetchProducts
  };
};
