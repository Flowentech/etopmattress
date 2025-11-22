import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { employeeService } from '@/lib/employee/employeeService';

// GET /api/admin/employees/[id] - Get specific employee
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const employee = await employeeService.getEmployeeById(id);

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get employee metrics and recent activity
    const [metrics, activities, reviews] = await Promise.all([
      employeeService.getEmployeeMetrics(id, 'weekly'),
      employeeService.getEmployeeActivity(id, 20),
      employeeService.getEmployeeReviews(id)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        employee,
        metrics,
        activities,
        reviews
      }
    });
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employee',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// PATCH /api/admin/employees/[id] - Update employee
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const updateData = await request.json();

    const existingEmployee = await employeeService.getEmployeeById(id);
    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const updatedEmployee = await employeeService.updateEmployee(id, updateData);

    // Log the activity
    await employeeService.logActivity({
      employeeId: id,
      action: 'updated_employee',
      resource: 'employee',
      resourceId: id,
      details: {
        changes: updateData,
        employeeName: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`
      },
      category: 'users'
    });

    return NextResponse.json({
      success: true,
      data: updatedEmployee
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update employee',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// DELETE /api/admin/employees/[id] - Delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const existingEmployee = await employeeService.getEmployeeById(id);
    if (!existingEmployee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    await employeeService.deleteEmployee(id);

    // Log the activity
    await employeeService.logActivity({
      employeeId: user.id,
      action: 'deleted_employee',
      resource: 'employee',
      resourceId: id,
      details: {
        deletedEmployeeName: `${existingEmployee.firstName} ${existingEmployee.lastName}`,
        deletedEmployeeRole: existingEmployee.role
      },
      category: 'users'
    });

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete employee',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}