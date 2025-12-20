"use client";

import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import useCartStore from "@/store";
import Image from "next/image";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import { urlFor } from "@/sanity/lib/image";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Tag, X } from "lucide-react";

const CartPage = () => {
  const { items, removeItem, addItem, deleteCartProduct, getTotalPrice, appliedCoupon, applyCoupon, removeCoupon, getFinalPrice } = useCartStore();
  const { user } = useUser();

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage({ type: "error", text: "Please enter a coupon code" });
      return;
    }

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          cartTotal: getTotalPrice(),
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        applyCoupon({
          id: data.coupon.id,
          code: data.coupon.code,
          title: data.coupon.title,
          discountType: data.coupon.discountType,
          discountAmount: data.coupon.discountAmount,
          calculatedDiscount: data.discount,
        });
        setCouponMessage({ type: "success", text: data.message });
        setCouponCode("");
      } else {
        setCouponMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setCouponMessage({ type: "error", text: "Failed to apply coupon" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage(null);
  };

  // Helper to get item identifier (supports variants)
  const getItemId = (product: any) => {
    const variant = product.selectedVariant;
    if (variant) {
      return `${product._id}_${variant.sizeId}_${variant.heightId}`;
    }
    return product._id || "";
  };

  // Helper to get product price (supports variants)
  const getItemPrice = (product: any) => {
    const variant = product.selectedVariant;
    if (variant) {
      return variant.price ?? 0;
    }
    return product.price ?? 0;
  };

  if (items.length === 0) {
    return (
      <Container className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="min-h-screen py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {items.map((item) => {
                const itemId = getItemId(item.product);
                const itemPrice = getItemPrice(item.product);
                const variant = (item.product as any).selectedVariant;

                return (
                  <div key={itemId} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
                    {/* Image and Product Info */}
                    <div className="flex gap-3 flex-1">
                      {item.product.image && (
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                          <Image
                            src={urlFor(item.product.image).url()}
                            alt={item.product.name || "Product"}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.slug?.current}`}
                          className="font-semibold text-sm sm:text-base text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {variant && (
                          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                            <p>Size: {variant.sizeName}</p>
                            <p>Height: {variant.heightName}</p>
                          </div>
                        )}
                        {!variant && (
                          <p className="text-xs sm:text-sm text-gray-600 mt-1">
                            {item.product.categories?.join(", ") || "Product"}
                          </p>
                        )}

                        {/* Mobile Price - Show below product name on mobile */}
                        <div className="sm:hidden mt-2">
                          <div className="flex items-center justify-between">
                            <PriceView
                              price={itemPrice}
                              discount={item.product.discount}
                              label={item.product.label}
                            />
                            <p className="text-xs font-semibold text-gray-900">
                              BDT {(itemPrice * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => removeItem(itemId)}
                              className="px-2.5 sm:px-3 py-1 hover:bg-gray-100 transition-colors text-sm"
                            >
                              -
                            </button>
                            <span className="px-2.5 sm:px-3 py-1 border-x text-sm">{item.quantity}</span>
                            <button
                              onClick={() => addItem(item.product)}
                              className="px-2.5 sm:px-3 py-1 hover:bg-gray-100 transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => deleteCartProduct(itemId)}
                            className="text-red-500 hover:text-red-700 transition-colors p-2"
                          >
                            <FaRegTrashAlt size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Price - Show on right side on desktop */}
                    <div className="hidden sm:block text-right flex-shrink-0 min-w-[140px]">
                      <PriceView
                        price={itemPrice}
                        discount={item.product.discount}
                        label={item.product.label}
                      />
                      <p className="text-sm text-gray-600 mt-1 font-semibold">
                        Subtotal: BDT {(itemPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Order Summary</h2>

            {/* Coupon Input */}
            <div className="mb-4">
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={couponLoading}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponMessage && (
                    <p className={`text-xs ${couponMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-700">-BDT {appliedCoupon.calculatedDiscount.toFixed(2)} discount</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">BDT {getTotalPrice().toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-sm sm:text-base text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-BDT {appliedCoupon.calculatedDiscount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Shipping</span>
                <span className="text-xs sm:text-sm text-gray-500">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base">
                <span className="text-gray-600">Tax</span>
                <span className="text-xs sm:text-sm text-gray-500">Calculated at checkout</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-base sm:text-lg">
                  <span>Total</span>
                  <span className="text-emerald-600">BDT {getFinalPrice().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-green-600 mt-1">You saved BDT {appliedCoupon.calculatedDiscount.toFixed(2)}!</p>
                )}
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-emerald-600 text-white py-3 sm:py-3.5 rounded-md hover:bg-emerald-700 transition-colors text-center block text-sm sm:text-base font-medium"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="w-full text-emerald-600 py-2 hover:text-emerald-700 transition-colors text-center block mt-3 text-sm sm:text-base"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CartPage;