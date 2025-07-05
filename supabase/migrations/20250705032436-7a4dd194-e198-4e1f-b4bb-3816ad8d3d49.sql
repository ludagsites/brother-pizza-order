
-- Criar tabela para mensagens do chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de mensagens
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas mensagens dos seus pedidos
CREATE POLICY "Users can view messages from their orders" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = chat_messages.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Política para usuários enviarem mensagens nos seus pedidos
CREATE POLICY "Users can send messages to their orders" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = chat_messages.order_id 
      AND orders.user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- Política para admins verem todas as mensagens
CREATE POLICY "Admins can view all messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'admin@brotherspizzaria.com'
    )
  );

-- Política para admins enviarem mensagens
CREATE POLICY "Admins can send messages to any order" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'admin@brotherspizzaria.com'
    )
    AND sender_id = auth.uid()
  );

-- Habilitar realtime para a tabela de mensagens
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
