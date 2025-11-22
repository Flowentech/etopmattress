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

    const formData = await request.formData();
    const productId = formData.get("productId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const title = formData.get("title") as string;
    const comment = formData.get("comment") as string;

    if (!productId || !rating || !title || !comment) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user info from Clerk (using dummy data since user is already authenticated)
    const userEmail = "user@example.com";
    const userName = "User";

    // Check if user has already reviewed this product
    const existingReview = await backendClient.fetch(
      `*[_type == "review" && product._ref == $productId && user == $userId][0]`,
      { productId, userId }
    );

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Check if user purchased this product (optional - for verified purchase badge)
    const hasPurchased = await backendClient.fetch(
      `count(*[_type == "order" && clerkUserId == $userId && $productId in products[].product._ref && status in ["delivered", "cod_collected"]]) > 0`,
      { userId, productId }
    );

    // Handle image uploads
    const images: Array<{
      _type: string;
      asset: {
        _type: string;
        _ref: string;
      };
      alt: string;
    }> = [];
    const imageFiles: File[] = [];
    
    // Collect all image files
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("image_") && value instanceof File) {
        imageFiles.push(value);
      }
    }

    // Upload images to Sanity
    for (const imageFile of imageFiles) {
      try {
        const imageAsset = await backendClient.assets.upload("image", imageFile, {
          filename: imageFile.name,
        });
        
        images.push({
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
          alt: `Review image by ${userName}`,
        });
      } catch (imageError) {
        console.error("Error uploading image:", imageError);
        // Continue without this image
      }
    }

    // Create review
    const review = await backendClient.create({
      _type: "review",
      product: {
        _type: "reference",
        _ref: productId,
      },
      user: userId,
      userName,
      userEmail,
      rating,
      title,
      comment,
      images,
      verified: hasPurchased,
      helpful: 0,
      status: "pending", // Reviews need moderation
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}