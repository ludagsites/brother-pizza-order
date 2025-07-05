
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrderStore } from '@/stores/orderStore';
import { useChat } from '@/hooks/useChat';
import { Order, OrderStatus } from '@/types';
import { Clock, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface SupabaseOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any[];
  user_id: string;
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useSupabaseAuth();
  const { toast } = useToast();

  const { messages, sendMessage } = useChat(selectedOrder || '');

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates for orders
    const channel = supabase
      .channel('admin_orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'preparing':
        return 'Preparando';
      case 'ready':
        return 'Pronto';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string, orderCustomer: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: `Pedido de ${orderCustomer} marcado como ${getStatusText(newStatus).toLowerCase()}.`
      });
      
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido",
        variant: "destructive",
      });
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

  const activeOrders = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'delivered' || order.status === 'cancelled'
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600">Gerencie todos os pedidos da pizzaria</p>
          </div>

          {/* Active Orders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pedidos Ativos ({activeOrders.length})
            </h2>
            
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customer_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getTimeAgo(order.created_at)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        {order.customer_address}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Status:</label>
                        <Select
                          value={order.status}
                          onValueChange={(value) => 
                            handleStatusChange(order.id, value, order.customer_name)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="preparing">Preparando</SelectItem>
                            <SelectItem value="ready">Pronto</SelectItem>
                            <SelectItem value="delivered">Entregue</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        
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
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {activeOrders.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📋</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Nenhum pedido ativo
                    </h3>
                    <p className="text-gray-600">
                      Todos os pedidos foram processados
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Completed Orders */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Pedidos Concluídos ({completedOrders.length})
            </h2>
            
            <div className="space-y-4">
              {completedOrders.slice(0, 5).map((order) => (
                <Card key={order.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.customer_name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customer_phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getTimeAgo(order.created_at)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Panel */}
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
    </AdminLayout>
  );
};

export default AdminOrders;
