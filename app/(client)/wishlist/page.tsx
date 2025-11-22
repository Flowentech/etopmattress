"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/sanity.types";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import the store to avoid SSR issues
const useWishlistStore = dynamic(() => import("@/store/wishlistStore"), {
  ssr: false,
});

interface WishlistItem {
  _id: string;
  productId: string;
  userId: string;
  product: Product;
  createdAt: string;
}

export default function WishlistPage() {
  const { user } = useUser();
  const [guestItems, setGuestItems] = useState<any[]>([]);
  const [clearWishlist, setClearWishlist] = useState<(() => void) | null>(null);
  const [serverItems, setServerItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeLoaded, setStoreLoaded] = useState(false);

  // Initialize store after component mounts
  useEffect(() => {
    const initStore = async () => {
      try {
        const { default: store } = await import("@/store/wishlistStore");
        const storeState = store.getState();
        setGuestItems(storeState.items);
        setClearWishlist(() => storeState.clearWishlist);
        setStoreLoaded(true);
      } catch (error) {
        console.error("Error loading wishlist store:", error);
        setStoreLoaded(true);
      }
    };
    initStore();
  }, []);

  useEffect(() => {
    const fetchServerWishlist = async () => {
      if (!user || !storeLoaded) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/wishlist");
        const data = await response.json();
        if (data.success) {
          setServerItems(data.wishlist);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServerWishlist();
  }, [user, storeLoaded]);

  const wishlistItems = user 
    ? serverItems.map(item => item.product).filter(product => product && product._id)
    : guestItems.map(item => item.product).filter(product => product && product._id);

  if (loading || !storeLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-primary fill-current" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-8 text-center max-w-md">
              Start adding items to your wishlist by clicking the heart icon on products you love
            </p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          // Wishlist Items
          <div className="space-y-6">
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Save your wishlist permanently</h3>
                    <p className="text-sm text-amber-600 mt-1">
                      Sign in to save your wishlist and access it from any device
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Link href="/sign-in">
                        <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          Create Account
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Showing {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
              {wishlistItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (user) {
                      // Clear server wishlist
                      fetch("/api/wishlist/clear", { method: "POST" })
                        .then(() => setServerItems([]))
                        .catch(console.error);
                    } else if (clearWishlist) {
                      clearWishlist();
                      setGuestItems([]);
                    }
                  }}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  Clear All
                </Button>
              )}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {wishlistItems.filter(product => product && product._id).map((product) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-center"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Continue Shopping */}
            <div className="flex justify-center pt-8">
              <Link href="/shop">
                <Button variant="outline" className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}