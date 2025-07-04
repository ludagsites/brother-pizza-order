
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import CartDrawer from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { categories } from '@/data/products';
import { Product, ProductCategory } from '@/types';
import { Settings, Pizza, Clock, MapPin, Phone } from 'lucide-react';

const Index = () => {
  const { 
    products, 
    loading, 
    error, 
    fetchProducts, 
    subscribeToChanges, 
    unsubscribeFromChanges 
  } = useSupabaseProductStore();

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    subscribeToChanges();
    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const pizzas = filteredProducts.filter(product => product.category === 'pizzas');
  const otherProducts = filteredProducts.filter(product => product.category !== 'pizzas');

  const pizzasBySize = {
    media: pizzas.filter(pizza => pizza.price <= 39.90),
    grande: pizzas.filter(pizza => pizza.price > 39.90 && pizza.price <= 49.90),
    familia: pizzas.filter(pizza => pizza.price > 49.90)
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
  };

  const renderProductGrid = (products: Product[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleProductClick}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 font-semibold">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 font-semibold">Erro ao carregar produtos: {error}</p>
          <Button onClick={fetchProducts} className="bg-amber-700 hover:bg-amber-800 text-white">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-amber-800 to-orange-700 text-white py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8">
            <Pizza className="h-16 w-16 mx-auto mb-4 text-amber-200" />
            <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{ fontFamily: 'cursive' }}>
              Brother's Pizzaria
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 font-semibold">
              As melhores pizzas da cidade, direto no seu lar
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg opacity-80 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Delivery rápido</span>
              </div>
              <div className="flex items-center gap-2">
                <Pizza className="h-5 w-5" />
                <span>Ingredientes frescos</span>
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span>Sabor incomparável</span>
              </div>
            </div>
          </div>
          
          {/* Botão Principal */}
          <Link to="/order">
            <Button 
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 text-2xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
              style={{ fontFamily: 'cursive' }}
            >
              🍕 FAZER PEDIDO 🍕
            </Button>
          </Link>
        </div>
        
        {/* Admin Access Button */}
        <Link to="/admin">
          <Button 
            variant="outline" 
            size="sm"
            className="absolute top-4 right-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        </Link>
      </section>

      {/* Info Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Pizza className="h-12 w-12 mx-auto mb-4 text-amber-700" />
              <h3 className="text-xl font-bold text-amber-900 mb-2">Pizzas Artesanais</h3>
              <p className="text-gray-600">Feitas com ingredientes selecionados e muito amor</p>
            </div>
            <div className="p-6">
              <Clock className="h-12 w-12 mx-auto mb-4 text-amber-700" />
              <h3 className="text-xl font-bold text-amber-900 mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">Seu pedido quentinho em até 40 minutos</p>
            </div>
            <div className="p-6">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-amber-700" />
              <h3 className="text-xl font-bold text-amber-900 mb-2">Atendemos Toda Cidade</h3>
              <p className="text-gray-600">Delivery para toda região com taxa especial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Preview */}
      <Header 
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={handleMenuClick}
      />
      
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <main className="container px-4 py-8">
        {selectedCategory === 'pizzas' || selectedCategory === 'all' ? (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-amber-900 mb-6 text-center">🍕 Nossas Pizzas</h2>
            
            <Tabs defaultValue="media" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-amber-100">
                <TabsTrigger value="media" className="text-sm font-semibold data-[state=active]:bg-amber-700 data-[state=active]:text-white">
                  Média ({pizzasBySize.media.length})
                </TabsTrigger>
                <TabsTrigger value="grande" className="text-sm font-semibold data-[state=active]:bg-amber-700 data-[state=active]:text-white">
                  Grande ({pizzasBySize.grande.length})
                </TabsTrigger>
                <TabsTrigger value="familia" className="text-sm font-semibold data-[state=active]:bg-amber-700 data-[state=active]:text-white">
                  Família ({pizzasBySize.familia.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="media" className="space-y-6">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">Pizza Média</h3>
                  <p className="text-amber-600">Ideal para 1-2 pessoas • Até R$ 39,90</p>
                </div>
                {pizzasBySize.media.length > 0 ? (
                  renderProductGrid(pizzasBySize.media)
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma pizza média disponível no momento</p>
                )}
              </TabsContent>

              <TabsContent value="grande" className="space-y-6">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">Pizza Grande</h3>
                  <p className="text-amber-600">Ideal para 2-3 pessoas • R$ 39,91 - R$ 49,90</p>
                </div>
                {pizzasBySize.grande.length > 0 ? (
                  renderProductGrid(pizzasBySize.grande)
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma pizza grande disponível no momento</p>
                )}
              </TabsContent>

              <TabsContent value="familia" className="space-y-6">
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-semibold text-amber-800 mb-2">Pizza Família</h3>
                  <p className="text-amber-600">Ideal para 4+ pessoas • Acima de R$ 49,90</p>
                </div>
                {pizzasBySize.familia.length > 0 ? (
                  renderProductGrid(pizzasBySize.familia)
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma pizza família disponível no momento</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        {selectedCategory !== 'pizzas' && otherProducts.length > 0 && (
          <div className="mb-8">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">
                {selectedCategory === 'all' ? 'Outros Produtos' : 
                 categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-amber-600">
                {otherProducts.length} {otherProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {renderProductGrid(otherProducts)}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍕</span>
            </div>
            <h3 className="text-xl font-semibold text-amber-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-amber-600">
              Tente selecionar uma categoria diferente
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-xl font-bold mb-4">Contato</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>(75) 99166-2591</span>
                </div>
                <p>WhatsApp: (75) 98851-0206</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Horário de Funcionamento</h3>
              <div className="space-y-1">
                <p>Segunda a Domingo</p>
                <p>18:00 às 23:00</p>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Pagamento</h3>
              <div className="space-y-1">
                <p>PIX, Cartão, Dinheiro</p>
                <p>PIX: (75) 98851-0206</p>
                <p>Jeferson Barboza</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-amber-700 mt-8 pt-8 text-center">
            <p className="text-amber-200">
              © 2024 Brother's Pizzaria - Feito com ❤️ para você
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default Index;
