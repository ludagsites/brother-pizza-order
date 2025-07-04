
-- Criar tabela para taxas de entrega por bairro
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  neighborhood TEXT NOT NULL UNIQUE,
  delivery_fee DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir bairros de exemplo com taxas de entrega
INSERT INTO public.delivery_zones (neighborhood, delivery_fee) VALUES
('Centro', 8.00),
('Brasília', 9.50),
('Kalilândia', 10.00),
('Conceição', 11.00),
('Feira VI', 12.00),
('Feira VII', 8.50),
('Feira IX', 13.00),
('Feira X', 14.00),
('George Américo', 15.00),
('Mangabeira', 12.50),
('Sobradinho', 11.50),
('Tomba', 9.00),
('Baraúnas', 10.50),
('Cidade Nova', 13.50),
('Papagaio', 14.50),
('Santa Mônica', 8.00),
('Aviário', 9.50),
('Capuã', 12.00),
('Serraria Brasil', 15.00),
('Campo Limpo', 11.00);

-- Habilitar RLS na tabela de zonas de entrega
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Permitir que qualquer pessoa veja as zonas de entrega
CREATE POLICY "Anyone can view delivery zones" 
  ON public.delivery_zones 
  FOR SELECT 
  USING (true);

-- Adicionar colunas necessárias na tabela de pedidos
ALTER TABLE public.orders 
ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT 0,
ADD COLUMN delivery_time_estimate TEXT DEFAULT '30-60 minutos',
ADD COLUMN payment_method TEXT,
ADD COLUMN needs_change BOOLEAN DEFAULT false,
ADD COLUMN change_amount DECIMAL(10,2),
ADD COLUMN remove_ingredients TEXT,
ADD COLUMN observations TEXT;

-- Atualizar produtos com ingredientes de exemplo para pizzas
UPDATE public.products 
SET description = CASE 
  WHEN name = 'Margherita' THEN 'Molho de tomate, mussarela, manjericão, orégano'
  WHEN name = 'Pepperoni' THEN 'Molho de tomate, mussarela, pepperoni, orégano'
  WHEN name = 'Portuguesa' THEN 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitona'
  WHEN name = 'Calabresa' THEN 'Molho de tomate, mussarela, calabresa, cebola, orégano'
  WHEN name = 'Quatro Queijos' THEN 'Molho de tomate, mussarela, catupiry, parmesão, provolone'
  WHEN name = 'Frango com Catupiry' THEN 'Molho de tomate, mussarela, frango desfiado, catupiry, milho'
  WHEN name = 'Bacon' THEN 'Molho de tomate, mussarela, bacon, cebola, orégano'
  WHEN name = 'Vegetariana' THEN 'Molho de tomate, mussarela, pimentão, champignon, cebola, azeitona'
  WHEN name = 'Napolitana' THEN 'Molho de tomate, mussarela, tomate, manjericão, alho'
  WHEN name = 'Toscana' THEN 'Molho de tomate, mussarela, calabresa, bacon, ovo, cebola'
  WHEN name = 'Especial da Casa' THEN 'Molho de tomate, mussarela, presunto, bacon, champignon, azeitona'
  WHEN name = 'Camarão' THEN 'Molho de tomate, mussarela, camarão, catupiry, cebola'
  WHEN name = 'Chocolate' THEN 'Chocolate ao leite, granulado, leite condensado'
  WHEN name = 'Brigadeiro' THEN 'Chocolate, brigadeiro, granulado, leite condensado'
  WHEN name = 'Banana com Canela' THEN 'Banana, canela, açúcar, leite condensado'
  ELSE description
END
WHERE category = 'pizzas';
