
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para perfis
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  available BOOLEAN DEFAULT true,
  sizes JSONB DEFAULT '[]',
  extras JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para produtos (públicos para leitura, apenas admin para escrita)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Políticas para produtos
CREATE POLICY "Anyone can view available products" ON public.products
  FOR SELECT USING (available = true);

CREATE POLICY "Admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email = 'admin@brotherspizzaria.com'
    )
  );

-- Criar tabela de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para pedidos
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND email = 'admin@brotherspizzaria.com'
    )
  );

-- Criar tabela de itens do carrinho (opcional, para persistência)
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  selected_size JSONB,
  selected_extras JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, selected_size)
);

-- Habilitar RLS para itens do carrinho
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para carrinho
CREATE POLICY "Users can manage own cart" ON public.cart_items
  FOR ALL USING (user_id = auth.uid());

-- Inserir alguns produtos de exemplo
INSERT INTO public.products (name, description, price, category, image, available) VALUES
('Pizza Margherita', 'Molho de tomate, mussarela, manjericão e azeitonas', 35.90, 'pizzas', '/placeholder.svg', true),
('Pizza Calabresa', 'Molho de tomate, mussarela, calabresa e cebola', 38.90, 'pizzas', '/placeholder.svg', true),
('Pizza Portuguesa', 'Molho de tomate, mussarela, presunto, ovos, ervilha e cebola', 42.90, 'pizzas', '/placeholder.svg', true),
('Coca-Cola 350ml', 'Refrigerante gelado', 5.90, 'bebidas', '/placeholder.svg', true),
('Água 500ml', 'Água mineral', 3.50, 'bebidas', '/placeholder.svg', true),
('Pudim de Leite', 'Sobremesa tradicional brasileira', 8.90, 'sobremesas', '/placeholder.svg', true);
