
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PizzaFlavor {
  id: string;
  name: string;
  category: 'tradicionais' | 'especiais' | 'doces';
  ingredients: string;
  price_media: number;
  price_grande: number;
  price_familia: number;
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
      setFlavors(data || []);
    } catch (error) {
      console.error('Erro ao buscar sabores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlavorsByCategory = (category: string) => {
    return flavors.filter(flavor => flavor.category === category);
  };

  const getMinPrice = (size: 'media' | 'grande' | 'familia') => {
    if (flavors.length === 0) return 0;
    const priceField = `price_${size}`;
    return Math.min(...flavors.map(flavor => flavor[priceField]));
  };

  return {
    flavors,
    loading,
    getFlavorsByCategory,
    getMinPrice,
    fetchFlavors
  };
};
