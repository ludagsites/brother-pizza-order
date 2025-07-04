
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSupabaseProductStore } from '@/stores/supabaseProductStore';
import OrderSummary from '@/components/OrderSummary';

const OrderPage = () => {
  const { products, fetchProducts } = useSupabaseProductStore();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

  const isFormValid = () => {
    return selectedSize && 
           selectedFlavors.length > 0 && 
           customerInfo.name && 
           customerInfo.phone && 
           customerInfo.street && 
           customerInfo.neighborhood && 
           customerInfo.number && 
           customerInfo.paymentMethod &&
           (!customerInfo.needsChange || customerInfo.changeAmount);
  };

  const generateWhatsAppMessage = () => {
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR');
    const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const sizeOption = getCurrentSizeOption();
    const selectedPizzaNames = pizzas
      .filter(p => selectedFlavors.includes(p.id))
      .map(p => p.name);
    
    let message = `🍕 *PEDIDO BROTHER'S PIZZARIA* 🍕\n\n`;
    message += `📅 Data: ${date}\n`;
    message += `🕐 Horário: ${time}\n\n`;
    message += `👤 *Cliente:* ${customerInfo.name}\n`;
    message += `📱 *Telefone:* ${customerInfo.phone}\n\n`;
    message += `🏠 *Endereço:*\n`;
    message += `${customerInfo.street}, ${customerInfo.number}\n`;
    message += `${customerInfo.neighborhood}\n\n`;
    message += `🍕 *Pedido:*\n`;
    message += `Tamanho: ${sizeOption?.name} (${sizeOption?.description})\n`;
    message += `Sabores:\n`;
    selectedPizzaNames.forEach(name => {
      message += `• ${name}\n`;
    });
    
    if (customerInfo.removeIngredients) {
      message += `\n🚫 *Retirar ingredientes:* ${customerInfo.removeIngredients}\n`;
    }
    
    if (customerInfo.observations) {
      message += `\n📝 *Observações:* ${customerInfo.observations}\n`;
    }
    
    message += `\n💰 *Valor:* R$ ${getOrderPrice().toFixed(2).replace('.', ',')}\n`;
    message += `💳 *Forma de pagamento:* ${customerInfo.paymentMethod}\n`;
    
    if (customerInfo.needsChange) {
      message += `💵 *Troco para:* R$ ${customerInfo.changeAmount}\n`;
    }
    
    message += `\n*Obrigado por realizar seu pedido!*\n`;
    message += `Vai fazer pix? Nossa chave é *(75) 988510206 - Jeferson Barboza*`;
    
    return encodeURIComponent(message);
  };

  const handleWhatsAppRedirect = () => {
    const message = generateWhatsAppMessage();
    const phoneNumber = '5575991662591';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (showSummary) {
    return (
      <OrderSummary
        orderData={{
          size: getCurrentSizeOption(),
          flavors: pizzas.filter(p => selectedFlavors.includes(p.id)),
          customerInfo,
          price: getOrderPrice()
        }}
        onBack={() => setShowSummary(false)}
        onConfirmWhatsApp={handleWhatsAppRedirect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-amber-900">Fazer Pedido</h1>
          <ShoppingCart className="h-8 w-8 text-amber-700" />
        </div>

        <div className="space-y-8">
          {/* Tamanho da Pizza */}
          <Card>
            <CardHeader>
              <CardTitle className="text-amber-900">1. Escolha o Tamanho</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                {sizeOptions.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-amber-50">
                    <RadioGroupItem value={size.id} id={size.id} />
                    <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-lg">{size.name}</span>
                          <p className="text-sm text-gray-600">{size.description}</p>
                        </div>
                        <span className="text-amber-700 font-semibold">A partir de R$ 29,90</span>
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
                <CardTitle className="text-amber-900">
                  2. Escolha os Sabores 
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({selectedFlavors.length}/{getMaxFlavors()} sabores)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {flavorCategories.map((category) => {
                  const categoryPizzas = pizzas.filter(p => {
                    // Simulando categorias baseado no nome/preço
                    if (category.id === 'tradicionais') return p.price <= 35;
                    if (category.id === 'especiais') return p.price > 35 && p.price <= 45;
                    return p.price > 45;
                  });

                  if (categoryPizzas.length === 0) return null;

                  return (
                    <div key={category.id} className="mb-6">
                      <h3 className="text-lg font-semibold text-amber-800 mb-3">{category.name}</h3>
                      <div className="grid gap-2">
                        {categoryPizzas.map((pizza) => (
                          <div key={pizza.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                            <Checkbox
                              id={pizza.id}
                              checked={selectedFlavors.includes(pizza.id)}
                              onCheckedChange={(checked) => handleFlavorChange(pizza.id, checked as boolean)}
                              disabled={!selectedFlavors.includes(pizza.id) && selectedFlavors.length >= getMaxFlavors()}
                            />
                            <Label htmlFor={pizza.id} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{pizza.name}</span>
                                  <p className="text-sm text-gray-600">{pizza.description}</p>
                                </div>
                                <span className="text-amber-700 font-semibold">
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
                <CardTitle className="text-amber-900">3. Personalize seu Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="observations">Observações (Opcional)</Label>
                  <Textarea
                    id="observations"
                    placeholder="Alguma observação especial para seu pedido?"
                    value={customerInfo.observations}
                    onChange={(e) => setCustomerInfo({...customerInfo, observations: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="removeIngredients">Ingredientes que deseja retirar (Opcional)</Label>
                  <Textarea
                    id="removeIngredients"
                    placeholder="Ex: cebola, azeitona..."
                    value={customerInfo.removeIngredients}
                    onChange={(e) => setCustomerInfo({...customerInfo, removeIngredients: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados do Cliente */}
          {selectedFlavors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">4. Seus Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    placeholder="(75) 99999-9999"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Rua *</Label>
                    <Input
                      id="street"
                      value={customerInfo.street}
                      onChange={(e) => setCustomerInfo({...customerInfo, street: e.target.value})}
                      placeholder="Nome da rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={customerInfo.number}
                      onChange={(e) => setCustomerInfo({...customerInfo, number: e.target.value})}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={customerInfo.neighborhood}
                    onChange={(e) => setCustomerInfo({...customerInfo, neighborhood: e.target.value})}
                    placeholder="Nome do bairro"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Valor do Pedido e Pagamento */}
          {selectedFlavors.length > 0 && customerInfo.name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-900">5. Valor e Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-amber-100 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-900">
                    Valor do Pedido: R$ {getOrderPrice().toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    *Baseado no sabor mais caro selecionado
                  </p>
                </div>

                <div>
                  <Label className="text-lg font-semibold">Forma de Pagamento *</Label>
                  <RadioGroup 
                    value={customerInfo.paymentMethod} 
                    onValueChange={(value) => setCustomerInfo({...customerInfo, paymentMethod: value, needsChange: false, changeAmount: ''})}
                    className="mt-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="pix" id="pix" />
                        <Label htmlFor="pix" className="flex-1 cursor-pointer">
                          <div>
                            <span className="font-semibold">PIX</span>
                            <p className="text-sm text-gray-600">(75) 988510206 - Jeferson Barboza</p>
                          </div>
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="cartao" id="cartao" />
                        <Label htmlFor="cartao" className="cursor-pointer font-semibold">
                          Cartão de Crédito/Débito
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="dinheiro" id="dinheiro" />
                        <Label htmlFor="dinheiro" className="cursor-pointer font-semibold">
                          Dinheiro
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-amber-50">
                        <RadioGroupItem value="dinheiro-cartao" id="dinheiro-cartao" />
                        <Label htmlFor="dinheiro-cartao" className="cursor-pointer font-semibold">
                          Dinheiro e Cartão
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {(customerInfo.paymentMethod === 'dinheiro' || customerInfo.paymentMethod === 'dinheiro-cartao') && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <Label className="font-semibold">Precisa de troco?</Label>
                    <RadioGroup 
                      value={customerInfo.needsChange ? 'sim' : 'nao'} 
                      onValueChange={(value) => setCustomerInfo({...customerInfo, needsChange: value === 'sim', changeAmount: ''})}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nao" id="nao-troco" />
                        <Label htmlFor="nao-troco" className="cursor-pointer">Não</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sim" id="sim-troco" />
                        <Label htmlFor="sim-troco" className="cursor-pointer">Sim</Label>
                      </div>
                    </RadioGroup>

                    {customerInfo.needsChange && (
                      <div className="mt-3">
                        <Label htmlFor="changeAmount">Troco para quanto? *</Label>
                        <Input
                          id="changeAmount"
                          type="number"
                          step="0.01"
                          value={customerInfo.changeAmount}
                          onChange={(e) => setCustomerInfo({...customerInfo, changeAmount: e.target.value})}
                          placeholder="50.00"
                          className="mt-1"
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
            <div className="text-center">
              <Button
                onClick={() => setShowSummary(true)}
                className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-4 text-lg font-bold rounded-full"
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
