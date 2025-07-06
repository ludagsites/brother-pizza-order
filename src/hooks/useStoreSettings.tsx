
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StoreSettings {
  id: string;
  is_open: boolean;
  updated_at: string;
  updated_by: string | null;
}

export const useStoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erro ao buscar configurações da loja:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async () => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('store_settings')
        .update({ 
          is_open: !settings.is_open,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: "Status da loja atualizado",
        description: `Loja ${!settings.is_open ? 'aberta' : 'fechada'} com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status da loja:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da loja",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStoreSettings();

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('store-settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_settings'
        },
        () => {
          fetchStoreSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    loading,
    toggleStoreStatus,
    isOpen: settings?.is_open ?? true
  };
};
