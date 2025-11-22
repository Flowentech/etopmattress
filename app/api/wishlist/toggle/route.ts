import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if user has a wishlist
    const existingWishlist = await backendClient.fetch(
      `*[_type == "wishlist" && userId == $userId][0]`,
      { userId }
    );

    if (existingWishlist) {
      // Check if product is already in wishlist
      const productIndex = existingWishlist.products?.findIndex(
        (item: { product: { _ref: string } }) => item.product._ref === productId
      );

      if (productIndex !== -1) {
        // Remove from wishlist
        const updatedProducts = existingWishlist.products.filter(
          (item: { product: { _ref: string } }) => item.product._ref !== productId
        );
        
        await backendClient
          .patch(existingWishlist._id)
          .set({
            products: updatedProducts,
            updatedAt: new Date().toISOString(),
          })
          .commit();

        return NextResponse.json({
          success: true,
          isWishlisted: false,
          message: "Product removed from wishlist",
        });
      } else {
        // Add to wishlist
        const newProduct = {
          _key: crypto.randomUUID(),
          product: {
            _type: "reference",
            _ref: productId,
          },
          addedAt: new Date().toISOString(),
        };

        await backendClient
          .patch(existingWishlist._id)
          .setIfMissing({ products: [] })
          .append("products", [newProduct])
          .set({ updatedAt: new Date().toISOString() })
          .commit();

        return NextResponse.json({
          success: true,
          isWishlisted: true,
          message: "Product added to wishlist",
        });
      }
    } else {
      // Create new wishlist
      const newProduct = {
        _key: crypto.randomUUID(),
        product: {
          _type: "reference",
          _ref: productId,
        },
        addedAt: new Date().toISOString(),
      };

      await backendClient.create({
        _type: "wishlist",
        userId,
        products: [newProduct],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        isWishlisted: true,
        message: "Product added to wishlist",
      });
    }
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}