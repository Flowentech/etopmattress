"use client";

import { useEffect, useState } from "react";
import Container from "@/components/Container";
import CategoryCard from "@/components/CategoryCard";
import { ChevronDown, ChevronRight } from "lucide-react";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  image?: any;
  level: number;
  order: number;
  parent?: { _id: string; title: string; slug: { current: string } };
  children?: Category[];
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(buildCategoryTree(data));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const buildCategoryTree = (cats: Category[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // Initialize all categories
    cats.forEach((cat) => {
      categoryMap.set(cat._id, { ...cat, children: [] });
    });

    // Build tree structure
    cats.forEach((cat) => {
      const category = categoryMap.get(cat._id)!;
      if (cat.parent?._id) {
        const parent = categoryMap.get(cat.parent._id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    // Sort by order
    const sortByOrder = (a: Category, b: Category) => (a.order || 0) - (b.order || 0);
    rootCategories.sort(sortByOrder);
    rootCategories.forEach((cat) => {
      if (cat.children) cat.children.sort(sortByOrder);
      cat.children?.forEach((subCat) => {
        if (subCat.children) subCat.children.sort(sortByOrder);
      });
    });

    return rootCategories;
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryWithChildren = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const paddingLeft = depth * 20;

    return (
      <div key={category._id} className="border-b border-gray-200 last:border-b-0">
        <div
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
          onClick={() => hasChildren && toggleExpand(category._id)}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <button
                className="mr-3 text-gray-600 hover:text-gray-900"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(category._id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            ) : (
              <div className="w-5 mr-3" />
            )}

            {category.image?.asset?.url && (
              <img
                src={category.image.asset.url}
                alt={category.title}
                className="w-12 h-12 object-cover rounded mr-4"
              />
            )}

            <div className="flex-1">
              <a
                href={`/categories/${category.slug.current}`}
                className="font-semibold text-gray-900 hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {category.title}
              </a>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            {category.productCount !== undefined && (
              <span className="text-sm text-gray-500 ml-4">
                {category.productCount} products
              </span>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {category.children?.map((child) => renderCategoryWithChildren(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Container className="py-8">
          <div className="text-center mb-12">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
          </div>
          <div className="bg-white rounded-lg shadow-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded mr-4 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Shop by Categories</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our curated collection of products organized by category. Find everything you need to transform
            your space.
          </p>
        </div>

        {/* Categories Accordion */}
        <div className="bg-white rounded-lg shadow-sm mb-12">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Categories Found</h3>
              <p className="text-gray-500">Categories will appear here once they are added.</p>
            </div>
          ) : (
            categories.map((category) => renderCategoryWithChildren(category))
          )}
        </div>

        {/* Grid View of Main Categories */}
        {categories.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Main Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-12">
              {categories.map((category) => (
                <CategoryCard key={category._id} category={category} />
              ))}
            </div>
          </div>
        )}

        {/* Additional Info Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Shop by Categories?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto mb-6">
              Our carefully curated categories make it easy to find exactly what you&apos;re looking for. Whether
              you&apos;re redesigning a room or looking for specific items, our organized categories help you discover
              the perfect products for your space.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Easy Discovery</h3>
                <p className="text-sm text-gray-600">Find products quickly by browsing specific categories</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Curated Selection</h3>
                <p className="text-sm text-gray-600">Hand-picked products in each category for quality</p>
              </div>
              <div className="text-center">
                <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Hierarchical Navigation</h3>
                <p className="text-sm text-gray-600">Browse through main, sub, and sub-sub categories with ease</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
