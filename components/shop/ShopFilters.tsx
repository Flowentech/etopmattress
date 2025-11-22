"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { CategoryWithCount, PriceRange, FilterStats } from "@/lib/filterService";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CategoryTree extends CategoryWithCount {
  level: number;
  parent?: { _id: string; title: string };
  children?: CategoryTree[];
}

interface ShopFiltersProps {
  categories: CategoryWithCount[];
  priceRanges: PriceRange[];
  filterStats: FilterStats;
  currentFilters: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    availability?: string[];
    rating?: string;
  };
}

export default function ShopFilters({ categories, priceRanges, currentFilters }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || "");
  const [priceRange, setPriceRange] = useState([
    Number(currentFilters.minPrice) || 0,
    Number(currentFilters.maxPrice) || 500
  ]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Build category tree on mount
  useEffect(() => {
    const tree = buildCategoryTree(categories as any[]);
    setCategoryTree(tree);
  }, [categories]);

  const buildCategoryTree = (cats: any[]): CategoryTree[] => {
    const categoryMap = new Map<string, CategoryTree>();
    const rootCategories: CategoryTree[] = [];

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

    return rootCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // Update slider when filters change
  useEffect(() => {
    setPriceRange([
      Number(currentFilters.minPrice) || 0,
      Number(currentFilters.maxPrice) || 500
    ]);
  }, [currentFilters.minPrice, currentFilters.maxPrice]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceRangeClick = (range: PriceRange) => {
    const minVal = range.min.toString();
    const maxVal = range.max?.toString() || "";

    setMinPrice(minVal);
    setMaxPrice(maxVal);
    const params = new URLSearchParams(searchParams);

    params.set("minPrice", minVal);
    if (maxVal) {
      params.set("maxPrice", maxVal);
    } else {
      params.delete("maxPrice");
    }

    params.delete("page");
    router.push(`/shop?${params.toString()}`);
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

  const renderCategoryTree = (category: CategoryTree, depth: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = currentFilters.category === category._id;
    const isExpanded = expandedCategories.has(category._id);
    const paddingLeft = depth * 12;

    return (
      <div key={category._id} className="space-y-1">
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category._id);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              style={{ marginLeft: `${paddingLeft}px` }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          ) : (
            <div style={{ width: "20px", marginLeft: `${paddingLeft}px` }} />
          )}

          <button
            onClick={() => updateFilter("category", category._id)}
            className={`flex-1 flex items-center rounded text-xs transition-colors py-1.5 px-2 ${
              isSelected
                ? "bg-emerald-100 text-emerald-800 font-semibold"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="flex-1 text-left">{category.title}</span>
            <span className="text-gray-400 text-[10px]">({category.productCount})</span>
          </button>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children?.map((child) => renderCategoryTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="">
      {/* Categories Filter */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold">Categories</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-1">
          <button
            onClick={() => updateFilter("category", "all")}
            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
              !currentFilters.category || currentFilters.category === "all"
                ? "bg-emerald-100 text-emerald-800 font-medium"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Categories
          </button>

          {categoryTree.map((category) => renderCategoryTree(category))}
        </CardContent>
      </Card>

      {/* Price Filter */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {/* Quick Price Ranges */}
          <div className="space-y-1">
            {priceRanges.slice(0, 4).map((range, index) => (
              <button
                key={index}
                onClick={() => handlePriceRangeClick(range)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  Number(currentFilters.minPrice) === range.min && Number(currentFilters.maxPrice) === range.max
                    ? "bg-emerald-100 text-emerald-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Price Range Slider */}
          <div className="border-t pt-3 mt-2">
            <div className="space-y-3">
              <div className="px-1">
                <Slider
                  value={priceRange}
                  onValueChange={(values) => {
                    setPriceRange(values);
                    setMinPrice(values[0].toString());
                    setMaxPrice(values[1].toString());
                  }}
                  onValueCommit={(values) => {
                    const params = new URLSearchParams(searchParams);
                    if (values[0] > 0) {
                      params.set("minPrice", values[0].toString());
                    } else {
                      params.delete("minPrice");
                    }
                    if (values[1] < 500) {
                      params.set("maxPrice", values[1].toString());
                    } else {
                      params.delete("maxPrice");
                    }
                    params.delete("page");
                    router.push(`/shop?${params.toString()}`);
                  }}
                  max={500}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              <div className="text-center text-xs text-gray-500">
                Price Range: ${priceRange[0]} - ${priceRange[1]}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Combined */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="text-sm font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-2">
          {/* Availability */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Availability</p>
            <div className="space-y-1">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3 h-3 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-600">In Stock</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-3 h-3 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-600">On Sale</span>
              </label>
            </div>
          </div>

          {/* Rating */}
          <div className="border-t pt-2">
            <p className="text-xs font-medium text-gray-700 mb-1">Rating</p>
            <div className="space-y-1">
              {[4, 3].map((rating) => (
                <button
                  key={rating}
                  className="w-full text-left px-2 py-1 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <div className="flex items-center">
                    {Array.from({ length: rating }).map((_, i) => (
                      <svg
                        key={i}
                        className="w-3 h-3 text-yellow-400 fill-current"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-xs">& Up</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
