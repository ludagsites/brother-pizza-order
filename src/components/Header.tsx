
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header = ({ onCartClick, onMenuClick }: HeaderProps) => {
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 pizza-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Brother's</h1>
              <p className="text-xs text-gray-600 -mt-1">Pizzaria</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onCartClick}
          className="relative pizza-gradient hover:opacity-90 text-white"
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Carrinho
          {totalItems > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 bg-white text-primary hover:bg-white"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
