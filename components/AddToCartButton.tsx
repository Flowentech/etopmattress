"use client";

import { Product } from "@/sanity.types";
import useCartStore from "@/store";
import { useState, useEffect } from "react";
import { FaCartPlus } from "react-icons/fa";

interface AddToCartButtonProps {
  product: Product;
  className?: string;
}

const AddToCartButton = ({ product, className = "" }: AddToCartButtonProps) => {
  const { addItem, getItemCount } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  // Generate unique ID for variants (product_id + variant info)
  const getItemId = () => {
    if ((product as any).selectedVariant) {
      const variant = (product as any).selectedVariant;
      return `${product._id}_${variant.sizeId}_${variant.heightId}`;
    }
    return product._id || "";
  };

  // Check stock - for variants, use variant stock
  const currentStock = (product as any).selectedVariant
    ? (product as any).selectedVariant.stock
    : product?.stock;

  const itemQuantity = mounted ? getItemCount(getItemId()) : 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={currentStock === 0}
      className={`
        ${className}
        ${
          currentStock === 0
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : isAdded
            ? "bg-green-600 text-white"
            : "bg-primary text-white hover:bg-primary/90"
        }
        w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-medium
      `}
    >
      {currentStock === 0 ? (
        <span className="text-[9px] sm:text-[10px]">Out of Stock</span>
      ) : isAdded ? (
        <>
          <span>✓</span>
          <span className="hidden sm:inline">Added to Cart</span>
          <span className="sm:hidden">Added</span>
        </>
      ) : (
        <>
          <FaCartPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="truncate">
            {itemQuantity > 0 ? (
              <>
                <span className="hidden sm:inline">In Cart ({itemQuantity})</span>
                <span className="sm:hidden">({itemQuantity})</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Add to Cart</span>
                <span className="sm:hidden">Add</span>
              </>
            )}
          </span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;