
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StoreIcon } from 'lucide-react';

const StoreClosedBanner = () => {
  return (
    <Alert className="bg-red-50 border-red-200 mb-6">
      <StoreIcon className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-800 font-medium">
        <strong>Loja Fechada:</strong> No momento não estamos recebendo pedidos. 
        Volte em breve para fazer seu pedido!
      </AlertDescription>
    </Alert>
  );
};

export default StoreClosedBanner;
