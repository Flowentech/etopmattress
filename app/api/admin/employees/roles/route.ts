import { NextRequest, NextResponse } from 'next/server';
import { EmployeeService } from '@/lib/services/employee';
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

    const roles = await EmployeeService.getRoles();

    return NextResponse.json({
      success: true,
      data: roles
    });
  } catch (error: any) {
    console.error('Roles API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch roles',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super_admin (only super_admin can create roles)
    const userProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || userProfile.role !== 'super_admin') {
      return NextResponse.json({ error: "Forbidden - Only super admin can create roles" }, { status: 403 });
    }

    const body = await request.json();

    // Get user info for audit logging
    const performerProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        firstName,
        lastName,
        email
      }
    `, { clerkId: user.id });

    const performerData = {
      userId: user.id,
      userName: `${performerProfile?.firstName || ''} ${performerProfile?.lastName || ''}`.trim() || performerProfile?.email || 'Unknown',
      userEmail: performerProfile?.email || user.emailAddresses[0]?.emailAddress || 'Unknown',
    };

    const role = await EmployeeService.createRole({
      ...body,
      ...performerData,
    });

    return NextResponse.json({
      success: true,
      data: role
    });
  } catch (error: any) {
    console.error('Role creation Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create role',
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super_admin
    const userProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || userProfile.role !== 'super_admin') {
      return NextResponse.json({ error: "Forbidden - Only super admin can update roles" }, { status: 403 });
    }

    const { roleId, ...updateData } = await request.json();

    // Get user info for audit logging
    const performerProfile = await backendClient.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        firstName,
        lastName,
        email
      }
    `, { clerkId: user.id });

    const performerData = {
      userId: user.id,
      userName: `${performerProfile?.firstName || ''} ${performerProfile?.lastName || ''}`.trim() || performerProfile?.email || 'Unknown',
      userEmail: performerProfile?.email || user.emailAddresses[0]?.emailAddress || 'Unknown',
    };

    const updatedRole = await EmployeeService.updateRole(roleId, {
      ...updateData,
      ...performerData,
    });

    return NextResponse.json({
      success: true,
      data: updatedRole
    });
  } catch (error: any) {
    console.error('Role update Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update role',
        message: error.message
      },
      { status: 500 }
    );
  }
}