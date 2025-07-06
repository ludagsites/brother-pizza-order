
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { usePizzaFlavors } from '@/hooks/usePizzaFlavors';
import { Pizza, Plus, Minus, ShoppingCart } from 'lucide-react';
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

  const handleFlavorAdd = (flavor: any) => {
    if (!selectedSize) return;
    if (selectedFlavors.length < selectedSize.maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleFlavorRemove = (flavorId: string) => {
    setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavorId));
  };

  const isFlavorSelected = (flavorId: string) => {
    return selectedFlavors.some(f => f.id === flavorId);
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
    
    setAddedPizzaName(pizzaName);
    setShowModal(true);
    
    setSelectedSize(null);
    setSelectedFlavors([]);
    setQuantity(1);
  };

  const handleAddAnotherPizza = () => {
    setShowModal(false);
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
          <p className="text-xl text-gray-600">Carregando sabores deliciosos...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full shadow-xl border-2 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
          <CardTitle className="flex items-center gap-4 text-4xl font-bold text-gray-800">
            <div className="w-16 h-16 pizza-gradient rounded-full flex items-center justify-center shadow-lg">
              <Pizza className="h-9 w-9 text-white" />
            </div>
            Monte sua Pizza Perfeita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-10 p-10">
          {/* Size Selection */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200">
            <h3 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
              <span className="text-4xl">📏</span>
              1. Escolha o Tamanho
            </h3>
            <RadioGroup value={selectedSize?.id || ''} onValueChange={handleSizeChange}>
              <div className="grid gap-6">
                {PIZZA_SIZES.map((size) => (
                  <div key={size.id} className="flex items-center space-x-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-200 hover:bg-orange-50">
                    <RadioGroupItem value={size.id} id={size.id} className="w-6 h-6" />
                    <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-gray-800">{size.name}</span>
                          <span className="text-lg text-gray-600 ml-4">
                            ({size.slices} fatias, até {size.maxFlavors} sabores)
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-orange-600">
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
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border-2 border-red-200">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                <span className="text-4xl">🍕</span>
                2. Escolha os Sabores ({selectedFlavors.length}/{selectedSize.maxFlavors})
              </h3>
              
              {/* Selected Flavors */}
              {selectedFlavors.length > 0 && (
                <div className="mb-8 p-6 bg-white rounded-xl border-2 border-green-200">
                  <h4 className="text-xl font-bold text-green-700 mb-4">Sabores Selecionados:</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedFlavors.map((flavor, index) => (
                      <Badge 
                        key={`${flavor.id}-${index}`}
                        className="text-lg px-4 py-2 bg-green-100 text-green-800 cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                        onClick={() => handleFlavorRemove(flavor.id)}
                      >
                        {flavor.name} ✕
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-8">
                {CATEGORIES.map((category) => {
                  const categoryFlavors = getFlavorsByCategory(category.id);
                  if (categoryFlavors.length === 0) return null;

                  return (
                    <div key={category.id} className="bg-white p-6 rounded-xl border-2 border-gray-200">
                      <h4 className="text-2xl font-bold mb-6 text-orange-600 flex items-center gap-3">
                        <span className="text-3xl">{category.emoji}</span>
                        {category.name}
                        <Badge className="text-lg px-3 py-1 bg-orange-100 text-orange-800">
                          {categoryFlavors.length} sabores
                        </Badge>
                      </h4>
                      
                      <div className="space-y-4">
                        {categoryFlavors.map((flavor) => {
                          const priceField = `price_${selectedSize.id}`;
                          const isSelected = isFlavorSelected(flavor.id);
                          const canSelect = selectedFlavors.length < selectedSize.maxFlavors || isSelected;

                          return (
                            <div key={flavor.id} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-green-300 bg-green-50' 
                                : canSelect
                                  ? 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                                  : 'border-gray-200 bg-gray-50 opacity-50'
                            }`}>
                              <div className="flex-1">
                                <div className="text-xl font-bold text-gray-800 mb-2">{flavor.name}</div>
                                <div className="text-base text-gray-600">{flavor.ingredients}</div>
                              </div>
                              
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-orange-600">
                                    R$ {flavor[priceField].toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                                
                                {isSelected ? (
                                  <Button
                                    onClick={() => handleFlavorRemove(flavor.id)}
                                    variant="destructive"
                                    size="lg"
                                    className="w-12 h-12 rounded-full"
                                  >
                                    <Minus className="h-6 w-6" />
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleFlavorAdd(flavor)}
                                    disabled={!canSelect}
                                    className="w-12 h-12 rounded-full pizza-gradient hover:opacity-90"
                                    size="lg"
                                  >
                                    <Plus className="h-6 w-6" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          {selectedFlavors.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl border-2 border-green-200">
              <h3 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                <span className="text-4xl">🔢</span>
                3. Quantidade
              </h3>
              <div className="flex items-center justify-center gap-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="w-16 h-16 text-2xl font-bold rounded-full border-2"
                >
                  -
                </Button>
                <span className="text-5xl font-bold w-24 text-center text-gray-800">{quantity}</span>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-16 h-16 text-2xl font-bold rounded-full border-2"
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
              className="w-full pizza-gradient hover:opacity-90 text-white text-3xl py-10 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              <ShoppingCart className="h-8 w-8 mr-4" />
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
