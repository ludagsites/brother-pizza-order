
import { create } from 'zustand';
import { Order, OrderStatus } from '@/types';

interface OrderStore {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getTotalRevenue: () => number;
  getTodayOrders: () => Order[];
  getRecentOrders: () => Order[];
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [
    {
      id: '1',
      items: [],
      total: 89.80,
      status: 'preparing',
      customerInfo: {
        name: 'João Silva',
        phone: '(11) 99999-9999',
        address: 'Rua das Flores, 123 - São Paulo'
      },
      createdAt: new Date()
    },
    {
      id: '2',
      items: [],
      total: 45.90,
      status: 'ready',
      customerInfo: {
        name: 'Maria Santos',
        phone: '(11) 88888-8888',
        address: 'Av. Paulista, 456 - São Paulo'
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 30)
    }
  ],

  addOrder: (orderData) => set((state) => ({
    orders: [
      ...state.orders,
      {
        ...orderData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date()
      }
    ]
  })),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    )
  })),

  getOrdersByStatus: (status) => {
    return get().orders.filter(order => order.status === status);
  },

  getTotalRevenue: () => {
    return get().orders
      .filter(order => order.status === 'delivered')
      .reduce((total, order) => total + order.total, 0);
  },

  getTodayOrders: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return get().orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  },

  getRecentOrders: () => {
    return get().orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }
}));
