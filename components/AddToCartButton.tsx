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
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : isAdded
            ? "bg-primary text-white"
            : "bg-primary text-white hover:bg-primary/90"
        }
        px-4 py-2 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-[10px] font-medium
      `}
    >
      {currentStock === 0 ? (
        "Out of Stock"
      ) : isAdded ? (
        <>
          <span>✓</span>
          <span>Added to Cart</span>
        </>
      ) : (
        <>
          <FaCartPlus size={14} />
          <span>
            {itemQuantity > 0 ? `In Cart (${itemQuantity})` : "Add to Cart"}
          </span>
        </>
      )}
    </button>
  );
};

export default AddToCartButton;