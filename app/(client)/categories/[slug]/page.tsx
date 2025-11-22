import { Suspense } from "react";
import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import { getAllCategories, getProductsByCategory } from "@/sanity/helpers";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Temporarily disabled to allow build to proceed
// export async function generateStaticParams() {
//   const categories = await getAllCategories();
//
//   return categories.map((category: { _id: string; slug?: { current: string } }) => ({
//     slug: category.slug?.current || category._id,
//   }));
// }

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getAllCategories();
  const category = categories.find((cat: { _id: string; title: string; slug?: { current: string }; description?: string; image?: unknown }) => 
    cat.slug?.current === slug || cat._id === slug
  );

  return {
    title: category ? `${category.title} - Category | Interiowale` : "Category | Interiowale",
    description: category?.description || `Browse our ${category?.title || 'category'} collection of premium products.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  
  // Get all categories to find the current one
  const categories = await getAllCategories();
  const category = categories.find((cat: { _id: string; title: string; slug?: { current: string }; description?: string; image?: unknown }) => 
    cat.slug?.current === slug || cat._id === slug
  );

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The category you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/categories">
            <Button>Browse All Categories</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get products for this category using category slug if available, otherwise use ID
  const categoryIdentifier = category.slug?.current || category._id;
  const products = await getProductsByCategory(categoryIdentifier);

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-emerald-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.title}</span>
        </div>

        {/* Back Button */}
        <Link href="/categories">
          <Button variant="outline" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Button>
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Category Image */}
            <div className="w-full lg:w-64 flex-shrink-0">
              {category.image ? (
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={urlFor(category.image).url()}
                    alt={category.title}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg flex items-center justify-center">
                  <div className="text-emerald-600">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {category.title}
              </h1>
              {category.description && (
                <p className="text-lg text-gray-600 mb-6">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{products.length} {products.length === 1 ? 'product' : 'products'} available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Products in {category.title}
            </h2>
            <Link href="/shop">
              <Button variant="outline" size="sm">
                View All Products
              </Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-500 mb-6">
                There are currently no products in this category. Check back soon for new arrivals!
              </p>
              <Link href="/shop">
                <Button>Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <Suspense fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm animate-pulse w-[300px] h-[200px] flex mx-auto">
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
            }>
              <ProductGrid products={products} />
            </Suspense>
          )}
        </div>
      </Container>
    </div>
  );
}
