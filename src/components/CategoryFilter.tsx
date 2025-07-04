
import { Button } from '@/components/ui/button';

interface Category {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories?: Category[];
}

const CategoryFilter = ({ 
  selectedCategory, 
  onCategoryChange, 
  categories = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'pizzas', name: 'Pizzas', count: 0 },
    { id: 'bebidas', name: 'Bebidas', count: 0 },
  ]
}: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
          className={`${
            selectedCategory === category.id
              ? 'pizza-gradient text-white'
              : 'hover:bg-orange-50 hover:text-orange-600'
          }`}
        >
          {category.name}
          {category.count > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-white/20 rounded-full">
              {category.count}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
