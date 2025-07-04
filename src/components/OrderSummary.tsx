
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle } from 'lucide-react';

interface OrderSummaryProps {
  orderData: {
    size: any;
    flavors: any[];
    customerInfo: any;
    price: number;
  };
  onBack: () => void;
  onConfirmWhatsApp: () => void;
}

const OrderSummary = ({ orderData, onBack, onConfirmWhatsApp }: OrderSummaryProps) => {
  const { size, flavors, customerInfo, price } = orderData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-amber-900">Resumo do Pedido</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-amber-900 text-center">
              🍕 Brother's Pizzaria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do Cliente */}
            <div className="bg-amber-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3">👤 Dados do Cliente</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Nome:</span> {customerInfo.name}</p>
                <p><span className="font-semibold">Telefone:</span> {customerInfo.phone}</p>
                <p><span className="font-semibold">Endereço:</span></p>
                <p className="ml-4">{customerInfo.street}, {customerInfo.number}</p>
                <p className="ml-4">{customerInfo.neighborhood}</p>
              </div>
            </div>

            {/* Detalhes do Pedido */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3">🍕 Seu Pedido</h3>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold">Tamanho: {size?.name}</p>
                  <p className="text-sm text-gray-600">{size?.description}</p>
                </div>
                
                <div>
                  <p className="font-semibold">Sabores:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {flavors.map((flavor) => (
                      <li key={flavor.id} className="text-sm">
                        {flavor.name} - R$ {flavor.price.toFixed(2).replace('.', ',')}
                      </li>
                    ))}
                  </ul>
                </div>

                {customerInfo.removeIngredients && (
                  <div>
                    <p className="font-semibold">🚫 Retirar ingredientes:</p>
                    <p className="text-sm text-gray-700">{customerInfo.removeIngredients}</p>
                  </div>
                )}

                {customerInfo.observations && (
                  <div>
                    <p className="font-semibold">📝 Observações:</p>
                    <p className="text-sm text-gray-700">{customerInfo.observations}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-900 mb-3">💰 Pagamento</h3>
              <div className="space-y-2">
                <p className="text-xl font-bold text-green-700">
                  Valor Total: R$ {price.toFixed(2).replace('.', ',')}
                </p>
                <p><span className="font-semibold">Forma de pagamento:</span> {customerInfo.paymentMethod}</p>
                
                {customerInfo.paymentMethod === 'pix' && (
                  <div className="bg-blue-100 p-3 rounded mt-2">
                    <p className="font-semibold text-blue-800">Chave PIX:</p>
                    <p className="text-blue-700">(75) 988510206 - Jeferson Barboza</p>
                  </div>
                )}

                {customerInfo.needsChange && (
                  <p><span className="font-semibold">Troco para:</span> R$ {customerInfo.changeAmount}</p>
                )}
              </div>
            </div>

            {/* Data e Hora */}
            <div className="text-center text-sm text-gray-600">
              <p>📅 {new Date().toLocaleDateString('pt-BR')}</p>
              <p>🕐 {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </CardContent>
        </Card>

        {/* Botão WhatsApp */}
        <div className="text-center">
          <Button
            onClick={onConfirmWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-bold rounded-full w-full"
            size="lg"
          >
            <MessageCircle className="h-6 w-6 mr-3" />
            Confirmar Pedido no WhatsApp
          </Button>
          
          <p className="text-sm text-gray-600 mt-4">
            Você será redirecionado para o WhatsApp com todas as informações do seu pedido
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
