import { apiFetch } from '@/config/api';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  description: string;
  priceKobo: number;
  category: 'classic' | 'dress' | 'sport' | 'smart';
  movement: string | null;
  caseSizeMm: number | null;
  strap: string | null;
  waterResistance: string | null;
  imageUrl: string;
  gallery: string[];
  stock: number;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface PopulatedCartItem {
  id: string;
  productId: string;
  quantity: number;
  updatedAt?: string;
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    priceKobo: number;
    imageUrl: string;
    stock: number;
    category: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  subtotalKobo: number;
  shippingFeeKobo: number;
  totalKobo: number;
  paymentMethod: 'bank_transfer' | 'pay_on_delivery';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    priceKobo: number;
    imageUrl: string;
  }>;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'customer' | 'admin';
  avatarUrl?: string | null;
}

export const ProductApi = {
  async list(params?: { category?: string; search?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiFetch<{ items: Product[]; total: number }>(`/api/products${qs}`);
  },

  async getBySlug(slug: string) {
    const res = await apiFetch<{ items: Product[] }>(`/api/products?search=${encodeURIComponent(slug)}`);
    if (res.data?.items) {
      const match = res.data.items.find((p) => p.slug === slug);
      if (match) return { data: match, error: null };
    }
    return { data: null, error: 'Product not found' };
  },
};

export const CartApi = {
  async get() {
    return apiFetch<{ items: PopulatedCartItem[] }>('/api/cart');
  },

  async setItem(productId: string, quantity: number, updatedAt?: string) {
    return apiFetch<{ success: boolean; items: PopulatedCartItem[] }>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, updatedAt }),
    });
  },

  async syncCart(items: Array<{ productId: string; quantity: number; updatedAt?: string }>) {
    return apiFetch<{ success: boolean; items: PopulatedCartItem[] }>('/api/cart', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  },

  async clear() {
    return apiFetch<{ success: boolean; items: [] }>('/api/cart', {
      method: 'DELETE',
    });
  },
};

export const OrderApi = {
  async create(orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryState: string;
    paymentMethod: 'bank_transfer' | 'pay_on_delivery';
    items: Array<{ productId: string; quantity: number }>;
  }) {
    return apiFetch<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async list() {
    return apiFetch<{ items: Order[] }>('/api/orders');
  },

  async getByOrderNumber(orderNumber: string) {
    return apiFetch<{ order: Order }>(`/api/orders/${orderNumber}`);
  },
};

export const AuthApi = {
  async googleLogin(idToken: string) {
    return apiFetch<{ success: boolean; token: string; user: User }>('/api/auth/mobile/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  },

  async verifyToken() {
    return apiFetch<{ success: boolean; token?: string; user: User }>('/api/auth/mobile/token', {
      method: 'GET',
    });
  },
};
