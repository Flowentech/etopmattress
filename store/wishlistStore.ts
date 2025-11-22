import { Product } from "../sanity.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  guestEmail?: string; // For email marketing
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => boolean; // Returns true if added, false if removed
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
  getItemCount: () => number;
  setGuestEmail: (email: string) => void;
  // Migration function for when user logs in
  syncWithServer: (userId: string) => Promise<void>;
}

const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      guestEmail: undefined,
      
      addItem: (product) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product._id === product._id
          );
          if (existingItem) {
            return state; // Already exists, no change
          }
          return {
            items: [
              ...state.items,
              { product, addedAt: new Date().toISOString() }
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.product._id !== productId
          ),
        })),

      toggleItem: (product) => {
        const state = get();
        const isCurrentlyWishlisted = state.items.some(
          (item) => item.product._id === product._id
        );
        
        if (isCurrentlyWishlisted) {
          get().removeItem(product._id);
          return false;
        } else {
          get().addItem(product);
          return true;
        }
      },

      isWishlisted: (productId) => {
        return get().items.some((item) => item.product._id === productId);
      },

      clearWishlist: () => set({ items: [] }),

      getItemCount: () => get().items.length,

      setGuestEmail: (email) => set({ guestEmail: email }),

      syncWithServer: async (userId) => {
        const state = get();
        if (state.items.length === 0) return;

        try {
          // Send guest wishlist to server
          await fetch("/api/wishlist/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              guestItems: state.items,
              guestEmail: state.guestEmail,
            }),
          });

          // Clear local storage after successful sync
          set({ items: [], guestEmail: undefined });
        } catch (error) {
          console.error("Failed to sync wishlist with server:", error);
        }
      },
    }),
    {
      name: "guest-wishlist-store",
      // Only persist for guest users
      partialize: (state) => ({
        items: state.items,
        guestEmail: state.guestEmail,
      }),
    }
  )
);

export default useWishlistStore;