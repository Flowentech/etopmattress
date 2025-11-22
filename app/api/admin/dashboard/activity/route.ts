import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

interface ActivityItem {
  id: string;
  type: 'store_application' | 'architect_registration' | 'order' | 'user_registration';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin role check

    // Fetch recent activity from different sources
    const [
      storeApplications,
      architectRegistrations,
      recentOrders,
      recentUsers
    ] = await Promise.all([
      // Store applications
      client.fetch(`
        *[_type == "storeApplication"] | order(submittedAt desc) [0...10] {
          _id,
          _type,
          storeInfo { storeName },
          status,
          submittedAt
        }
      `),

      // New architect registrations (unverified)
      client.fetch(`
        *[_type == "simpleArchitectProfile" && verified == false] | order(createdAt desc) [0...10] {
          _id,
          _type,
          name,
          verified,
          createdAt
        }
      `),

      // Recent orders
      client.fetch(`
        *[_type == "platformOrder"] | order(orderDate desc) [0...10] {
          _id,
          _type,
          customerInfo { name },
          status,
          orderDate
        }
      `),

      // Recent user registrations
      client.fetch(`
        *[_type == "userProfile"] | order(createdAt desc) [0...10] {
          _id,
          _type,
          firstName,
          lastName,
          email,
          role,
          createdAt
        }
      `)
    ]);

    // Combine and format activity
    const activity: ActivityItem[] = [
      ...storeApplications.map((app: any) => ({
        id: app._id,
        type: 'store_application' as const,
        title: 'Store Application',
        description: `${app.storeInfo?.storeName || 'Unknown Store'} - ${app.status}`,
        status: app.status === 'pending' ? 'pending' : app.status === 'approved' ? 'approved' : 'rejected',
        createdAt: app.submittedAt
      })),

      ...architectRegistrations.map((app: any) => ({
        id: app._id,
        type: 'architect_registration' as const,
        title: 'New Architect Registration',
        description: `${app.name || 'Unknown Architect'} - ${app.verified ? 'Verified' : 'Pending Verification'}`,
        status: 'pending',
        createdAt: app.createdAt
      })),

      ...recentOrders.map((order: any) => ({
        id: order._id,
        type: 'order' as const,
        title: 'New Order',
        description: `Order from ${order.customerInfo?.name || 'Unknown Customer'}`,
        status: order.status === 'completed' ? 'completed' : 'pending',
        createdAt: order.orderDate
      })),

      ...recentUsers.map((user: any) => ({
        id: user._id,
        type: 'user_registration' as const,
        title: 'New User Registration',
        description: `${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`,
        status: 'completed' as const,
        createdAt: user.createdAt
      }))
    ];

    // Sort by creation date and limit to 20 most recent
    activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(activity.slice(0, 20));
  } catch (error) {
    console.error('Error fetching dashboard activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}