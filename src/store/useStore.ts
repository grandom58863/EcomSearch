import { create } from 'zustand';
import { Product } from '../types/product';

interface StoreState {
  products: Product[];
  cart: Product[];
  chatbotResults: Product[];
  filters: {
    priceRange: [number, number];
    brands: string[];
    categories: string[];
    skinType: string[];
  };
  setProducts: (products: Product[]) => void;
  setChatbotResults: (products: Product[]) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateFilters: (filters: Partial<StoreState['filters']>) => void;
}

export const useStore = create<StoreState>((set) => ({
  products: [],
  cart: [],
  chatbotResults: [],
  filters: {
    priceRange: [0, 1000],
    brands: [],
    categories: [],
    skinType: [],
  },
  setProducts: (products) => set({ products }),
  setChatbotResults: (products) => set({ chatbotResults: products }),
  addToCart: (product) =>
    set((state) => ({ cart: [...state.cart, product] })),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    })),
  updateFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));