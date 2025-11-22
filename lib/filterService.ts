import { unstable_cache } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";
import { 
  CATEGORIES_WITH_COUNT_QUERY, 
  PRICE_RANGES_QUERY, 
  FILTER_STATS_QUERY,
  CATEGORY_LOOKUP_QUERY 
} from "@/sanity/queries/filterQueries";

// Cache for 1 hour (3600 seconds)
const CACHE_DURATION = 3600;

export interface CategoryWithCount {
  _id: string;
  title: string;
  slug?: { current: string };
  description?: string;
  image?: {
    asset: {
      _ref: string;
    };
  };
  level: number;
  order: number;
  parent?: {
    _id: string;
    title: string;
  };
  productCount: number;
}

export interface PriceRange {
  label: string;
  min: number;
  max: number | null;
  count: number;
}

export interface FilterStats {
  availability: {
    inStock: number;
    outOfStock: number;
    onSale: number;
    newArrivals: number;
  };
  ratings: {
    fourStarPlus: number;
    threeStarPlus: number;
    avgRating: number;
  };
  totalProducts: number;
}

// Cached function to get categories with product counts
export const getCategoriesWithCount = unstable_cache(
  async (): Promise<CategoryWithCount[]> => {
    try {
      return await sanityFetch(CATEGORIES_WITH_COUNT_QUERY) || [];
    } catch (error) {
      console.error("Error fetching categories with count:", error);
      return [];
    }
  },
  ["categories-with-count"],
  {
    revalidate: CACHE_DURATION,
    tags: ["categories", "products"]
  }
);

// Cached function to get price ranges with counts
export const getPriceRangesWithCount = unstable_cache(
  async () => {
    try {
      return await sanityFetch(PRICE_RANGES_QUERY) || { priceStats: {}, priceRanges: [] };
    } catch (error) {
      console.error("Error fetching price ranges:", error);
      return { priceStats: {}, priceRanges: [] };
    }
  },
  ["price-ranges-with-count"],
  {
    revalidate: CACHE_DURATION,
    tags: ["products", "pricing"]
  }
);

// Cached function to get filter statistics
export const getFilterStats = unstable_cache(
  async (): Promise<FilterStats> => {
    try {
      return await sanityFetch(FILTER_STATS_QUERY) || {
        availability: { inStock: 0, outOfStock: 0, onSale: 0, newArrivals: 0 },
        ratings: { fourStarPlus: 0, threeStarPlus: 0, avgRating: 0 },
        totalProducts: 0
      };
    } catch (error) {
      console.error("Error fetching filter stats:", error);
      return {
        availability: { inStock: 0, outOfStock: 0, onSale: 0, newArrivals: 0 },
        ratings: { fourStarPlus: 0, threeStarPlus: 0, avgRating: 0 },
        totalProducts: 0
      };
    }
  },
  ["filter-stats"],
  {
    revalidate: CACHE_DURATION,
    tags: ["products", "statistics"]
  }
);

// Fast category lookup with cache
export const getCategoryById = unstable_cache(
  async (categoryId: string) => {
    try {
      return await sanityFetch(CATEGORY_LOOKUP_QUERY, { categoryId }) || null;
    } catch (error) {
      console.error("Error fetching category by ID:", error);
      return null;
    }
  },
  ["category-lookup"],
  {
    revalidate: CACHE_DURATION,
    tags: ["categories"]
  }
);

// Helper function to format price ranges for display
export const formatPriceRange = (min: number, max: number | null): string => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (max === null) {
    return `${formatPrice(min)}+`;
  }
  
  if (min === 0) {
    return `Under ${formatPrice(max)}`;
  }
  
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

// Helper function to get human-readable filter labels
export const getFilterLabel = (type: string, value: string | number): string => {
  switch (type) {
    case 'availability':
      switch (value) {
        case 'inStock': return 'In Stock Only';
        case 'onSale': return 'On Sale';
        case 'newArrivals': return 'New Arrivals';
        default: return String(value);
      }
    case 'rating':
      return `${value}+ Stars`;
    case 'price':
      if (typeof value === 'string') {
        const [min, max] = value.split('-').map(Number);
        return formatPriceRange(min, max || null);
      }
      return String(value);
    default:
      return String(value);
  }
};