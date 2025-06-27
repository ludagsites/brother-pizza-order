
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();

  const handleCheckout = () => {
    // Implementar lógica de checkout
    console.log('Checkout initiated');
    onClose();
  };

  if (items.length === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Seu Carrinho</SheetTitle>
            <SheetDescription>
              Seus itens aparecerão aqui
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🛒</span>
            </div>
            <p className="text-gray-500 text-center">
              Seu carrinho está vazio<br />
              Adicione alguns itens deliciosos!
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Seu Carrinho</SheetTitle>
          <SheetDescription>
            {items.length} {items.length === 1 ? 'item' : 'itens'} no carrinho
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-sm">{item.product.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {item.selectedSize && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {item.selectedSize.name}
                    </Badge>
                  )}
                  
                  {item.selectedExtras.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      +{item.selectedExtras.map(e => e.name).join(', ')}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <span className="font-semibold text-primary">
                      R$ {(item.totalPrice * item.quantity).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-primary">
              R$ {getTotalPrice().toFixed(2).replace('.', ',')}
            </span>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={handleCheckout}
              className="w-full pizza-gradient hover:opacity-90 text-white py-6 text-lg"
            >
              Finalizar Pedido
            </Button>
            
            <Button
              variant="outline"
              onClick={clearCart}
              className="w-full"
            >
              Limpar Carrinho
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
