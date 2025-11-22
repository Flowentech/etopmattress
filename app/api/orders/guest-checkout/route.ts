import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { generateOrderNumber, calculateEstimatedDelivery } from "@/lib/orderUtils";

interface GuestOrderData {
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      [key: string]: unknown;
    };
    quantity: number;
  }>;
  paymentMethod: 'cod';
  totalAmount: number;
  deliveryAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode?: string;
    country: string;
  };
  subscribeToNewsletter: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: GuestOrderData = await request.json();

    // Validate required fields
    if (!orderData.customerName || !orderData.customerEmail || !orderData.deliveryAddress) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate items have prices
    const itemsWithoutPrice = orderData.items.filter((item) => !item.product.price);
    if (itemsWithoutPrice.length > 0) {
      return NextResponse.json(
        { success: false, message: "Some items do not have a price" },
        { status: 400 }
      );
    }

    // Generate order details
    const orderNumber = generateOrderNumber();
    const orderDate = new Date();
    const estimatedDelivery = calculateEstimatedDelivery(
      orderDate,
      orderData.deliveryAddress.city
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
      message: "Order placed successfully. We will contact you soon to confirm your order.",
      timestamp: orderDate.toISOString(),
      location: "InterioWale Warehouse",
    };

    // Create order in Sanity
    const order = await backendClient.create({
      _type: "order",
      orderNumber: orderNumber,
      customerName: orderData.customerName,
      stripeCustomerId: orderData.customerEmail, // Using email as identifier for guest
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

    // Handle newsletter subscription
    if (orderData.subscribeToNewsletter && orderData.customerEmail) {
      try {
        await backendClient.create({
          _type: "emailSubscriber",
          email: orderData.customerEmail,
          source: "guest_checkout",
          customerName: orderData.customerName,
          orderNumber: orderNumber,
          subscribedAt: new Date().toISOString(),
          status: "active",
          metadata: {
            firstOrderValue: orderData.totalAmount,
            city: orderData.deliveryAddress.city,
            state: orderData.deliveryAddress.state,
          },
        });
      } catch (emailError) {
        // Email subscription error shouldn't fail the order
        console.error("Email subscription error:", emailError);
      }
    }

    // Send confirmation email/SMS (implement based on your service)
    await sendGuestOrderConfirmation(orderData, orderNumber);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderNumber: orderNumber,
      estimatedDelivery: estimatedDelivery.toISOString(),
      order,
    });
  } catch (error) {
    console.error("Error creating guest order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Email/SMS confirmation function
async function sendGuestOrderConfirmation(orderData: GuestOrderData, orderNumber: string) {
  try {
    // Implement your email service here (Resend, SendGrid, etc.)
    console.log(`Sending order confirmation to ${orderData.customerEmail} for order ${orderNumber}`);
    
    // For SMS notification to customer
    console.log(`Sending SMS confirmation to ${orderData.deliveryAddress.phone} for order ${orderNumber}`);
    
    // Internal notification to admin
    console.log(`New guest order ${orderNumber} - ${orderData.customerName} - ৳${orderData.totalAmount}`);
    
    // You can implement actual email/SMS sending here
    // Example with a service like Resend:
    /*
    await resend.emails.send({
      from: 'orders@interiowale.com',
      to: orderData.customerEmail,
      subject: `Order Confirmation - ${orderNumber}`,
      html: generateOrderConfirmationHTML(orderData, orderNumber),
    });
    */
  } catch (error) {
    console.error("Error sending confirmation:", error);
    // Don't throw error as order was successful
  }
}