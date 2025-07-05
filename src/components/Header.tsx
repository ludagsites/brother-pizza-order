
import { Pizza, User, LogOut, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';
import CartDrawer from './CartDrawer';

const Header = () => {
  const { user, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate('/');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 pizza-gradient rounded-full flex items-center justify-center">
              <Pizza className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Brother's Pizzaria</h1>
              <p className="text-xs text-gray-600">As melhores pizzas da cidade</p>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {user && <CartDrawer />}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/my-orders">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Meus Pedidos</span>
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Olá, {user.user_metadata?.name || 'Cliente'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
