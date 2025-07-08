import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingCart, 
  User, 
  Settings, 
  History, 
  Percent, 
  Menu, 
  X, 
  Pizza, 
  Package, 
  Eye, 
  EyeOff, 
  Plus, 
  Minus,
  Store,
  StoreIcon,
  LogOut,
  Users,
  BarChart3,
  ChefHat,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  Check,
  AlertCircle,
  Trash2
} from 'lucide-react';

// Types
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  sizes?: any;
  extras?: any;
}

interface PizzaFlavor {
  id: string;
  name: string;
  ingredients: string;
  category: string;
  price_media: number;
  price_grande: number;
  price_familia: number;
  available: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: any;
  selectedFlavors?: any[];
}

interface DeliveryZone {
  id: string;
  neighborhood: string;
  delivery_fee: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: any;
  total: number;
  status: string;
  created_at: string;
  payment_method?: string;
  delivery_fee?: number;
  notes?: string;
}

// Auth Context
interface AuthContextType {
  user: any;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Cart Store
let cartItems: CartItem[] = [];
const cartSubscribers: Array<() => void> = [];

const useCart = () => {
  const [items, setItems] = useState(cartItems);

  useEffect(() => {
    const unsubscribe = () => setItems([...cartItems]);
    cartSubscribers.push(unsubscribe);
    return () => {
      const index = cartSubscribers.indexOf(unsubscribe);
      if (index > -1) cartSubscribers.splice(index, 1);
    };
  }, []);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const existingIndex = cartItems.findIndex(i => i.id === item.id);
    if (existingIndex > -1) {
      cartItems[existingIndex].quantity += item.quantity || 1;
    } else {
      cartItems.push({ ...item, quantity: item.quantity || 1 });
    }
    cartSubscribers.forEach(fn => fn());
  };

  const removeItem = (id: string) => {
    const index = cartItems.findIndex(i => i.id === id);
    if (index > -1) {
      cartItems.splice(index, 1);
      cartSubscribers.forEach(fn => fn());
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cartItems.find(i => i.id === id);
    if (item) {
      if (quantity <= 0) {
        removeItem(id);
      } else {
        item.quantity = quantity;
        cartSubscribers.forEach(fn => fn());
      }
    }
  };

  const clearCart = () => {
    cartItems.length = 0;
    cartSubscribers.forEach(fn => fn());
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  };
};

// UI Components
const Button = ({ children, variant = 'default', size = 'default', className = '', onClick, disabled, ...props }: any) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
  };

  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Textarea = ({ className = '', ...props }: any) => (
  <textarea
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select = ({ children, onValueChange, value, ...props }: any) => (
  <select 
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    onChange={(e) => onValueChange?.(e.target.value)}
    value={value}
    {...props}
  >
    {children}
  </select>
);

const Switch = ({ checked, onCheckedChange, disabled }: any) => (
  <button
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onCheckedChange?.(!checked)}
    className={`peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-primary' : 'bg-input'
    }`}
  >
    <span
      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const Badge = ({ children, className = '' }: any) => (
  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </div>
);

// Header Component
const Header = () => {
  const { user, signOut } = useAuth();
  const { getTotalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Pizza className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Brother's Pizzaria</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium">
              Início
            </Link>
            {user && (
              <>
                <Link to="/order" className="text-gray-600 hover:text-orange-600 font-medium">
                  Fazer Pedido
                </Link>
                <Link to="/my-orders" className="text-gray-600 hover:text-orange-600 font-medium">
                  Meus Pedidos
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/order" className="relative p-2 text-gray-600 hover:text-orange-600">
                  <ShoppingCart className="h-6 w-6" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-600">
                    <User className="h-6 w-6" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Entrar
                </Button>
              </Link>
            )}
            
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-600 hover:text-orange-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            {user && (
              <>
                <Link
                  to="/order"
                  className="block px-3 py-2 text-gray-600 hover:text-orange-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fazer Pedido
                </Link>
                <Link
                  to="/my-orders"
                  className="block px-3 py-2 text-gray-600 hover:text-orange-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Meus Pedidos
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

// Data Hooks
const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('available', true);
        
        if (error) throw error;
        setProducts((data || []) as Product[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};

const usePizzaFlavors = () => {
  const [flavors, setFlavors] = useState<PizzaFlavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlavors = async () => {
      try {
        const { data, error } = await supabase
          .from('pizza_flavors')
          .select('*')
          .eq('available', true)
          .order('category', { ascending: true });
        
        if (error) throw error;
        setFlavors((data || []) as PizzaFlavor[]);
      } catch (error) {
        console.error('Error fetching flavors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlavors();
  }, []);

  const getFlavorsByCategory = (category: string) => {
    return flavors.filter(flavor => flavor.category === category);
  };

  const getMinPrice = (size: string) => {
    if (flavors.length === 0) return 0;
    const priceField = `price_${size}` as keyof PizzaFlavor;
    return Math.min(...flavors.map(flavor => Number(flavor[priceField])));
  };

  return { flavors, loading, getFlavorsByCategory, getMinPrice };
};

const useDeliveryZones = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_zones')
          .select('*')
          .order('neighborhood');
        
        if (error) throw error;
        setZones(data || []);
      } catch (error) {
        console.error('Error fetching zones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchZones();
  }, []);

  return { zones, loading };
};

const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const createOrder = async (orderData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: (error as Error).message };
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, createOrder, fetchUserOrders };
};

// Pizza Builder Component
const PizzaBuilder = ({ onAddToCart }: { onAddToCart: (pizza: any) => void }) => {
  const { flavors, loading, getFlavorsByCategory, getMinPrice } = usePizzaFlavors();
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  const PIZZA_SIZES = [
    { id: 'media', name: 'Média', slices: 6, maxFlavors: 2 },
    { id: 'grande', name: 'Grande', slices: 8, maxFlavors: 3 },
    { id: 'famiglia', name: 'Família', slices: 12, maxFlavors: 4 }
  ];

  const CATEGORIES = [
    { id: 'tradicionais', name: 'Tradicionais', emoji: '🍕' },
    { id: 'especiais', name: 'Especiais', emoji: '⭐' },
    { id: 'doces', name: 'Doces', emoji: '🍫' }
  ];

  const handleSizeChange = (sizeId: string) => {
    const size = PIZZA_SIZES.find(s => s.id === sizeId);
    setSelectedSize(size || null);
    setSelectedFlavors([]);
  };

  const handleFlavorAdd = (flavor: any) => {
    if (!selectedSize) return;
    if (selectedFlavors.length < selectedSize.maxFlavors) {
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  const handleFlavorRemove = (flavorId: string) => {
    setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavorId));
  };

  const calculatePrice = () => {
    if (!selectedSize || selectedFlavors.length === 0) return 0;
    
    const priceField = `price_${selectedSize.id}`;
    const maxPrice = Math.max(...selectedFlavors.map(flavor => flavor[priceField]));
    return maxPrice * quantity;
  };

  const canAddToCart = selectedSize && selectedFlavors.length > 0;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const pizzaName = `Pizza ${selectedSize.name} - ${selectedFlavors.map(f => f.name).join(', ')}`;
    
    const pizza = {
      id: `pizza-${Date.now()}`,
      name: pizzaName,
      price: calculatePrice() / quantity,
      quantity,
      selectedSize,
      selectedFlavors
    };

    onAddToCart(pizza);
    
    setSelectedSize(null);
    setSelectedFlavors([]);
    setQuantity(1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-600">Carregando sabores...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-xl border-2 border-orange-200">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200">
        <CardTitle className="flex items-center gap-4 text-4xl font-bold text-gray-800">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
            <Pizza className="h-9 w-9 text-white" />
          </div>
          Monte sua Pizza Perfeita
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-10 p-10">
        {/* Size Selection */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200">
          <h3 className="text-3xl font-bold mb-8 text-gray-800">1. Escolha o Tamanho</h3>
          <div className="grid gap-6">
            {PIZZA_SIZES.map((size) => (
              <div key={size.id} 
                   className={`flex items-center space-x-4 p-6 bg-white rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-orange-300 hover:bg-orange-50 ${
                     selectedSize?.id === size.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                   }`}
                   onClick={() => handleSizeChange(size.id)}
              >
                <input 
                  type="radio" 
                  name="size" 
                  value={size.id} 
                  checked={selectedSize?.id === size.id}
                  onChange={() => handleSizeChange(size.id)}
                  className="w-6 h-6" 
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-gray-800">{size.name}</span>
                      <span className="text-lg text-gray-600 ml-4">
                        ({size.slices} fatias, até {size.maxFlavors} sabores)
                      </span>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      A partir de R$ {getMinPrice(size.id).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flavor Selection */}
        {selectedSize && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-8 rounded-2xl border-2 border-red-200">
            <h3 className="text-3xl font-bold mb-8 text-gray-800">
              2. Escolha os Sabores ({selectedFlavors.length}/{selectedSize.maxFlavors})
            </h3>
            
            {/* Selected Flavors */}
            {selectedFlavors.length > 0 && (
              <div className="mb-8 p-6 bg-white rounded-xl border-2 border-green-200">
                <h4 className="text-xl font-bold text-green-700 mb-4">Sabores Selecionados:</h4>
                <div className="flex flex-wrap gap-3">
                  {selectedFlavors.map((flavor, index) => (
                    <Badge 
                      key={`${flavor.id}-${index}`}
                      className="text-lg px-4 py-2 bg-green-100 text-green-800 cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                      onClick={() => handleFlavorRemove(flavor.id)}
                    >
                      {flavor.name} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-8">
              {CATEGORIES.map((category) => {
                const categoryFlavors = getFlavorsByCategory(category.id);
                if (categoryFlavors.length === 0) return null;

                return (
                  <div key={category.id} className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h4 className="text-2xl font-bold mb-6 text-orange-600 flex items-center gap-3">
                      <span className="text-3xl">{category.emoji}</span>
                      {category.name}
                      <Badge className="text-lg px-3 py-1 bg-orange-100 text-orange-800">
                        {categoryFlavors.length} sabores
                      </Badge>
                    </h4>
                    
                    <div className="space-y-4">
                      {categoryFlavors.map((flavor) => {
                        const priceField = `price_${selectedSize.id}`;
                        const isSelected = selectedFlavors.some(f => f.id === flavor.id);
                        const canSelect = selectedFlavors.length < selectedSize.maxFlavors || isSelected;

                        return (
                          <div key={flavor.id} className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all duration-200 ${
                            isSelected 
                              ? 'border-green-300 bg-green-50' 
                              : canSelect
                                ? 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                                : 'border-gray-200 bg-gray-50 opacity-50'
                          }`}>
                            <div className="flex-1">
                              <div className="text-xl font-bold text-gray-800 mb-2">{flavor.name}</div>
                              <div className="text-base text-gray-600">{flavor.ingredients}</div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <span className="text-2xl font-bold text-orange-600">
                                  R$ {flavor[priceField].toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                              
                              {isSelected ? (
                                <Button
                                  onClick={() => handleFlavorRemove(flavor.id)}
                                  variant="destructive"
                                  size="lg"
                                  className="w-12 h-12 rounded-full"
                                >
                                  <Minus className="h-6 w-6" />
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => handleFlavorAdd(flavor)}
                                  disabled={!canSelect}
                                  className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                                  size="lg"
                                >
                                  <Plus className="h-6 w-6" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity */}
        {selectedFlavors.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl border-2 border-green-200">
            <h3 className="text-3xl font-bold mb-8 text-gray-800">3. Quantidade</h3>
            <div className="flex items-center justify-center gap-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="w-16 h-16 text-2xl font-bold rounded-full border-2"
              >
                -
              </Button>
              <span className="text-5xl font-bold w-24 text-center text-gray-800">{quantity}</span>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setQuantity(quantity + 1)}
                className="w-16 h-16 text-2xl font-bold rounded-full border-2"
              >
                +
              </Button>
            </div>
          </div>
        )}

        {/* Add to Cart */}
        {canAddToCart && (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white text-3xl py-10 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <ShoppingCart className="h-8 w-8 mr-4" />
            Adicionar ao Carrinho - R$ {calculatePrice().toFixed(2).replace('.', ',')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Pages
const HomePage = () => {
  const { products, loading } = useProducts();
  const { user } = useAuth();

  const promotions = products.filter(product => product.category === 'promocoes' && product.available);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Brother's Pizzaria
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            As melhores pizzas da cidade, feitas com amor e ingredientes frescos
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <div>
              {user ? (
                <Link to="/order">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-12 py-4 text-xl">
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    Fazer Pedidos
                  </Button>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-12 py-4 text-xl">
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    Fazer Pedidos
                  </Button>
                </Link>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {user && (
                <Link to="/my-orders">
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-6 py-3">
                    <History className="mr-2 h-5 w-5" />
                    Meus Pedidos
                  </Button>
                </Link>
              )}
              
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-orange-600 font-semibold px-6 py-3"
                onClick={() => document.getElementById('promocoes')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Percent className="mr-2 h-5 w-5" />
                Ver Promoções
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promoções Section */}
      <section className="py-16 bg-gray-100" id="promocoes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Promoções Especiais
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofertas imperdíveis para você e sua família
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square">
                  <img
                    src={promotion.image || '/placeholder.svg'}
                    alt={promotion.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {promotion.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {promotion.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-orange-600">
                      R$ {promotion.price.toFixed(2).replace('.', ',')}
                    </span>
                    {user ? (
                      <Link to="/order">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white">
                          Pedir Agora
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/auth">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 text-white">
                          Fazer Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {promotions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-600">
                  Nenhuma promoção disponível no momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Brother's Pizzaria</h3>
              <p className="text-gray-400 mb-4">
                As melhores pizzas da cidade, feitas com amor e ingredientes frescos desde 2020.
              </p>
              <p className="text-gray-400">
                © 2024 Todos os direitos reservados
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 (11) 99999-9999</p>
                <p>📧 contato@brotherspizzaria.com</p>
                <p>📍 Rua das Pizzas, 123 - Centro</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Horário de Funcionamento</h4>
              <div className="space-y-2 text-gray-400">
                <p>Segunda a Quinta: 18h - 23h</p>
                <p>Sexta e Sábado: 18h - 00h</p>
                <p>Domingo: 18h - 22h</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Painel Administrativo
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const OrderPage = () => {
  const { products, loading: productsLoading } = useProducts();
  const { user } = useAuth();
  const { addItem, items, getTotalItems, getTotalPrice, removeItem, updateQuantity } = useCart();
  const { zones } = useDeliveryZones();
  const { createOrder, loading: orderLoading } = useOrders();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState('bebidas');
  const [activeTab, setActiveTab] = useState('pizzas');
  const [showCart, setShowCart] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryZone: '',
    paymentMethod: '',
    notes: '',
    needsChange: false,
    changeAmount: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return product.category !== 'pizzas';
    return product.category === selectedCategory;
  });

  const categories = [
    { id: 'all', name: 'Todos', count: products.filter(p => p.category !== 'pizzas').length },
    { id: 'bebidas', name: 'Bebidas', count: products.filter(p => p.category === 'bebidas').length },
    { id: 'promocoes', name: 'Promoções', count: products.filter(p => p.category === 'promocoes').length },
  ];

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });
  };

  const handlePizzaAddToCart = (pizza: any) => {
    addItem(pizza);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    
    const selectedZone = zones.find(z => z.id === orderForm.deliveryZone);
    const deliveryFee = selectedZone?.delivery_fee || 0;
    const subtotal = getTotalPrice();
    const total = subtotal + deliveryFee;

    try {
      const orderData = {
        user_id: user.id,
        customer_name: orderForm.name,
        customer_phone: orderForm.phone,
        customer_address: orderForm.address,
        items: items,
        total,
        delivery_fee: deliveryFee,
        payment_method: orderForm.paymentMethod,
        notes: orderForm.notes,
        status: 'pending'
      };

      const result = await createOrder(orderData);
      
      if (result.success) {
        // Clear cart
        items.length = 0;
        setShowCart(false);
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error creating order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fazer Pedido
          </h1>
          <p className="text-xl text-gray-600">
            Monte sua pizza perfeita e escolha suas bebidas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Produtos */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('pizzas')}
                  className={`px-6 py-3 font-semibold text-lg ${
                    activeTab === 'pizzas' 
                      ? 'border-b-2 border-orange-500 text-orange-600' 
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  🍕 Pizzas
                </button>
                <button
                  onClick={() => setActiveTab('outros')}
                  className={`px-6 py-3 font-semibold text-lg ${
                    activeTab === 'outros' 
                      ? 'border-b-2 border-orange-500 text-orange-600' 
                      : 'text-gray-600 hover:text-orange-600'
                  }`}
                >
                  🥤 Bebidas & Outros
                </button>
              </div>
            </div>
            
            {activeTab === 'pizzas' && (
              <div className="space-y-6">
                <PizzaBuilder onAddToCart={handlePizzaAddToCart} />
              </div>
            )}
            
            {activeTab === 'outros' && (
              <div className="space-y-6">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-orange-100'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square">
                        <img
                          src={product.image || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-orange-600">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                          <Button
                            onClick={() => handleAddToCart(product)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <p className="text-xl text-gray-600">
                        Nenhum produto encontrado nesta categoria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Carrinho</span>
                    <Badge className="bg-orange-100 text-orange-800">
                      {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      Seu carrinho está vazio
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{item.name}</h4>
                              <p className="text-orange-600 font-bold">
                                R$ {item.price.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span className="text-orange-600">
                            R$ {getTotalPrice().toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowCart(true)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={items.length === 0}
                      >
                        Finalizar Pedido
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    required
                    value={orderForm.name}
                    onChange={(e) => setOrderForm({...orderForm, name: e.target.value})}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <Input
                    required
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo *
                </label>
                <Textarea
                  required
                  value={orderForm.address}
                  onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
                  placeholder="Rua, número, bairro, cidade"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro (Taxa de Entrega) *
                </label>
                <Select
                  required
                  value={orderForm.deliveryZone}
                  onValueChange={(value) => setOrderForm({...orderForm, deliveryZone: value})}
                >
                  <option value="">Selecione o bairro</option>
                  {zones.map((zone) => (
                    <option key={zone.id} value={zone.id}>
                      {zone.neighborhood} - R$ {zone.delivery_fee.toFixed(2).replace('.', ',')}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento *
                </label>
                <Select
                  required
                  value={orderForm.paymentMethod}
                  onValueChange={(value) => setOrderForm({...orderForm, paymentMethod: value})}
                >
                  <option value="">Selecione a forma de pagamento</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="pix">PIX</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <Textarea
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  placeholder="Observações sobre o pedido..."
                  rows={3}
                />
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">Resumo do Pedido</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>R$ {getTotalPrice().toFixed(2).replace('.', ',')}</span>
                    </div>
                    {orderForm.deliveryZone && (
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Entrega:</span>
                        <span>
                          R$ {(zones.find(z => z.id === orderForm.deliveryZone)?.delivery_fee || 0).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        R$ {(getTotalPrice() + (zones.find(z => z.id === orderForm.deliveryZone)?.delivery_fee || 0)).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCart(false)}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || items.length === 0}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Pedido'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              phone,
            },
          },
        });
        if (error) throw error;
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Pizza className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? 'Aguarde...' : (isLogin ? 'Entrar' : 'Criar conta')}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-orange-600 hover:text-orange-500"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyOrdersPage = () => {
  const { user } = useAuth();
  const { orders, loading, fetchUserOrders } = useOrders();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserOrders(user.id);
  }, [user]);

  if (!user) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-800' },
      preparing: { label: 'Preparando', className: 'bg-orange-100 text-orange-800' },
      ready: { label: 'Pronto', className: 'bg-green-100 text-green-800' },
      delivered: { label: 'Entregue', className: 'bg-gray-100 text-gray-800' }
    };
    
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Meus Pedidos</h1>
          <p className="text-lg text-gray-600">
            Acompanhe o status dos seus pedidos
          </p>
        </div>

        {orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum pedido encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não fez nenhum pedido
              </p>
              <Link to="/order">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Fazer Primeiro Pedido
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{order.id.slice(-8)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Itens do Pedido:</h4>
                      <div className="space-y-2">
                        {Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}x {item.name}</span>
                            <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                          </div>
                        )) : (
                          <div className="text-sm text-gray-600">Itens não disponíveis</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Endereço:</strong> {order.customer_address}</p>
                        <p><strong>Telefone:</strong> {order.customer_phone}</p>
                        {order.payment_method && (
                          <p><strong>Pagamento:</strong> {order.payment_method}</p>
                        )}
                        {order.notes && (
                          <p><strong>Observações:</strong> {order.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        {order.delivery_fee && order.delivery_fee > 0 && (
                          <span>Taxa de entrega: R$ {order.delivery_fee.toFixed(2).replace('.', ',')}</span>
                        )}
                      </div>
                      <div className="text-xl font-bold text-orange-600">
                        Total: R$ {order.total.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.email === 'admin@brotherspizzaria.com';

  if (!user || !isAdmin) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600">Gerencie sua pizzaria</p>
            </div>
            <Link to="/">
              <Button variant="outline">
                Voltar ao Site
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/orders">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Pedidos
                </h3>
                <p className="text-gray-600">
                  Visualize e gerencie todos os pedidos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Produtos
                </h3>
                <p className="text-gray-600">
                  Gerencie produtos e disponibilidade
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/pizza-flavors">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Pizza className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sabores de Pizza
                </h3>
                <p className="text-gray-600">
                  Adicione e edite sabores de pizza
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/reports">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Relatórios
                </h3>
                <p className="text-gray-600">
                  Visualize estatísticas e relatórios
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Página não encontrada</h2>
      <p className="text-gray-600 mb-8">A página que você está procurando não existe.</p>
      <Link to="/">
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          Voltar ao Início
        </Button>
      </Link>
    </div>
  </div>
);

// Main App Component
const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/brother-pizza-order">
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Toaster />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<div>Admin Products</div>} />
              <Route path="/admin/pizza-flavors" element={<div>Admin Pizza Flavors</div>} />
              <Route path="/admin/orders" element={<div>Admin Orders</div>} />
              <Route path="/admin/reports" element={<div>Admin Reports</div>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;