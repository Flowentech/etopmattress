import { Product } from "@/sanity.types";
import { urlFor } from "@/sanity/lib/image";
import Image from "next/image";
import React from "react";
import { LuStar } from "react-icons/lu";
import PriceView from "./PriceView";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden group text-xs w-[300px] h-[200px] flex">
      <div className="w-1/2 border-r border-gray-300 overflow-hidden relative">
        {product?.image && (
          <Link href={`/product/${product?.slug?.current}`}>
            <Image
              src={urlFor(product.image).url()}
              alt="productImage"
              width={150}
              height={200}
              loading="lazy"
              className={`w-full h-full object-cover transition-transform duration-500 ${product?.stock !== 0 && "group-hover:scale-105"}`}
            />
          </Link>
        )}
        {product?.stock === 0 && (
          <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-xs font-bold text-white">Out of Stock</p>
          </div>
        )}
        {product?.status && (
          <div className="absolute uppercase rounded-r-lg left-0 top-0 z-10 px-1 py-0.5 group-hover:opacity-0 transition-opacity duration-300 bg-orange-500 text-white font-bold text-[10px]">
            {product.status}
          </div>
        )}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WishlistButton product={product} size="sm" />
        </div>
      </div>
      <div className="w-1/2 p-3 flex flex-col justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 font-medium text-[10px]">Snacks</p>
            <div className="text-lightText flex items-center gap-0.5">
              {Array.from({ length: 3 }).map((_, index) => {
                const isLastStar = index === 2;
                return (
                  <LuStar
                    fill={!isLastStar ? "#fca99b" : "transparent"}
                    key={index}
                    className={`w-2 h-2 ${isLastStar ? "text-gray-500" : "text-lightOrange"}`}
                  />
                );
              })}
            </div>
          </div>
          <p className="text-xs text-gray-600 tracking-wide font-semibold line-clamp-2 capitalize">
            {product?.name}
          </p>
          <PriceView
            price={product?.price}
            discount={product?.discount}
            label={product?.label}
          />
        </div>
        <div className="mt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
