
import { Button } from '@/components/ui/button';
import { Pizza } from 'lucide-react';
import { ProductCategory } from '@/types';

interface CategoryFilterProps {
  categories: { id: string; name: string; icon: string }[];
  selectedCategory: ProductCategory | 'all';
  onCategoryChange: (category: ProductCategory | 'all') => void;
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="sticky top-16 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="container px-4 py-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => onCategoryChange('all')}
            className={`whitespace-nowrap ${
              selectedCategory === 'all' 
                ? 'pizza-gradient text-white hover:opacity-90' 
                : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
            }`}
          >
            <Pizza className="h-4 w-4 mr-2" />
            Todos
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => onCategoryChange(category.id as ProductCategory)}
              className={`whitespace-nowrap ${
                selectedCategory === category.id 
                  ? 'pizza-gradient text-white hover:opacity-90' 
                  : 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
              }`}
            >
              <Pizza className="h-4 w-4 mr-2" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilter;
