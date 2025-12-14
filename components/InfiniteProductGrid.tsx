"use client";

import { Product } from "@/sanity.types";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

interface InfiniteProductGridProps {
  initialProducts: Product[];
  filters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    availability?: string[];
    rating?: string;
  };
  totalProducts: number;
}

export default function InfiniteProductGrid({
  initialProducts,
  filters,
  totalProducts,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalProducts);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const prevFiltersRef = useRef<string>("");

  // Create a stable filter key to detect actual changes
  const filterKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // Reset products when filters actually change
  useEffect(() => {
    if (prevFiltersRef.current !== filterKey) {
      prevFiltersRef.current = filterKey;
      setProducts(initialProducts);
      setPage(1);
      setHasMore(initialProducts.length < totalProducts);
    }
  }, [filterKey, initialProducts, totalProducts]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.search && { search: filters.search }),
        ...(filters.availability && { availability: filters.availability.join(",") }),
        ...(filters.rating && { rating: filters.rating }),
      });

      const response = await fetch(`/api/products?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();

      if (data.products && data.products.length > 0) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(data.pagination.currentPage);
        setHasMore(data.pagination.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more products:", error);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [page, hasMore, filters]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadMore]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No products found</p>
        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="flex justify-center"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm animate-pulse w-full max-w-[300px] h-[200px] flex mx-auto"
            >
              <div className="w-1/2 bg-gray-200 rounded-l-lg"></div>
              <div className="w-1/2 p-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="bg-gray-200 h-2 rounded"></div>
                  <div className="bg-gray-200 h-3 rounded"></div>
                  <div className="bg-gray-200 h-2 rounded w-2/3"></div>
                </div>
                <div className="bg-gray-200 h-6 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Observer target */}
      <div ref={observerTarget} className="h-10 mt-4" />

      {/* End message */}
      {!hasMore && products.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            You've reached the end of the list ({products.length} products)
          </p>
        </div>
      )}
    </>
  );
}
