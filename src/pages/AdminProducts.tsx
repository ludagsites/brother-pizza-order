
import { useState, useEffect } from 'react';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { usePizzaFlavors } from '@/hooks/usePizzaFlavors';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Package, Eye, EyeOff, Pizza, Store, StoreIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminProducts = () => {
  const { 
    products, 
    loading: productsLoading, 
    error, 
    fetchProducts, 
    updateProductAvailability,
    subscribeToChanges,
    unsubscribeFromChanges
  } = useSupabaseProductStore();
  
  const { flavors, loading: flavorsLoading, updateFlavorAvailability } = usePizzaFlavors();
  const { settings, loading: storeLoading, toggleStoreStatus } = useStoreSettings();
  const { toast } = useToast();
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);
  const [updatingFlavor, setUpdatingFlavor] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    subscribeToChanges();

    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  const handleProductAvailabilityToggle = async (productId: string, currentAvailable: boolean) => {
    setUpdatingProduct(productId);
    
    const result = await updateProductAvailability(productId, !currentAvailable);
    
    if (result.success) {
      toast({
        title: "Produto atualizado",
        description: `Produto ${!currentAvailable ? 'ativado' : 'desativado'} com sucesso!`,
      });
    } else {
      toast({
        title: "Erro",
        description: result.error || "Erro ao atualizar produto",
        variant: "destructive",
      });
    }
    
    setUpdatingProduct(null);
  };

  const handleFlavorAvailabilityToggle = async (flavorId: string, currentAvailable: boolean) => {
    setUpdatingFlavor(flavorId);
    
    try {
      const { error } = await supabase
        .from('pizza_flavors')
        .update({ available: !currentAvailable })
        .eq('id', flavorId);

      if (error) throw error;

      toast({
        title: "Sabor atualizado",
        description: `Sabor ${!currentAvailable ? 'ativado' : 'desativado'} com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar sabor:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar disponibilidade do sabor",
        variant: "destructive",
      });
    } finally {
      setUpdatingFlavor(null);
    }
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'pizzas': 'Pizzas',
      'bebidas': 'Bebidas',
      'sobremesas': 'Sobremesas',
      'promocoes': 'Promoções',
      'tradicionais': 'Tradicionais',
      'especiais': 'Especiais',
      'doces': 'Doces'
    };
    return categories[category] || category;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'pizzas': return 'bg-red-100 text-red-800';
      case 'bebidas': return 'bg-blue-100 text-blue-800';
      case 'sobremesas': return 'bg-purple-100 text-purple-800';
      case 'promocoes': return 'bg-green-100 text-green-800';
      case 'tradicionais': return 'bg-orange-100 text-orange-800';
      case 'especiais': return 'bg-red-100 text-red-800';
      case 'doces': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (productsLoading || flavorsLoading || storeLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando produtos...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center">
          <p className="text-red-600 mb-4">Erro: {error}</p>
          <Button onClick={fetchProducts}>Tentar novamente</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie a disponibilidade dos produtos e sabores</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={toggleStoreStatus}
              variant={settings?.is_open ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {settings?.is_open ? <StoreIcon className="h-4 w-4" /> : <Store className="h-4 w-4" />}
              {settings?.is_open ? 'Fechar Loja' : 'Abrir Loja'}
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {products.length + flavors.length} itens total
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Atualizações em Tempo Real
              </Badge>
            </div>
          </div>
        </div>

        {/* Status da Loja */}
        <Card className={`border-2 ${settings?.is_open ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${settings?.is_open ? 'text-green-800' : 'text-red-800'}`}>
              {settings?.is_open ? <Store className="h-5 w-5" /> : <StoreIcon className="h-5 w-5" />}
              Status da Loja: {settings?.is_open ? 'ABERTA' : 'FECHADA'}
            </CardTitle>
            <CardDescription>
              {settings?.is_open 
                ? 'A loja está aberta e os clientes podem fazer pedidos'
                : 'A loja está fechada e os clientes não podem fazer pedidos'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Sabores de Pizza */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Pizza className="h-6 w-6 text-orange-500" />
            Sabores de Pizza
            <Badge className="bg-orange-100 text-orange-800">
              {flavors.length} sabores
            </Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flavors.map((flavor) => (
              <Card key={flavor.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-2">
                        {flavor.name}
                      </CardTitle>
                      <Badge className={getCategoryBadgeColor(flavor.category)}>
                        {getCategoryName(flavor.category)}
                      </Badge>
                      <CardDescription className="text-sm text-gray-600 mt-2">
                        {flavor.ingredients}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Média</p>
                        <p className="text-primary font-semibold">
                          R$ {flavor.price_media.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Grande</p>
                        <p className="text-primary font-semibold">
                          R$ {flavor.price_grande.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-700">Família</p>
                        <p className="text-primary font-semibold">
                          R$ {flavor.price_familia.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {flavor.available ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {flavor.available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </div>
                      
                      <Switch
                        checked={flavor.available || false}
                        onCheckedChange={() => handleFlavorAvailabilityToggle(flavor.id, flavor.available || false)}
                        disabled={updatingFlavor === flavor.id}
                      />
                    </div>

                    {updatingFlavor === flavor.id && (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-600">Atualizando...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Outros Produtos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-500" />
            Outros Produtos
            <Badge className="bg-blue-100 text-blue-800">
              {products.length} produtos
            </Badge>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-2">
                        {product.name}
                      </CardTitle>
                      <Badge 
                        className={`text-xs mb-3 ${getCategoryBadgeColor(product.category)}`}
                      >
                        {getCategoryName(product.category)}
                      </Badge>
                    </div>
                    
                    <div className="ml-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                  
                  <CardDescription className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {product.available ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">
                          {product.available ? 'Disponível' : 'Indisponível'}
                        </span>
                      </div>
                      
                      <Switch
                        checked={product.available}
                        onCheckedChange={() => handleProductAvailabilityToggle(product.id, product.available)}
                        disabled={updatingProduct === product.id}
                      />
                    </div>

                    {updatingProduct === product.id && (
                      <div className="flex items-center justify-center py-2">
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span className="text-sm text-gray-600">Atualizando...</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
