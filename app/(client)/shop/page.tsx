"use client";

import { useState, useEffect } from "react";
import Container from "@/components/Container";
import ProductGrid from "@/components/ProductGrid";
import { Product } from "@/sanity.types";
import { ChevronDown, ChevronRight, Filter } from "lucide-react";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  level: number;
  order: number;
  parent?: { _id: string; title: string; slug: { current: string } };
  children?: Category[];
  productCount?: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(buildCategoryTree(data));
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsMobileFilterOpen(false);
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

  const getSelectedCategoryName = () => {
    if (selectedCategory === "all") return "All Products";

    const findCategory = (cats: Category[]): string | null => {
      for (const cat of cats) {
        if (cat._id === selectedCategory) return cat.title;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(categories) || "Filter";
  };

  const renderCategoryItem = (category: Category, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = selectedCategory === category._id;
    const paddingLeft = depth * 16;

    return (
      <div key={category._id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(category._id);
            }
            handleCategoryChange(category._id);
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
            isSelected
              ? "bg-primary text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
          style={{ paddingLeft: `${paddingLeft + 16}px` }}
        >
          <span className="flex items-center gap-2 flex-1">
            {hasChildren && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(category._id);
                }}
                className="cursor-pointer"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            )}
            {!hasChildren && <span className="w-4" />}
            <span className="font-medium">{category.title}</span>
          </span>
          {category.productCount !== undefined && (
            <span className={`text-xs ${isSelected ? "text-white" : "text-gray-500"}`}>
              ({category.productCount})
            </span>
          )}
        </button>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {category.children?.map((child) => renderCategoryItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">Browse our collection of products</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </h2>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <button
                  onClick={() => handleCategoryChange("all")}
                  className={`w-full text-left px-4 py-2.5 font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All Products
                </button>
                {categories.map((category) => renderCategoryItem(category))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm"
              >
                <span className="font-medium text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  {getSelectedCategoryName()}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    isMobileFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mobile Filter Dropdown */}
              {isMobileFilterOpen && (
                <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
                  <button
                    onClick={() => handleCategoryChange("all")}
                    className={`w-full text-left px-4 py-3 border-b border-gray-200 font-medium ${
                      selectedCategory === "all"
                        ? "bg-primary text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((category) => (
                    <div key={category._id} className="border-b border-gray-200 last:border-b-0">
                      {renderCategoryItem(category)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Products Count */}
            <div className="mb-4 text-sm text-gray-600">
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  {products.length} {products.length === 1 ? "product" : "products"} found
                </span>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Products Found</h3>
                <p className="text-gray-500">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
