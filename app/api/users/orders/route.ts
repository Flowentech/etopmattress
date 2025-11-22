import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { cache } from '@/lib/cache/service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Generate cache key
    const cacheKey = cache.generateKey('user:orders', {
      userId,
      limit,
      offset
    });

    const fetchUserOrders = async () => {

      // Fetch user orders
      const orders = await client.fetch(`
        *[_type == "order" && customer.userId == $userId] | order(orderDate desc)[$offset...$offset + $limit] {
          _id,
          orderNumber,
          status,
          total,
          itemCount,
          orderDate,
          "storeName": store->name,
          "storeSlug": store->slug.current,
          items[] {
            product->{
              _id,
              name,
              slug,
              price,
              images
            },
            quantity,
            price
          },
          shippingAddress,
          paymentStatus,
          trackingNumber
        }
      `, { userId, offset, limit });

      // Get total count
      const total = await client.fetch(`
        count(*[_type == "order" && customer.userId == $userId])
      `, { userId });

      return {
        orders,
        pagination: {
          total,
          offset,
          limit,
          hasMore: offset + limit < total
        }
      };
    };

    return api.withCache(cacheKey, fetchUserOrders, {
      cache: { ttl: 300, tags: [`user:${userId}:orders`] }, // 5 minutes cache
      enablePerformanceMonitoring: true
    });

  } catch (error) {
    console.error('Error fetching user orders:', error);
    return api.error('Failed to fetch orders', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}