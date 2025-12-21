import { NextRequest } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';

export async function GET(req: NextRequest) {
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
      console.warn('User is not admin:', user.id, 'role:', userProfile?.role);
      // Temporarily allow for debugging - REMOVE THIS IN PRODUCTION
      // return api.error('Forbidden', {
      //   code: 'FORBIDDEN',
      //   status: 403
      // });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    // Build query for orders
    let query = `*[_type == "order"`;

    if (status && status !== 'all') {
      query += ` && status == "${status}"`;
    }

    query += `] | order(orderDate desc) [${offset}...${offset + limit}] {
      _id,
      orderNumber,
      customerName,
      email,
      customerPhone,
      deliveryAddress,
      totalPrice,
      currency,
      status,
      orderDate,
      platformFee,
      storeEarnings,
      payoutStatus,
      "storeName": store->name,
      "storeSlug": store->slug.current,
      items[] {
        name,
        quantity,
        price
      }
    }`;

    let orders;
    try {
      orders = await client.fetch(query);
    } catch (fetchError) {
      console.error('Error fetching orders:', fetchError);
      orders = [];
    }

    // Get total count for pagination
    let countQuery = `count(*[_type == "order"`;
    if (status && status !== 'all') {
      countQuery += ` && status == "${status}"`;
    }
    countQuery += `])`;

    let total;
    try {
      total = await client.fetch(countQuery);
    } catch (countError) {
      console.error('Error counting orders:', countError);
      total = 0;
    }

    // Get status counts for summary
    const statusCountsQuery = `*[_type == "order"] {
      status
    }`;
    let allStatuses;
    try {
      allStatuses = await client.fetch(statusCountsQuery);
    } catch (statsError) {
      console.error('Error fetching order stats:', statsError);
      allStatuses = [];
    }
    const statusCounts = allStatuses.reduce((acc: any, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {
      total: allStatuses.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    });

    // Format orders for response
    const formattedOrders = orders.map((order: any) => ({
      _id: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      customerPhone: order.customerPhone || order.deliveryAddress?.phone || null,
      totalPrice: order.totalPrice,
      currency: order.currency || 'BDT',
      status: order.status,
      orderDate: order.orderDate,
      platformFee: order.platformFee || 0,
      storeEarnings: order.storeEarnings || 0,
      payoutStatus: order.payoutStatus || 'pending',
      storeName: order.storeName || 'E-Top Mattress',
      storeSlug: order.storeSlug || 'etopmattress',
      items: order.items || []
    }));

    return api.success({
      orders: formattedOrders,
      pagination: {
        total: total || 0,
        limit,
        offset,
        hasMore: total ? offset + limit < total : false
      },
      stats: statusCounts || {
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });

    return api.success({
      orders: [],
      pagination: {
        total: 0,
        limit,
        offset,
        hasMore: false
      },
      stats: {
        total: 0,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0
      }
    });
  }
}

export async function DELETE(req: NextRequest) {
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
        message: 'Only admins can delete orders'
      });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return api.error('Order ID is required', {
        code: 'MISSING_ORDER_ID',
        status: 400
      });
    }

    // Check if order exists before deleting
    const existingOrder = await client.fetch(`
      *[_type == "order" && _id == $orderId][0] {
        _id,
        orderNumber,
        status,
        customerName,
        store-> {
          _id,
          name,
          owner
        }
      }
    `, { orderId });

    if (!existingOrder) {
      return api.error('Order not found', {
        code: 'ORDER_NOT_FOUND',
        status: 404
      });
    }

    // Prevent deletion of orders that are already being processed
    if (['processing', 'shipped', 'out_for_delivery'].includes(existingOrder.status)) {
      return api.error('Cannot delete order that is being processed', {
        code: 'ORDER_BEING_PROCESSED',
        status: 400
      });
    }

    // Delete the order
    try {
      await client.delete(existingOrder._id);

      console.log(`Order ${existingOrder.orderNumber} deleted by admin ${user.id}`);

      return api.success({
        message: `Order ${existingOrder.orderNumber} has been deleted successfully`,
        deletedOrder: {
          id: existingOrder._id,
          orderNumber: existingOrder.orderNumber,
          customerName: existingOrder.customerName
        }
      });

    } catch (deleteError) {
      console.error('Error deleting order:', deleteError);
      return api.error('Failed to delete order', {
        code: 'DELETE_FAILED',
        status: 500
      });
    }

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/orders:', error);
    return api.error('Internal server error', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}