"use server";

import stripe from "@/lib/stripe";
import Stripe from "stripe";
import { urlFor } from "@/sanity/lib/image";
import { CartItem } from "@/store";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
}

export interface GroupedCartItems {
  product: CartItem["product"];
  quantity: number;
}

export async function createCheckoutSession(
  items: CartItem[],
  customerEmail: string,
  customerName: string,
  clerkUserId: string
) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Generate a unique order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const metadata: Metadata = {
    orderNumber,
    customerName,
    customerEmail,
    clerkUserId,
  };

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round((item.product.price || 0) * 100),
        product_data: {
          name: item.product.name || "Product",
          description: item.product.description || "",
          images: item.product.image
            ? [urlFor(item.product.image).url()]
            : [],
          metadata: {
            productId: item.product._id || "",
            // Add any other product metadata you need
          },
        },
      },
    })
  );

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_number=${orderNumber}`,
      cancel_url: `${origin}/cart?canceled=true`,
      metadata,
      customer_email: customerEmail,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "IN"], // Add your allowed countries
      },
      billing_address_collection: "required",
      phone_number_collection: {
        enabled: true,
      },
      allow_promotion_codes: true,
      custom_text: {
        submit: {
          message: "We'll send order updates to your email address.",
        },
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    throw new Error("Failed to create checkout session");
  }
}

// Additional helper function to retrieve session
export async function getCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw new Error("Failed to retrieve checkout session");
  }
}

// Function to handle successful webhook
export async function handleSuccessfulCheckout(session: Stripe.Checkout.Session) {
  const orderNumber = session.metadata?.orderNumber;
  const customerEmail = session.customer_details?.email;
  const customerName = session.metadata?.customerName;
  const clerkUserId = session.metadata?.clerkUserId;
  const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

  // Here you would typically:
  // 1. Create an order in your database
  // 2. Send confirmation email
  // 3. Update inventory
  // 4. Create order tracking

  console.log("Payment successful:", {
    orderNumber,
    customerEmail,
    customerName,
    clerkUserId,
    totalAmount,
    sessionId: session.id,
  });

  // TODO: Implement your order creation logic here
  // await createOrderInDatabase({
  //   orderNumber,
  //   customerEmail,
  //   customerName,
  //   clerkUserId,
  //   totalAmount,
  //   sessionId: session.id,
  //   items: [], // You'll need to get items from the session or cart
  //   shippingAddress: session.shipping_details,
  //   billingAddress: session.billing_details,
  // });
}