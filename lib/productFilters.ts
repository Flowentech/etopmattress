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

  // Category filter - check both _ref and _id
  if (filters.category && filters.category !== "all") {
    filteredProducts = filteredProducts.filter(product =>
      product.categories?.some(cat => {
        const catId = typeof cat === 'object' && '_ref' in cat ? cat._ref : (cat as any)._id;
        return catId === filters.category;
      })
    );
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice ? Number(filters.minPrice) : 0;
    const max = filters.maxPrice ? Number(filters.maxPrice) : Infinity;

    filteredProducts = filteredProducts.filter(
      product => product.price && product.price >= min && product.price <= max
    );
  }

  // Search filter
  if (filters.search?.trim()) {
    const term = filters.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      product =>
        product.name?.toLowerCase().includes(term) ||
        product.description?.toLowerCase()?.includes(term)
    );
  }

  // Availability filter
  if (filters.availability && filters.availability.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      return filters.availability?.some(avail => {
        if (avail === 'inStock') return product.stock && product.stock > 0;
        if (avail === 'outOfStock') return !product.stock || product.stock === 0;
        if (avail === 'onSale') return product.discount && product.discount > 0;
        if (avail === 'newArrivals') return product.label === 'New';
        return false;
      });
    });
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
        case 'newest':
          return new Date(b._createdAt || '').getTime() - new Date(a._createdAt || '').getTime();
        default:
          return 0;
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