import { Suspense } from "react";
import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopHeader from "@/components/shop/ShopHeader";
import { getAllProducts } from "@/sanity/helpers";
import {
  getCategoriesWithCount,
  getPriceRangesWithCount,
  getFilterStats,
} from "@/lib/filterService";
import { filterProducts } from "@/lib/productFilters";

export const metadata = {
  title: "Shop - All Products | Interiowale",
  description:
    "Browse our complete collection of premium plants and interior design products. Filter by category, price, and more.",
};

interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    search?: string;
    availability?: string;
    rating?: string;
  }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const {
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    search,
    availability,
    rating,
  } = params;

  // Fetch optimized filter data with caching
  const [categories, priceData, filterStats, allProducts] = await Promise.all([
    getCategoriesWithCount(),
    getPriceRangesWithCount(),
    getFilterStats(),
    getAllProducts(),
  ]);

  // Apply filtering
  const filteredProducts = filterProducts(allProducts, {
    category,
    minPrice,
    maxPrice,
    search,
    availability: availability?.split(","),
    rating,
    sort,
  });

  return (
    <div className="bg-gray-0 pb-16 flex">
      {/* Left Sidebar - Sticky Filters */}
      <div className="bg-white shadow-sm border-r border-gray-200 w-64">
        <div className="sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto p-4">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ShopFilters
              categories={categories}
              priceRanges={priceData.priceRanges}
              filterStats={filterStats}
              currentFilters={{
                category,
                minPrice,
                maxPrice,
                sort,
                search,
                availability: availability?.split(","),
                rating,
              }}
            />
          </Suspense>
        </div>
      </div>

      {/* Right Content - Products */}
      <div className="flex-1 min-h-[calc(100vh-16rem)]">
        <Container className="py-6">
          {/* Shop Header */}
          <ShopHeader
            totalProducts={filteredProducts.length}
            currentFilters={{
              category,
              minPrice,
              maxPrice,
              sort,
              search,
              availability: availability?.split(","),
              rating,
            }}
          />

          {/* Products Grid */}
          <div className="mt-6">
            <Suspense
              fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-sm animate-pulse w-[300px] h-[200px] flex mx-auto"
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
              }
            >
              <ProductGrid products={filteredProducts} />
            </Suspense>
          </div>
        </Container>
      </div>
    </div>
  );
}
