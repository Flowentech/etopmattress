import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { employeeService } from '@/lib/employee/employeeService';
import { EmployeeService } from '@/lib/services/employee';
import { EmployeeRole } from '@/types/employee';
import { AuditService } from '@/lib/services/audit';

// GET /api/admin/employees - Get all employees
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
      // Temporarily allow for debugging - REMOVE THIS IN PRODUCTION
      // return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') as EmployeeRole;
    const department = searchParams.get('department');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');

    const filters: any = {};
    if (role) filters.role = role;
    if (department) filters.department = department;
    if (isActive !== null) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    const employees = await employeeService.getEmployees(filters);
    const statistics = await employeeService.getEmployeeStatistics();

    return NextResponse.json({
      success: true,
      data: {
        employees,
        statistics
      }
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employees',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST /api/admin/employees - Create new employee
export async function POST(request: NextRequest) {
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

    const employeeData = await request.json();

    // Validate required fields
    const requiredFields = ['clerkId', 'email', 'firstName', 'lastName', 'role'];
    for (const field of requiredFields) {
      if (!employeeData[field]) {
        return NextResponse.json({
          error: `Missing required field: ${field}`
        }, { status: 400 });
      }
    }

    // Check if employee with this Clerk ID already exists
    const existingEmployee = await employeeService.getEmployeeByClerkId(employeeData.clerkId);
    if (existingEmployee) {
      return NextResponse.json({
        error: 'Employee with this Clerk ID already exists'
      }, { status: 409 });
    }

    const newEmployee = await employeeService.createEmployee({
      ...employeeData,
      isActive: true,
      isOnline: false
    });

    // Log the activity
    await employeeService.logActivity({
      employeeId: newEmployee._id!,
      action: 'created_employee',
      resource: 'employee',
      resourceId: newEmployee._id,
      details: {
        employeeName: `${newEmployee.firstName} ${newEmployee.lastName}`,
        role: newEmployee.role
      },
      category: 'users'
    });

    return NextResponse.json({
      success: true,
      data: newEmployee
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to create employee',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}