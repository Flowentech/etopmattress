import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch orders for the authenticated user
    const orders = await client.fetch(
      `*[_type == "order" && clerkUserId == $userId] | order(orderDate desc) {
        _id,
        orderNumber,
        customerName,
        email,
        totalPrice,
        currency,
        status,
        orderDate,
        deliveryAddress,
        "items": products[] {
          "name": product->name,
          quantity,
          "price": product->price,
          "image": product->image
        },
        orderUpdates[] {
          status,
          message,
          timestamp,
          location
        }
      }`,
      { userId }
    );

    // Ensure all orders have items array (even if empty)
    const normalizedOrders = (orders || []).map((order: any) => ({
      ...order,
      items: order.items || [],
    }));

    return NextResponse.json({
      success: true,
      orders: normalizedOrders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', orders: [] },
      { status: 500 }
    );
  }
}
