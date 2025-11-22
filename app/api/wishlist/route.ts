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
      *[_type == "wishlist" && userId == $userId] | order(_createdAt desc) {
        _id,
        productId,
        userId,
        _createdAt,
        "product": *[_type == "product" && _id == ^.productId][0]
      }
    `);

    const wishlist = await sanityFetch(WISHLIST_QUERY, { userId }) || [];

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