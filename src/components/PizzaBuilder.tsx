
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePizzaFlavors } from '@/hooks/usePizzaFlavors';
import { Pizza, Plus } from 'lucide-react';

interface PizzaSize {
  id: 'media' | 'grande' | 'familia';
  name: string;
  slices: number;
  maxFlavors: number;
}

const PIZZA_SIZES: PizzaSize[] = [
  { id: 'media', name: 'Média', slices: 6, maxFlavors: 2 },
  { id: 'grande', name: 'Grande', slices: 8, maxFlavors: 3 },
  { id: 'familia', name: 'Família', slices: 12, maxFlavors: 4 }
];

const CATEGORIES = [
  { id: 'tradicionais', name: 'Tradicionais' },
  { id: 'especiais', name: 'Especiais' },
  { id: 'doces', name: 'Doces' }
];

interface PizzaBuilderProps {
  onAddToCart: (pizza: any) => void;
}

const PizzaBuilder = ({ onAddToCart }: PizzaBuilderProps) => {
  const { flavors, loading, getFlavorsByCategory, getMinPrice } = usePizzaFlavors();
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  const handleSizeChange = (sizeId: string) => {
    const size = PIZZA_SIZES.find(s => s.id === sizeId);
    setSelectedSize(size || null);
    setSelectedFlavors([]);
  };

  const handleFlavorToggle = (flavor: any, checked: boolean) => {
    if (!selectedSize) return;

    if (checked) {
      if (selectedFlavors.length < selectedSize.maxFlavors) {
        setSelectedFlavors([...selectedFlavors, flavor]);
      }
    } else {
      setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id));
    }
  };

  const calculatePrice = () => {
    if (!selectedSize || selectedFlavors.length === 0) return 0;
    
    const priceField = `price_${selectedSize.id}`;
    const maxPrice = Math.max(...selectedFlavors.map(flavor => flavor[priceField]));
    return maxPrice * quantity;
  };

  const canAddToCart = selectedSize && selectedFlavors.length > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const pizza = {
      id: `pizza-${Date.now()}`,
      name: `Pizza ${selectedSize.name}`,
      description: selectedFlavors.map(f => f.name).join(', '),
      price: calculatePrice(),
      category: 'pizzas',
      image: '/placeholder.svg',
      available: true,
      selectedSize,
      selectedFlavors,
      quantity
    };

    onAddToCart(pizza);
    
    // Reset form
    setSelectedSize(null);
    setSelectedFlavors([]);
    setQuantity(1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando sabores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pizza className="h-6 w-6" />
          Monte sua Pizza
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Size Selection */}
        <div>
          <h3 className="font-semibold mb-3">1. Escolha o Tamanho</h3>
          <RadioGroup value={selectedSize?.id || ''} onValueChange={handleSizeChange}>
            {PIZZA_SIZES.map((size) => (
              <div key={size.id} className="flex items-center space-x-2">
                <RadioGroupItem value={size.id} id={size.id} />
                <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{size.name}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({size.slices} fatias, até {size.maxFlavors} sabores)
                      </span>
                    </div>
                    <span className="text-primary font-semibold">
                      A partir de R$ {getMinPrice(size.id).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Flavor Selection */}
        {selectedSize && (
          <div>
            <h3 className="font-semibold mb-3">
              2. Escolha os Sabores ({selectedFlavors.length}/{selectedSize.maxFlavors})
            </h3>
            
            <div className="space-y-4">
              {CATEGORIES.map((category) => {
                const categoryFlavors = getFlavorsByCategory(category.id);
                if (categoryFlavors.length === 0) return null;

                return (
                  <div key={category.id}>
                    <h4 className="font-medium text-lg mb-2 text-orange-600">
                      {category.name}
                    </h4>
                    <ScrollArea className="h-48 border rounded-lg p-3">
                      <div className="space-y-2">
                        {categoryFlavors.map((flavor) => {
                          const priceField = `price_${selectedSize.id}`;
                          const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                          const canSelect = selectedFlavors.length < selectedSize.maxFlavors || isSelected;

                          return (
                            <div key={flavor.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={flavor.id}
                                checked={isSelected}
                                disabled={!canSelect}
                                onCheckedChange={(checked) => handleFlavorToggle(flavor, checked as boolean)}
                              />
                              <Label htmlFor={flavor.id} className="flex-1 cursor-pointer text-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{flavor.name}</div>
                                    <div className="text-xs text-gray-500">{flavor.ingredients}</div>
                                  </div>
                                  <div className="text-right ml-2">
                                    <span className="text-primary font-semibold text-sm">
                                      R$ {flavor[priceField].toFixed(2).replace('.', ',')}
                                    </span>
                                  </div>
                                </div>
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        {selectedFlavors.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">3. Quantidade</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
        )}

        {/* Add to Cart */}
        {canAddToCart && (
          <Button
            onClick={handleAddToCart}
            className="w-full pizza-gradient hover:opacity-90 text-white text-lg py-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar ao Carrinho - R$ {calculatePrice().toFixed(2).replace('.', ',')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PizzaBuilder;
