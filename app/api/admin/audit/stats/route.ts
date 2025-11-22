import { NextRequest, NextResponse } from 'next/server';
import { AuditService } from '@/lib/services/audit';
import { currentUser } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
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

    const searchParams = request.nextUrl.searchParams;

    const filters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      userId: searchParams.get('userId') || undefined,
    };

    const stats = await AuditService.getAuditLogStats(filters);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Audit stats API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit stats',
        message: error.message
      },
      { status: 500 }
    );
  }
}