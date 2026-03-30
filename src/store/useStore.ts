import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  rating: number;
}
interface CartItem extends Product { quantity: number }

interface StoreState {
  cart: CartItem[];
  wishlist: Product[];
  compareList: Product[];
  total: number;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  addToCompare: (product: Product) => void;
  removeFromCompare: (id: string) => void;
  clearCart: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      compareList: [],
      total: 0,

      addToCart: (product) => set((state) => {
        const existing = state.cart.find(i => i.id === product.id);
        const newCart = existing
          ? state.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...state.cart, { ...product, quantity: 1 }];
        return {
          cart: newCart,
          total: newCart.reduce((acc, i) => acc + i.price * i.quantity, 0)
        };
      }),

      removeFromCart: (id) => set((state) => {
        const newCart = state.cart.filter(i => i.id !== id);
        return { cart: newCart, total: newCart.reduce((acc, i) => acc + i.price * i.quantity, 0) };
      }),

      addToWishlist: (product) => set((state) => ({
        wishlist: state.wishlist.find(p => p.id === product.id) ? state.wishlist : [...state.wishlist, product]
      })),

      removeFromWishlist: (id) => set((state) => ({
        wishlist: state.wishlist.filter(p => p.id !== id)
      })),
  addToCompare: (product) => set((state) => {
    if (state.compareList.length >= 3) return state;
    if (state.compareList.find(p => p.id === product.id)) return state;
    return { compareList: [...state.compareList, product] };
  }),
  removeFromCompare: (productId) => set((state) => ({
    compareList: state.compareList.filter(p => p.id !== productId)
  })),
  clearCart: () => set({ cart: [], total: 0 }),
}), {
  name: 'ecommerce-store',
})
);
