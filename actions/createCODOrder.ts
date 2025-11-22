"use server";

import { backendClient } from "@/sanity/lib/backendClient";
import { GroupedCartItems } from "./createCheckoutSession";
import { generateOrderNumber, calculateEstimatedDelivery } from "@/lib/orderUtils";

export interface CODOrderData {
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
  items: GroupedCartItems[];
  paymentMethod: 'cod';
  totalAmount: number;
  deliveryAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
}

export async function createCODOrder(orderData: CODOrderData) {
  try {
    // Validate items have prices
    const itemsWithoutPrice = orderData.items.filter((item) => !item.product.price);
    if (itemsWithoutPrice.length > 0) {
      throw new Error("Some items do not have a price");
    }

    // Generate human-readable order number
    const orderNumber = generateOrderNumber();
    const orderDate = new Date();
    const estimatedDelivery = calculateEstimatedDelivery(
      orderDate,
      orderData.deliveryAddress?.city || ""
    );

    // Create Sanity product references
    const sanityProducts = orderData.items.map((item) => ({
      _key: crypto.randomUUID(),
      product: {
        _type: "reference",
        _ref: item.product._id,
      },
      quantity: item.quantity,
    }));

    // Create initial order update
    const initialUpdate = {
      _key: crypto.randomUUID(),
      status: "pending",
      message: "Order placed successfully. We will confirm your order soon.",
      timestamp: orderDate.toISOString(),
      location: "InterioWale Warehouse",
    };

    // Create order in Sanity
    const order = await backendClient.create({
      _type: "order",
      orderNumber: orderNumber,
      customerName: orderData.customerName,
      stripeCustomerId: orderData.customerEmail, // Using email as identifier
      clerkUserId: orderData.clerkUserId,
      email: orderData.customerEmail,
      currency: "BDT",
      amountDiscount: 0,
      products: sanityProducts,
      totalPrice: orderData.totalAmount,
      status: "pending",
      orderDate: orderDate.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      deliveryAddress: orderData.deliveryAddress,
      orderUpdates: [initialUpdate],
      paymentMethod: "cod",
      stripeCheckoutSessionId: null,
      stripePaymentIntentId: null,
    });

    // Send confirmation email (optional)
    await sendCODConfirmationEmail(orderData);

    return { success: true, order };
  } catch (error) {
    console.error("Error creating COD order:", error);
    return { success: false, error: error || "Something went wrong" };
  }
}

async function sendCODConfirmationEmail(orderData: CODOrderData) {
  // Implement email sending logic here
  // You can use services like Resend, SendGrid, etc.
  console.log("Sending COD confirmation email to:", orderData.customerEmail);
}
