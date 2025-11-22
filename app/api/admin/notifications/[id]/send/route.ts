import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { client, writeClient } from '@/sanity/lib/client';
import { api } from '@/lib/api/response';
import { notificationService } from '@/lib/notifications/service';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const user = await currentUser();

    if (!user) {
      return api.error('Unauthorized', {
        code: 'UNAUTHORIZED',
        status: 401
      });
    }

    // Check if user is admin
    const userProfile = await client.fetch(`
      *[_type == "userProfile" && clerkId == $clerkId][0] {
        role
      }
    `, { clerkId: user.id });

    if (!userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
      return api.error('Forbidden', {
        code: 'FORBIDDEN',
        status: 403
      });
    }

    // Get the notification
    const notification = await client.fetch(`
      *[_type == "notification" && _id == $id][0] {
        title,
        message,
        type,
        targetAudience,
        priority,
        status
      }
    `, { id: params.id });

    if (!notification) {
      return api.error('Notification not found', {
        code: 'NOT_FOUND',
        status: 404
      });
    }

    if (notification.status === 'sent') {
      return api.error('Notification already sent', {
        code: 'ALREADY_SENT',
        status: 400
      });
    }

    // Update notification status to sent
    await writeClient
      .patch(params.id)
      .set({
        status: 'sent',
        sentAt: new Date().toISOString()
      })
      .commit();

    // Get target users based on audience
    let targetUsers = [];

    switch (notification.targetAudience) {
      case 'all':
        // Get all active users
        targetUsers = await client.fetch(`
          *[_type == "userProfile" && isActive == true] {
            clerkId,
            email,
            firstName,
            lastName
          }
        `);
        break;

      case 'sellers':
        // Get all sellers
        targetUsers = await client.fetch(`
          *[_type == "userProfile" && role == "seller" && isActive == true] {
            clerkId,
            email,
            firstName,
            lastName
          }
        `);
        break;

      case 'customers':
        // Get all customers
        targetUsers = await client.fetch(`
          *[_type == "userProfile" && role == "customer" && isActive == true] {
            clerkId,
            email,
            firstName,
            lastName
          }
        `);
        break;

      case 'architects':
        // Get all architects
        targetUsers = await client.fetch(`
          *[_type == "userProfile" && role == "architect" && isActive == true] {
            clerkId,
            email,
            firstName,
            lastName
          }
        `);
        break;

      case 'admins':
        // Get all admins
        targetUsers = await client.fetch(`
          *[_type == "userProfile" && role in ["admin", "super_admin"] && isActive == true] {
            clerkId,
            email,
            firstName,
            lastName
          }
        `);
        break;
    }

    // Send notifications to target users
    const notificationPromises = targetUsers.map(async (targetUser) => {
      try {
        // Create individual notification record for each user
        await writeClient.create({
          _type: 'userNotification',
          userId: targetUser.clerkId,
          notificationId: params.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          status: 'unread',
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString()
        });

        // Send via notification service (email, push, etc.)
        if (notificationService.notifyUser) {
          await notificationService.notifyUser({
            email: targetUser.email,
            name: `${targetUser.firstName} ${targetUser.lastName}`.trim(),
            subject: notification.title,
            message: notification.message,
            type: notification.type
          });
        }
      } catch (error) {
        console.error(`Failed to send notification to ${targetUser.email}:`, error);
      }
    });

    await Promise.allSettled(notificationPromises);

    return api.success({
      message: `Notification sent to ${targetUsers.length} users`,
      sentCount: targetUsers.length
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return api.error('Failed to send notification', {
      code: 'INTERNAL_ERROR',
      status: 500
    });
  }
}