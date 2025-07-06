
-- Criar tabela para controlar status da loja
CREATE TABLE public.store_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_open BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users
);

-- Inserir configuração inicial (loja aberta)
INSERT INTO public.store_settings (is_open) VALUES (true);

-- Habilitar RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Política para visualização (todos podem ver se a loja está aberta)
CREATE POLICY "Anyone can view store status" 
  ON public.store_settings 
  FOR SELECT 
  USING (true);

-- Política para admin gerenciar status da loja
CREATE POLICY "Admins can manage store status" 
  ON public.store_settings 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email = 'admin@brotherspizzaria.com'
  ));

-- Habilitar realtime para a tabela
ALTER TABLE public.store_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
