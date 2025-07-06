
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pizza, ShoppingCart, Plus } from 'lucide-react';

interface PizzaAddedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAnotherPizza: () => void;
  onAddDrinks: () => void;
  pizzaName: string;
}

const PizzaAddedModal = ({ isOpen, onClose, onAddAnotherPizza, onAddDrinks, pizzaName }: PizzaAddedModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 pizza-gradient rounded-full flex items-center justify-center">
              <Pizza className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Pizza Adicionada!
          </DialogTitle>
          <DialogDescription className="text-lg text-gray-600">
            Sua <span className="font-semibold text-orange-600">{pizzaName}</span> foi adicionada ao carrinho com sucesso!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          <Button
            onClick={onAddAnotherPizza}
            className="w-full pizza-gradient hover:opacity-90 text-white text-lg py-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar Mais Uma Pizza
          </Button>

          <Button
            onClick={onAddDrinks}
            variant="outline"
            className="w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 text-lg py-6"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Adicionar Bebidas
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800"
          >
            Continuar Comprando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PizzaAddedModal;
