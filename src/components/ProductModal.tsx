
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { Product, ProductSize, ProductExtra } from '@/types';
import { useCartStore } from '@/stores/cartStore';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>();
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  if (!product) return null;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedExtras);
    }
    onClose();
    // Reset state
    setSelectedSize(undefined);
    setSelectedExtras([]);
    setQuantity(1);
  };

  const calculateTotal = () => {
    let total = product.price;
    if (selectedSize) total += selectedSize.price;
    total += selectedExtras.reduce((sum, extra) => sum + extra.price, 0);
    return total * quantity;
  };

  const handleExtraChange = (extra: ProductExtra, checked: boolean) => {
    if (checked) {
      setSelectedExtras([...selectedExtras, extra]);
    } else {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-gray-600">
            {product.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Escolha o tamanho</h3>
              <RadioGroup
                value={selectedSize?.id || ''}
                onValueChange={(value) => {
                  const size = product.sizes?.find(s => s.id === value);
                  setSelectedSize(size);
                }}
              >
                {product.sizes.map((size) => (
                  <div key={size.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={size.id} id={size.id} />
                    <Label htmlFor={size.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{size.name}</span>
                        <span className="text-primary font-semibold">
                          {size.price > 0 ? `+R$ ${size.price.toFixed(2).replace('.', ',')}` : 'Grátis'}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Extras */}
          {product.extras && product.extras.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Adicionais</h3>
              <div className="space-y-3">
                {product.extras.map((extra) => (
                  <div key={extra.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={extra.id}
                      checked={selectedExtras.some(e => e.id === extra.id)}
                      onCheckedChange={(checked) => handleExtraChange(extra, checked as boolean)}
                    />
                    <Label htmlFor={extra.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <span>{extra.name}</span>
                        <span className="text-primary font-semibold">
                          +R$ {extra.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold mb-3">Quantidade</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className="w-full pizza-gradient hover:opacity-90 text-white text-lg py-6"
            disabled={!product.available || (product.sizes && !selectedSize)}
          >
            Adicionar ao carrinho - R$ {calculateTotal().toFixed(2).replace('.', ',')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
