
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  sizes?: ProductSize[];
  extras?: ProductExtra[];
}

export interface ProductSize {
  id: string;
  name: string;
  price: number;
}

export interface ProductExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize?: ProductSize;
  selectedExtras: ProductExtra[];
  totalPrice: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  createdAt: Date;
  delivery_fee?: number;
  payment_method?: string;
  needs_change?: boolean;
  change_amount?: number;
  observations?: string;
  remove_ingredients?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export type ProductCategory = 'pizzas' | 'bebidas' | 'promocoes';

export interface DeliveryZone {
  id: string;
  neighborhood: string;
  delivery_fee: number;
}
