
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface OrderSummaryProps {
  orderData: {
    size: any;
    flavors: any[];
    customerInfo: any;
    price: number;
    deliveryFee: number;
    totalPrice: number;
  };
  onBack: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const OrderSummary = ({ orderData, onBack, onConfirm, loading }: OrderSummaryProps) => {
  const { size, flavors, customerInfo, price, deliveryFee, totalPrice } = orderData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-4 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={onBack} disabled={loading}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-amber-900">Resumo do Pedido</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-amber-900 text-center text-lg md:text-xl">
              🍕 Brother's Pizzaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dados do Cliente */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3 text-sm">👤 Dados do Cliente</h3>
              <div className="space-y-1 text-xs">
                <p><span className="font-semibold">Nome:</span> {customerInfo.name}</p>
                <p><span className="font-semibold">Telefone:</span> {customerInfo.phone}</p>
                <p><span className="font-semibold">Endereço:</span></p>
                <p className="ml-4">{customerInfo.street}, {customerInfo.number}</p>
                <p className="ml-4">{customerInfo.neighborhood}</p>
              </div>
            </div>

            {/* Detalhes do Pedido */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3 text-sm">🍕 Seu Pedido</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-sm">Tamanho: {size?.name}</p>
                  <p className="text-xs text-gray-600">{size?.description}</p>
                </div>
                
                <div>
                  <p className="font-semibold text-sm">Sabores:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {flavors.map((flavor) => (
                      <li key={flavor.id} className="text-xs">
                        <span className="font-medium">{flavor.name}</span>
                        <p className="text-xs text-gray-600 ml-4">{flavor.description}</p>
                        <span className="text-amber-700 font-semibold"> - R$ {flavor.price.toFixed(2).replace('.', ',')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {customerInfo.removeIngredients && (
                  <div>
                    <p className="font-semibold text-sm">🚫 Retirar ingredientes:</p>
                    <p className="text-xs text-gray-700">{customerInfo.removeIngredients}</p>
                  </div>
                )}

                {customerInfo.observations && (
                  <div>
                    <p className="font-semibold text-sm">📝 Observações:</p>
                    <p className="text-xs text-gray-700">{customerInfo.observations}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3 text-sm">💰 Pagamento</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Valor do pedido:</span>
                  <span className="font-semibold">R$ {price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de entrega:</span>
                  <span className="font-semibold">R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="border-t border-green-300 pt-2 flex justify-between">
                  <span className="font-bold">Valor Total:</span>
                  <span className="font-bold text-lg text-green-700">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                <p className="mt-2"><span className="font-semibold">Forma de pagamento:</span> {customerInfo.paymentMethod}</p>
                
                {customerInfo.paymentMethod === 'pix' && (
                  <div className="bg-blue-100 p-3 rounded mt-2">
                    <p className="font-semibold text-blue-800 text-xs">Chave PIX:</p>
                    <p className="text-blue-700 text-xs">(75) 988510206 - Jeferson Barboza</p>
                  </div>
                )}

                {customerInfo.needsChange && (
                  <p className="text-xs"><span className="font-semibold">Troco para:</span> R$ {customerInfo.changeAmount}</p>
                )}
              </div>
            </div>

            {/* Data e Hora */}
            <div className="text-center text-xs text-gray-600">
              <p>📅 {new Date().toLocaleDateString('pt-BR')}</p>
              <p>🕐 {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="font-semibold text-amber-700">⏱️ Tempo de entrega: 30-60 minutos</p>
            </div>
          </CardContent>
        </Card>

        {/* Botão Confirmar */}
        <div className="text-center">
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base font-bold rounded-full w-full sm:w-auto"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              'Confirmar Pedido'
            )}
          </Button>
          
          <p className="text-xs text-gray-600 mt-4">
            Seu pedido será registrado e você receberá a confirmação
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
