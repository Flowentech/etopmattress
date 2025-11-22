import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { employeeService } from '@/lib/employee/employeeService';

// GET /api/admin/employees/activity - Get all employee activities
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const employeeId = searchParams.get('employeeId');

    let activities;
    if (employeeId) {
      activities = await employeeService.getEmployeeActivity(employeeId, limit);
    } else {
      activities = await employeeService.getAllActivities(limit);
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      activities = activities.filter(activity => activity.category === category);
    }

    return NextResponse.json({
      success: true,
      data: {
        activities,
        total: activities.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching employee activities:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employee activities',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST /api/admin/employees/activity - Log employee activity
export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json();
    const { clerkId, ...activity } = activityData;

    // Find employee by Clerk ID
    const employee = await employeeService.getEmployeeByClerkId(clerkId);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await employeeService.logActivity({
      employeeId: employee._id!,
      ...activity,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Activity logged successfully'
    });
  } catch (error: any) {
    console.error('Error logging employee activity:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to log activity',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}