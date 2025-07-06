
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type PizzaFlavorRow = Database['public']['Tables']['pizza_flavors']['Row'];

interface PizzaFlavor {
  id: string;
  name: string;
  category: 'tradicionais' | 'especiais' | 'doces';
  ingredients: string;
  price_media: number;
  price_grande: number;
  price_famiglia: number;
  available: boolean;
}

export const usePizzaFlavors = () => {
  const [flavors, setFlavors] = useState<PizzaFlavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlavors();
  }, []);

  const fetchFlavors = async () => {
    try {
      const { data, error } = await supabase
        .from('pizza_flavors')
        .select('*')
        .eq('available', true)
        .order('name');

      if (error) throw error;
      
      // Map the data to ensure proper typing
      const mappedFlavors = (data || []).map((flavor: PizzaFlavorRow) => ({
        id: flavor.id,
        name: flavor.name,
        category: flavor.category as 'tradicionais' | 'especiais' | 'doces',
        ingredients: flavor.ingredients,
        price_media: flavor.price_media,
        price_grande: flavor.price_grande,
        price_famiglia: flavor.price_familia,
        available: flavor.available || false
      }));
      
      setFlavors(mappedFlavors);
    } catch (error) {
      console.error('Erro ao buscar sabores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlavorsByCategory = (category: string) => {
    return flavors.filter(flavor => flavor.category === category);
  };

  const getMinPrice = (size: 'media' | 'grande' | 'famiglia') => {
    if (flavors.length === 0) return 0;
    const priceField = `price_${size}`;
    return Math.min(...flavors.map(flavor => flavor[priceField as keyof PizzaFlavor] as number));
  };

  return {
    flavors,
    loading,
    getFlavorsByCategory,
    getMinPrice,
    fetchFlavors
  };
};
