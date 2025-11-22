"use client";

import { Category } from "@/sanity.types";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface Props {
  categories: Category[];
}

const CategorySelector = ({ categories }: Props) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const router = useRouter();

  const handleSelect = (categoryId: string, slug?: string) => {
    setSelectedCategory(categoryId);
    const path = categoryId === "all" ? "/categories" : `/categories/${slug}`;
    router.push(path);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-6">
      {categories?.slice(0, 8).map((category) => (
        <div
          key={category._id}
          className={cn(
            "group bg-white hover:bg-emerald-50 rounded-xl p-4 relative aspect-square flex flex-col items-center justify-center cursor-pointer shadow-sm border border-gray-200 hover:border-emerald-300 transition-all duration-200",
            selectedCategory === category._id && "ring-2 ring-emerald-500 bg-emerald-50"
          )}
          onClick={() => handleSelect(category._id, category.slug?.current)}
        >
          {/* Category Image */}
          <div className="w-12 h-12 lg:w-16 lg:h-16 mb-3 relative">
            {category?.image ? (
              <Image
                src={urlFor(category.image).url()}
                alt={category?.title || "CategoryImage"}
                fill
                className="object-contain group-hover:scale-110 transition-transform duration-200"
                sizes="(max-width: 768px) 48px, (max-width: 1024px) 64px, 64px"
              />
            ) : (
              <div className="w-full h-full bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0v-4a2 2 0 011-1h2a2 2 0 011 1v4z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Category Title */}
          <h3 className="text-xs lg:text-sm font-medium text-gray-800 text-center line-clamp-2 group-hover:text-emerald-700 transition-colors">
            {category?.title}
          </h3>
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
        </div>
      ))}
    </div>
  );
};

export default CategorySelector;
