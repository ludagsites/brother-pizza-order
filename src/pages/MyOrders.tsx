
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
import { Clock, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
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
        return <Badge variant="secondary">Pendente</Badge>;
      case 'preparing':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Preparando</Badge>;
      case 'ready':
        return <Badge className="bg-green-500 hover:bg-green-600">Pronto</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Entregue</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando pedidos...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meus Pedidos
            </h1>
            <p className="text-xl text-gray-600">
              Acompanhe o status dos seus pedidos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lista de Pedidos */}
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id.slice(-8)}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4" />
                          {getTimeAgo(order.created_at)}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-2">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {order.items?.length || 0} item(s)
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order.id)}
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {orders.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📋</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Você ainda não fez nenhum pedido
                    </p>
                    <Button 
                      onClick={() => navigate('/order')}
                      className="pizza-gradient hover:opacity-90 text-white"
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
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Chat do Pedido #{selectedOrder.slice(-8)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender_id === user?.id
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.message}</p>
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
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
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
