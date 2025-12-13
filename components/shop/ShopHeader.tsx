"use client";

import { useState, useCallback, useMemo, useTransition, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Form from "next/form";

interface ShopHeaderProps {
  totalProducts: number;
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    availability?: string[];
    rating?: string;
  };
}

export default function ShopHeader({ totalProducts, currentFilters }: ShopHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const navigationRef = useRef(false);
  const [sortBy, setSortBy] = useState(currentFilters.sort || "newest");

  const handleSortChange = useCallback((newSort: string) => {
    if (navigationRef.current) return;

    navigationRef.current = true;
    setSortBy(newSort);

    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    params.delete("page"); // Reset to page 1 when sorting

    startTransition(() => {
      router.push(`/shop?${params.toString()}`);
      setTimeout(() => {
        navigationRef.current = false;
      }, 100);
    });
  }, [searchParams, router]);

  const clearFilters = useCallback(() => {
    if (navigationRef.current) return;

    navigationRef.current = true;

    startTransition(() => {
      router.push("/shop");
      setTimeout(() => {
        navigationRef.current = false;
      }, 100);
    });
  }, [router]);

  const hasFilters = useMemo(() =>
    currentFilters.category || currentFilters.minPrice ||
    currentFilters.maxPrice || currentFilters.search,
    [currentFilters.category, currentFilters.minPrice, currentFilters.maxPrice, currentFilters.search]
  );

  return (
    <div className="space-y-4">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop All Products</h1>
          <p className="text-gray-600 mt-1">
            Discover our complete collection of premium plants and interior design products
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <Form action="/shop" className="relative">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={currentFilters.search}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <Button 
              type="submit" 
              size="sm"
              className="absolute right-1 top-1 bottom-1 px-3 bg-emerald-600 hover:bg-emerald-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Button>
          </Form>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        {/* Results Count & Active Filters */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            <strong>{totalProducts}</strong> products found
          </span>
          
          {hasFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-xs border-gray-300 hover:border-gray-400"
            >
              Clear all filters
            </Button>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {currentFilters.category && (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
              Category: {currentFilters.category}
              <button className="hover:text-emerald-900 ml-1">×</button>
            </span>
          )}
          
          {currentFilters.search && (
            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Search: "{currentFilters.search}"
              <button className="hover:text-blue-900 ml-1">×</button>
            </span>
          )}
          
          {(currentFilters.minPrice || currentFilters.maxPrice) && (
            <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              Price: ${currentFilters.minPrice || 0} - ${currentFilters.maxPrice || "∞"}
              <button className="hover:text-purple-900 ml-1">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}