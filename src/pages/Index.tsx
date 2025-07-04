
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Settings } from 'lucide-react';

const Index = () => {
  const { products, loading, fetchProducts, subscribeToChanges, unsubscribeFromChanges } = useSupabaseProductStore();
  const { user } = useSupabaseAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
    subscribeToChanges();

    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="hero-gradient text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Brother's Pizzaria
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              As melhores pizzas da cidade, feitas com amor e ingredientes frescos
            </p>
            {user ? (
              <div className="space-y-4">
                <Link to="/order">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Fazer Pedido
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg opacity-90 mb-4">
                  Faça login para realizar pedidos
                </p>
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                    Entrar / Cadastrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Nosso Cardápio
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubra nossos sabores únicos e ingredientes selecionados
              </p>
            </div>

            <CategoryFilter
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showAddToCart={user !== null}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  Nenhum produto encontrado nesta categoria.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="text-2xl font-bold">Brother's Pizzaria</h3>
                <p className="text-gray-400">© 2024 Todos os direitos reservados</p>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
