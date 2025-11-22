import { revalidateTag } from "next/cache";

// Cache tag constants
export const CACHE_TAGS = {
  CATEGORIES: "categories",
  PRODUCTS: "products", 
  PRICING: "pricing",
  STATISTICS: "statistics",
  FILTERS: "filters"
} as const;

// Helper functions to revalidate specific cache tags
export const revalidateCategories = () => revalidateTag(CACHE_TAGS.CATEGORIES);
export const revalidateProducts = () => revalidateTag(CACHE_TAGS.PRODUCTS);
export const revalidatePricing = () => revalidateTag(CACHE_TAGS.PRICING);
export const revalidateStatistics = () => revalidateTag(CACHE_TAGS.STATISTICS);
export const revalidateFilters = () => {
  revalidateTag(CACHE_TAGS.CATEGORIES);
  revalidateTag(CACHE_TAGS.PRODUCTS);
  revalidateTag(CACHE_TAGS.PRICING);
  revalidateTag(CACHE_TAGS.STATISTICS);
};

// Revalidate everything
export const revalidateAll = () => {
  Object.values(CACHE_TAGS).forEach(tag => revalidateTag(tag));
};