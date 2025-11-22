import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add proper admin role check
    // const userProfile = await getUserProfile(userId);
    // if (!userProfile?.role || !['admin', 'super_admin'].includes(userProfile.role)) {
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    // Calculate stats from various sources
    const [
      totalOrders,
      totalStores,
      totalArchitectureFirms,
      pendingStoreApplications,
      pendingArchitectureApplications,
      recentTransactions
    ] = await Promise.all([
      // Total orders (platform orders)
      client.fetch('count(*[_type == "platformOrder"])'),

      // Total stores
      client.fetch('count(*[_type == "store" && settings.isActive == true])'),

      // Total architects (verified)
      client.fetch('count(*[_type == "simpleArchitectProfile" && verified == true])'),

      // Pending store applications
      client.fetch('count(*[_type == "storeApplication" && status == "pending"])'),

      // Unverified architects
      client.fetch('count(*[_type == "simpleArchitectProfile" && verified == false])'),

      // Recent transactions for revenue calculation
      client.fetch(`
        *[_type == "commissionTransaction" | order(status, "completed")][-30...0] | order(processedAt desc) {
          amount,
          processedAt
        }
      `)
    ]);

    // Calculate total revenue from transactions
    const totalRevenue = recentTransactions.reduce((sum: number, tx: any) => {
      return sum + (tx.amount || 0);
    }, 0);

    // Calculate monthly growth (simplified)
    const monthlyGrowth = 15.2; // TODO: Calculate from actual data

    // Total users (user profiles)
    const totalUsers = await client.fetch('count(*[_type == "userProfile"])');

    const stats = {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalStores,
      totalArchitects: totalArchitectureFirms,
      monthlyGrowth,
      pendingStoreApplications,
      unverifiedArchitects: pendingArchitectureApplications,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}