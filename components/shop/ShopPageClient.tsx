"use client";

import ShopHeader from "./ShopHeader";
import ShopFilters from "./ShopFilters";
import MobileFilterButton from "./MobileFilterButton";
import InfiniteProductGrid from "../InfiniteProductGrid";
import { Product } from "@/sanity.types";

interface ShopPageClientProps {
  initialProducts: Product[];
  totalProducts: number;
  categories: any[];
  priceRanges: any[];
  filterStats: any;
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

export default function ShopPageClient({
  initialProducts,
  totalProducts,
  categories,
  priceRanges,
  filterStats,
  currentFilters,
}: ShopPageClientProps) {
  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 shadow-sm">
        <div className="sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto p-4">
          <ShopFilters
            categories={categories}
            priceRanges={priceRanges}
            filterStats={filterStats}
            currentFilters={currentFilters}
          />
        </div>
      </aside>

      <main className="flex-1 w-full">
        <div className="px-4 md:px-6 lg:px-8 py-6">
          <div className="mb-4 lg:hidden">
            <MobileFilterButton
              categories={categories}
              priceRanges={priceRanges}
              filterStats={filterStats}
              currentFilters={currentFilters}
            />
          </div>

          <ShopHeader
            totalProducts={totalProducts}
            currentFilters={currentFilters}
          />

          <div className="mt-6 w-full">
            <InfiniteProductGrid
              initialProducts={initialProducts}
              totalProducts={totalProducts}
              filters={currentFilters}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
