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
      userId: searchParams.get('userId') || undefined,
      resourceType: searchParams.get('resourceType') || undefined,
      action: searchParams.get('action') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const result = await AuditService.getAuditLogs(filters);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Audit logs API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch audit logs',
        message: error.message
      },
      { status: 500 }
    );
  }
}