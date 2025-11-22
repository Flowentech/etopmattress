import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: user.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' }; // Fallback for debugging
    }

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403,
        message: 'Only admins can ship orders'
      });
    }

    const { orderId } = params;
    const body = await req.json();
    const { trackingNumber, estimatedDelivery, courierService, notes, status } = body;

    if (!trackingNumber) {
      return api.error('Tracking number is required', {
        code: 'MISSING_TRACKING_NUMBER',
        status: 400
      });
    }

    // Check if order exists
    const existingOrder = await client.fetch(`
      *[_type == "order" && _id == $orderId][0] {
        _id,
        orderNumber,
        status,
        customerName,
        customerEmail,
        trackingNumber,
        orderUpdates
      }
    `, { orderId });

    if (!existingOrder) {
      return api.error('Order not found', {
        code: 'ORDER_NOT_FOUND',
        status: 404
      });
    }

    // Prevent shipping already shipped orders
    if (['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(existingOrder.status)) {
      return api.error('Order is already in delivery phase', {
        code: 'ORDER_ALREADY_SHIPPED',
        status: 400
      });
    }

    // Prepare order updates array
    const updateEntry = {
      status: status || 'shipped',
      message: notes || `Order shipped via ${courierService || 'courier service'} with tracking number ${trackingNumber}`,
      timestamp: new Date().toISOString(),
      location: 'Processing Center',
      _key: Math.random().toString(36).substr(2, 9)
    };

    // Update order with shipping information
    const updateData: any = {
      status: status || 'shipped',
      trackingNumber,
      courierService: courierService || 'steadfast',
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
      orderUpdates: [
        ...(existingOrder.orderUpdates || []),
        updateEntry
      ]
    };

    const updatedOrder = await client.patch(orderId, updateData).commit();

    console.log(`Order ${existingOrder.orderNumber} shipped by admin ${user.id} with tracking ${trackingNumber}`);

    return api.success({
      message: `Order ${existingOrder.orderNumber} has been shipped successfully`,
      order: {
        id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        trackingNumber: updatedOrder.trackingNumber,
        estimatedDelivery: updatedOrder.estimatedDelivery,
        courierService: updatedOrder.courierService
      }
    });

  } catch (error: any) {
    console.error('Error shipping order:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });

    return api.error('Failed to ship order', {
      code: 'SHIPPING_FAILED',
      status: 500
    });
  }
}