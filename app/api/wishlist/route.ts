import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const WISHLIST_QUERY = defineQuery(`
      *[_type == "wishlist" && userId == $userId][0] {
        _id,
        userId,
        products[] {
          _key,
          addedAt,
          "product": product->
        },
        createdAt,
        updatedAt
      }
    `);

    const result = await sanityFetch(WISHLIST_QUERY, { userId });
    const wishlist = result?.products?.map((item: any) => ({
      _id: item._key,
      productId: item.product?._id,
      userId,
      createdAt: item.addedAt,
      product: item.product
    })).filter((item: any) => item.product) || [];

    return NextResponse.json({
      success: true,
      wishlist,
    });

  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}