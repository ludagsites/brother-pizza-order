
-- Criar tabela para os sabores de pizza
CREATE TABLE public.pizza_flavors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tradicionais', 'especiais', 'doces')),
  ingredients TEXT NOT NULL,
  price_media NUMERIC NOT NULL,
  price_grande NUMERIC NOT NULL,
  price_familia NUMERIC NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pizza_flavors ENABLE ROW LEVEL SECURITY;

-- Política para todos verem os sabores disponíveis
CREATE POLICY "Anyone can view available pizza flavors" 
  ON public.pizza_flavors 
  FOR SELECT 
  USING (available = true);

-- Política para admins gerenciarem sabores
CREATE POLICY "Admins can manage pizza flavors" 
  ON public.pizza_flavors 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'admin@brotherspizzaria.com'
    )
  );

-- Inserir sabores tradicionais
INSERT INTO public.pizza_flavors (name, category, ingredients, price_media, price_grande, price_familia) VALUES
('Margherita', 'tradicionais', 'Molho de tomate, mussarela, manjericão, azeite', 25.00, 35.00, 50.00),
('Portuguesa', 'tradicionais', 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitona', 28.00, 38.00, 55.00),
('Calabresa', 'tradicionais', 'Molho de tomate, mussarela, calabresa, cebola', 26.00, 36.00, 52.00),
('Frango com Catupiry', 'tradicionais', 'Molho de tomate, mussarela, frango desfiado, catupiry', 30.00, 40.00, 58.00),
('Quatro Queijos', 'tradicionais', 'Molho de tomate, mussarela, parmesão, provolone, gorgonzola', 32.00, 42.00, 60.00),
('Pepperoni', 'tradicionais', 'Molho de tomate, mussarela, pepperoni', 29.00, 39.00, 56.00),
('Napolitana', 'tradicionais', 'Molho de tomate, mussarela, tomate, manjericão', 27.00, 37.00, 53.00),
('Atum', 'tradicionais', 'Molho de tomate, mussarela, atum, cebola, azeitona', 31.00, 41.00, 59.00),
('Bacon', 'tradicionais', 'Molho de tomate, mussarela, bacon, cebola', 30.00, 40.00, 58.00),
('Milho', 'tradicionais', 'Molho de tomate, mussarela, milho, orégano', 24.00, 34.00, 49.00),
('Americana', 'tradicionais', 'Molho de tomate, mussarela, presunto, champignon, palmito', 29.00, 39.00, 56.00),
('Vegetariana', 'tradicionais', 'Molho de tomate, mussarela, tomate, cebola, pimentão, azeitona', 28.00, 38.00, 55.00),
('Mussarela', 'tradicionais', 'Molho de tomate, mussarela, orégano', 23.00, 33.00, 48.00),
('Presunto', 'tradicionais', 'Molho de tomate, mussarela, presunto', 26.00, 36.00, 52.00),
('Anchovas', 'tradicionais', 'Molho de tomate, mussarela, anchovas, azeitona', 33.00, 43.00, 62.00),
('Romana', 'tradicionais', 'Molho de tomate, mussarela, presunto, tomate, orégano', 27.00, 37.00, 53.00),
('Siciliana', 'tradicionais', 'Molho de tomate, mussarela, calabresa, champignon, azeitona', 30.00, 40.00, 58.00),
('Caprese', 'tradicionais', 'Molho de tomate, mussarela de búfala, tomate, manjericão', 34.00, 44.00, 63.00),
('Abobrinha', 'tradicionais', 'Molho de tomate, mussarela, abobrinha, alho', 26.00, 36.00, 52.00),
('Rúcula', 'tradicionais', 'Molho de tomate, mussarela, rúcula, tomate seco', 29.00, 39.00, 56.00),
('Brócolis', 'tradicionais', 'Molho de tomate, mussarela, brócolis, alho', 27.00, 37.00, 53.00),
('Escarola', 'tradicionais', 'Molho de tomate, mussarela, escarola, bacon', 28.00, 38.00, 55.00),
('Palmito', 'tradicionais', 'Molho de tomate, mussarela, palmito, tomate', 30.00, 40.00, 58.00),
('Cogumelos', 'tradicionais', 'Molho de tomate, mussarela, champignon, shimeji', 31.00, 41.00, 59.00),
('Alho e Óleo', 'tradicionais', 'Molho de tomate, mussarela, alho, azeite, orégano', 25.00, 35.00, 50.00),
('Cebola', 'tradicionais', 'Molho de tomate, mussarela, cebola caramelizada', 26.00, 36.00, 52.00),
('Pimentão', 'tradicionais', 'Molho de tomate, mussarela, pimentão colorido', 27.00, 37.00, 53.00),
('Berinjela', 'tradicionais', 'Molho de tomate, mussarela, berinjela grelhada', 28.00, 38.00, 55.00),
('Tomate Seco', 'tradicionais', 'Molho de tomate, mussarela, tomate seco, manjericão', 30.00, 40.00, 58.00),
('Manjericão', 'tradicionais', 'Molho de tomate, mussarela, manjericão fresco', 26.00, 36.00, 52.00);

-- Inserir sabores especiais
INSERT INTO public.pizza_flavors (name, category, ingredients, price_media, price_grande, price_familia) VALUES
('Camarão', 'especiais', 'Molho de tomate, mussarela, camarão, catupiry', 45.00, 65.00, 90.00),
('Salmão', 'especiais', 'Molho branco, mussarela, salmão, alcaparras', 48.00, 68.00, 95.00),
('Lombo Canadense', 'especiais', 'Molho de tomate, mussarela, lombo canadense, abacaxi', 38.00, 55.00, 78.00),
('Cordeiro', 'especiais', 'Molho de tomate, mussarela, cordeiro, alecrim', 50.00, 70.00, 98.00),
('Pato', 'especiais', 'Molho de tomate, mussarela, pato desfiado, cereja', 46.00, 66.00, 92.00),
('Polvo', 'especiais', 'Molho de tomate, mussarela, polvo, azeitona', 47.00, 67.00, 93.00),
('Lagosta', 'especiais', 'Molho branco, mussarela, lagosta, limão siciliano', 55.00, 75.00, 105.00),
('File Mignon', 'especiais', 'Molho de tomate, mussarela, filé mignon, champignon', 52.00, 72.00, 100.00),
('Costela', 'especiais', 'Molho barbecue, mussarela, costela desfiada, cebola', 42.00, 62.00, 85.00),
('Picanha', 'especiais', 'Molho de tomate, mussarela, picanha, pimentão', 49.00, 69.00, 96.00),
('Bacalhau', 'especiais', 'Molho branco, mussarela, bacalhau, batata', 44.00, 64.00, 88.00),
('Caviar', 'especiais', 'Molho branco, mussarela, caviar, cream cheese', 60.00, 80.00, 110.00),
('Trufa Negra', 'especiais', 'Molho branco, mussarela, trufa negra, parmesão', 65.00, 85.00, 120.00),
('Foie Gras', 'especiais', 'Molho de tomate, mussarela, foie gras, figo', 58.00, 78.00, 108.00),
('Osso Buco', 'especiais', 'Molho de tomate, mussarela, osso buco, gremolata', 47.00, 67.00, 93.00),
('Lula', 'especiais', 'Molho de tomate, mussarela, lula, alho', 43.00, 63.00, 86.00),
('Vieiras', 'especiais', 'Molho branco, mussarela, vieiras, manjericão', 51.00, 71.00, 99.00),
('Caranguejo', 'especiais', 'Molho de tomate, mussarela, caranguejo, limão', 46.00, 66.00, 92.00),
('Peixe Espada', 'especiais', 'Molho de tomate, mussarela, peixe espada, alcaparras', 44.00, 64.00, 88.00),
('Avestruz', 'especiais', 'Molho de tomate, mussarela, avestruz, rúcula', 53.00, 73.00, 102.00),
('Javali', 'especiais', 'Molho de tomate, mussarela, javali, cogumelos', 54.00, 74.00, 103.00),
('Coelho', 'especiais', 'Molho de tomate, mussarela, coelho, alecrim', 48.00, 68.00, 95.00),
('Codorna', 'especiais', 'Molho de tomate, mussarela, codorna, uva', 45.00, 65.00, 90.00),
('Paca', 'especiais', 'Molho de tomate, mussarela, paca, mandioca', 49.00, 69.00, 96.00),
('Capivara', 'especiais', 'Molho de tomate, mussarela, capivara, palmito', 47.00, 67.00, 93.00),
('Tartaruga', 'especiais', 'Molho verde, mussarela, tartaruga, ervas', 52.00, 72.00, 100.00),
('Crocodilo', 'especiais', 'Molho de tomate, mussarela, crocodilo, pimenta', 56.00, 76.00, 106.00),
('Búfalo', 'especiais', 'Molho de tomate, mussarela, búfalo, cebola roxa', 50.00, 70.00, 98.00),
('Alce', 'especiais', 'Molho de tomate, mussarela, alce, cranberry', 57.00, 77.00, 107.00),
('Rena', 'especiais', 'Molho de tomate, mussarela, rena, cogumelos', 55.00, 75.00, 105.00);

-- Inserir sabores doces
INSERT INTO public.pizza_flavors (name, category, ingredients, price_media, price_grande, price_familia) VALUES
('Chocolate', 'doces', 'Massa doce, chocolate, leite condensado', 28.00, 38.00, 55.00),
('Brigadeiro', 'doces', 'Massa doce, brigadeiro, granulado', 30.00, 40.00, 58.00),
('Romeu e Julieta', 'doces', 'Massa doce, queijo, goiabada', 26.00, 36.00, 52.00),
('Banana com Canela', 'doces', 'Massa doce, banana, canela, açúcar', 25.00, 35.00, 50.00),
('Nutella', 'doces', 'Massa doce, nutella, morango', 35.00, 48.00, 68.00),
('Prestígio', 'doces', 'Massa doce, chocolate, coco ralado', 32.00, 42.00, 60.00),
('Beijinho', 'doces', 'Massa doce, leite condensado, coco', 29.00, 39.00, 56.00),
('Churros', 'doces', 'Massa doce, doce de leite, canela', 31.00, 41.00, 59.00),
('Sonho de Valsa', 'doces', 'Massa doce, chocolate, amendoim', 33.00, 43.00, 62.00),
('Paçoca', 'doces', 'Massa doce, paçoca, leite condensado', 30.00, 40.00, 58.00),
('Oreo', 'doces', 'Massa doce, biscoito oreo, cream cheese', 34.00, 44.00, 63.00),
('Mousse de Maracujá', 'doces', 'Massa doce, mousse de maracujá', 27.00, 37.00, 53.00),
('Pudim', 'doces', 'Massa doce, pudim, calda de caramelo', 28.00, 38.00, 55.00),
('Sorvete', 'doces', 'Massa doce, sorvete de baunilha, calda', 26.00, 36.00, 52.00),
('Morango com Chocolate', 'doces', 'Massa doce, morango, chocolate branco', 32.00, 42.00, 60.00),
('Banana Split', 'doces', 'Massa doce, banana, sorvete, calda', 30.00, 40.00, 58.00),
('Doce de Leite', 'doces', 'Massa doce, doce de leite, coco', 29.00, 39.00, 56.00),
('Cocada', 'doces', 'Massa doce, cocada, leite condensado', 28.00, 38.00, 55.00),
('Quindim', 'doces', 'Massa doce, quindim, coco', 31.00, 41.00, 59.00),
('Bis', 'doces', 'Massa doce, chocolate bis, leite condensado', 33.00, 43.00, 62.00),
('Kit Kat', 'doces', 'Massa doce, kit kat, chocolate', 34.00, 44.00, 63.00),
('M&M', 'doces', 'Massa doce, m&m, chocolate', 35.00, 45.00, 65.00),
('Chocolate Branco', 'doces', 'Massa doce, chocolate branco, morango', 30.00, 40.00, 58.00),
('Leite Ninho', 'doces', 'Massa doce, leite ninho, morango', 32.00, 42.00, 60.00),
('Ovomaltine', 'doces', 'Massa doce, ovomaltine, leite condensado', 31.00, 41.00, 59.00),
('Açaí', 'doces', 'Massa doce, açaí, granola', 29.00, 39.00, 56.00),
('Cupuaçu', 'doces', 'Massa doce, cupuaçu, castanha', 28.00, 38.00, 55.00),
('Caju', 'doces', 'Massa doce, caju, castanha de caju', 27.00, 37.00, 53.00),
('Manga', 'doces', 'Massa doce, manga, coco', 26.00, 36.00, 52.00),
('Abacaxi', 'doces', 'Massa doce, abacaxi, canela', 25.00, 35.00, 50.00);

-- Habilitar realtime para a tabela
ALTER TABLE public.pizza_flavors REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pizza_flavors;
