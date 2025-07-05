
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

const CategoryFilter = ({ selectedCategory, onCategoryChange, categories }: CategoryFilterProps) => {
  const defaultCategories = [
    { id: 'all', name: 'Todos', count: 0 },
    { id: 'pizzas', name: 'Pizzas', count: 0 },
    { id: 'bebidas', name: 'Bebidas', count: 0 },
    { id: 'promocoes', name: 'Promoções', count: 0 },
  ];

  const categoriesToShow = categories || defaultCategories;

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categoriesToShow.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'default' : 'outline'}
          onClick={() => onCategoryChange(category.id)}
          className={`flex items-center gap-2 ${
            selectedCategory === category.id 
              ? 'pizza-gradient text-white hover:opacity-90' 
              : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
          }`}
        >
          {category.name}
          {category.count > 0 && (
            <Badge 
              variant="secondary" 
              className={`${
                selectedCategory === category.id 
                  ? 'bg-white/20 text-white' 
                  : 'bg-orange-100 text-orange-600'
              }`}
            >
              {category.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;
