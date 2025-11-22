import { Product } from "@/sanity.types";

interface FilterParams {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string[];
  rating?: string;
  search?: string;
  sort?: string;
}

export function filterProducts(products: Product[], filters: FilterParams): Product[] {
  let filteredProducts = [...products];

  // Category filter
  if (filters.category && filters.category !== "all") {
    filteredProducts = filteredProducts.filter(product => 
      product.categories?.some((cat: { _ref?: string; _id?: string }) => cat._ref === filters.category || cat._id === filters.category)
    );
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? parseFloat(filters.minPrice) : 0;
    const max = filters.maxPrice ? parseFloat(filters.maxPrice) : Infinity;
    
    filteredProducts = filteredProducts.filter(product => 
      product.price && product.price >= min && product.price <= max
    );
  }

  // Availability filters
  if (filters.availability && filters.availability.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return filters.availability!.some(filter => {
        switch (filter) {
          case 'inStock':
            return product.stock && product.stock > 0;
          case 'onSale':
            return product.discount && product.discount > 0;
          case 'newArrivals':
            // Products created in last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return product._createdAt && new Date(product._createdAt) > thirtyDaysAgo;
          default:
            return true;
        }
      });
    });
  }

  // Rating filter
  if (filters.rating) {
    const minRating = parseFloat(filters.rating);
    filteredProducts = filteredProducts.filter(product => 
      (product as any).rating && (product as any).rating >= minRating
    );
  }

  // Search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.toLowerCase().trim();
    filteredProducts = filteredProducts.filter(product =>
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );
  }

  // Sort products
  if (filters.sort) {
    filteredProducts.sort((a, b) => {
      switch (filters.sort) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'rating':
          return ((b as any).rating || 0) - ((a as any).rating || 0);
        case 'newest':
        default:
          return new Date(b._createdAt || '').getTime() - new Date(a._createdAt || '').getTime();
      }
    });
  }

  return filteredProducts;
}

export function getFilteredProductCount(products: Product[], filters: FilterParams): number {
  return filterProducts(products, filters).length;
}

// Helper to get human readable sort options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'rating', label: 'Highest Rated' },
] as const;