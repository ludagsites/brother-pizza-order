
import { Product } from '@/types';

export const products: Product[] = [
  // Pizzas
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    price: 35.90,
    category: 'pizzas',
    image: '/placeholder.svg',
    available: true,
    sizes: [
      { id: 's1', name: 'Pequena', price: 0 },
      { id: 's2', name: 'Média', price: 8.00 },
      { id: 's3', name: 'Grande', price: 15.00 }
    ],
    extras: [
      { id: 'e1', name: 'Mussarela Extra', price: 5.00 },
      { id: 'e2', name: 'Azeitona', price: 3.00 },
      { id: 'e3', name: 'Orégano', price: 1.00 }
    ]
  },
  {
    id: '2',
    name: 'Pizza Calabresa',
    description: 'Molho de tomate, mussarela, calabresa e cebola',
    price: 39.90,
    category: 'pizzas',
    image: '/placeholder.svg',
    available: true,
    sizes: [
      { id: 's1', name: 'Pequena', price: 0 },
      { id: 's2', name: 'Média', price: 8.00 },
      { id: 's3', name: 'Grande', price: 15.00 }
    ],
    extras: [
      { id: 'e1', name: 'Mussarela Extra', price: 5.00 },
      { id: 'e4', name: 'Calabresa Extra', price: 7.00 },
      { id: 'e5', name: 'Cebola Extra', price: 2.00 }
    ]
  },
  {
    id: '3',
    name: 'Pizza Portuguesa',
    description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitona',
    price: 42.90,
    category: 'pizzas',
    image: '/placeholder.svg',
    available: false,
    sizes: [
      { id: 's1', name: 'Pequena', price: 0 },
      { id: 's2', name: 'Média', price: 8.00 },
      { id: 's3', name: 'Grande', price: 15.00 }
    ],
    extras: [
      { id: 'e1', name: 'Mussarela Extra', price: 5.00 },
      { id: 'e6', name: 'Presunto Extra', price: 6.00 },
      { id: 'e2', name: 'Azeitona', price: 3.00 }
    ]
  },
  {
    id: '4',
    name: 'Pizza Quatro Queijos',
    description: 'Molho de tomate, mussarela, gorgonzola, parmesão e catupiry',
    price: 45.90,
    category: 'pizzas',
    image: '/placeholder.svg',
    available: true,
    sizes: [
      { id: 's1', name: 'Pequena', price: 0 },
      { id: 's2', name: 'Média', price: 8.00 },
      { id: 's3', name: 'Grande', price: 15.00 }
    ],
    extras: [
      { id: 'e7', name: 'Gorgonzola Extra', price: 8.00 },
      { id: 'e8', name: 'Catupiry Extra', price: 6.00 },
      { id: 'e9', name: 'Parmesão Extra', price: 4.00 }
    ]
  },
  // Bebidas
  {
    id: '5',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante Coca-Cola 2 litros',
    price: 8.90,
    category: 'bebidas',
    image: '/placeholder.svg',
    available: true
  },
  {
    id: '6',
    name: 'Suco de Laranja 500ml',
    description: 'Suco natural de laranja',
    price: 6.50,
    category: 'bebidas',
    image: '/placeholder.svg',
    available: true
  },
  {
    id: '7',
    name: 'Água Mineral 500ml',
    description: 'Água mineral sem gás',
    price: 3.00,
    category: 'bebidas',
    image: '/placeholder.svg',
    available: false
  },
  // Sobremesas
  {
    id: '8',
    name: 'Pudim de Leite',
    description: 'Pudim caseiro com calda de caramelo',
    price: 12.90,
    category: 'sobremesas',
    image: '/placeholder.svg',
    available: true
  },
  {
    id: '9',
    name: 'Sorvete 500ml',
    description: 'Sorvete artesanal sabores variados',
    price: 15.90,
    category: 'sobremesas',
    image: '/placeholder.svg',
    available: true
  }
];

export const categories = [
  { id: 'pizzas', name: 'Pizzas', icon: 'pizza' },
  { id: 'bebidas', name: 'Bebidas', icon: 'cup' },
  { id: 'sobremesas', name: 'Sobremesas', icon: 'cake' },
  { id: 'promoções', name: 'Promoções', icon: 'percent' }
];
