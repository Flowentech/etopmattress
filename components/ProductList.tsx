/* eslint-disable @typescript-eslint/no-explicit-any */
import { Product } from "@/sanity.types";
import React from "react";
import ProductGrid from "./ProductGrid";
interface Props {
  products: Product[];
  title?: any;
  subtitle?:string
}
const ProductList = ({ products, title,subtitle }: Props) => {
  return (
    <div>
      {title && (
        <div className="pb-5">
          <h2 className="text-2xl font-semibold text-gray-600">
            {title}
          </h2>
          <p className="text-sm text-gray-500 font-thin">
            {subtitle}
          </p>
        </div>
      )}

      <ProductGrid products={products} />
    </div>
  );
};

export default ProductList;
