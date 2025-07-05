
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useCartStore } from '@/stores/cartStore';
import { useDeliveryZones } from '@/hooks/useDeliveryZones';
import { useOrders } from '@/hooks/useOrders';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import OrderSummary from '@/components/OrderSummary';
import CategoryFilter from '@/components/CategoryFilter';
import AuthGuard from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const OrderPage = () => {
  const { products, loading, fetchProducts, subscribeToChanges, unsubscribeFromChanges } = useSupabaseProductStore();
  const { user } = useSupabaseAuth();
  const { items, getTotalItems, addItem } = useCartStore();
  const { zones } = useDeliveryZones();
  const { createOrder, loading: orderLoading } = useOrders();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('pizzas');

  useEffect(() => {
    fetchProducts();
    subscribeToChanges();

    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  // Verificar se há pelo menos uma pizza e uma bebida no carrinho
  const pizzasInCart = items.filter(item => item.product.category === 'pizzas');
  const drinksInCart = items.filter(item => item.product.category === 'bebidas');
  const hasRequiredItems = pizzasInCart.length > 0 && drinksInCart.length > 0;

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true;
    return product.category === selectedCategory;
  });

  // Categorias disponíveis (sem sobremesas)
  const categories = [
    { id: 'all', name: 'Todos', count: products.length },
    { id: 'pizzas', name: 'Pizzas', count: products.filter(p => p.category === 'pizzas').length },
    { id: 'bebidas', name: 'Bebidas', count: products.filter(p => p.category === 'bebidas').length },
  ];

  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  if (!user) {
    return (
      <AuthGuard requireAuth>
        <div></div>
      </AuthGuard>
    );
  }

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fazer Pedido
            </h1>
            <p className="text-xl text-gray-600">
              Selecione suas pizzas e bebidas favoritas
            </p>
          </div>

          {/* Alerta sobre itens obrigatórios */}
          {!hasRequiredItems && getTotalItems() > 0 && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Você precisa selecionar pelo menos uma pizza e uma bebida para finalizar o pedido.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Produtos */}
            <div className="lg:col-span-3">
              <CategoryFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                categories={categories}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-xl text-gray-600">
                      Nenhum produto encontrado nesta categoria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <OrderSummary 
                  deliveryZones={zones}
                  onOrderCreate={createOrder}
                  isLoading={orderLoading}
                  hasRequiredItems={hasRequiredItems}
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
