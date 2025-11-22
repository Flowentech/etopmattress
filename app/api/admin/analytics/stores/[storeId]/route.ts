import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/models/analytics';
import { currentUser } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';

export async function GET(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
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

    const { storeId } = params;
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      startDate: searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: searchParams.get('endDate') || new Date().toISOString().split('T')[0],
      periodType: searchParams.get('periodType') || 'daily',
      transactionType: searchParams.get('transactionType') || undefined,
    };

    // Get store data
    const storeData = await backendClient.fetch(`
      *[_type == "store" && _id == $storeId][0] {
        _id,
        name,
        slug,
        settings,
        owner->{
          clerkId,
          firstName,
          lastName,
          email
        }
      }
    `, { storeId });

    if (!storeData) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // Get analytics data
    const analytics = await AnalyticsService.getStoreAnalytics(storeId, filters);
    const transactions = await AnalyticsService.getStoreTransactions(storeId, filters);
    const performance = await AnalyticsService.getStorePerformance(storeId, filters);

    // Calculate summary metrics
    const summary = {
      totalRevenue: analytics.reduce((sum: number, item: any) => sum + item.totalRevenue, 0),
      totalOrders: analytics.reduce((sum: number, item: any) => sum + item.totalOrders, 0),
      totalCommission: analytics.reduce((sum: number, item: any) => sum + item.commissionTotal, 0),
      avgCommissionRate: analytics.length > 0
        ? analytics.reduce((sum: number, item: any) => sum + item.commissionRate, 0) / analytics.length
        : 0,
      totalItemsSold: analytics.reduce((sum: number, item: any) => sum + item.totalItemsSold, 0),
      avgOrderValue: analytics.length > 0
        ? analytics.reduce((sum: number, item: any) => sum + item.avgOrderValue, 0) / analytics.length
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        store: storeData,
        analytics,
        transactions,
        performance,
        summary,
        filters,
      },
    });
  } catch (error: any) {
    console.error('Store Analytics Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch store analytics',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeId } = params;
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'create_transaction':
        const transaction = await AnalyticsService.createStoreTransaction({
          storeId,
          orderId: data.orderId,
          transactionType: data.transactionType,
          amount: data.amount,
          commissionAmount: data.commissionAmount,
          commissionRate: data.commissionRate,
          metadata: data.metadata,
        });

        return NextResponse.json({
          success: true,
          data: { transaction }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Store Analytics POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        message: error.message,
      },
      { status: 500 }
    );
  }
}