
-- Inserir produtos de promoção
INSERT INTO public.products (name, description, price, category, available, image) VALUES
(
  'Combo Família', 
  '2 Pizzas Grandes + 2 Refrigerantes 2L + 1 Sobremesa', 
  45.90, 
  'promocoes', 
  true,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop'
),
(
  'Pizza + Bebida', 
  '1 Pizza Média + 1 Refrigerante 600ml', 
  22.90, 
  'promocoes', 
  true,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop'
);
