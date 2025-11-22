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

    const { guestItems, guestEmail } = await request.json();
    
    if (!guestItems || guestItems.length === 0) {
      return NextResponse.json({ success: true, message: "No items to sync" });
    }

    // Get or create user's wishlist
    let userWishlist = await backendClient.fetch(
      `*[_type == "wishlist" && userId == $userId][0]`,
      { userId }
    );

    if (!userWishlist) {
      // Create new wishlist
      userWishlist = await backendClient.create({
        _type: "wishlist",
        userId,
        products: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Get existing product IDs in server wishlist
    const existingProductIds = userWishlist.products?.map(
      (item: { product: { _ref: string } }) => item.product._ref
    ) || [];

    // Filter out products that already exist in server wishlist
    const newProducts = guestItems
      .filter((guestItem: { product: { _id: string } }) => 
        !existingProductIds.includes(guestItem.product._id)
      )
      .map((guestItem: { product: { _id: string }; addedAt: string }) => ({
        _key: crypto.randomUUID(),
        product: {
          _type: "reference",
          _ref: guestItem.product._id,
        },
        addedAt: guestItem.addedAt,
      }));

    if (newProducts.length > 0) {
      // Add new products to server wishlist
      await backendClient
        .patch(userWishlist._id)
        .setIfMissing({ products: [] })
        .append("products", newProducts)
        .set({ updatedAt: new Date().toISOString() })
        .commit();
    }

    // Store guest email for marketing if provided
    if (guestEmail) {
      try {
        await backendClient.create({
          _type: "emailSubscriber",
          email: guestEmail,
          source: "guest_wishlist_sync",
          userId: userId,
          subscribedAt: new Date().toISOString(),
          status: "active",
        });
      } catch (error) {
        // Email might already exist, that's okay
        console.log("Email already exists or other error:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${newProducts.length} items to your wishlist`,
      syncedCount: newProducts.length,
    });
  } catch (error) {
    console.error("Error syncing wishlist:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}