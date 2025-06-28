
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrderStore } from '@/stores/orderStore';
import { Order, OrderStatus } from '@/types';
import { Clock, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useOrderStore();
  const { toast } = useToast();

  const getStatusBadge = (status: OrderStatus) => {
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

  const getStatusText = (status: OrderStatus) => {
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

  const handleStatusChange = (orderId: string, newStatus: OrderStatus, orderCustomer: string) => {
    updateOrderStatus(orderId, newStatus);
    toast({
      title: "Status atualizado!",
      description: `Pedido de ${orderCustomer} marcado como ${getStatusText(newStatus).toLowerCase()}.`
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `${diffMins} min atrás`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  };

  const activeOrders = orders.filter(order => 
    order.status !== 'delivered' && order.status !== 'cancelled'
  );
  
  const completedOrders = orders.filter(order => 
    order.status === 'delivered' || order.status === 'cancelled'
  );

  return (
    <AdminLayout>
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
          
          <div className="grid gap-4">
            {activeOrders.map((order) => (
              <Card key={order.id} className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.customerInfo.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {order.customerInfo.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getTimeAgo(order.createdAt)}
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
                      {order.customerInfo.address}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium">Status:</label>
                      <Select
                        value={order.status}
                        onValueChange={(value: OrderStatus) => 
                          handleStatusChange(order.id, value, order.customerInfo.name)
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
          
          <div className="grid gap-4">
            {completedOrders.slice(0, 10).map((order) => (
              <Card key={order.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.customerInfo.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {order.customerInfo.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {getTimeAgo(order.createdAt)}
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
    </AdminLayout>
  );
};

export default AdminOrders;
