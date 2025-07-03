
import { useState, useEffect } from 'react';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Package, Eye, EyeOff } from 'lucide-react';

const AdminProducts = () => {
  const { 
    products, 
    loading, 
    error, 
    fetchProducts, 
    updateProductAvailability,
    subscribeToChanges,
    unsubscribeFromChanges
  } = useSupabaseProductStore();
  
  const { toast } = useToast();
  const [updatingProduct, setUpdatingProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    subscribeToChanges();

    return () => {
      unsubscribeFromChanges();
    };
  }, [fetchProducts, subscribeToChanges, unsubscribeFromChanges]);

  const handleAvailabilityToggle = async (productId: string, currentAvailable: boolean) => {
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

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'pizzas': 'Pizzas',
      'bebidas': 'Bebidas',
      'sobremesas': 'Sobremesas',
      'promocoes': 'Promoções'
    };
    return categories[category] || category;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'pizzas': return 'bg-red-100 text-red-800';
      case 'bebidas': return 'bg-blue-100 text-blue-800';
      case 'sobremesas': return 'bg-purple-100 text-purple-800';
      case 'promocoes': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
            <p className="text-gray-600">Gerencie a disponibilidade dos produtos</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {products.length} produtos total
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Atualizações em Tempo Real
            </Badge>
          </div>
        </div>

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
                      onCheckedChange={() => handleAvailabilityToggle(product.id, product.available)}
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

        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600">
              Adicione produtos para começar a gerenciar o cardápio
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
