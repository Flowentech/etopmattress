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
        items[] {
          name,
          quantity,
          price,
          image
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

    return NextResponse.json({
      success: true,
      orders: orders || [],
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
