import { NextRequest, NextResponse } from 'next/server';
import { EmployeeService } from '@/lib/services/employee';
import { currentUser } from '@clerk/nextjs/server';
import { backendClient } from '@/sanity/lib/backendClient';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resource, action } = await request.json();

    if (!resource || !action) {
      return NextResponse.json({ error: "Resource and action are required" }, { status: 400 });
    }

    // Check if user is admin or super_admin (they have all permissions)
    const userProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile) {
      return NextResponse.json({
        hasAccess: false,
        reason: 'User profile not found'
      });
    }

    if (['admin', 'super_admin'].includes(userProfile.role)) {
      return NextResponse.json({
        hasAccess: true,
        reason: 'Admin user has full access'
      });
    }

    // Check access control rules first
    const accessCheck = await EmployeeService.checkAccessRule(user.id, resource, action);

    if (accessCheck.hasAccess) {
      return NextResponse.json({
        hasAccess: true,
        reason: accessCheck.reason,
        rule: accessCheck.rule
      });
    }

    // Fall back to role-based permissions
    const hasPermission = await EmployeeService.hasPermission(user.id, resource, action);

    return NextResponse.json({
      hasAccess,
      reason: hasPermission ? 'Role-based access granted' : accessCheck.reason || 'Permission denied'
    });

  } catch (error: any) {
    console.error('Access check error:', error);
    return NextResponse.json({
      hasAccess: false,
      reason: 'Error checking access'
    }, { status: 500 });
  }
}