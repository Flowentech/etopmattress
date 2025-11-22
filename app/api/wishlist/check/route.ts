import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ isWishlisted: false });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product is in user's wishlist
    const wishlist = await backendClient.fetch(
      `*[_type == "wishlist" && userId == $userId && $productId in products[].product._ref][0]`,
      { userId, productId }
    );

    return NextResponse.json({
      isWishlisted: !!wishlist,
    });
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return NextResponse.json({ isWishlisted: false });
  }
}