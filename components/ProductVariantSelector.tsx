"use client";

import { Product } from "@/sanity.types";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import PriceView from "./PriceView";
import AddToCartButton from "./AddToCartButton";

interface ProductVariantSelectorProps {
  product: Product;
}

interface PriceVariant {
  size: {
    _id: string;
    name: string;
    width: number;
    length: number;
    displayOrder: number;
  };
  height: {
    _id: string;
    name: string;
    value: number;
    displayOrder: number;
  };
  price: number;
  stock: number;
}

const ProductVariantSelector = ({ product }: ProductVariantSelectorProps) => {
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [selectedHeightId, setSelectedHeightId] = useState<string>("");

  // Extract unique sizes and heights from variants
  const { uniqueSizes, uniqueHeights } = useMemo(() => {
    if (!product.priceVariants || product.priceVariants.length === 0) {
      return { uniqueSizes: [], uniqueHeights: [] };
    }

    const sizesMap = new Map();
    const heightsMap = new Map();

    product.priceVariants.forEach((variant: any) => {
      if (variant.size) {
        sizesMap.set(variant.size._id, variant.size);
      }
      if (variant.height) {
        heightsMap.set(variant.height._id, variant.height);
      }
    });

    const sizes = Array.from(sizesMap.values()).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );
    const heights = Array.from(heightsMap.values()).sort(
      (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
    );

    return { uniqueSizes: sizes, uniqueHeights: heights };
  }, [product.priceVariants]);

  // Find the selected variant based on size and height
  const selectedVariant = useMemo(() => {
    if (!selectedSizeId || !selectedHeightId || !product.priceVariants) {
      return null;
    }

    return product.priceVariants.find(
      (variant: any) =>
        variant.size?._id === selectedSizeId &&
        variant.height?._id === selectedHeightId
    );
  }, [selectedSizeId, selectedHeightId, product.priceVariants]);

  // Get available heights for the selected size
  const availableHeights = useMemo(() => {
    if (!selectedSizeId || !product.priceVariants) {
      return uniqueHeights;
    }

    const heightsForSize = new Set();
    product.priceVariants.forEach((variant: any) => {
      if (variant.size?._id === selectedSizeId && variant.height) {
        heightsForSize.add(variant.height._id);
      }
    });

    return uniqueHeights.filter((height: any) =>
      heightsForSize.has(height._id)
    );
  }, [selectedSizeId, product.priceVariants, uniqueHeights]);

  // Get available sizes for the selected height
  const availableSizes = useMemo(() => {
    if (!selectedHeightId || !product.priceVariants) {
      return uniqueSizes;
    }

    const sizesForHeight = new Set();
    product.priceVariants.forEach((variant: any) => {
      if (variant.height?._id === selectedHeightId && variant.size) {
        sizesForHeight.add(variant.size._id);
      }
    });

    return uniqueSizes.filter((size: any) => sizesForHeight.has(size._id));
  }, [selectedHeightId, product.priceVariants, uniqueSizes]);

  // Create a product variant for cart
  const productWithVariant = useMemo(() => {
    if (!selectedVariant) return null;

    return {
      ...product,
      selectedVariant: {
        sizeId: selectedSizeId,
        sizeName: selectedVariant.size?.name || "",
        heightId: selectedHeightId,
        heightName: selectedVariant.height?.name || "",
        price: selectedVariant.price,
        stock: selectedVariant.stock,
      },
    };
  }, [product, selectedVariant, selectedSizeId, selectedHeightId]);

  const isVariantSelected = selectedSizeId && selectedHeightId;
  const variantInStock = selectedVariant && selectedVariant.stock > 0;

  return (
    <div className="space-y-4">
      {/* Size Selector */}
      <div className="space-y-2">
        <Label htmlFor="size" className="text-base font-semibold">
          Select Size
        </Label>
        <Select value={selectedSizeId} onValueChange={setSelectedSizeId}>
          <SelectTrigger id="size" className="w-full">
            <SelectValue placeholder="Choose a size" />
          </SelectTrigger>
          <SelectContent>
            {availableSizes.map((size: any) => (
              <SelectItem key={size._id} value={size._id}>
                {size.name} ({size.width}' x {size.length}')
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Height Selector */}
      <div className="space-y-2">
        <Label htmlFor="height" className="text-base font-semibold">
          Select Height
        </Label>
        <Select
          value={selectedHeightId}
          onValueChange={setSelectedHeightId}
          disabled={!selectedSizeId}
        >
          <SelectTrigger id="height" className="w-full">
            <SelectValue placeholder="Choose a height" />
          </SelectTrigger>
          <SelectContent>
            {availableHeights.map((height: any) => (
              <SelectItem key={height._id} value={height._id}>
                {height.name} ({height.value}")
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!selectedSizeId && (
          <p className="text-sm text-gray-500">Please select a size first</p>
        )}
      </div>

      {/* Price Display */}
      {selectedVariant && (
        <div className="space-y-2">
          <PriceView
            price={selectedVariant.price}
            discount={product?.discount}
            label={product?.label}
            className="text-lg font-bold"
          />
          {variantInStock ? (
            <p className="bg-green-100 w-24 text-center text-green-600 text-sm py-2.5 font-semibold rounded-lg">
              In Stock
            </p>
          ) : (
            <p className="bg-red-100 w-32 text-center text-red-600 text-sm py-2.5 font-semibold rounded-lg">
              Out of Stock
            </p>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      {isVariantSelected && productWithVariant && (
        <AddToCartButton
          product={productWithVariant as any}
          className="w-full"
        />
      )}

      {!isVariantSelected && (
        <div className="w-full bg-gray-200 text-gray-600 px-4 py-3 rounded-md text-center text-sm font-medium">
          Please select size and height to add to cart
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;
