import { Product } from "./sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  title: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  calculatedDiscount: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getTotalPrice: () => number;
  getSubTotalPrice: () => number;
  getItemCount: (productId: string) => number;
  getGroupedItems: () => CartItem[];
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getFinalPrice: () => number;
}

// Helper function to get unique item identifier (supports variants)
const getItemIdentifier = (product: Product): string => {
  const variant = (product as any).selectedVariant;
  if (variant) {
    return `${product._id}_${variant.sizeId}_${variant.heightId}`;
  }
  return product._id || "";
};

// Helper function to get product price (supports variants)
const getProductPrice = (product: Product): number => {
  const variant = (product as any).selectedVariant;
  if (variant) {
    return variant.price ?? 0;
  }
  return product.price ?? 0;
};

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [] as CartItem[],
      appliedCoupon: null as AppliedCoupon | null,
      addItem: (product) =>
        set((state) => {
          const itemId = getItemIdentifier(product);
          const existingItem = state.items.find(
            (item) => getItemIdentifier(item.product) === itemId
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                getItemIdentifier(item.product) === itemId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          } else {
            return { items: [...state.items, { product, quantity: 1 }] };
          }
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.reduce((acc, item) => {
            const itemId = getItemIdentifier(item.product);
            if (itemId === productId) {
              if (item.quantity > 1) {
                acc.push({ ...item, quantity: item.quantity - 1 });
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, [] as CartItem[]),
        })),
      deleteCartProduct: (productId) =>
        set((state) => ({
          items: state.items.filter(
            ({ product }) => getItemIdentifier(product) !== productId
          ),
        })),
      resetCart: () => set({ items: [], appliedCoupon: null }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + getProductPrice(item.product) * item.quantity,
          0
        );
      },
      getSubTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = getProductPrice(item.product);
          const discount = ((item.product.discount ?? 0) * price) / 100;
          const discountedPrice = price + discount;
          return total + discountedPrice * item.quantity;
        }, 0);
      },
      getItemCount: (productId) => {
        const item = get().items.find((item) => getItemIdentifier(item.product) === productId);
        return item ? item.quantity : 0;
      },
      getGroupedItems: () => get().items,
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
      removeCoupon: () => set({ appliedCoupon: null }),
      getFinalPrice: () => {
        const total = get().getTotalPrice();
        const coupon = get().appliedCoupon;
        if (coupon) {
          return Math.max(0, total - coupon.calculatedDiscount);
        }
        return total;
      },
    }),
    {
      name: "cart-store",
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Migration to version 2 - reset cart to handle new variant structure
          return { ...persistedState, items: [], appliedCoupon: null };
        }
        if (version < 3) {
          // Migration to version 3 - add coupon support
          return { ...persistedState, appliedCoupon: null };
        }
        return persistedState;
      },
    }
  )
);

export default useCartStore;