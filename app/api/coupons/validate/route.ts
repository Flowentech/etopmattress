import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";

interface ValidateRequest {
  couponCode: string;
  cartTotal: number;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();
    const { couponCode, cartTotal, userId } = body;

    if (!couponCode || cartTotal === undefined) {
      return NextResponse.json(
        { valid: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert coupon code to uppercase for case-insensitive matching
    const normalizedCode = couponCode.trim().toUpperCase();

    // Query for the coupon
    const COUPON_QUERY = defineQuery(
      `*[_type == "sale" && upper(couponCode) == $code][0] {
        _id,
        title,
        couponCode,
        discountType,
        discountAmount,
        minOrderValue,
        maxDiscount,
        maxUsageCount,
        maxUsagePerUser,
        currentUsageCount,
        validFrom,
        validUntil,
        isActive
      }`
    );

    const coupon = await client.fetch(COUPON_QUERY, { code: normalizedCode });

    if (!coupon) {
      return NextResponse.json({
        valid: false,
        message: "Invalid coupon code",
      });
    }

    // Validation checks
    const now = new Date();

    // Check if active
    if (!coupon.isActive) {
      return NextResponse.json({
        valid: false,
        message: "This coupon is no longer active",
      });
    }

    // Check valid date range
    const validFrom = new Date(coupon.validFrom);
    const validUntil = new Date(coupon.validUntil);

    if (now < validFrom) {
      return NextResponse.json({
        valid: false,
        message: `This coupon will be valid from ${validFrom.toLocaleDateString()}`,
      });
    }

    if (now > validUntil) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has expired",
      });
    }

    // Check minimum order value
    if (cartTotal < (coupon.minOrderValue || 0)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order value of BDT ${coupon.minOrderValue} required`,
      });
    }

    // Check total usage limit
    if (
      coupon.maxUsageCount > 0 &&
      (coupon.currentUsageCount || 0) >= coupon.maxUsageCount
    ) {
      return NextResponse.json({
        valid: false,
        message: "This coupon has reached its usage limit",
      });
    }

    // Check per-user usage limit
    if (userId && coupon.maxUsagePerUser > 0) {
      const USER_USAGE_QUERY = defineQuery(
        `count(*[_type == "order" && coupon._ref == $couponId && clerkUserId == $userId])`
      );

      const userUsageCount = await client.fetch(USER_USAGE_QUERY, {
        couponId: coupon._id,
        userId,
      });

      if (userUsageCount >= coupon.maxUsagePerUser) {
        return NextResponse.json({
          valid: false,
          message: "You have already used this coupon the maximum number of times",
        });
      }
    }

    // Calculate discount
    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (cartTotal * coupon.discountAmount) / 100;

      // Apply max discount cap if set
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      // Fixed discount
      discountAmount = coupon.discountAmount;
    }

    // Ensure discount doesn't exceed cart total
    if (discountAmount > cartTotal) {
      discountAmount = cartTotal;
    }

    // Round to 2 decimal places
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      message: `Coupon applied successfully! You saved BDT ${discountAmount.toFixed(2)}`,
      discount: discountAmount,
      coupon: {
        id: coupon._id,
        code: coupon.couponCode,
        title: coupon.title,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
