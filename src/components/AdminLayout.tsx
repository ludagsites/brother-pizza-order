
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  LogOut,
  Pizza
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from './AdminLogin';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Produtos' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
    { to: '/admin/reports', icon: BarChart3, label: 'Relatórios' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 pizza-gradient rounded-lg flex items-center justify-center">
                <Pizza className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Brother's Pizzaria</h1>
                <p className="text-xs text-gray-600">Painel Administrativo</p>
              </div>
            </Link>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-80px)] p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? 'default' : 'ghost'}
                  className={`w-full justify-start ${
                    location.pathname === item.to 
                      ? 'pizza-gradient text-white hover:opacity-90' 
                      : 'hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
