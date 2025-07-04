
import { useState } from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { DeliveryZone } from '@/types';

interface OrderSummaryProps {
  deliveryZones: DeliveryZone[];
  onOrderCreate: (orderData: any) => Promise<any>;
  isLoading: boolean;
  hasRequiredItems: boolean;
}

const OrderSummary = ({ deliveryZones, onOrderCreate, isLoading, hasRequiredItems }: OrderSummaryProps) => {
  const { items, getTotal, clearCart, getItemCount } = useCartStore();
  const { user } = useSupabaseAuth();
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [customerData, setCustomerData] = useState({
    name: user?.user_metadata?.name || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    paymentMethod: '',
    needsChange: false,
    changeAmount: '',
    observations: '',
    removeIngredients: ''
  });
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  const subtotal = getTotal();
  const deliveryFee = selectedZone?.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasRequiredItems) {
      return;
    }

    const orderData = {
      items: items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedExtras: item.selectedExtras,
        totalPrice: item.totalPrice
      })),
      total,
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      customer_address: customerData.address,
      delivery_fee: deliveryFee,
      payment_method: customerData.paymentMethod,
      needs_change: customerData.needsChange,
      change_amount: customerData.needsChange ? parseFloat(customerData.changeAmount) || 0 : 0,
      observations: customerData.observations,
      remove_ingredients: customerData.removeIngredients
    };

    const result = await onOrderCreate(orderData);
    
    if (result.success) {
      setOrderConfirmed(true);
      clearCart();
      // Resetar formulário após 3 segundos
      setTimeout(() => {
        setOrderConfirmed(false);
        setCustomerData({
          name: user?.user_metadata?.name || '',
          phone: user?.user_metadata?.phone || '',
          address: '',
          paymentMethod: '',
          needsChange: false,
          changeAmount: '',
          observations: '',
          removeIngredients: ''
        });
        setSelectedZone(null);
      }, 3000);
    }
  };

  if (orderConfirmed) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Pedido Confirmado!
              </h3>
              <p className="text-gray-600 mb-2">
                Seu pedido foi registrado com sucesso.
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Tempo de entrega: 30-60 minutos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Resumo do Pedido
          <Badge variant="secondary">
            {getItemCount()} {getItemCount() === 1 ? 'item' : 'itens'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Revise seu pedido e finalize a compra
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Seu carrinho está vazio
          </p>
        ) : (
          <>
            {/* Itens do carrinho */}
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-gray-600">Qtd: {item.quantity}</p>
                    {item.selectedSize && (
                      <p className="text-blue-600 text-xs">
                        {item.selectedSize.name}
                      </p>
                    )}
                    {item.selectedExtras.length > 0 && (
                      <p className="text-green-600 text-xs">
                        +{item.selectedExtras.map(e => e.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">
                    R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totais */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              
              {selectedZone && (
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega ({selectedZone.neighborhood}):</span>
                  <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <Separator />

            {/* Formulário de entrega */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={customerData.name}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Bairro</Label>
                <Select
                  value={selectedZone?.id || ''}
                  onValueChange={(value) => {
                    const zone = deliveryZones.find(z => z.id === value);
                    setSelectedZone(zone || null);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryZones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.neighborhood} - R$ {zone.delivery_fee.toFixed(2).replace('.', ',')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço completo</Label>
                <Textarea
                  id="address"
                  placeholder="Rua, número, complemento..."
                  value={customerData.address}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment">Forma de pagamento</Label>
                <Select
                  value={customerData.paymentMethod}
                  onValueChange={(value) => setCustomerData(prev => ({ ...prev, paymentMethod: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="cartao">Cartão na entrega</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {customerData.paymentMethod === 'dinheiro' && (
                <div className="space-y-2">
                  <Label>
                    <input
                      type="checkbox"
                      checked={customerData.needsChange}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, needsChange: e.target.checked }))}
                      className="mr-2"
                    />
                    Preciso de troco
                  </Label>
                  {customerData.needsChange && (
                    <Input
                      type="number"
                      placeholder="Valor para troco"
                      value={customerData.changeAmount}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, changeAmount: e.target.value }))}
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="remove">Remover ingredientes</Label>
                <Input
                  id="remove"
                  placeholder="Ex: cebola, azeitona..."
                  value={customerData.removeIngredients}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, removeIngredients: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  placeholder="Instruções especiais..."
                  value={customerData.observations}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, observations: e.target.value }))}
                />
              </div>

              <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                <span>Tempo de entrega: 30-60 minutos</span>
              </div>

              <Button
                type="submit"
                className="w-full pizza-gradient hover:opacity-90 text-white"
                disabled={isLoading || !hasRequiredItems}
              >
                {isLoading ? 'Processando...' : `Confirmar Pedido - R$ ${total.toFixed(2).replace('.', ',')}`}
              </Button>

              {!hasRequiredItems && (
                <p className="text-sm text-red-600 text-center">
                  Adicione pelo menos uma pizza e uma bebida para continuar
                </p>
              )}
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
