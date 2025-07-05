
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  created_at: string;
}

export const useChat = (orderId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!orderId) return;

    fetchMessages();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`chat_${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          message: message.trim()
        });

      if (error) throw error;

      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive",
      });
    }
  };

  return { messages, loading, sendMessage };
};
