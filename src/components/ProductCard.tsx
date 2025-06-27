
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  return (
    <Card className={`card-hover ${!product.available ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
          {!product.available && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 right-2"
            >
              Indisponível
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg font-semibold text-gray-900">
          {product.name}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600 line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.sizes && (
              <span className="text-xs text-gray-500">
                A partir de
              </span>
            )}
          </div>
          
          <Button
            onClick={() => onAddToCart(product)}
            disabled={!product.available}
            className="pizza-gradient hover:opacity-90 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
