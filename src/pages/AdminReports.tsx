
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderStore } from '@/stores/orderStore';
import { useProductStore } from '@/stores/productStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, ShoppingCart, Clock } from 'lucide-react';

const AdminReports = () => {
  const { orders, getTotalRevenue, getTodayOrders } = useOrderStore();
  const { products } = useProductStore();

  const todayOrders = getTodayOrders();
  const totalRevenue = getTotalRevenue();
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Dados para o gráfico de vendas por categoria
  const salesByCategory = products.reduce((acc, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { name: category, sales: 0, count: 0 };
    }
    // Simulando vendas baseado no preço do produto
    acc[category].sales += product.price * 5; // Multiplicador simulado
    acc[category].count += 5; // Quantidade simulada
    return acc;
  }, {} as Record<string, { name: string; sales: number; count: number }>);

  const chartData = Object.values(salesByCategory).map(item => ({
    name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
    vendas: Math.round(item.sales),
    quantidade: item.count
  }));

  // Produtos mais vendidos (simulado)
  const topProducts = products
    .map(product => ({
      ...product,
      soldCount: Math.floor(Math.random() * 50) + 10 // Simulando vendas
    }))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 5);

  // Horários de pico (simulado)
  const peakHours = [
    { hour: '18:00-19:00', orders: 15 },
    { hour: '19:00-20:00', orders: 23 },
    { hour: '20:00-21:00', orders: 18 },
    { hour: '21:00-22:00', orders: 12 },
    { hour: '22:00-23:00', orders: 8 }
  ];

  const bestHour = peakHours.reduce((max, hour) => 
    hour.orders > max.orders ? hour : max
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho e vendas</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalOrders} pedidos processados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {averageOrderValue.toFixed(2).replace('.', ',')}
              </div>
              <p className="text-xs text-muted-foreground">
                Por pedido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.filter(p => p.available).length}</div>
              <p className="text-xs text-muted-foreground">
                De {products.length} produtos total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horário de Pico</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bestHour.hour}</div>
              <p className="text-xs text-muted-foreground">
                {bestHour.orders} pedidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <CardDescription>
              Desempenho de vendas por categoria de produto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'vendas' ? `R$ ${value}` : value,
                      name === 'vendas' ? 'Receita' : 'Quantidade'
                    ]}
                  />
                  <Bar dataKey="vendas" fill="#ea580c" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
              <CardDescription>Ranking dos produtos com melhor desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          R$ {product.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{product.soldCount}</p>
                      <p className="text-sm text-gray-500">vendas</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Peak Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Horários de Maior Movimento</CardTitle>
              <CardDescription>Distribuição de pedidos por hora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {peakHours.map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <span className="font-medium">{hour.hour}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${(hour.orders / 25) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">
                        {hour.orders}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
