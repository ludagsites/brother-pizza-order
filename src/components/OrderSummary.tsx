
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cartStore';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { ShoppingCart, Trash2, Plus, Minus, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryZone {
  id: string;
  neighborhood: string;
  delivery_fee: number;
}

interface OrderSummaryProps {
  deliveryZones: DeliveryZone[];
  onOrderCreate: (orderData: any) => Promise<any>;
  isLoading: boolean;
  hasRequiredItems: boolean;
}

const OrderSummary = ({ deliveryZones, onOrderCreate, isLoading, hasRequiredItems }: OrderSummaryProps) => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState('');
  const [observations, setObservations] = useState('');

  const pixInfo = "PIX: (75) 988510206 - Jeferson Barboza";

  const subtotal = getTotal();
  const deliveryFee = selectedZone?.delivery_fee || 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        name: user.user_metadata?.name || '',
        phone: user.user_metadata?.phone || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasRequiredItems) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione pelo menos um item ao carrinho",
        variant: "destructive",
      });
      return;
    }

    if (!paymentMethod) {
      toast({
        title: "Forma de pagamento obrigatória",
        description: "Selecione uma forma de pagamento",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      items: items.map(item => ({
        id: item.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.totalPrice,
        selectedSize: item.selectedSize,
        selectedFlavors: item.product.selectedFlavors || [],
        description: item.product.description
      })),
      total,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      delivery_fee: deliveryFee,
      payment_method: paymentMethod,
      needs_change: needsChange && paymentMethod === 'dinheiro',
      change_amount: needsChange && paymentMethod === 'dinheiro' ? parseFloat(changeAmount) || 0 : 0,
      observations
    };

    const result = await onOrderCreate(orderData);
    
    if (result.success) {
      clearCart();
      navigate('/my-orders');
    }
  };

  const copyPixInfo = () => {
    navigator.clipboard.writeText("(75) 988510206");
    toast({
      title: "PIX copiado!",
      description: "Número PIX copiado para a área de transferência",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Resumo do Pedido
        </CardTitle>
        <CardDescription>
          {items.length} item(s) no carrinho
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cart Items */}
          {items.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <ScrollArea className="h-48 border rounded-lg p-3">
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2 p-2 border rounded">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                        {item.product.selectedFlavors && (
                          <p className="text-xs text-gray-500 truncate">
                            {item.product.selectedFlavors.map((f: any) => f.name).join(', ')}
                          </p>
                        )}
                        {item.selectedSize && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {item.selectedSize.name}
                          </Badge>
                        )}
                        <p className="text-sm font-semibold text-primary">
                          R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Dados do Cliente</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Endereço *</Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Zone */}
          <div>
            <Label htmlFor="zone">Bairro para Entrega</Label>
            <Select onValueChange={(value) => {
              const zone = deliveryZones.find(z => z.id === value) || null;
              setSelectedZone(zone);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu bairro" />
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

          {/* Order Total */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxa de entrega:</span>
              <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="text-base font-semibold">Forma de Pagamento *</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="cursor-pointer">PIX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dinheiro" id="dinheiro" />
                <Label htmlFor="dinheiro" className="cursor-pointer">Dinheiro</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cartao" id="cartao" />
                <Label htmlFor="cartao" className="cursor-pointer">Cartão (na entrega)</Label>
              </div>
            </RadioGroup>

            {paymentMethod === 'pix' && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dados PIX:</p>
                    <p className="text-sm text-gray-600">{pixInfo}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyPixInfo}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                </div>
              </div>
            )}

            {paymentMethod === 'dinheiro' && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs-change"
                    checked={needsChange}
                    onCheckedChange={setNeedsChange}
                  />
                  <Label htmlFor="needs-change">Preciso de troco</Label>
                </div>
                {needsChange && (
                  <div>
                    <Label htmlFor="change-amount">Troco para quanto?</Label>
                    <Input
                      id="change-amount"
                      type="number"
                      step="0.01"
                      value={changeAmount}
                      onChange={(e) => setChangeAmount(e.target.value)}
                      placeholder="Ex: 50.00"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Observations */}
          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Alguma observação especial para o pedido..."
            />
          </div>

          <Button
            type="submit"
            disabled={!hasRequiredItems || isLoading || !paymentMethod}
            className="w-full pizza-gradient hover:opacity-90 text-white"
          >
            {isLoading ? 'Finalizando...' : `Finalizar Pedido - R$ ${total.toFixed(2).replace('.', ',')}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
