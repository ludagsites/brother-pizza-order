
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  items: any[];
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_fee: number;
  payment_method: string;
  needs_change?: boolean;
  change_amount?: number;
  observations?: string;
  remove_ingredients?: string;
}

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrder = async (orderData: OrderData) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...orderData,
          user_id: user.id,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pedido confirmado!",
        description: "Seu pedido foi registrado com sucesso. Tempo de entrega: 30-60 minutos.",
      });

      return { success: true, order: data };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar pedido",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading };
};
