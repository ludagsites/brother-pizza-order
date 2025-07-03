
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
import { Settings } from 'lucide-react';

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
    // Buscar produtos inicialmente
    fetchProducts();
    
    // Configurar atualizações em tempo real
    subscribeToChanges();

    // Cleanup na desmontagem
    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Organizar pizzas por tamanho
  const pizzas = filteredProducts.filter(product => product.category === 'pizzas');
  const otherProducts = filteredProducts.filter(product => product.category !== 'pizzas');

  // Categorizar pizzas por tamanho baseado no preço
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro ao carregar produtos: {error}</p>
          <Button onClick={fetchProducts}>Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onCartClick={() => setIsCartOpen(true)}
        onMenuClick={handleMenuClick}
      />
      
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Hero Section */}
      <section className="hero-gradient text-white py-12 relative">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Brother's Pizzaria
          </h1>
          <p className="text-xl md:text-2xl mb-6 opacity-90">
            As melhores pizzas da cidade, direto no seu lar
          </p>
          <p className="text-lg opacity-80">
            Delivery rápido • Ingredientes frescos • Sabor incomparável
          </p>
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

      {/* Products Section */}
      <main className="container px-4 py-8">
        {selectedCategory === 'pizzas' || selectedCategory === 'all' ? (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🍕 Nossas Pizzas</h2>
            
            <Tabs defaultValue="media" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="media" className="text-sm">
                  Média ({pizzasBySize.media.length})
                </TabsTrigger>
                <TabsTrigger value="grande" className="text-sm">
                  Grande ({pizzasBySize.grande.length})
                </TabsTrigger>
                <TabsTrigger value="familia" className="text-sm">
                  Família ({pizzasBySize.familia.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="media" className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Pizza Média</h3>
                  <p className="text-gray-600">Ideal para 1-2 pessoas • Até R$ 39,90</p>
                </div>
                {pizzasBySize.media.length > 0 ? (
                  renderProductGrid(pizzasBySize.media)
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma pizza média disponível no momento</p>
                )}
              </TabsContent>

              <TabsContent value="grande" className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Pizza Grande</h3>
                  <p className="text-gray-600">Ideal para 2-3 pessoas • R$ 39,91 - R$ 49,90</p>
                </div>
                {pizzasBySize.grande.length > 0 ? (
                  renderProductGrid(pizzasBySize.grande)
                ) : (
                  <p className="text-center text-gray-500 py-8">Nenhuma pizza grande disponível no momento</p>
                )}
              </TabsContent>

              <TabsContent value="familia" className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Pizza Família</h3>
                  <p className="text-gray-600">Ideal para 4+ pessoas • Acima de R$ 49,90</p>
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

        {/* Other Products */}
        {selectedCategory !== 'pizzas' && otherProducts.length > 0 && (
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedCategory === 'all' ? 'Outros Produtos' : 
                 categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {otherProducts.length} {otherProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>

            {renderProductGrid(otherProducts)}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🍕</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600">
              Tente selecionar uma categoria diferente
            </p>
          </div>
        )}
      </main>

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
