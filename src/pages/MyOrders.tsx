
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useChat } from '@/hooks/useChat';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, MessageCircle, Send, Eye, MapPin, Phone, User, CreditCard, Pizza } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type SupabaseOrder = Database['public']['Tables']['orders']['Row'];

const MyOrders = () => {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState<SupabaseOrder | null>(null);
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { messages, sendMessage } = useChat(selectedOrder || '');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pendente</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">Preparando</Badge>;
      case 'ready':
        return <Badge className="bg-green-500 hover:bg-green-600 text-xs">Pronto</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelado</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedOrder) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const getItemsCount = (items: any) => {
    if (Array.isArray(items)) {
      return items.reduce((total, item) => total + (item.quantity || 1), 0);
    }
    return 0;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'cash':
        return 'Dinheiro';
      case 'card':
        return 'Cartão na Entrega';
      default:
        return method;
    }
  };

  if (!user) {
    return (
      <AuthGuard requireAuth>
        <div></div>
      </AuthGuard>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Carregando pedidos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
              Meus Pedidos
            </h1>
            <p className="text-lg sm:text-xl text-gray-600">
              Acompanhe o status dos seus pedidos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Lista de Pedidos */}
            <div className="space-y-3 sm:space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                          {getTimeAgo(order.created_at || '')}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-lg sm:text-2xl font-bold text-primary mb-1 sm:mb-2">
                          {formatCurrency(Number(order.total))}
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <div className="text-xs sm:text-sm text-gray-600">
                        {getItemsCount(order.items)} item(s)
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setOrderDetails(order)}
                              className="flex items-center gap-1 text-xs flex-1 sm:flex-none"
                            >
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg sm:text-xl">Detalhes do Pedido #{orderDetails?.id.slice(-8)}</DialogTitle>
                              <DialogDescription className="text-sm">
                                Informações completas do seu pedido
                              </DialogDescription>
                            </DialogHeader>
                            {orderDetails && (
                              <div className="space-y-4 sm:space-y-6">
                                {/* Status e Data */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    {getStatusBadge(orderDetails.status)}
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs text-gray-500">Data do Pedido</p>
                                    <p className="text-sm font-medium">
                                      {new Date(orderDetails.created_at || '').toLocaleString('pt-BR')}
                                    </p>
                                  </div>
                                </div>

                                {/* Informações do Cliente */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                                      <User className="h-4 w-4" />
                                      Dados do Cliente
                                    </h3>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                      <p><span className="font-medium">Nome:</span> {orderDetails.customer_name}</p>
                                      <p><span className="font-medium">Telefone:</span> {orderDetails.customer_phone}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                                      <MapPin className="h-4 w-4" />
                                      Endereço de Entrega
                                    </h3>
                                    <p className="text-xs sm:text-sm">{orderDetails.customer_address}</p>
                                  </div>
                                </div>

                                {/* Itens do Pedido */}
                                <div>
                                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                                    <Pizza className="h-4 w-4" />
                                    Itens do Pedido
                                  </h3>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {Array.isArray(orderDetails.items) && orderDetails.items.map((item: any, index: number) => (
                                      <div key={index} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-medium text-sm">{item.product?.name || 'Item'}</h4>
                                          <span className="text-sm font-bold">
                                            {formatCurrency(item.totalPrice || 0)}
                                          </span>
                                        </div>
                                        {item.selectedSize && (
                                          <p className="text-xs text-gray-600">
                                            Tamanho: {item.selectedSize.name}
                                          </p>
                                        )}
                                        {item.selectedFlavors && item.selectedFlavors.length > 0 && (
                                          <p className="text-xs text-gray-600">
                                            Sabores: {item.selectedFlavors.map((f: any) => f.name).join(', ')}
                                          </p>
                                        )}
                                        {item.selectedExtras && item.selectedExtras.length > 0 && (
                                          <p className="text-xs text-gray-600">
                                            Extras: {item.selectedExtras.map((e: any) => e.name).join(', ')}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-600">Quantidade: {item.quantity}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Informações de Pagamento */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                                      <CreditCard className="h-4 w-4" />
                                      Pagamento
                                    </h3>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                      <p><span className="font-medium">Método:</span> {getPaymentMethodText(orderDetails.payment_method || '')}</p>
                                      {orderDetails.needs_change && orderDetails.change_amount && (
                                        <p><span className="font-medium">Troco para:</span> {formatCurrency(Number(orderDetails.change_amount))}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold mb-2 text-sm">Resumo</h3>
                                    <div className="space-y-1 text-xs sm:text-sm">
                                      <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>{formatCurrency(Number(orderDetails.total) - Number(orderDetails.delivery_fee || 0))}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Taxa de Entrega:</span>
                                        <span>{formatCurrency(Number(orderDetails.delivery_fee || 0))}</span>
                                      </div>
                                      <div className="flex justify-between font-bold border-t pt-1">
                                        <span>Total:</span>
                                        <span>{formatCurrency(Number(orderDetails.total))}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Observações */}
                                {(orderDetails.observations || orderDetails.remove_ingredients) && (
                                  <div>
                                    <h3 className="font-semibold mb-2 text-sm">Observações</h3>
                                    <div className="text-xs sm:text-sm space-y-1">
                                      {orderDetails.observations && (
                                        <p><span className="font-medium">Observações:</span> {orderDetails.observations}</p>
                                      )}
                                      {orderDetails.remove_ingredients && (
                                        <p><span className="font-medium">Remover ingredientes:</span> {orderDetails.remove_ingredients}</p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order.id)}
                          className="flex items-center gap-1 text-xs flex-1 sm:flex-none"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {orders.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8 sm:py-12">
                    <div className="w-16 sm:w-24 h-16 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl sm:text-4xl">📋</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Você ainda não fez nenhum pedido
                    </p>
                    <Button 
                      onClick={() => navigate('/order')}
                      className="pizza-gradient hover:opacity-90 text-white text-sm"
                    >
                      Fazer Primeiro Pedido
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chat */}
            {selectedOrder && (
              <div className="lg:sticky lg:top-24">
                <Card className="h-[500px] sm:h-[600px] flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                      Chat do Pedido #{selectedOrder.slice(-8)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-3 sm:p-6">
                    <ScrollArea className="flex-1 mb-3 sm:mb-4">
                      <div className="space-y-3 sm:space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] px-3 py-2 rounded-lg text-xs sm:text-sm ${
                                message.sender_id === user?.id
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p>{message.message}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="text-sm"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyOrders;
