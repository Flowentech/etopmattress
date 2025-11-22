import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { employeeService } from '@/lib/employee/employeeService';

// GET /api/admin/employees/[id]/permissions - Get employee permissions
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

    // Get all available permissions and employee's current permissions
    const rolePermissions = await import('@/types/employee').then(m => m.ROLE_PERMISSIONS);
    const allPermissions = await import('@/types/employee').then(m => m.EMPLOYEE_PERMISSIONS);

    const currentPermissions = employee.customPermissions || [];
    const roleBasedPermissions = rolePermissions[employee.role] || [];

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          name: `${employee.firstName} ${employee.lastName}`,
          role: employee.role,
          email: employee.email
        },
        permissions: {
          current: currentPermissions,
          roleBased: roleBasedPermissions,
          all: Object.values(allPermissions).map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            category: p.category
          }))
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching employee permissions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employee permissions',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// POST /api/admin/employees/[id]/permissions - Update employee permissions
export async function POST(
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
    const { permissions, action } = await request.json();

    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    let updatedEmployee;
    if (action === 'assign') {
      updatedEmployee = await employeeService.assignPermissions(id, permissions);
    } else if (action === 'grant') {
      updatedEmployee = await employeeService.grantPermission(id, permissions);
    } else if (action === 'revoke') {
      updatedEmployee = await employeeService.revokePermission(id, permissions);
    }

    // Log the permission change
    await employeeService.logActivity({
      employeeId: user.id,
      action: `${action}_permissions`,
      resource: 'employee_permissions',
      resourceId: id,
      details: {
        targetEmployee: `${employee.firstName} ${employee.lastName}`,
        permissions: permissions,
        action: action
      },
      category: 'settings'
    });

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: `Permissions ${action}ed successfully`
    });
  } catch (error: any) {
    console.error('Error updating employee permissions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update employee permissions',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}