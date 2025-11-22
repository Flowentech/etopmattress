import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { writeClient } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { getUserProfile, updateUserProfile } from '@/lib/auth/user-profile';
import { UserRole } from '@/types/roles';
import { notificationService } from '@/lib/notifications/service';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    const body = await request.json();
    const { userId: userIdParam, role } = body;

    // Users can only update their own role
    if (userIdParam !== userId) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    // Validate role
    const validRoles = [
      UserRole.CUSTOMER,
      UserRole.CUSTOMER_ARCHITECT_CLIENT
    ];

    if (!validRoles.includes(role)) {
      return api.error('Invalid role', {
        code: 'VALIDATION_ERROR',
        status: 400
      });
    }

    // Get current user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      return api.error('User profile not found', {
        code: 'NOT_FOUND',
        status: 404
      });
    }

    // Update user role in Sanity
    await writeClient
      .patch(userProfile.id)
      .set({
        role: role,
        preferences: {
          ...userProfile.preferences,
          enableArchitectureServices: role.includes('architect'),
          enableShopping: true, // Always allow shopping for customers
        },
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Send notification about role upgrade
    try {
      if (role === UserRole.CUSTOMER_ARCHITECT_CLIENT && userProfile.role === UserRole.CUSTOMER) {
        await notificationService.sendNotification(
          {
            userId,
            type: 'success',
            title: 'Account Upgraded! 🎉',
            message: 'Your account has been upgraded to include architecture services. You can now post projects and hire architects.',
            actionUrl: '/dashboard/user?tab=architecture',
            actionText: 'Explore Architecture',
            metadata: { roleUpgrade: true, newRole: role }
          },
          {
            to: userProfile.email,
            type: 'sendSellerApplicationReceived', // Using existing template as base
            templateParams: 'Architecture Services'
          }
        );
      }
    } catch (notificationError) {
      console.error('Failed to send role upgrade notification:', notificationError);
      // Continue anyway - role was updated
    }

    return api.success({
      message: 'Role updated successfully',
      newRole: role
    }, {
      status: 200
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return api.error('Failed to update role', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}