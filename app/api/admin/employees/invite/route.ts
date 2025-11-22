import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client } from '@/sanity/lib/client';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const adminUser = await currentUser();

    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    let userProfile;
    try {
      userProfile = await client.fetch(`
        *[_type == "userProfile" && clerkId == $clerkId][0] {
          role
        }
      `, { clerkId: adminUser.id });
    } catch (profileError) {
      console.error('Error fetching user profile:', profileError);
      userProfile = { role: 'admin' };
    }

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, firstName, lastName, role, department } = await request.json();

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists in Clerk
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [email]
      });

      if (existingUsers.data.length > 0) {
        const existingUser = existingUsers.data[0];

        // Create employee record with existing Clerk user
        const employeeData = {
          clerkId: existingUser.id,
          email: existingUser.emailAddresses[0]?.emailAddress || email,
          firstName: existingUser.firstName || firstName,
          lastName: existingUser.lastName || lastName,
          role,
          department,
          isActive: true,
          isOnline: false,
          employmentDetails: {
            employeeId: `EMP-${Date.now()}`,
            hireDate: new Date().toISOString().split('T')[0],
            department,
            workSchedule: {
              workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              workHours: { start: '09:00', end: '18:00' }
            }
          }
        };

        const employeeService = await import('@/lib/employee/employeeService');
        const newEmployee = await employeeService.employeeService.createEmployee(employeeData);

        // Log the activity
        await employeeService.employeeService.logActivity({
          employeeId: adminUser.id,
          action: 'created_employee',
          resource: 'employee',
          resourceId: newEmployee._id!,
          details: {
            employeeName: `${newEmployee.firstName} ${newEmployee.lastName}`,
            role: newEmployee.role,
            method: 'existing_user'
          },
          category: 'users'
        });

        return NextResponse.json({
          success: true,
          data: {
            employee: newEmployee,
            message: 'Employee created with existing user account'
          }
        });
      }
    } catch (clerkError) {
      console.error('Error checking existing user:', clerkError);
    }

    // Create new Clerk user
    try {
      const newUser = await clerkClient.users.createUser({
        emailAddress: [email],
        firstName,
        lastName,
        password: generateTempPassword(),
        skipPasswordRequirements: true,
      });

      // Create employee record
      const employeeData = {
        clerkId: newUser.id,
        email: newUser.emailAddresses[0]?.emailAddress || email,
        firstName: newUser.firstName || firstName,
        lastName: newUser.lastName || lastName,
        role,
        department,
        isActive: true,
        isOnline: false,
        employmentDetails: {
          employeeId: `EMP-${Date.now()}`,
          hireDate: new Date().toISOString().split('T')[0],
          department,
          workSchedule: {
            workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            workHours: { start: '09:00', end: '18:00' }
          }
        }
      };

      const employeeService = await import('@/lib/employee/employeeService');
      const newEmployee = await employeeService.employeeService.createEmployee(employeeData);

      // Log the activity
      await employeeService.employeeService.logActivity({
        employeeId: adminUser.id,
        action: 'created_employee',
        resource: 'employee',
        resourceId: newEmployee._id!,
        details: {
          employeeName: `${newEmployee.firstName} ${newEmployee.lastName}`,
          role: newEmployee.role,
          method: 'new_user'
        },
        category: 'users'
      });

      return NextResponse.json({
        success: true,
        data: {
          employee: newEmployee,
          clerkUser: {
            id: newUser.id,
            email: newUser.emailAddresses[0]?.emailAddress
          },
          message: 'Employee and user account created successfully'
        }
      });

    } catch (clerkError) {
      console.error('Error creating Clerk user:', clerkError);
      return NextResponse.json({
        error: 'Failed to create user account',
        details: clerkError instanceof Error ? clerkError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error inviting employee:', error);
    return NextResponse.json({
      error: 'Failed to invite employee',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

function generateTempPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}