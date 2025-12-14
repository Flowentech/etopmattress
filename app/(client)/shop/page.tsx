import { getAllProducts } from "@/sanity/helpers";
import { filterProducts } from "@/lib/productFilters";
import ShopPageClient from "@/components/shop/ShopPageClient";

const INITIAL_ITEMS = 8;

export const metadata = {
  title: "Shop - All Products | Etopmattress",
  description:
    "Browse our complete collection of premium mattresses. Filter by category, price, and more.",
};

interface ShopPageProps {
  searchParams?: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    search?: string;
    availability?: string;
    rating?: string;
  };
}

export default async function Page({ searchParams = {} }: ShopPageProps) {
  const {
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    search,
    availability,
    rating,
  } = searchParams;

  const allProducts = await getAllProducts().catch((): any[] => []);

  // Clean products to avoid circular references and ensure serializability
  const cleanedProducts = allProducts.map((product: any) => ({
    _id: product._id,
    _createdAt: product._createdAt,
    name: product.name,
    slug: product.slug,
    image: product.image,
    price: product.price,
    discount: product.discount,
    label: product.label,
    stock: product.stock,
    status: product.status,
    description: product.description,
    categories: product.categories?.map((cat: any) => ({
      _id: cat._id,
      title: cat.title,
      slug: cat.slug,
    })) || [],
  }));

  // Extract unique categories from products
  const categoryMap = new Map();
  cleanedProducts.forEach((product: any) => {
    product.categories?.forEach((cat: any) => {
      if (cat && !categoryMap.has(cat._id)) {
        categoryMap.set(cat._id, {
          _id: cat._id,
          title: cat.title,
          slug: cat.slug,
          productCount: 0,
        });
      }
    });
  });

  // Count products per category
  cleanedProducts.forEach((product: any) => {
    product.categories?.forEach((cat: any) => {
      if (cat) {
        const category = categoryMap.get(cat._id);
        if (category) {
          category.productCount = (category.productCount || 0) + 1;
        }
      }
    });
  });

  const categories = Array.from(categoryMap.values());

  const availabilityArray: string[] | undefined = availability?.split(",");

  const filteredProducts = filterProducts(cleanedProducts, {
    category,
    minPrice,
    maxPrice,
    search,
    availability: availabilityArray,
    rating,
    sort,
  });

  const initialProducts = filteredProducts.slice(0, INITIAL_ITEMS);
  const totalProducts = filteredProducts.length;

  const priceData = {
    priceRanges: [
      { label: "Under $25", min: 0, max: 25, count: 0 },
      { label: "$25 - $50", min: 25, max: 50, count: 0 },
      { label: "$50 - $100", min: 50, max: 100, count: 0 },
      { label: "$100 - $200", min: 100, max: 200, count: 0 },
      { label: "Over $200", min: 200, max: null, count: 0 },
    ],
  };

  const filterStats = {
    availability: { inStock: 0, outOfStock: 0, onSale: 0, newArrivals: 0 },
    ratings: { fourStarPlus: 0, threeStarPlus: 0, avgRating: 0 },
    totalProducts,
  };

  const currentFilters = {
    category,
    minPrice,
    maxPrice,
    sort,
    search,
    availability: availabilityArray,
    rating,
  };

  return (
    <ShopPageClient
      initialProducts={initialProducts}
      totalProducts={totalProducts}
      categories={categories}
      priceRanges={priceData.priceRanges}
      filterStats={filterStats}
      currentFilters={currentFilters}
    />
  );
}
