
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import { useDeliveryZones } from '@/hooks/useDeliveryZones';
import { useOrders } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import OrderSummary from '@/components/OrderSummary';

const OrderPage = () => {
  const { products, fetchProducts } = useSupabaseProductStore();
  const { zones } = useDeliveryZones();
  const { createOrder, loading: orderLoading } = useOrders();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    street: '',
    neighborhood: '',
    number: '',
    observations: '',
    removeIngredients: '',
    paymentMethod: '',
    needsChange: false,
    changeAmount: ''
  });
  const [showSummary, setShowSummary] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchProducts();
  }, [fetchProducts]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const pizzas = products.filter(p => p.category === 'pizzas' && p.available);
  
  const sizeOptions = [
    { id: 'media', name: 'Média', description: '6 fatias - até 2 sabores', maxFlavors: 2 },
    { id: 'grande', name: 'Grande', description: '8 fatias - até 3 sabores', maxFlavors: 3 },
    { id: 'familia', name: 'Família', description: '12 fatias - até 4 sabores', maxFlavors: 4 }
  ];

  const flavorCategories = [
    { id: 'tradicionais', name: 'Tradicionais' },
    { id: 'especiais', name: 'Especiais' },
    { id: 'doces', name: 'Doces' }
  ];

  const getCurrentSizeOption = () => {
    return sizeOptions.find(s => s.id === selectedSize);
  };

  const getMaxFlavors = () => {
    const sizeOption = getCurrentSizeOption();
    return sizeOption ? sizeOption.maxFlavors : 2;
  };

  const handleFlavorChange = (flavorId: string, checked: boolean) => {
    const maxFlavors = getMaxFlavors();
    
    if (checked && selectedFlavors.length < maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavorId]);
    } else if (!checked) {
      setSelectedFlavors(selectedFlavors.filter(id => id !== flavorId));
    }
  };

  const getOrderPrice = () => {
    if (selectedFlavors.length === 0) return 0;
    
    const selectedPizzas = pizzas.filter(p => selectedFlavors.includes(p.id));
    const maxPrice = Math.max(...selectedPizzas.map(p => p.price));
    return maxPrice;
  };

  const getDeliveryFee = () => {
    const zone = zones.find(z => z.neighborhood === selectedNeighborhood);
    return zone ? zone.delivery_fee : 0;
  };

  const getTotalPrice = () => {
    return getOrderPrice() + getDeliveryFee();
  };

  const isFormValid = () => {
    return selectedSize && 
           selectedFlavors.length > 0 && 
           customerInfo.name && 
           customerInfo.phone && 
           customerInfo.street && 
           selectedNeighborhood && 
           customerInfo.number && 
           customerInfo.paymentMethod &&
           (!customerInfo.needsChange || customerInfo.changeAmount);
  };

  const handleConfirmOrder = async () => {
    const orderData = {
      items: pizzas.filter(p => selectedFlavors.includes(p.id)).map(pizza => ({
        id: pizza.id,
        name: pizza.name,
        price: pizza.price,
        size: getCurrentSizeOption()?.name
      })),
      total: getTotalPrice(),
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: `${customerInfo.street}, ${customerInfo.number} - ${selectedNeighborhood}`,
      delivery_fee: getDeliveryFee(),
      payment_method: customerInfo.paymentMethod,
      needs_change: customerInfo.needsChange,
      change_amount: customerInfo.needsChange ? parseFloat(customerInfo.changeAmount) : null,
      observations: customerInfo.observations,
      remove_ingredients: customerInfo.removeIngredients
    };

    const result = await createOrder(orderData);
    if (result.success) {
      setOrderConfirmed(true);
    }
  };

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">Confirmado com Sucesso!</h1>
            <p className="text-gray-600 mb-4">
              Seu pedido foi registrado e será entregue em 30-60 minutos.
            </p>
            <Link to="/">
              <Button className="w-full">Voltar ao Início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSummary) {
    return (
      <OrderSummary
        orderData={{
          size: getCurrentSizeOption(),
          flavors: pizzas.filter(p => selectedFlavors.includes(p.id)),
          customerInfo: { ...customerInfo, neighborhood: selectedNeighborhood },
          price: getOrderPrice(),
          deliveryFee: getDeliveryFee(),
          totalPrice: getTotalPrice()
        }}
        onBack={() => setShowSummary(false)}
        onConfirm={handleConfirmOrder}
        loading={orderLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-4 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-900">Fazer Pedido</h1>
          <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-amber-700" />
        </div>

        <div className="space-y-6">
          {/* Tamanho da Pizza */}
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-900 text-lg">1. Escolha o Tamanho</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                {sizeOptions.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                    <RadioGroupItem value={size.id} id={size.id} />
                    <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <div>
                          <span className="font-semibold text-base">{size.name}</span>
                          <p className="text-sm text-gray-600">{size.description}</p>
                        </div>
                        <span className="text-amber-700 font-semibold text-sm mt-1 sm:mt-0">A partir de R$ 29,90</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Sabores da Pizza */}
          {selectedSize && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg">
                  2. Escolha os Sabores 
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({selectedFlavors.length}/{getMaxFlavors()} sabores)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flavorCategories.map((category) => {
                  const categoryPizzas = pizzas.filter(p => {
                    if (category.id === 'tradicionais') return p.price <= 35;
                    if (category.id === 'especiais') return p.price > 35 && p.price <= 45;
                    return p.price > 45;
                  });

                  if (categoryPizzas.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-6">
                      <h3 className="text-base font-semibold text-amber-800 mb-3">{category.name}</h3>
                      <div className="grid gap-2">
                        {categoryPizzas.map((pizza) => (
                          <div key={pizza.id} className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                            <Checkbox
                              id={pizza.id}
                              checked={selectedFlavors.includes(pizza.id)}
                              onCheckedChange={(checked) => handleFlavorChange(pizza.id, checked as boolean)}
                              disabled={!selectedFlavors.includes(pizza.id) && selectedFlavors.length >= getMaxFlavors()}
                              className="mt-1"
                            />
                            <Label htmlFor={pizza.id} className="flex-1 cursor-pointer">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                                <div className="flex-1">
                                  <span className="font-medium text-sm">{pizza.name}</span>
                                  <p className="text-xs text-gray-600 mt-1">{pizza.description}</p>
                                </div>
                                <span className="text-amber-700 font-semibold text-sm mt-1 sm:mt-0 sm:ml-2">
                                  R$ {pizza.price.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Observações e Ingredientes */}
          {selectedFlavors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg">3. Personalize seu Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="observations" className="text-sm">Observações (Opcional)</Label>
                  <Textarea
                    id="observations"
                    placeholder="Alguma observação especial para seu pedido?"
                    value={customerInfo.observations}
                    onChange={(e) => setCustomerInfo({...customerInfo, observations: e.target.value})}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="removeIngredients" className="text-sm">Ingredientes que deseja retirar (Opcional)</Label>
                  <Textarea
                    id="removeIngredients"
                    placeholder="Ex: cebola, azeitona..."
                    value={customerInfo.removeIngredients}
                    onChange={(e) => setCustomerInfo({...customerInfo, removeIngredients: e.target.value})}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados do Cliente */}
          {selectedFlavors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg">4. Seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">Nome *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Seu nome completo"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="(75) 99999-9999"
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="street" className="text-sm">Rua *</Label>
                    <Input
                      id="street"
                      value={customerInfo.street}
                      onChange={(e) => setCustomerInfo({...customerInfo, street: e.target.value})}
                      placeholder="Nome da rua"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number" className="text-sm">Número *</Label>
                    <Input
                      id="number"
                      value={customerInfo.number}
                      onChange={(e) => setCustomerInfo({...customerInfo, number: e.target.value})}
                      placeholder="123"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="neighborhood" className="text-sm">Bairro *</Label>
                  <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Selecione o bairro" />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.neighborhood}>
                          {zone.neighborhood} - R$ {zone.delivery_fee.toFixed(2).replace('.', ',')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valor do Pedido e Pagamento */}
          {selectedFlavors.length > 0 && customerInfo.name && selectedNeighborhood && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900 text-lg">5. Valor e Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-100 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Valor do Pedido:</span>
                      <span className="font-semibold">R$ {getOrderPrice().toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Entrega:</span>
                      <span className="font-semibold">R$ {getDeliveryFee().toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="border-t border-amber-300 pt-2 flex justify-between">
                      <span className="font-bold">Total:</span>
                      <span className="font-bold text-lg">R$ {getTotalPrice().toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 mt-2">
                    *Baseado no sabor mais caro selecionado • Entrega: 30-60 minutos
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold">Forma de Pagamento *</Label>
                  <RadioGroup 
                    value={customerInfo.paymentMethod} 
                    onValueChange={(value) => setCustomerInfo({...customerInfo, paymentMethod: value, needsChange: false, changeAmount: ''})}
                    className="mt-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 cursor-pointer text-sm">
                          <div>
                            <span className="font-semibold">PIX</span>
                            <p className="text-xs text-gray-600">(75) 988510206 - Jeferson Barboza</p>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="cartao" id="cartao" />
                        <Label htmlFor="cartao" className="cursor-pointer font-semibold text-sm">
                          Cartão de Crédito/Débito
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="dinheiro" id="dinheiro" />
                        <Label htmlFor="dinheiro" className="cursor-pointer font-semibold text-sm">
                          Dinheiro
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="dinheiro-cartao" id="dinheiro-cartao" />
                        <Label htmlFor="dinheiro-cartao" className="cursor-pointer font-semibold text-sm">
                          Dinheiro e Cartão
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {(customerInfo.paymentMethod === 'dinheiro' || customerInfo.paymentMethod === 'dinheiro-cartao') && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <Label className="font-semibold text-sm">Precisa de troco?</Label>
                    <RadioGroup 
                      value={customerInfo.needsChange ? 'sim' : 'nao'} 
                      onValueChange={(value) => setCustomerInfo({...customerInfo, needsChange: value === 'sim', changeAmount: ''})}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao" id="nao-troco" />
                        <Label htmlFor="nao-troco" className="cursor-pointer text-sm">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim" id="sim-troco" />
                        <Label htmlFor="sim-troco" className="cursor-pointer text-sm">Sim</Label>
                      </div>
                    </RadioGroup>

                    {customerInfo.needsChange && (
                      <div className="mt-3">
                        <Label htmlFor="changeAmount" className="text-sm">Troco para quanto? *</Label>
                        <Input
                          id="changeAmount"
                          type="number"
                          step="0.01"
                          value={customerInfo.changeAmount}
                          onChange={(e) => setCustomerInfo({...customerInfo, changeAmount: e.target.value})}
                          placeholder="50.00"
                          className="mt-1 text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Botão Verificar Resumo */}
          {isFormValid() && (
            <div className="text-center pb-4">
              <Button
                onClick={() => setShowSummary(true)}
                className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 text-base font-bold rounded-full w-full sm:w-auto"
                size="lg"
              >
                Verificar Resumo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
