
-- Atualizar a função handle_new_user para incluir telefone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$;

-- Adicionar alguns produtos de bebidas de exemplo
INSERT INTO public.products (name, description, price, category, available) VALUES
('Coca-Cola 350ml', 'Refrigerante de cola gelado', 4.50, 'bebidas', true),
('Coca-Cola 600ml', 'Refrigerante de cola gelado', 6.00, 'bebidas', true),
('Guaraná Antarctica 350ml', 'Refrigerante de guaraná gelado', 4.50, 'bebidas', true),
('Guaraná Antarctica 600ml', 'Refrigerante de guaraná gelado', 6.00, 'bebidas', true),
('Sprite 350ml', 'Refrigerante de limão gelado', 4.50, 'bebidas', true),
('Fanta Laranja 350ml', 'Refrigerante de laranja gelado', 4.50, 'bebidas', true),
('Água Mineral 500ml', 'Água mineral natural', 2.50, 'bebidas', true),
('Suco de Laranja 300ml', 'Suco natural de laranja', 5.00, 'bebidas', true),
('Suco de Maracujá 300ml', 'Suco natural de maracujá', 5.00, 'bebidas', true),
('Cerveja Skol 350ml', 'Cerveja gelada', 4.00, 'bebidas', true);
