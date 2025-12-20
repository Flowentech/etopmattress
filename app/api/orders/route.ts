import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { generateOrderNumber, calculateEstimatedDelivery } from "@/lib/orderUtils";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
  selectedVariant?: {
    sizeId: string;
    heightId: string;
    sizeName: string;
    heightName: string;
    price: number;
  } | null;
}

interface OrderData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const orderData: OrderData = await request.json();

    // Validate required fields
    if (!orderData.firstName || !orderData.email || !orderData.address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }

    // Generate order details
    const orderNumber = generateOrderNumber();
    const orderDate = new Date();
    const estimatedDelivery = calculateEstimatedDelivery(orderDate, orderData.city);

    // Create Sanity product references
    const sanityProducts = orderData.items.map((item) => ({
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: item.productId,
      },
      quantity: item.quantity,
      selectedVariant: item.selectedVariant || null,
    }));

    // Create initial order update
    const initialUpdate = {
      _key: crypto.randomUUID(),
      status: "pending",
      message: "Order placed successfully. We will contact you soon to confirm your order.",
      timestamp: orderDate.toISOString(),
      location: "Warehouse",
    };

    // Create delivery address object
    const deliveryAddress = {
      fullName: `${orderData.firstName} ${orderData.lastName}`,
      phone: orderData.phone,
      address: orderData.address,
      city: orderData.city,
      state: orderData.state,
      zipCode: orderData.zipCode,
      country: "Bangladesh",
    };

    // Create order in Sanity
    const order = await backendClient.create({
      _type: "order",
      orderNumber: orderNumber,
      customerName: `${orderData.firstName} ${orderData.lastName}`,
      clerkUserId: userId,
      email: orderData.email,
      currency: "BDT",
      amountDiscount: 0,
      products: sanityProducts,
      totalPrice: orderData.totalAmount,
      status: "pending",
      orderDate: orderDate.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      deliveryAddress: deliveryAddress,
      orderUpdates: [initialUpdate],
      paymentMethod: orderData.paymentMethod || "cod",
      notes: orderData.notes || "",
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
    });

    // Send confirmation (implement your email service)
    await sendOrderConfirmation(orderData, orderNumber, userId);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderNumber: orderNumber,
      _id: order._id,
      estimatedDelivery: estimatedDelivery.toISOString(),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// Email/SMS confirmation function
async function sendOrderConfirmation(
  orderData: OrderData,
  orderNumber: string,
  userId: string
) {
  try {
    console.log(
      `Sending order confirmation to ${orderData.email} for order ${orderNumber}`
    );
    console.log(
      `Sending SMS confirmation to ${orderData.phone} for order ${orderNumber}`
    );
    console.log(
      `New order ${orderNumber} - ${orderData.firstName} ${orderData.lastName} - ৳${orderData.totalAmount}`
    );

    // Implement actual email/SMS sending here
  } catch (error) {
    console.error("Error sending confirmation:", error);
  }
}
