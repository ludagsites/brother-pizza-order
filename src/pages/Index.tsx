
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Percent, Settings } from 'lucide-react';

const Index = () => {
  const { products, loading, fetchProducts, subscribeToChanges, unsubscribeFromChanges } = useSupabaseProductStore();
  const { user } = useSupabaseAuth();

  useEffect(() => {
    fetchProducts();
    subscribeToChanges();

    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  // Filtrar promoções
  const promotions = products.filter(product => product.category === 'promocoes' && product.available);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link to="/order">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Fazer Pedidos
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Fazer Pedidos
                  </Button>
                </Link>
              )}
              
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-8 py-3 text-lg">
                <Percent className="mr-2 h-5 w-5" />
                Ver Promoções
              </Button>
            </div>
          </div>
        </section>

        {/* Promoções Section */}
        <section className="py-16" id="promocoes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Promoções Especiais
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Ofertas imperdíveis para você e sua família
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-square">
                    <img
                      src={promotion.image || '/placeholder.svg'}
                      alt={promotion.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {promotion.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {promotion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-orange-600">
                        R$ {promotion.price.toFixed(2).replace('.', ',')}
                      </span>
                      {user ? (
                        <Link to="/order">
                          <Button className="pizza-gradient hover:opacity-90 text-white">
                            Pedir Agora
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/auth">
                          <Button className="pizza-gradient hover:opacity-90 text-white">
                            Fazer Login
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {promotions.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-600">
                    Nenhuma promoção disponível no momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Brother's Pizzaria</h3>
                <p className="text-gray-400 mb-4">
                  As melhores pizzas da cidade, feitas com amor e ingredientes frescos desde 2020.
                </p>
                <p className="text-gray-400">
                  © 2024 Todos os direitos reservados
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Contato</h4>
                <div className="space-y-2 text-gray-400">
                  <p>📞 (11) 99999-9999</p>
                  <p>📧 contato@brotherspizzaria.com</p>
                  <p>📍 Rua das Pizzas, 123 - Centro</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-4">Horário de Funcionamento</h4>
                <div className="space-y-2 text-gray-400">
                  <p>Segunda a Quinta: 18h - 23h</p>
                  <p>Sexta e Sábado: 18h - 00h</p>
                  <p>Domingo: 18h - 22h</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <Link to="/admin">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Painel Administrativo
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
