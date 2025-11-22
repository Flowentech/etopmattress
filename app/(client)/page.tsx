import Categories from "@/components/Categories";
import Container from "@/components/Container";
import {DiscountBanner} from "@/components/DiscountBanner";
import ProductList from "@/components/ProductList";
import { getAllCategories, getSale, getTrendingProducts, getBestSellerProducts, getFeaturedProducts, getNewArrivals } from "@/sanity/helpers";

export default async function Home() {
  const allCategories = await getAllCategories();
  // Filter to show only main categories (level 0) on home page
  const categories = allCategories.filter((cat: any) => cat.level === 0 || !cat.level);
  const sales = await getSale();

  // Get products by navigation categories
  const trendingProducts = await getTrendingProducts();
  const bestSellerProducts = await getBestSellerProducts();
  const featuredProducts = await getFeaturedProducts();
  const newArrivals = await getNewArrivals();

  return (
    <Container className="pb-10">
      <DiscountBanner sales={sales} />

      {/* Hero Section */}
      <div className="my-10 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-primary">Etopmattress</span>
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Experience the perfect night&apos;s sleep with our premium collection of mattresses.
            Quality comfort, exceptional support, unbeatable prices.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="/shop" className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Shop Now
            </a>
            <a href="/categories" className="bg-white text-primary px-6 py-3 rounded-lg font-semibold border-2 border-primary hover:bg-pink-50 transition-colors">
              Browse Categories
            </a>
          </div>
        </div>
      </div>

      <Categories categories={categories} />

      <ProductList
        title={
          <>
            New <span className="text-primary">Arrivals</span>
          </>
        }
        subtitle="Latest additions to our mattress collection with cutting-edge technology."
        products={newArrivals}
      />

      <ProductList
        products={trendingProducts}
        title={
          <>
            Trending <span className="text-primary">Mattresses</span>
          </>
        }
        subtitle="Discover our most popular mattresses loved by thousands of satisfied customers."
      />

      <ProductList
        title={
          <>
            Best Seller <span className="text-primary">Mattresses</span>
          </>
        }
        subtitle="Top-rated mattresses for exceptional comfort and lasting quality."
        products={bestSellerProducts}
      />

      <ProductList
        title={
          <>
            Featured <span className="text-primary">Collection</span>
          </>
        }
        subtitle="Premium mattresses handpicked for superior sleep experience."
        products={featuredProducts}
      />
    </Container>
  );
}
