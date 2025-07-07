import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useCartStore } from '@/stores/cartStore';
import { useDeliveryZones } from '@/hooks/useDeliveryZones';
import { useOrders } from '@/hooks/useOrders';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import CategoryFilter from '@/components/CategoryFilter';
import AuthGuard from '@/components/AuthGuard';
import PizzaBuilder from '@/components/PizzaBuilder';
import StoreClosedBanner from '@/components/StoreClosedBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const OrderPage = () => {
  const { products, loading, fetchProducts, subscribeToChanges, unsubscribeFromChanges } = useSupabaseProductStore();
  const { user } = useSupabaseAuth();
  const { items, getTotalItems, addItem } = useCartStore();
  const { zones } = useDeliveryZones();
  const { createOrder, loading: orderLoading } = useOrders();
  const { isOpen: storeIsOpen, loading: storeLoading } = useStoreSettings();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('bebidas');
  const [activeTab, setActiveTab] = useState<string>('pizzas');

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

  const categories = [
    { id: 'all', name: 'Todos', count: products.filter(p => p.category !== 'pizzas').length },
    { id: 'bebidas', name: 'Bebidas', count: products.filter(p => p.category === 'bebidas').length },
    { id: 'promocoes', name: 'Promoções', count: products.filter(p => p.category === 'promocoes').length },
  ];

  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  const handleAddPizzaToCart = (pizza: any) => {
    addItem(pizza);
  };

  const handleSwitchToDrinks = () => {
    setActiveTab('outros');
  };

  if (!user) {
    return (
      <AuthGuard requireAuth>
        <div></div>
      </AuthGuard>
    );
  }

  if (loading || storeLoading) {
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Store Closed Banner */}
          {!storeIsOpen && <StoreClosedBanner />}
          
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fazer Pedido
            </h1>
            <p className="text-xl text-gray-600">
              Monte sua pizza perfeita e escolha suas bebidas
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Produtos */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-14 mb-8">
                  <TabsTrigger value="pizzas" className="text-lg font-semibold">🍕 Pizzas</TabsTrigger>
                  <TabsTrigger value="outros" className="text-lg font-semibold">🥤 Bebidas & Outros</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pizzas" className="space-y-6">
                  {storeIsOpen ? (
                    <PizzaBuilder onAddToCart={handleAddPizzaToCart} onSwitchToDrinks={handleSwitchToDrinks} />
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <p className="text-xl text-gray-600">
                          A loja está fechada no momento. Não é possível fazer pedidos.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="outros" className="space-y-6">
                  {storeIsOpen ? (
                    <>
                      <CategoryFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categories={categories}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProducts
                          .filter(product => product.category !== 'pizzas')
                          .map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              onAddToCart={handleAddToCart}
                            />
                          ))}
                      </div>

                      {filteredProducts.filter(p => p.category !== 'pizzas').length === 0 && (
                        <Card className="text-center py-12">
                          <CardContent>
                            <p className="text-xl text-gray-600">
                              Nenhum produto encontrado nesta categoria.
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card className="text-center py-12">
                      <CardContent>
                        <p className="text-xl text-gray-600">
                          A loja está fechada no momento. Não é possível fazer pedidos.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <OrderSummary 
                  deliveryZones={zones}
                  onOrderCreate={createOrder}
                  isLoading={orderLoading}
                  hasRequiredItems={getTotalItems() > 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderPage;
