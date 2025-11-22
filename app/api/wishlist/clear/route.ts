import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { backendClient } from "@/sanity/lib/backendClient";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all wishlist items for this user
    const WISHLIST_QUERY = defineQuery(`
      *[_type == "wishlist" && userId == $userId]._id
    `);

    const wishlistIds = await sanityFetch(WISHLIST_QUERY, { userId }) || [];

    // Delete all wishlist items
    if (wishlistIds.length > 0) {
      const transaction = backendClient.transaction();
      wishlistIds.forEach((id: string) => {
        transaction.delete(id);
      });
      await transaction.commit();
    }

    return NextResponse.json({
      success: true,
      message: "Wishlist cleared successfully",
    });

  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}