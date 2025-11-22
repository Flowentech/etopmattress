import { NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";
import { currentUser } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or super_admin
    const userProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

    // Fetch orders separately to calculate revenue
    const deliveredOrders = await backendClient.fetch(`*[_type == "order" && status == "delivered"] { totalPrice, orderDate }`);
    const deliveredOrdersThisMonth = deliveredOrders.filter((order: any) => order.orderDate >= firstDayThisMonth);
    const deliveredOrdersLastMonth = deliveredOrders.filter((order: any) => order.orderDate >= firstDayLastMonth && order.orderDate < firstDayThisMonth);

    const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
    const thisMonthRevenue = deliveredOrdersThisMonth.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);
    const lastMonthRevenue = deliveredOrdersLastMonth.reduce((sum: number, order: any) => sum + (order.totalPrice || 0), 0);

    const analytics = await backendClient.fetch(`{
      "orders": {
        "total": count(*[_type == "order"]),
        "thisMonth": count(*[_type == "order" && orderDate >= $thisMonth]),
        "pending": count(*[_type == "order" && status == "pending"]),
        "confirmed": count(*[_type == "order" && status == "confirmed"]),
        "paid": count(*[_type == "order" && status == "paid"]),
        "processing": count(*[_type == "order" && status == "processing"]),
        "shipped": count(*[_type == "order" && status == "shipped"]),
        "delivered": count(*[_type == "order" && status == "delivered"]),
        "completed": count(*[_type == "order" && status in ["delivered", "cod_collected"]])
      },
      "users": {
        "total": count(*[_type == "userProfile"]),
        "active": count(*[_type == "userProfile" && isActive == true]),
        "newThisMonth": count(*[_type == "userProfile" && createdAt >= $thisMonth])
      },
      "products": {
        "total": count(*[_type == "product"]),
        "active": count(*[_type == "product" && !(_id in path("drafts.**"))])
      }
    }`, {
      thisMonth: firstDayThisMonth,
      lastMonth: firstDayLastMonth,
    });

    // Add revenue data
    analytics.revenue = {
      total: totalRevenue,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue
    };

  // Calculate growth
  const growth = analytics.revenue.lastMonth > 0
    ? ((analytics.revenue.thisMonth - analytics.revenue.lastMonth) / analytics.revenue.lastMonth * 100).toFixed(1)
    : 0;

    analytics.revenue.growth = parseFloat(growth);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({
      revenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 },
      orders: { total: 0, thisMonth: 0, pending: 0, completed: 0, confirmed: 0, paid: 0, processing: 0, shipped: 0, delivered: 0 },
      users: { total: 0, active: 0, newThisMonth: 0 },
      products: { total: 0, active: 0 },
    });
  }
}
