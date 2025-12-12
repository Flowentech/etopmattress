import { Suspense } from "react";
import Container from "@/components/Container";
import InfiniteProductGrid from "@/components/InfiniteProductGrid";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopHeader from "@/components/shop/ShopHeader";
import MobileFilterButton from "@/components/shop/MobileFilterButton";
import { getAllProducts } from "@/sanity/helpers";
import { getCategoriesWithCount } from "@/lib/filterService";
import { filterProducts } from "@/lib/productFilters";

const INITIAL_ITEMS = 12;

export const metadata = {
  title: "Shop - All Products | Etopmattress",
  description:
    "Browse our complete collection of premium mattresses. Filter by category, price, and more.",
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

  // Fetch products and categories
  const [allProducts, categories] = await Promise.all([
    getAllProducts(),
    getCategoriesWithCount().catch((): any[] => []),
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

  // Get only initial items for SSR
  const initialProducts = filteredProducts.slice(0, INITIAL_ITEMS);
  const totalProducts = filteredProducts.length;

  // Compute price ranges from products (faster than Sanity query)
  const priceData = {
    priceStats: {},
    priceRanges: [
      { label: "Under $25", min: 0, max: 25, count: 0 },
      { label: "$25 - $50", min: 25, max: 50, count: 0 },
      { label: "$50 - $100", min: 50, max: 100, count: 0 },
      { label: "$100 - $200", min: 100, max: 200, count: 0 },
      { label: "Over $200", min: 200, max: null, count: 0 },
    ],
  };

  // Simple filter stats computed from products
  const filterStats = {
    availability: { inStock: 0, outOfStock: 0, onSale: 0, newArrivals: 0 },
    ratings: { fourStarPlus: 0, threeStarPlus: 0, avgRating: 0 },
    totalProducts,
  };

  return (
    <div className="bg-gray-0 pb-16 lg:flex">
      {/* Left Sidebar - Sticky Filters (Hidden on mobile) */}
      <div className="hidden lg:block bg-white shadow-sm border-r border-gray-200 w-64">
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
      <div className="flex-1 min-h-[calc(100vh-16rem)] w-full lg:w-auto">
        <Container className="py-6">
          {/* Mobile Filter Button */}
          <div className="mb-4 lg:hidden">
            <MobileFilterButton
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
          </div>

          {/* Shop Header */}
          <ShopHeader
            totalProducts={totalProducts}
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

          {/* Products Grid with Infinite Scroll */}
          <div className="mt-6">
            <InfiniteProductGrid
              initialProducts={initialProducts}
              totalProducts={totalProducts}
              filters={{
                category,
                minPrice,
                maxPrice,
                sort,
                search,
                availability: availability?.split(","),
                rating,
              }}
            />
          </div>
        </Container>
      </div>
    </div>
  );
}
