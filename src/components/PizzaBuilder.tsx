
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
import PizzaAddedModal from './PizzaAddedModal';

interface PizzaSize {
  id: 'media' | 'grande' | 'famiglia';
  name: string;
  slices: number;
  maxFlavors: number;
}

const PIZZA_SIZES: PizzaSize[] = [
  { id: 'media', name: 'Média', slices: 6, maxFlavors: 2 },
  { id: 'grande', name: 'Grande', slices: 8, maxFlavors: 3 },
  { id: 'famiglia', name: 'Família', slices: 12, maxFlavors: 4 }
];

const CATEGORIES = [
  { id: 'tradicionais', name: 'Tradicionais', emoji: '🍕' },
  { id: 'especiais', name: 'Especiais', emoji: '⭐' },
  { id: 'doces', name: 'Doces', emoji: '🍫' }
];

interface PizzaBuilderProps {
  onAddToCart: (pizza: any) => void;
  onSwitchToDrinks?: () => void;
}

const PizzaBuilder = ({ onAddToCart, onSwitchToDrinks }: PizzaBuilderProps) => {
  const { flavors, loading, getFlavorsByCategory, getMinPrice } = usePizzaFlavors();
  const [selectedSize, setSelectedSize] = useState<PizzaSize | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [addedPizzaName, setAddedPizzaName] = useState('');

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

    const pizzaName = `Pizza ${selectedSize.name} - ${selectedFlavors.map(f => f.name).join(', ')}`;
    
    const pizza = {
      id: `pizza-${Date.now()}`,
      name: pizzaName,
      description: selectedFlavors.map(f => f.name).join(', '),
      price: calculatePrice() / quantity,
      category: 'pizzas',
      image: '/placeholder.svg',
      available: true,
      selectedSize,
      selectedFlavors,
      quantity
    };

    onAddToCart(pizza);
    
    // Mostrar modal
    setAddedPizzaName(pizzaName);
    setShowModal(true);
    
    // Reset form
    setSelectedSize(null);
    setSelectedFlavors([]);
    setQuantity(1);
  };

  const handleAddAnotherPizza = () => {
    setShowModal(false);
    // Manter na aba de pizzas
  };

  const handleAddDrinks = () => {
    setShowModal(false);
    if (onSwitchToDrinks) {
      onSwitchToDrinks();
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">Carregando sabores deliciosos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-lg border-2 border-orange-100">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
          <CardTitle className="flex items-center gap-3 text-3xl font-bold text-gray-800">
            <div className="w-12 h-12 pizza-gradient rounded-full flex items-center justify-center">
              <Pizza className="h-7 w-7 text-white" />
            </div>
            Monte sua Pizza Perfeita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          {/* Size Selection */}
          <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <span className="text-3xl">📏</span>
              1. Escolha o Tamanho
            </h3>
            <RadioGroup value={selectedSize?.id || ''} onValueChange={handleSizeChange}>
              <div className="grid gap-4">
                {PIZZA_SIZES.map((size) => (
                  <div key={size.id} className="flex items-center space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-orange-300 transition-colors">
                    <RadioGroupItem value={size.id} id={size.id} className="w-5 h-5" />
                    <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xl font-bold text-gray-800">{size.name}</span>
                          <span className="text-lg text-gray-600 ml-3">
                            ({size.slices} fatias, até {size.maxFlavors} sabores)
                          </span>
                        </div>
                        <span className="text-xl font-bold text-orange-600">
                          A partir de R$ {getMinPrice(size.id).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Flavor Selection */}
          {selectedSize && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="text-3xl">🍕</span>
                2. Escolha os Sabores ({selectedFlavors.length}/{selectedSize.maxFlavors})
              </h3>
              
              <div className="space-y-6">
                {CATEGORIES.map((category) => {
                  const categoryFlavors = getFlavorsByCategory(category.id);
                  if (categoryFlavors.length === 0) return null;

                  return (
                    <div key={category.id} className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <h4 className="text-2xl font-bold mb-4 text-orange-600 flex items-center gap-2">
                        <span className="text-2xl">{category.emoji}</span>
                        {category.name}
                        <Badge className="text-lg px-3 py-1 bg-orange-100 text-orange-800">
                          {categoryFlavors.length} sabores
                        </Badge>
                      </h4>
                      <ScrollArea className="h-64 pr-4">
                        <div className="space-y-3">
                          {categoryFlavors.map((flavor) => {
                            const priceField = `price_${selectedSize.id}`;
                            const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                            const canSelect = selectedFlavors.length < selectedSize.maxFlavors || isSelected;

                            return (
                              <div key={flavor.id} className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors ${
                                isSelected ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                              } ${!canSelect ? 'opacity-50' : ''}`}>
                                <Checkbox
                                  id={flavor.id}
                                  checked={isSelected}
                                  disabled={!canSelect}
                                  onCheckedChange={(checked) => handleFlavorToggle(flavor, checked === true)}
                                  className="w-5 h-5 mt-1"
                                />
                                <Label htmlFor={flavor.id} className="flex-1 cursor-pointer">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <div className="text-lg font-bold text-gray-800">{flavor.name}</div>
                                      <div className="text-sm text-gray-600 mt-1">{flavor.ingredients}</div>
                                    </div>
                                    <div className="text-right ml-4">
                                      <span className="text-xl font-bold text-orange-600">
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
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="text-3xl">🔢</span>
                3. Quantidade
              </h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-12 h-12 text-xl font-bold"
                >
                  -
                </Button>
                <span className="text-3xl font-bold w-16 text-center text-gray-800">{quantity}</span>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 text-xl font-bold"
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
              className="w-full pizza-gradient hover:opacity-90 text-white text-2xl py-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-6 w-6 mr-3" />
              Adicionar ao Carrinho - R$ {calculatePrice().toFixed(2).replace('.', ',')}
            </Button>
          )}
        </CardContent>
      </Card>

      <PizzaAddedModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onAddAnotherPizza={handleAddAnotherPizza}
        onAddDrinks={handleAddDrinks}
        pizzaName={addedPizzaName}
      />
    </>
  );
};

export default PizzaBuilder;
