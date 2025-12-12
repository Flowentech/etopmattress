"use client";
import { Product } from "@/sanity.types";
import React, { memo } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  products: Product[];
}

const ProductGrid = memo(({ products }: Props) => {
  return (
    <AnimatePresence mode="wait">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map((product, index) => (
          <motion.div
            key={product?._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, delay: index * 0.02 }}
            className="flex justify-center"
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
});

ProductGrid.displayName = "ProductGrid";

export default ProductGrid;
