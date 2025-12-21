import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Valid statuses
    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Update order status in Sanity
    const updatedOrder = await backendClient
      .patch(orderId)
      .set({ status })
      .commit();

    // Create status update entry in orderUpdates array
    const statusUpdate = {
      _key: crypto.randomUUID(),
      status: status,
      message: `Order status updated to ${status}`,
      timestamp: new Date().toISOString(),
      location: 'Admin Panel',
    };

    // Add the status update to orderUpdates array
    await backendClient
      .patch(orderId)
      .setIfMissing({ orderUpdates: [] })
      .append('orderUpdates', [statusUpdate])
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
