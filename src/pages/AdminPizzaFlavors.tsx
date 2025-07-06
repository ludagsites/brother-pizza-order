
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Pizza, Eye, EyeOff } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type PizzaFlavorRow = Database['public']['Tables']['pizza_flavors']['Row'];

const AdminPizzaFlavors = () => {
  const [flavors, setFlavors] = useState<PizzaFlavorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingFlavor, setUpdatingFlavor] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFlavors();
    subscribeToChanges();

    return () => {
      unsubscribeFromChanges();
    };
  }, []);

  const fetchFlavors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pizza_flavors')
        .select('*')
        .order('name');

      if (error) throw error;
      setFlavors(data || []);
    } catch (error) {
      console.error('Erro ao buscar sabores:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar sabores de pizza",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('pizza-flavors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pizza_flavors'
        },
        () => {
          fetchFlavors();
        }
      )
      .subscribe();

    return channel;
  };

  const unsubscribeFromChanges = () => {
    supabase.removeAllChannels();
  };

  const handleAvailabilityToggle = async (flavorId: string, currentAvailable: boolean) => {
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
      'tradicionais': 'Tradicionais',
      'especiais': 'Especiais',
      'doces': 'Doces'
    };
    return categories[category] || category;
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'tradicionais': return 'bg-orange-100 text-orange-800';
      case 'especiais': return 'bg-red-100 text-red-800';
      case 'doces': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando sabores...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const flavorsByCategory = flavors.reduce((acc, flavor) => {
    if (!acc[flavor.category]) {
      acc[flavor.category] = [];
    }
    acc[flavor.category].push(flavor);
    return acc;
  }, {} as { [key: string]: PizzaFlavorRow[] });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sabores de Pizza</h1>
            <p className="text-gray-600">Gerencie a disponibilidade dos sabores de pizza</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {flavors.length} sabores total
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Atualizações em Tempo Real
            </Badge>
          </div>
        </div>

        {Object.entries(flavorsByCategory).map(([category, categoryFlavors]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <Pizza className="h-6 w-6 text-orange-500" />
              {getCategoryName(category)}
              <Badge className={getCategoryBadgeColor(category)}>
                {categoryFlavors.length} sabores
              </Badge>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryFlavors.map((flavor) => (
                <Card key={flavor.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold mb-2">
                          {flavor.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 mb-3">
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
                          onCheckedChange={() => handleAvailabilityToggle(flavor.id, flavor.available || false)}
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
        ))}

        {flavors.length === 0 && (
          <div className="text-center py-12">
            <Pizza className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum sabor encontrado
            </h3>
            <p className="text-gray-600">
              Adicione sabores de pizza para começar a gerenciar
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPizzaFlavors;
