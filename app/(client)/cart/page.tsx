"use client";

import Container from "@/components/Container";
import PriceView from "@/components/PriceView";
import useCartStore from "@/store";
import Image from "next/image";
import Link from "next/link";
import { FaRegTrashAlt } from "react-icons/fa";
import { urlFor } from "@/sanity/lib/image";

const CartPage = () => {
  const { items, removeItem, addItem, deleteCartProduct, getTotalPrice } = useCartStore();

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
                  <div key={itemId} className="flex items-center gap-4 p-4 border rounded-lg">
                    {item.product.image && (
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={urlFor(item.product.image).url()}
                          alt={item.product.name || "Product"}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <Link
                        href={`/product/${item.product.slug?.current}`}
                        className="font-semibold text-gray-900 hover:text-primary transition-colors"
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
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.categories?.join(", ") || "Product"}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => removeItem(itemId)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 py-1 border-x">{item.quantity}</span>
                          <button
                            onClick={() => addItem(item.product)}
                            className="px-3 py-1 hover:bg-gray-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => deleteCartProduct(itemId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <FaRegTrashAlt size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <PriceView
                        price={itemPrice}
                        discount={item.product.discount}
                        label={item.product.label}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Subtotal: ${(itemPrice * item.quantity).toFixed(2)}
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 transition-colors text-center block"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="w-full text-emerald-600 py-2 hover:text-emerald-700 transition-colors text-center block mt-3"
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