
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeliveryZone {
  id: string;
  neighborhood: string;
  delivery_fee: number;
}

export const useDeliveryZones = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('neighborhood');

      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      console.error('Erro ao buscar zonas de entrega:', error);
    } finally {
      setLoading(false);
    }
  };

  return { zones, loading };
};
