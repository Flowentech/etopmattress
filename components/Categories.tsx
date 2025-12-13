import { Category } from "@/sanity.types";
import React from "react";
import Link from "next/link";
import CategorySelector from "./ui/category-selector";

interface Props {
  categories: Category[];
}

const Categories = ({ categories }: Props) => {
  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-left">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by <span className="text-primary">Category</span>
          </h2>
          <p className="text-gray-600 max-w-2xl">
            Explore our carefully curated collection of plants and interior design products
          </p>
        </div>
        <div className="flex-shrink-0">
          <Link 
            href="/categories" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-lg hover:bg-emerald-50 transition-all duration-200"
          >
            View All
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      <CategorySelector categories={categories} />
    </div>
  );
};

export default Categories;
